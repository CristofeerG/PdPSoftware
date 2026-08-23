import { Fragment, useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import { METODO_PAGO_LABEL } from "../../types/reportes";
import { nombreMesa, type Cuenta } from "../../types/mesas";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";

export function HistorialCuentasPage() {
  const api = useApi();
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [expandidaId, setExpandidaId] = useState<number | null>(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);

    const params = new URLSearchParams({ estado: "CERRADA" });
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);

    api<Cuenta[]>(`/cuentas?${params.toString()}`)
      .then((data) => activo && setCuentas(data))
      .catch((err) => activo && setError(err instanceof ApiError ? err.message : "No se pudo cargar el historial"))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-texto">Historial de cuentas cerradas</h1>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Desde" htmlFor="hist-desde">
            <Input id="hist-desde" type="date" value={desde} onChange={(event) => setDesde(event.target.value)} />
          </Field>
          <Field label="Hasta" htmlFor="hist-hasta">
            <Input id="hist-hasta" type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} />
          </Field>
          {(desde || hasta) && (
            <Button
              variant="ghost"
              onClick={() => {
                setDesde("");
                setHasta("");
              }}
            >
              Limpiar filtro
            </Button>
          )}
        </div>

        {error && <p className="text-sm text-rojo">{error}</p>}

        {cargando ? (
          <p className="text-sm text-texto-secundario">Cargando…</p>
        ) : cuentas.length === 0 ? (
          <p className="text-sm text-texto-secundario">No hay cuentas cerradas en este rango.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/20 text-texto-secundario">
                  <th className="py-2 pr-3 font-medium">Cierre</th>
                  <th className="py-2 pr-3 font-medium">Mesa</th>
                  <th className="py-2 pr-3 font-medium">Mesero</th>
                  <th className="py-2 pr-3 font-medium">Método de pago</th>
                  <th className="py-2 pr-3 font-medium">Descuento</th>
                  <th className="py-2 pr-3 font-medium">Total</th>
                  <th className="py-2 pr-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {cuentas.map((cuenta) => (
                  <Fragment key={cuenta.id}>
                    <tr>
                      <td className="whitespace-nowrap py-2 pr-3 text-texto-secundario">
                        {cuenta.fechaCierre ? new Date(cuenta.fechaCierre).toLocaleString() : "—"}
                      </td>
                      <td className="py-2 pr-3 text-texto">
                        {cuenta.mesa ? nombreMesa(cuenta.mesa) : `Mesa ${cuenta.mesaId}`}
                      </td>
                      <td className="py-2 pr-3 text-texto-secundario">{cuenta.usuario?.nombre ?? "—"}</td>
                      <td className="py-2 pr-3 text-texto-secundario">
                        {cuenta.metodoPago ? METODO_PAGO_LABEL[cuenta.metodoPago] : "—"}
                      </td>
                      <td className="py-2 pr-3 text-texto-secundario">
                        {Number(cuenta.descuento) > 0 ? `$${Number(cuenta.descuento).toFixed(2)}` : "—"}
                      </td>
                      <td className="py-2 pr-3 font-medium text-texto">${Number(cuenta.total).toFixed(2)}</td>
                      <td className="py-2 pr-3">
                        <Button
                          variant="ghost"
                          className="px-2 py-1"
                          onClick={() => setExpandidaId(expandidaId === cuenta.id ? null : cuenta.id)}
                        >
                          {expandidaId === cuenta.id ? "Ocultar" : "Ver items"}
                        </Button>
                      </td>
                    </tr>
                    {expandidaId === cuenta.id && (
                      <tr>
                        <td colSpan={7} className="bg-black/20 px-3 py-2">
                          {cuenta.itemsConsumo.length === 0 ? (
                            <p className="text-sm text-texto-secundario">Sin items.</p>
                          ) : (
                            <ul className="flex flex-col gap-1 text-sm text-texto-secundario">
                              {cuenta.itemsConsumo.map((item) => (
                                <li key={item.id}>
                                  {item.productoVenta.nombre} × {item.cantidad} — ${Number(item.subtotal).toFixed(2)}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
