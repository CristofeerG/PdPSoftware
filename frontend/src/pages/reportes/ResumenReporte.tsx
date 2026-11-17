import { useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import { ahoraNegocio } from "../../lib/fechasNegocio";
import { ds } from "../../lib/designSystem";
import type { ProductoVendido, VentasPorPeriodo } from "../../types/reportes";
import type { Cuenta } from "../../types/mesas";

type Rango = "dia" | "semana" | "mes";

const AGRUPACION_POR_RANGO: Record<Rango, "dia" | "semana" | "mes"> = { dia: "dia", semana: "dia", mes: "semana" };
const DIAS_POR_RANGO: Record<Rango, number> = { dia: 1, semana: 7, mes: 30 };

interface MeseroFila {
  nombre: string;
  mesas: number;
  ventas: number;
}

const ANCHO_GRAFICA = 600;
const ALTO_GRAFICA = 140;
const PAD_X_GRAFICA = 8;
const PAD_Y_GRAFICA = 10;
const ETIQUETAS_HORAS_GRAFICA = [0, 3, 6, 9, 12, 15, 18, 21];

function formatHora(hora: number): string {
  const periodo = hora < 12 ? "am" : "pm";
  const hora12 = hora % 12 === 0 ? 12 : hora % 12;
  return `${hora12}${periodo}`;
}

// Curva suave (Catmull-Rom → Bézier) que pasa por todos los puntos, para que
// la línea de horas pico no se vea quebrada como un gráfico de barras.
function pathSuave(puntos: { x: number; y: number }[]): string {
  if (puntos.length === 0) return "";
  if (puntos.length === 1) return `M ${puntos[0].x} ${puntos[0].y}`;
  let d = `M ${puntos[0].x} ${puntos[0].y}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[i === 0 ? i : i - 1];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[i + 2 < puntos.length ? i + 2 : i + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function ResumenReporte() {
  const api = useApi();
  const { Card, Tabs } = ds();

  const [rango, setRango] = useState<Rango>("semana");
  const [ventas, setVentas] = useState<VentasPorPeriodo[]>([]);
  const [productos, setProductos] = useState<ProductoVendido[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);

    // "desde"/"hasta" se mandan como "YYYY-MM-DD" (no un timestamp exacto):
    // asi el backend los ancla al inicio/fin del dia de negocio (corte a las
    // 6am, no medianoche, ver lib/fechasNegocio.ts), igual que en Ventas y
    // Cierre de Caja. Antes se mandaba un timestamp ISO relativo a "ahora"
    // (una ventana movil de N dias desde el instante en que se abria la
    // pantalla), que no representaba "hoy" ni ningun otro dia calendario, y
    // por eso esta pantalla mostraba cuentas y totales distintos a los del
    // resto de la app. Se usa `ahoraNegocio()` (no `new Date()`) para que
    // entre medianoche y las 6am "hoy" siga siendo la noche que sigue abierta.
    const hoy = ahoraNegocio();
    const desdeStr = format(subDays(hoy, DIAS_POR_RANGO[rango] - 1), "yyyy-MM-dd");
    const hastaStr = format(hoy, "yyyy-MM-dd");
    const params = new URLSearchParams({ desde: desdeStr, hasta: hastaStr });

    Promise.all([
      api<VentasPorPeriodo[]>(`/reportes/ventas?agrupacion=${AGRUPACION_POR_RANGO[rango]}&${params.toString()}`),
      api<ProductoVendido[]>(`/reportes/productos?orden=mas&limit=5&${params.toString()}`),
      api<Cuenta[]>(`/cuentas?estado=CERRADA&${params.toString()}`),
    ])
      .then(([ventasData, productosData, cuentasData]) => {
        if (!activo) return;
        setVentas(ventasData);
        setProductos(productosData);
        setCuentas(cuentasData);
      })
      .catch((err) => activo && setError(err instanceof ApiError ? err.message : "No se pudo cargar el resumen"))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rango]);

  const totalVentas = ventas.reduce((acc, fila) => acc + Number(fila.total), 0);
  const totalCuentas = ventas.reduce((acc, fila) => acc + fila.cantidadCuentas, 0);
  const topProducto = productos[0];

  // Ventas agrupadas por hora del día (0-23), sumando todas las cuentas
  // cerradas del rango seleccionado, para ver en qué horas se vende más.
  const ventasPorHora = useMemo(() => {
    const totales = new Array(24).fill(0) as number[];
    for (const cuenta of cuentas) {
      const fecha = cuenta.fechaCierre ?? cuenta.fechaApertura;
      if (!fecha) continue;
      totales[new Date(fecha).getHours()] += Number(cuenta.total);
    }
    return totales.map((total, hora) => ({ hora, total }));
  }, [cuentas]);

  const maximoHora = ventasPorHora.reduce((max, h) => Math.max(max, h.total), 0);
  const horaPico = ventasPorHora.reduce((pico, h) => (h.total > pico.total ? h : pico), ventasPorHora[0]);

  const puntosGrafica = ventasPorHora.map((h, i) => ({
    x: PAD_X_GRAFICA + (i / 23) * (ANCHO_GRAFICA - 2 * PAD_X_GRAFICA),
    y:
      PAD_Y_GRAFICA +
      (maximoHora > 0 ? (1 - h.total / maximoHora) : 1) * (ALTO_GRAFICA - PAD_Y_GRAFICA),
  }));
  const lineaGrafica = pathSuave(puntosGrafica);
  const areaGrafica =
    puntosGrafica.length > 0
      ? `${lineaGrafica} L ${puntosGrafica[puntosGrafica.length - 1].x} ${ALTO_GRAFICA} L ${puntosGrafica[0].x} ${ALTO_GRAFICA} Z`
      : "";

  const meseros = useMemo<MeseroFila[]>(() => {
    const porUsuario = new Map<string, { nombre: string; mesas: Set<number>; ventas: number }>();
    for (const cuenta of cuentas) {
      const nombre = cuenta.usuario?.nombre ?? "Sin asignar";
      const fila = porUsuario.get(nombre) ?? { nombre, mesas: new Set<number>(), ventas: 0 };
      fila.mesas.add(cuenta.mesaId);
      fila.ventas += Number(cuenta.total);
      porUsuario.set(nombre, fila);
    }
    return Array.from(porUsuario.values())
      .map((f) => ({ nombre: f.nombre, mesas: f.mesas.size, ventas: f.ventas }))
      .sort((a, b) => b.ventas - a.ventas);
  }, [cuentas]);

  if (cargando) return <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Cargando…</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <div style={{ width: 280 }}>
          <Tabs
            items={[
              { value: "dia", label: "Hoy" },
              { value: "semana", label: "Semana" },
              { value: "mes", label: "Mes" },
            ]}
            active={rango}
            onChange={(v) => setRango(v as Rango)}
          />
        </div>
      </div>

      {error && <p style={{ color: "var(--status-danger)", fontSize: 14 }}>{error}</p>}

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Card>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "var(--tracking-caps)", marginBottom: 8 }}>
              Ventas totales
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 28, color: "var(--color-gold)" }}>
              ${totalVentas.toFixed(2)}
            </div>
          </Card>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Card>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "var(--tracking-caps)", marginBottom: 8 }}>
              Cuentas cerradas
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 28, color: "var(--text-primary)" }}>{totalCuentas}</div>
          </Card>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Card>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "var(--tracking-caps)", marginBottom: 8 }}>
              Producto más vendido
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 19, color: "var(--text-primary)" }}>
              {topProducto?.nombre ?? "—"}
            </div>
            {topProducto && (
              <div style={{ color: "var(--color-gold)", fontWeight: 700, fontSize: 13, marginTop: 4 }}>{topProducto.cantidadVendida} unidades</div>
            )}
          </Card>
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: "1.4 1 320px" }}>
          <Card>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12, gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--text-primary)" }}>Horas pico de venta</div>
              {maximoHora > 0 && (
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Pico: <span style={{ color: "var(--color-gold)", fontWeight: 700 }}>{formatHora(horaPico.hora)}</span> · $
                  {horaPico.total.toFixed(2)}
                </div>
              )}
            </div>
            {maximoHora === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>No hay cuentas cerradas en este rango.</p>
            ) : (
              <>
                <svg
                  viewBox={`0 0 ${ANCHO_GRAFICA} ${ALTO_GRAFICA}`}
                  style={{ width: "100%", height: 150, display: "block" }}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="gradienteHorasPico" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={areaGrafica} fill="url(#gradienteHorasPico)" stroke="none" />
                  <path d={lineaGrafica} fill="none" stroke="var(--color-gold)" strokeWidth={2.5} strokeLinecap="round" />
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                  {ETIQUETAS_HORAS_GRAFICA.map((h) => (
                    <span key={h}>{formatHora(h)}</span>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>
        <div style={{ flex: "1 1 260px" }}>
          <Card>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--text-primary)", marginBottom: 12 }}>Productos más vendidos</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-caps)", paddingBottom: 8, borderBottom: "1px solid var(--border-subtle)" }}>
              <span>Producto</span>
              <span>Cant. · Total</span>
            </div>
            {productos.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 10 }}>Sin ventas en este rango.</p>
            ) : (
              productos.map((p) => (
                <div key={p.productoVentaId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <span style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 600 }}>{p.nombre}</span>
                  <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    {p.cantidadVendida} · ${Number(p.totalVendido).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>

      <Card>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--text-primary)", marginBottom: 12 }}>Meseros</div>
        <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-caps)", paddingBottom: 8, borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ flex: 1 }}>Mesero</div>
          <div style={{ width: 80 }}>Mesas</div>
          <div style={{ width: 100, textAlign: "right" }}>Ventas</div>
        </div>
        {meseros.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 10 }}>Sin cuentas cerradas en este rango.</p>
        ) : (
          meseros.map((m) => (
            <div key={m.nombre} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ flex: 1, color: "var(--text-primary)", fontWeight: 600, fontSize: 14 }}>{m.nombre}</div>
              <div style={{ width: 80, color: "var(--text-secondary)", fontSize: 14 }}>{m.mesas}</div>
              <div style={{ width: 100, textAlign: "right", color: "var(--text-secondary)", fontSize: 14 }}>${m.ventas.toFixed(2)}</div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
