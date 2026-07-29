import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import type { InventarioValorizado } from "../../types/reportes";
import { Card } from "../../components/ui/Card";

export function InventarioValorizadoReporte() {
  const api = useApi();
  const [datos, setDatos] = useState<InventarioValorizado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);

    api<InventarioValorizado>("/reportes/inventario-valorizado")
      .then((data) => activo && setDatos(data))
      .catch((err) => activo && setError(err instanceof ApiError ? err.message : "No se pudo cargar el reporte"))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, [api]);

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-texto">Inventario valorizado</h2>

      {error && <p className="text-sm text-rojo">{error}</p>}

      {cargando ? (
        <p className="text-sm text-texto-secundario">Cargando…</p>
      ) : !datos || datos.detalle.length === 0 ? (
        <p className="text-sm text-texto-secundario">Todavía no hay insumos cargados.</p>
      ) : (
        <>
          <p className="text-sm text-texto-secundario">
            Valor total del inventario:{" "}
            <span className="font-semibold text-dorado">${Number(datos.totalValorizado).toFixed(2)}</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/20 text-texto-secundario">
                  <th className="py-2 pr-3 font-medium">Insumo</th>
                  <th className="py-2 pr-3 font-medium">Categoría</th>
                  <th className="py-2 pr-3 font-medium">Stock actual</th>
                  <th className="py-2 pr-3 font-medium">Costo unitario</th>
                  <th className="py-2 pr-3 font-medium">Valor total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {datos.detalle.map((item) => (
                  <tr key={item.insumoId}>
                    <td className="py-2 pr-3 text-texto">{item.nombre}</td>
                    <td className="py-2 pr-3 text-texto-secundario">{item.categoria}</td>
                    <td className="py-2 pr-3 text-texto-secundario">
                      {Number(item.stockActual)} {item.unidad === "ML" ? "ml" : "u."}
                    </td>
                    <td className="py-2 pr-3 text-texto-secundario">${Number(item.costo).toFixed(2)}</td>
                    <td className="py-2 pr-3 font-medium text-texto">${Number(item.valorTotal).toFixed(2)}</td>
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
