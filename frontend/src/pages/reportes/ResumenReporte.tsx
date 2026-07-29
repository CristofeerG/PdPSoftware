import { useEffect, useMemo, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
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

    const desde = new Date();
    desde.setDate(desde.getDate() - DIAS_POR_RANGO[rango]);
    const params = new URLSearchParams({ desde: desde.toISOString() });

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
  const maximoBarra = ventas.reduce((max, fila) => Math.max(max, Number(fila.total)), 0);
  const topProducto = productos[0];

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
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>Ventas</div>
            {ventas.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>No hay cuentas cerradas en este rango.</p>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 150 }}>
                {ventas.map((fila) => (
                  <div key={fila.periodo} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                    <div
                      style={{
                        width: "100%",
                        background: "var(--color-gold)",
                        borderRadius: "6px 6px 0 0",
                        height: `${maximoBarra > 0 ? Math.max(4, (Number(fila.total) / maximoBarra) * 100) : 0}%`,
                      }}
                    />
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>{fila.periodo.slice(5)}</div>
                  </div>
                ))}
              </div>
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
