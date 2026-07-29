import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import { METODO_PAGO_LABEL, type CierreCaja } from "../../types/reportes";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CierreCajaReporte() {
  const api = useApi();
  const [fecha, setFecha] = useState(hoyISO());
  const [datos, setDatos] = useState<CierreCaja | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);

    api<CierreCaja>(`/reportes/cierre-caja?fecha=${fecha}`)
      .then((data) => activo && setDatos(data))
      .catch((err) => activo && setError(err instanceof ApiError ? err.message : "No se pudo cargar el cierre de caja"))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-texto">Cierre de caja diario</h2>
        <Input type="date" value={fecha} max={hoyISO()} onChange={(event) => setFecha(event.target.value)} />
      </div>

      {error && <p className="text-sm text-rojo">{error}</p>}

      {cargando ? (
        <p className="text-sm text-texto-secundario">Cargando…</p>
      ) : datos ? (
        <>
          <div className="flex flex-col items-center gap-1 rounded-md bg-black/20 py-6 text-center">
            <span className="text-4xl font-bold text-dorado">${Number(datos.totalVendido).toFixed(2)}</span>
            <span className="text-sm text-texto-secundario">
              {datos.cantidadCuentas} cuenta{datos.cantidadCuentas === 1 ? "" : "s"} cerrada
              {datos.cantidadCuentas === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {datos.desglosePorMetodoPago.map((fila) => (
              <div key={fila.metodoPago} className="rounded-md bg-black/20 p-4">
                <p className="text-sm text-texto-secundario">{METODO_PAGO_LABEL[fila.metodoPago]}</p>
                <p className="text-xl font-semibold text-texto">${Number(fila.total).toFixed(2)}</p>
                <p className="text-xs text-texto-secundario">
                  {fila.cantidadCuentas} cuenta{fila.cantidadCuentas === 1 ? "" : "s"}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </Card>
  );
}
