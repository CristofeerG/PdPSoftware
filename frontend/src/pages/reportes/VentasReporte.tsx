import { useEffect, useState } from "react";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import { METODO_PAGO_LABEL, type VentasPorPeriodo } from "../../types/reportes";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";

type Agrupacion = "dia" | "semana" | "mes";
type FiltroActivo = "hoy" | "semana" | "mes" | "personalizado";

export function VentasReporte() {
  const api = useApi();
  const [agrupacion, setAgrupacion] = useState<Agrupacion>("dia");
  const [filtroActivo, setFiltroActivo] = useState<FiltroActivo>("hoy");
  const [desde, setDesde] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [hasta, setHasta] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [datos, setDatos] = useState<VentasPorPeriodo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);

    const params = new URLSearchParams({ agrupacion: filtroActivo === "personalizado" ? agrupacion : "dia" });
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
  }, [agrupacion, filtroActivo, desde, hasta]);

  const totalPeriodo = datos.reduce((acc, fila) => acc + Number(fila.total), 0);
  const metodosPago = Object.keys(METODO_PAGO_LABEL) as (keyof VentasPorPeriodo["desglosePagos"])[];

  function handleExportarCSV() {
    const encabezado = ["Fecha", "Cuentas Cerradas", ...metodosPago.map((m) => METODO_PAGO_LABEL[m]), "Total Diario"];
    const filas = datos.map((fila) => [
      fila.periodo,
      String(fila.cantidadCuentas),
      ...metodosPago.map((m) => Number(fila.desglosePagos[m]).toFixed(2)),
      Number(fila.total).toFixed(2),
    ]);
    const csv = [encabezado, ...filas].map((fila) => fila.join(",")).join("\r\n");

    const nombreArchivo = desde && hasta ? `reporte_ventas_${desde}_a_${hasta}.csv` : `reporte_ventas_${new Date().toISOString().slice(0, 10)}.csv`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-texto">Ventas por período</h2>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={filtroActivo === "hoy" ? "primary" : "secondary"}
            className="px-3 py-1"
            onClick={() => {
              setFiltroActivo("hoy");
              setDesde(format(new Date(), "yyyy-MM-dd"));
              setHasta(format(new Date(), "yyyy-MM-dd"));
            }}
          >
            Hoy
          </Button>
          <Button
            type="button"
            variant={filtroActivo === "semana" ? "primary" : "secondary"}
            className="px-3 py-1"
            onClick={() => {
              setFiltroActivo("semana");
              setDesde(format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
              setHasta(format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
            }}
          >
            Esta Semana
          </Button>
          <Button
            type="button"
            variant={filtroActivo === "mes" ? "primary" : "secondary"}
            className="px-3 py-1"
            onClick={() => {
              setFiltroActivo("mes");
              setDesde(format(startOfMonth(new Date()), "yyyy-MM-dd"));
              setHasta(format(endOfMonth(new Date()), "yyyy-MM-dd"));
            }}
          >
            Este Mes
          </Button>
          <Button
            type="button"
            variant={filtroActivo === "personalizado" ? "primary" : "secondary"}
            className="px-3 py-1"
            onClick={() => setFiltroActivo("personalizado")}
          >
            Personalizado
          </Button>

          {filtroActivo === "personalizado" && (
            <>
              <Select value={agrupacion} onChange={(event) => setAgrupacion(event.target.value as Agrupacion)}>
                <option value="dia">Por día</option>
                <option value="semana">Por semana</option>
                <option value="mes">Por mes</option>
              </Select>
              <div className="flex items-center gap-2">
                <Input type="date" value={desde} onChange={(event) => setDesde(event.target.value)} />
                <span className="text-texto-secundario">–</span>
                <Input type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} />
              </div>
            </>
          )}
        </div>

        <Button type="button" variant="secondary" disabled={cargando || datos.length === 0} onClick={handleExportarCSV}>
          Exportar CSV
        </Button>
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-texto-secundario">
                  <th className="py-2 text-left font-medium">Fecha</th>
                  <th className="py-2 text-right font-medium">Cuentas Cerradas</th>
                  {metodosPago.map((metodo) => (
                    <th key={metodo} className="py-2 text-right font-medium">
                      {METODO_PAGO_LABEL[metodo]}
                    </th>
                  ))}
                  <th className="py-2 text-right font-medium">Total Diario</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((fila) => (
                  <tr key={fila.periodo} className="border-b border-white/5 last:border-0">
                    <td className="py-2.5 font-medium text-texto">{fila.periodo}</td>
                    <td className="py-2.5 text-right tabular-nums text-texto">{fila.cantidadCuentas}</td>
                    {metodosPago.map((metodo) => (
                      <td key={metodo} className="py-2.5 text-right tabular-nums text-texto">
                        ${Number(fila.desglosePagos[metodo]).toFixed(2)}
                      </td>
                    ))}
                    <td className="py-2.5 text-right font-semibold tabular-nums text-dorado">${Number(fila.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
