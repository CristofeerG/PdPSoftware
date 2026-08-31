import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import type { ProductoVenta } from "../../types/inventario";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ConfirmButton } from "../../components/ui/ConfirmButton";
import { Input } from "../../components/ui/Input";

export function ProductosVentaPage() {
  const api = useApi();
  const [productos, setProductos] = useState<ProductoVenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(0);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<ProductoVenta[]>("/productos-venta");
      setProductos(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar productos de venta");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function eliminar(id: number) {
    setError(null);
    try {
      await api(`/productos-venta/${id}`, { method: "DELETE" });
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar el producto");
    }
  }

  const grupos = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtrados = q ? productos.filter((p) => p.nombre.toLowerCase().includes(q)) : productos;

    const porCategoria = new Map<string, ProductoVenta[]>();
    for (const producto of filtrados) {
      const nombreCategoria = producto.categoria?.nombre ?? "Sin categoría";
      if (!porCategoria.has(nombreCategoria)) porCategoria.set(nombreCategoria, []);
      porCategoria.get(nombreCategoria)!.push(producto);
    }

    return Array.from(porCategoria.entries())
      .map(([nombreCategoria, items]) => ({
        nombreCategoria,
        items: items.slice().sort((a, b) => a.nombre.localeCompare(b.nombre)),
      }))
      .sort((a, b) => a.nombreCategoria.localeCompare(b.nombreCategoria));
  }, [productos, busqueda]);

  // Acá la "página" es una categoría entera, no un bloque de N productos: cada
  // categoría se ve completa (por eso no hay tope por cantidad), y se navega
  // de una categoría a la siguiente.
  useEffect(() => {
    setPagina(0);
  }, [busqueda]);

  const totalPaginas = grupos.length;
  const paginaSegura = Math.min(pagina, Math.max(0, totalPaginas - 1));
  const grupoActual = grupos[paginaSegura] ?? null;

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-texto">Productos de venta</h1>
        <Link to="/admin/productos-venta/nuevo">
          <Button type="button">+ Nuevo producto</Button>
        </Link>
      </div>

      <div className="mb-4">
        <Input
          type="search"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar producto por nombre…"
        />
      </div>

      {error && <p className="mb-3 rounded-md bg-rojo/10 px-3 py-2 text-sm text-rojo">{error}</p>}

      {loading ? (
        <p className="text-sm text-texto-secundario">Cargando…</p>
      ) : productos.length === 0 ? (
        <p className="text-sm text-texto-secundario">Todavía no hay productos de venta.</p>
      ) : grupos.length === 0 ? (
        <p className="text-sm text-texto-secundario">No se encontraron productos para "{busqueda}".</p>
      ) : (
        grupoActual && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-texto-secundario">
                {grupoActual.nombreCategoria}
              </h2>
              <ul className="divide-y divide-black/20">
                {grupoActual.items.map((producto) => (
                  <li key={producto.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium text-texto">{producto.nombre}</p>
                      <p className="text-sm text-texto-secundario">
                        {producto.recetaItems.length === 0
                          ? "Sin receta"
                          : producto.recetaItems
                              .map((r) => `${Number(r.cantidad)}${r.insumo.unidad === "ML" ? "ml" : "u."} ${r.insumo.nombre}`)
                              .join(" + ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-dorado">${Number(producto.precioVenta).toFixed(2)}</span>
                      <Link
                        to={`/admin/productos-venta/${producto.id}/editar`}
                        className="rounded-md px-2 py-1 text-sm font-medium text-texto-secundario hover:text-texto"
                      >
                        Editar
                      </Link>
                      <ConfirmButton onConfirm={() => eliminar(producto.id)} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.max(0, p - 1))}
                  disabled={paginaSegura === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-texto transition-colors hover:bg-black/30 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Categoría anterior"
                >
                  ‹
                </button>
                <span className="text-xs text-texto-secundario">
                  Categoría {paginaSegura + 1} de {totalPaginas}
                </span>
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
                  disabled={paginaSegura >= totalPaginas - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-texto transition-colors hover:bg-black/30 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Categoría siguiente"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )
      )}
    </Card>
  );
}
