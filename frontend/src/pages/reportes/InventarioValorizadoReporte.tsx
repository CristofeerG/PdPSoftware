import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import type { InventarioValorizado } from "../../types/reportes";
import { Card } from "../../components/ui/Card";

const POR_PAGINA = 15;

export function InventarioValorizadoReporte() {
  const api = useApi();
  const [datos, setDatos] = useState<InventarioValorizado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);

    api<InventarioValorizado>("/reportes/inventario-valorizado")
      .then((data) => {
        if (!activo) return;
        setDatos(data);
        setPagina(0);
      })
      .catch((err) => activo && setError(err instanceof ApiError ? err.message : "No se pudo cargar el reporte"))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, [api]);

  const detalleOrdenado = datos ? [...datos.detalle].sort((a, b) => Number(b.valorTotal) - Number(a.valorTotal)) : [];
  const totalPaginas = Math.max(1, Math.ceil(detalleOrdenado.length / POR_PAGINA));
  const detalleMostrado = detalleOrdenado.slice(pagina * POR_PAGINA, pagina * POR_PAGINA + POR_PAGINA);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-texto">Inventario valorizado</h2>
        {datos && (
          <p className="text-sm text-texto-secundario">
            Valor total del inventario: <span className="font-semibold text-dorado">${Number(datos.totalValorizado).toFixed(2)}</span>
          </p>
        )}
      </div>

      {error && <p className="text-sm text-rojo">{error}</p>}

      {cargando ? (
        <p className="text-sm text-texto-secundario">Cargando…</p>
      ) : !datos || datos.detalle.length === 0 ? (
        <p className="text-sm text-texto-secundario">Todavía no hay insumos cargados.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-texto-secundario">
                  <th className="py-2 text-left font-medium">Insumo</th>
                  <th className="py-2 text-left font-medium">Categoría</th>
                  <th className="py-2 text-right font-medium">Stock actual</th>
                  <th className="py-2 text-right font-medium">Costo unitario</th>
                  <th className="py-2 text-right font-medium">Valor total</th>
                </tr>
              </thead>
              <tbody>
                {detalleMostrado.map((item) => (
                  <tr key={item.insumoId} className="border-b border-white/5 last:border-0">
                    <td className="py-2.5 font-medium text-texto">{item.nombre}</td>
                    <td className="py-2.5 text-texto-secundario">{item.categoria}</td>
                    <td className="py-2.5 text-right tabular-nums text-texto">
                      {Number(item.stockActual)} {item.unidad === "ML" ? "ml" : "u."}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-texto-secundario">${Number(item.costo).toFixed(2)}</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums text-dorado">${Number(item.valorTotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPagina((p) => Math.max(0, p - 1))}
                disabled={pagina === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-texto transition-colors hover:bg-black/30 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Página anterior"
              >
                ‹
              </button>
              <span className="text-xs text-texto-secundario">
                Página {pagina + 1} de {totalPaginas} · {detalleOrdenado.length} insumos en total
              </span>
              <button
                type="button"
                onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
                disabled={pagina >= totalPaginas - 1}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-texto transition-colors hover:bg-black/30 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Página siguiente"
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
