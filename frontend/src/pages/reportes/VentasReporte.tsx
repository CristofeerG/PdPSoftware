import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import type { VentasPorPeriodo } from "../../types/reportes";
import { Card } from "../../components/ui/Card";
import { Input, Select } from "../../components/ui/Input";
import { BarraSimple } from "../../components/ui/BarraSimple";

type Agrupacion = "dia" | "semana" | "mes";

export function VentasReporte() {
  const api = useApi();
  const [agrupacion, setAgrupacion] = useState<Agrupacion>("dia");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [datos, setDatos] = useState<VentasPorPeriodo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);

    const params = new URLSearchParams({ agrupacion });
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);

    api<VentasPorPeriodo[]>(`/reportes/ventas?${params.toString()}`)
      .then((data) => activo && setDatos(data))
      .catch((err) => activo && setError(err instanceof ApiError ? err.message : "No se pudo cargar el reporte"))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agrupacion, desde, hasta]);

  const totalPeriodo = datos.reduce((acc, fila) => acc + Number(fila.total), 0);
  const maximo = datos.reduce((max, fila) => Math.max(max, Number(fila.total)), 0);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-texto">Ventas por período</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={agrupacion} onChange={(event) => setAgrupacion(event.target.value as Agrupacion)}>
            <option value="dia">Por día</option>
            <option value="semana">Por semana</option>
            <option value="mes">Por mes</option>
          </Select>
          <Input type="date" value={desde} onChange={(event) => setDesde(event.target.value)} />
          <span className="text-texto-secundario">–</span>
          <Input type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-rojo">{error}</p>}

      {cargando ? (
        <p className="text-sm text-texto-secundario">Cargando…</p>
      ) : datos.length === 0 ? (
        <p className="text-sm text-texto-secundario">No hay cuentas cerradas en este rango.</p>
      ) : (
        <>
          <p className="text-sm text-texto-secundario">
            Total del período: <span className="font-semibold text-dorado">${totalPeriodo.toFixed(2)}</span>
          </p>
          <div className="flex flex-col gap-3">
            {datos.map((fila) => (
              <BarraSimple
                key={fila.periodo}
                etiqueta={fila.periodo}
                valor={Number(fila.total)}
                maximo={maximo}
                detalle={`$${Number(fila.total).toFixed(2)} · ${fila.cantidadCuentas} cuenta${fila.cantidadCuentas === 1 ? "" : "s"}`}
              />
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
