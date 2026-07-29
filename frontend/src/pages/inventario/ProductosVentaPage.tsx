import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import type { ProductoVenta } from "../../types/inventario";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ConfirmButton } from "../../components/ui/ConfirmButton";

export function ProductosVentaPage() {
  const api = useApi();
  const [productos, setProductos] = useState<ProductoVenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-texto">Productos de venta</h1>
        <Link to="/admin/productos-venta/nuevo">
          <Button type="button">+ Nuevo producto</Button>
        </Link>
      </div>

      {error && <p className="mb-3 rounded-md bg-rojo/10 px-3 py-2 text-sm text-rojo">{error}</p>}

      {loading ? (
        <p className="text-sm text-texto-secundario">Cargando…</p>
      ) : productos.length === 0 ? (
        <p className="text-sm text-texto-secundario">Todavía no hay productos de venta.</p>
      ) : (
        <ul className="divide-y divide-black/20">
          {productos.map((producto) => (
            <li key={producto.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium text-texto">
                  {producto.nombre}{" "}
                  <span className="font-normal text-texto-secundario">— {producto.categoria.nombre}</span>
                </p>
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
      )}
    </Card>
  );
}
