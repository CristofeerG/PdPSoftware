import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import type { Categoria, Insumo, ProductoVenta } from "../../types/inventario";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Input, Select } from "../../components/ui/Input";

interface RecetaFila {
  key: string;
  recetaItemId?: number;
  insumoId: string;
  cantidad: string;
}

let contadorFilas = 0;
function nuevaFila(): RecetaFila {
  contadorFilas += 1;
  return { key: `nueva-${contadorFilas}`, insumoId: "", cantidad: "" };
}

export function ProductoVentaFormPage() {
  const { id } = useParams();
  const modoEdicion = Boolean(id);
  const navigate = useNavigate();
  const api = useApi();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [filas, setFilas] = useState<RecetaFila[]>([]);
  const [cantidadesOriginales, setCantidadesOriginales] = useState<Record<number, string>>({});
  const [eliminadas, setEliminadas] = useState<number[]>([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargar() {
      setCargandoDatos(true);
      setError(null);
      try {
        const [categoriasData, insumosData] = await Promise.all([
          api<Categoria[]>("/categorias"),
          api<Insumo[]>("/insumos"),
        ]);
        setCategorias(categoriasData);
        setInsumos(insumosData);

        if (id) {
          const producto = await api<ProductoVenta>(`/productos-venta/${id}`);
          setNombre(producto.nombre);
          setCategoriaId(String(producto.categoriaId));
          setPrecioVenta(producto.precioVenta);
          const filasIniciales = producto.recetaItems.map((r) => ({
            key: `existente-${r.id}`,
            recetaItemId: r.id,
            insumoId: String(r.insumoId),
            cantidad: r.cantidad,
          }));
          setFilas(filasIniciales);
          setCantidadesOriginales(
            Object.fromEntries(producto.recetaItems.map((r) => [r.id, r.cantidad])),
          );
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "No se pudo cargar los datos");
      } finally {
        setCargandoDatos(false);
      }
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function agregarFila() {
    setFilas((prev) => [...prev, nuevaFila()]);
  }

  function quitarFila(fila: RecetaFila) {
    if (fila.recetaItemId) {
      setEliminadas((prev) => [...prev, fila.recetaItemId!]);
    }
    setFilas((prev) => prev.filter((f) => f.key !== fila.key));
  }

  function actualizarFila(key: string, cambios: Partial<RecetaFila>) {
    setFilas((prev) => prev.map((f) => (f.key === key ? { ...f, ...cambios } : f)));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!categoriaId) {
      setError("Elegí una categoría");
      return;
    }
    if (filas.some((f) => !f.insumoId || !f.cantidad || Number(f.cantidad) <= 0)) {
      setError("Cada línea de receta necesita un insumo y una cantidad mayor a 0");
      return;
    }
    const idsInsumos = filas.map((f) => f.insumoId);
    if (new Set(idsInsumos).size !== idsInsumos.length) {
      setError("No repitas el mismo insumo en dos líneas de receta");
      return;
    }

    setGuardando(true);
    try {
      if (!modoEdicion) {
        await api<ProductoVenta>("/productos-venta", {
          method: "POST",
          body: {
            nombre,
            categoriaId: Number(categoriaId),
            precioVenta: Number(precioVenta),
            receta: filas.map((f) => ({ insumoId: Number(f.insumoId), cantidad: Number(f.cantidad) })),
          },
        });
      } else {
        await api<ProductoVenta>(`/productos-venta/${id}`, {
          method: "PUT",
          body: { nombre, categoriaId: Number(categoriaId), precioVenta: Number(precioVenta) },
        });

        for (const recetaItemId of eliminadas) {
          await api(`/productos-venta/${id}/receta/${recetaItemId}`, { method: "DELETE" });
        }

        for (const fila of filas) {
          if (!fila.recetaItemId) {
            await api(`/productos-venta/${id}/receta`, {
              method: "POST",
              body: { insumoId: Number(fila.insumoId), cantidad: Number(fila.cantidad) },
            });
          } else if (cantidadesOriginales[fila.recetaItemId] !== fila.cantidad) {
            await api(`/productos-venta/${id}/receta/${fila.recetaItemId}`, {
              method: "PUT",
              body: { cantidad: Number(fila.cantidad) },
            });
          }
        }
      }

      navigate("/admin/productos-venta");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar el producto");
    } finally {
      setGuardando(false);
    }
  }

  if (cargandoDatos) {
    return <p className="text-sm text-texto-secundario">Cargando…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Link to="/admin/productos-venta" className="text-sm text-texto-secundario hover:text-texto">
        ← Volver a Productos de venta
      </Link>

      <Card>
        <h1 className="mb-4 text-lg font-semibold text-texto">
          {modoEdicion ? "Editar producto de venta" : "Nuevo producto de venta"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Nombre" htmlFor="pv-nombre">
              <Input
                id="pv-nombre"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Ej. Tequila — Shot"
                required
              />
            </Field>

            <Field label="Categoría" htmlFor="pv-categoria">
              <Select
                id="pv-categoria"
                value={categoriaId}
                onChange={(event) => setCategoriaId(event.target.value)}
                required
              >
                <option value="" disabled>
                  Elegir…
                </option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Precio de venta" htmlFor="pv-precio">
              <Input
                id="pv-precio"
                type="number"
                step="0.01"
                min="0"
                value={precioVenta}
                onChange={(event) => setPrecioVenta(event.target.value)}
                required
              />
            </Field>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-texto-secundario">Receta</h2>
              <Button type="button" variant="secondary" className="px-2 py-1" onClick={agregarFila}>
                + Agregar insumo
              </Button>
            </div>

            {filas.length === 0 ? (
              <p className="rounded-md border border-dashed border-texto-secundario/40 px-3 py-4 text-center text-sm text-texto-secundario">
                Sin líneas de receta. Para un ítem simple (ej. una cerveza), agregá el insumo con cantidad 1.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {filas.map((fila) => (
                  <div key={fila.key} className="grid grid-cols-[1fr_120px_auto] items-center gap-2">
                    <Select
                      value={fila.insumoId}
                      onChange={(event) => actualizarFila(fila.key, { insumoId: event.target.value })}
                      required
                    >
                      <option value="" disabled>
                        Elegir insumo…
                      </option>
                      {insumos.map((insumo) => (
                        <option key={insumo.id} value={insumo.id}>
                          {insumo.nombre} ({insumo.unidad === "ML" ? "ml" : "u."})
                        </option>
                      ))}
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Cantidad"
                      value={fila.cantidad}
                      onChange={(event) => actualizarFila(fila.key, { cantidad: event.target.value })}
                      required
                    />
                    <Button type="button" variant="ghost" className="px-2 py-1 text-rojo" onClick={() => quitarFila(fila)}>
                      Quitar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-rojo">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar"}
            </Button>
            <Link to="/admin/productos-venta">
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
