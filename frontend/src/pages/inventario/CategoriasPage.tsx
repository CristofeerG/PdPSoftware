import { useEffect, useState, type FormEvent } from "react";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import type { Categoria } from "../../types/inventario";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { ConfirmButton } from "../../components/ui/ConfirmButton";

const POR_PAGINA = 10;

export function CategoriasPage() {
  const api = useApi();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<Categoria[]>("/categorias");
      setCategorias(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar categorías");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function iniciarEdicion(categoria: Categoria) {
    setEditandoId(categoria.id);
    setNombre(categoria.nombre);
    setFormError(null);
  }

  const totalPaginas = Math.max(1, Math.ceil(categorias.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas - 1);
  const categoriasMostradas = categorias.slice(paginaSegura * POR_PAGINA, paginaSegura * POR_PAGINA + POR_PAGINA);

  function cancelar() {
    setEditandoId(null);
    setNombre("");
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setGuardando(true);
    try {
      if (editandoId) {
        await api<Categoria>(`/categorias/${editandoId}`, { method: "PUT", body: { nombre } });
      } else {
        await api<Categoria>("/categorias", { method: "POST", body: { nombre } });
      }
      cancelar();
      await cargar();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No se pudo guardar la categoría");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: number) {
    setError(null);
    try {
      await api(`/categorias/${id}`, { method: "DELETE" });
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar la categoría");
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <Card>
        <h1 className="mb-4 text-lg font-semibold text-texto">Categorías</h1>

        {error && <p className="mb-3 rounded-md bg-rojo/10 px-3 py-2 text-sm text-rojo">{error}</p>}

        {loading ? (
          <p className="text-sm text-texto-secundario">Cargando…</p>
        ) : categorias.length === 0 ? (
          <p className="text-sm text-texto-secundario">Todavía no hay categorías.</p>
        ) : (
          <>
            <ul className="divide-y divide-black/20">
              {categoriasMostradas.map((categoria) => (
                <li key={categoria.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-texto">{categoria.nombre}</span>
                  <span className="flex items-center gap-1">
                    <Button variant="ghost" className="px-2 py-1" onClick={() => iniciarEdicion(categoria)}>
                      Editar
                    </Button>
                    <ConfirmButton onConfirm={() => eliminar(categoria.id)} />
                  </span>
                </li>
              ))}
            </ul>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.max(0, p - 1))}
                  disabled={paginaSegura === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-texto transition-colors hover:bg-black/30 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Página anterior"
                >
                  ‹
                </button>
                <span className="text-xs text-texto-secundario">
                  Página {paginaSegura + 1} de {totalPaginas} · {categorias.length} categorías en total
                </span>
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
                  disabled={paginaSegura >= totalPaginas - 1}
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

      <Card className="h-fit">
        <h2 className="mb-4 text-base font-semibold text-texto">
          {editandoId ? "Editar categoría" : "Nueva categoría"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="Nombre" htmlFor="cat-nombre">
            <Input
              id="cat-nombre"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              required
              placeholder="Ej. Licores"
            />
          </Field>

          {formError && <p className="text-sm text-rojo">{formError}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : editandoId ? "Guardar cambios" : "Crear"}
            </Button>
            {editandoId && (
              <Button type="button" variant="secondary" onClick={cancelar}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
