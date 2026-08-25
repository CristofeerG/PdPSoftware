import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import type { ProductoVendido } from "../../types/reportes";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

type Orden = "mas" | "menos";

export function ProductosReporte() {
  const api = useApi();
  const [orden, setOrden] = useState<Orden>("mas");
  const [datos, setDatos] = useState<ProductoVendido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);

    api<ProductoVendido[]>(`/reportes/productos?orden=${orden}&limit=10`)
      .then((data) => activo && setDatos(data))
      .catch((err) => activo && setError(err instanceof ApiError ? err.message : "No se pudo cargar el reporte"))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orden]);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-texto">Productos más y menos vendidos</h2>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={orden === "mas" ? "primary" : "secondary"}
            className="px-3 py-1"
            onClick={() => setOrden("mas")}
          >
            Más vendidos
          </Button>
          <Button
            type="button"
            variant={orden === "menos" ? "primary" : "secondary"}
            className="px-3 py-1"
            onClick={() => setOrden("menos")}
          >
            Menos vendidos
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-rojo">{error}</p>}

      {cargando ? (
        <p className="text-sm text-texto-secundario">Cargando…</p>
      ) : datos.length === 0 ? (
        <p className="text-sm text-texto-secundario">Todavía no hay productos de venta cargados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-texto-secundario">
                <th className="w-10 py-2 text-left font-medium">#</th>
                <th className="py-2 text-left font-medium">Producto</th>
                <th className="py-2 text-right font-medium">Cantidad</th>
                <th className="py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((fila, indice) => (
                <tr key={fila.productoVentaId} className="border-b border-white/5 last:border-0">
                  <td className="py-2.5 tabular-nums text-texto-secundario">{indice + 1}</td>
                  <td className="py-2.5 font-medium text-texto">{fila.nombre}</td>
                  <td className="py-2.5 text-right tabular-nums text-texto">{fila.cantidadVendida} u.</td>
                  <td className="py-2.5 text-right font-semibold tabular-nums text-dorado">
                    ${Number(fila.totalVendido).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
