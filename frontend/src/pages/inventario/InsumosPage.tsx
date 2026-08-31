import { useEffect, useMemo, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import { ds } from "../../lib/designSystem";
import type { Categoria, Insumo, MovimientoInventario, UnidadMedida } from "../../types/inventario";

type EstadoInsumo = "ok" | "bajo" | "agotado";
type FiltroEstado = "todos" | EstadoInsumo;
type ModalInsumo = null | "nuevo" | "editar";
type ModalAccion = null | "entrada" | "ajuste" | "kardex";

interface FormInsumo {
  nombre: string;
  categoriaId: string;
  unidad: UnidadMedida;
  costo: string;
  stockActual: string;
  stockMinimo: string;
}

const FORM_VACIO: FormInsumo = { nombre: "", categoriaId: "", unidad: "UNIDAD", costo: "", stockActual: "0", stockMinimo: "0" };

const MOTIVOS_AJUSTE = ["Conteo físico", "Merma", "Rotura", "Corrección", "Otro"];

const POR_PAGINA = 10;

function estadoInsumo(insumo: Insumo): EstadoInsumo {
  const actual = Number(insumo.stockActual);
  const minimo = Number(insumo.stockMinimo);
  if (actual <= 0) return "agotado";
  if (actual <= minimo) return "bajo";
  return "ok";
}

const TONE_POR_ESTADO: Record<EstadoInsumo, "free" | "warning" | "danger"> = {
  ok: "free",
  bajo: "warning",
  agotado: "danger",
};

const LABEL_POR_ESTADO: Record<EstadoInsumo, string> = { ok: "OK", bajo: "BAJO", agotado: "AGOTADO" };

function icono(src: string) {
  return <img src={src} style={{ width: 16, height: 16, filter: "invert(1)", opacity: 0.75 }} />;
}

export function InsumosPage() {
  const api = useApi();
  const { Card, Button, Input, Select, Tabs, Modal, IconButton, Badge, NumericStepper } = ds();

  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<FiltroEstado>("todos");
  const [pagina, setPagina] = useState(0);

  const [modalInsumo, setModalInsumo] = useState<ModalInsumo>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<FormInsumo>(FORM_VACIO);
  const [formError, setFormError] = useState<string | null>(null);
  const [costoPresentacionTotal, setCostoPresentacionTotal] = useState("");
  const [contenidoPresentacion, setContenidoPresentacion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState<number | null>(null);

  const [modalAccion, setModalAccion] = useState<ModalAccion>(null);
  const [insumoAccionId, setInsumoAccionId] = useState<number | null>(null);
  const [entradaQty, setEntradaQty] = useState(10);
  const [ajusteValor, setAjusteValor] = useState(0);
  const [ajusteMotivo, setAjusteMotivo] = useState(MOTIVOS_AJUSTE[0]);
  const [accionError, setAccionError] = useState<string | null>(null);
  const [procesandoAccion, setProcesandoAccion] = useState(false);
  const [kardex, setKardex] = useState<(MovimientoInventario & { saldo: number })[]>([]);
  const [cargandoKardex, setCargandoKardex] = useState(false);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardPaso, setWizardPaso] = useState<1 | 2>(1);
  const [wizardNombre, setWizardNombre] = useState("");
  const [wizardCategoriaId, setWizardCategoriaId] = useState("");
  const [wizardPrecio, setWizardPrecio] = useState("");
  const [wizardReceta, setWizardReceta] = useState<{ insumoId: string; cantidad: number }[]>([]);
  const [wizardAddInsumoId, setWizardAddInsumoId] = useState("");
  const [wizardError, setWizardError] = useState<string | null>(null);
  const [wizardGuardando, setWizardGuardando] = useState(false);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const [insumosData, categoriasData] = await Promise.all([
        api<Insumo[]>("/insumos"),
        api<Categoria[]>("/categorias"),
      ]);
      setInsumos(insumosData);
      setCategorias(categoriasData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar el inventario");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const insumosFiltrados = useMemo(() => {
    return insumos.filter((insumo) => {
      if (search.trim() && !insumo.nombre.toLowerCase().includes(search.trim().toLowerCase())) return false;
      if (categoriaFiltro && String(insumo.categoriaId) !== categoriaFiltro) return false;
      if (estadoFiltro !== "todos" && estadoInsumo(insumo) !== estadoFiltro) return false;
      return true;
    });
  }, [insumos, search, categoriaFiltro, estadoFiltro]);

  // Si el filtro cambia (o deja de haber resultados suficientes) volvemos a
  // la primera página, para no quedar mostrando una página vacía.
  useEffect(() => {
    setPagina(0);
  }, [search, categoriaFiltro, estadoFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(insumosFiltrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas - 1);
  const insumosMostrados = insumosFiltrados.slice(paginaSegura * POR_PAGINA, paginaSegura * POR_PAGINA + POR_PAGINA);

  function abrirNuevoInsumo() {
    setEditandoId(null);
    setForm(FORM_VACIO);
    setFormError(null);
    setCostoPresentacionTotal("");
    setContenidoPresentacion("");
    setModalInsumo("nuevo");
  }

  function abrirEditarInsumo(insumo: Insumo) {
    setEditandoId(insumo.id);
    setForm({
      nombre: insumo.nombre,
      categoriaId: String(insumo.categoriaId),
      unidad: insumo.unidad,
      costo: insumo.costo,
      stockActual: insumo.stockActual,
      stockMinimo: insumo.stockMinimo,
    });
    setFormError(null);
    setCostoPresentacionTotal("");
    setContenidoPresentacion("");
    setModalInsumo("editar");
  }

  function cerrarModalInsumo() {
    setModalInsumo(null);
    setEditandoId(null);
    setFormError(null);
  }

  const costoPorMlCalculado =
    Number(costoPresentacionTotal) > 0 && Number(contenidoPresentacion) > 0
      ? Number(costoPresentacionTotal) / Number(contenidoPresentacion)
      : null;

  function usarCostoCalculado() {
    if (costoPorMlCalculado === null) return;
    setForm((prev) => ({ ...prev, costo: costoPorMlCalculado.toFixed(4) }));
  }

  async function guardarInsumo() {
    setFormError(null);
    if (!form.nombre.trim()) {
      setFormError("El nombre es requerido");
      return;
    }
    if (!form.categoriaId) {
      setFormError("Elegí una categoría");
      return;
    }
    const body = {
      nombre: form.nombre,
      categoriaId: Number(form.categoriaId),
      unidad: form.unidad,
      costo: Number(form.costo || 0),
      stockActual: Number(form.stockActual || 0),
      stockMinimo: Number(form.stockMinimo || 0),
    };
    setGuardando(true);
    try {
      if (editandoId) {
        await api<Insumo>(`/insumos/${editandoId}`, { method: "PUT", body });
      } else {
        await api<Insumo>("/insumos", { method: "POST", body });
      }
      cerrarModalInsumo();
      await cargar();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No se pudo guardar el insumo");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarInsumo(id: number) {
    setError(null);
    try {
      await api(`/insumos/${id}`, { method: "DELETE" });
      setConfirmandoEliminar(null);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar el insumo");
    }
  }

  function cerrarModalAccion() {
    setModalAccion(null);
    setInsumoAccionId(null);
    setAccionError(null);
    setKardex([]);
  }

  function abrirEntrada(insumo: Insumo) {
    setInsumoAccionId(insumo.id);
    setEntradaQty(10);
    setAccionError(null);
    setModalAccion("entrada");
  }

  function abrirAjuste(insumo: Insumo) {
    setInsumoAccionId(insumo.id);
    setAjusteValor(Number(insumo.stockActual));
    setAjusteMotivo(MOTIVOS_AJUSTE[0]);
    setAccionError(null);
    setModalAccion("ajuste");
  }

  async function abrirKardex(insumo: Insumo) {
    setInsumoAccionId(insumo.id);
    setAccionError(null);
    setModalAccion("kardex");
    setCargandoKardex(true);
    try {
      const movimientos = await api<MovimientoInventario[]>(`/insumos/${insumo.id}/movimientos`);
      let saldo = Number(insumo.stockActual);
      const conSaldo = movimientos.map((mov) => {
        const fila = { ...mov, saldo };
        const cantidad = Number(mov.cantidad);
        saldo -= mov.tipo === "SALIDA" ? -cantidad : cantidad;
        return fila;
      });
      setKardex(conSaldo);
    } catch (err) {
      setAccionError(err instanceof ApiError ? err.message : "No se pudo cargar el kardex");
    } finally {
      setCargandoKardex(false);
    }
  }

  const insumoEnAccion = insumos.find((i) => i.id === insumoAccionId) ?? null;

  async function confirmarEntrada() {
    if (!insumoAccionId) return;
    setProcesandoAccion(true);
    setAccionError(null);
    try {
      await api(`/insumos/${insumoAccionId}/entradas`, { method: "POST", body: { cantidad: entradaQty } });
      cerrarModalAccion();
      await cargar();
    } catch (err) {
      setAccionError(err instanceof ApiError ? err.message : "No se pudo registrar la entrada");
    } finally {
      setProcesandoAccion(false);
    }
  }

  async function confirmarAjuste() {
    if (!insumoAccionId || !insumoEnAccion) return;
    const delta = ajusteValor - Number(insumoEnAccion.stockActual);
    if (delta === 0) {
      setAccionError("El nuevo conteo es igual al actual; no hay ajuste que registrar");
      return;
    }
    setProcesandoAccion(true);
    setAccionError(null);
    try {
      await api(`/insumos/${insumoAccionId}/ajustes`, { method: "POST", body: { cantidad: delta, motivo: ajusteMotivo } });
      cerrarModalAccion();
      await cargar();
    } catch (err) {
      setAccionError(err instanceof ApiError ? err.message : "No se pudo registrar el ajuste");
    } finally {
      setProcesandoAccion(false);
    }
  }

  function abrirWizard() {
    setWizardPaso(1);
    setWizardNombre("");
    setWizardCategoriaId("");
    setWizardPrecio("");
    setWizardReceta([]);
    setWizardAddInsumoId("");
    setWizardError(null);
    setWizardOpen(true);
  }

  function cerrarWizard() {
    setWizardOpen(false);
  }

  function agregarFilaReceta() {
    if (!wizardAddInsumoId) return;
    if (wizardReceta.some((r) => r.insumoId === wizardAddInsumoId)) return;
    setWizardReceta((prev) => [...prev, { insumoId: wizardAddInsumoId, cantidad: 1 }]);
    setWizardAddInsumoId("");
  }

  function quitarFilaReceta(insumoId: string) {
    setWizardReceta((prev) => prev.filter((r) => r.insumoId !== insumoId));
  }

  async function guardarProducto() {
    setWizardError(null);
    if (wizardReceta.length === 0) {
      setWizardError("Agregá al menos un insumo a la receta");
      return;
    }
    setWizardGuardando(true);
    try {
      await api("/productos-venta", {
        method: "POST",
        body: {
          nombre: wizardNombre,
          categoriaId: Number(wizardCategoriaId),
          precioVenta: Number(wizardPrecio),
          receta: wizardReceta.map((r) => ({ insumoId: Number(r.insumoId), cantidad: r.cantidad })),
        },
      });
      cerrarWizard();
    } catch (err) {
      setWizardError(err instanceof ApiError ? err.message : "No se pudo guardar el producto");
    } finally {
      setWizardGuardando(false);
    }
  }

  if (loading) return <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Cargando…</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: 26,
            color: "var(--text-primary)",
            letterSpacing: "var(--tracking-caps)",
            textTransform: "uppercase",
          }}
        >
          Inventario
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="outline" onClick={abrirNuevoInsumo}>
            + Nuevo insumo
          </Button>
          <Button variant="primary" onClick={abrirWizard}>
            + Nuevo producto
          </Button>
        </div>
      </div>

      {error && <p style={{ color: "var(--status-danger)", fontSize: 14, marginBottom: 12 }}>{error}</p>}

      <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <Input label="Buscar insumo" placeholder="Ej. maracuyá, tequila, mango" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ width: 220 }}>
          <Select
            label="Categoría"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            options={[{ value: "", label: "Todas" }, ...categorias.map((c) => ({ value: String(c.id), label: c.nombre }))]}
          />
        </div>
        <div style={{ width: 340 }}>
          <Tabs
            items={[
              { value: "todos", label: "Todos" },
              { value: "ok", label: "OK" },
              { value: "bajo", label: "Bajo" },
              { value: "agotado", label: "Agotado" },
            ]}
            active={estadoFiltro}
            onChange={(v) => setEstadoFiltro(v as FiltroEstado)}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <Card padding="0">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-caps)",
            }}
          >
            <div style={{ flex: 1 }}>Insumo</div>
            <div style={{ width: 110, textAlign: "right" }}>Existencia</div>
            <div style={{ width: 110 }}>Estado</div>
            <div style={{ width: 190 }}>Acciones</div>
          </div>
          {insumosFiltrados.length === 0 ? (
            <div style={{ padding: 20, color: "var(--text-secondary)", fontSize: 14 }}>Ningún insumo coincide con el filtro.</div>
          ) : (
            insumosMostrados.map((insumo) => {
              const estado = estadoInsumo(insumo);
              return (
                <div
                  key={insumo.id}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{insumo.nombre}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{insumo.categoria.nombre}</div>
                  </div>
                  <div style={{ width: 110, textAlign: "right", color: "var(--text-secondary)", fontSize: 14 }}>
                    {Number(insumo.stockActual)} {insumo.unidad === "ML" ? "ml" : "u."}
                  </div>
                  <div style={{ width: 110 }}>
                    <Badge tone={TONE_POR_ESTADO[estado]}>{LABEL_POR_ESTADO[estado]}</Badge>
                  </div>
                  <div style={{ width: 190 }}>
                    {confirmandoEliminar === insumo.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <Button variant="secondary" size="s" onClick={() => eliminarInsumo(insumo.id)}>
                          Confirmar
                        </Button>
                        <Button variant="ghost" size="s" onClick={() => setConfirmandoEliminar(null)}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 6 }}>
                        <IconButton icon={icono("https://unpkg.com/lucide-static/icons/plus.svg")} label="Registrar entrada" onClick={() => abrirEntrada(insumo)} />
                        <IconButton icon={icono("https://unpkg.com/lucide-static/icons/sliders-horizontal.svg")} label="Hacer ajuste" onClick={() => abrirAjuste(insumo)} />
                        <IconButton icon={icono("https://unpkg.com/lucide-static/icons/history.svg")} label="Ver historial (kardex)" onClick={() => abrirKardex(insumo)} />
                        <IconButton icon={icono("https://unpkg.com/lucide-static/icons/pencil.svg")} label="Editar" onClick={() => abrirEditarInsumo(insumo)} />
                        <IconButton icon={icono("https://unpkg.com/lucide-static/icons/trash-2.svg")} label="Eliminar" onClick={() => setConfirmandoEliminar(insumo.id)} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {totalPaginas > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "12px 20px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <Button variant="ghost" size="s" disabled={paginaSegura === 0} onClick={() => setPagina((p) => Math.max(0, p - 1))}>
                ‹ Anterior
              </Button>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Página {paginaSegura + 1} de {totalPaginas} · {insumosFiltrados.length} insumos
              </span>
              <Button
                variant="ghost"
                size="s"
                disabled={paginaSegura >= totalPaginas - 1}
                onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
              >
                Siguiente ›
              </Button>
            </div>
          )}
        </Card>
      </div>

      <Modal open={modalInsumo !== null} title={modalInsumo === "editar" ? "Editar insumo" : "Nuevo insumo"} onClose={cerrarModalInsumo}>
        <div style={{ minWidth: 320, maxWidth: 380, maxHeight: "80vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, paddingRight: 4 }}>
          <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Tequila" />
          <Select
            label="Categoría"
            value={form.categoriaId}
            onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
            options={[{ value: "", label: "Elegir…" }, ...categorias.map((c) => ({ value: String(c.id), label: c.nombre }))]}
          />
          <Select
            label="Unidad de medida"
            value={form.unidad}
            onChange={(e) => setForm({ ...form, unidad: e.target.value as UnidadMedida })}
            options={[
              { value: "UNIDAD", label: "Unidad (ej. cerveza, snack)" },
              { value: "ML", label: "Mililitros (ej. licor)" },
            ]}
          />
          <Input
            label={form.unidad === "ML" ? "Costo por ml" : "Costo por unidad"}
            type="number"
            value={form.costo}
            onChange={(e) => setForm({ ...form, costo: e.target.value })}
          />
          {form.unidad === "ML" && (
            <div style={{ background: "var(--surface-sunken)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-m)", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                ¿No sabés el costo por ml? Calculalo a partir de lo que te costó la presentación completa (ej. la botella).
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Input
                    label="Costo de la botella"
                    type="number"
                    value={costoPresentacionTotal}
                    onChange={(e) => setCostoPresentacionTotal(e.target.value)}
                    placeholder="Ej. 300"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Input
                    label="Contenido (ml)"
                    type="number"
                    value={contenidoPresentacion}
                    onChange={(e) => setContenidoPresentacion(e.target.value)}
                    placeholder="Ej. 750"
                  />
                </div>
              </div>
              {costoPorMlCalculado !== null && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 13, color: "var(--text-primary)" }}>= ${costoPorMlCalculado.toFixed(4)} por ml</span>
                  <Button variant="outline" size="s" onClick={usarCostoCalculado}>
                    Usar este costo
                  </Button>
                </div>
              )}
            </div>
          )}
          <Input label="Stock actual" type="number" value={form.stockActual} onChange={(e) => setForm({ ...form, stockActual: e.target.value })} />
          <Input label="Stock mínimo (alerta)" type="number" value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })} />
          {formError && <p style={{ color: "var(--status-danger)", fontSize: 13 }}>{formError}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="primary" disabled={guardando} onClick={guardarInsumo}>
              {guardando ? "Guardando…" : modalInsumo === "editar" ? "Guardar cambios" : "Crear"}
            </Button>
            <Button variant="ghost" onClick={cerrarModalInsumo}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={modalAccion === "entrada"} title="Registrar entrada" onClose={cerrarModalAccion}>
        {insumoEnAccion && (
          <div style={{ minWidth: 320 }}>
            <div style={{ color: "var(--text-secondary)", marginBottom: 6 }}>{insumoEnAccion.nombre}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>
              Existencia actual: {Number(insumoEnAccion.stockActual)} {insumoEnAccion.unidad === "ML" ? "ml" : "u."}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <NumericStepper value={entradaQty} onChange={setEntradaQty} min={1} max={9999} />
              <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{insumoEnAccion.unidad === "ML" ? "ml" : "u."} a agregar</span>
            </div>
            {accionError && <p style={{ color: "var(--status-danger)", fontSize: 13, marginBottom: 12 }}>{accionError}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="primary" disabled={procesandoAccion} onClick={confirmarEntrada}>
                {procesandoAccion ? "Guardando…" : "Registrar entrada"}
              </Button>
              <Button variant="ghost" onClick={cerrarModalAccion}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modalAccion === "ajuste"} title="Ajustar existencia" onClose={cerrarModalAccion}>
        {insumoEnAccion && (
          <div style={{ minWidth: 320 }}>
            <div style={{ color: "var(--text-secondary)", marginBottom: 6 }}>{insumoEnAccion.nombre}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>
              Existencia registrada: {Number(insumoEnAccion.stockActual)} {insumoEnAccion.unidad === "ML" ? "ml" : "u."}
            </div>
            <div style={{ marginBottom: 14 }}>
              <Select
                label="Motivo"
                value={ajusteMotivo}
                onChange={(e) => setAjusteMotivo(e.target.value)}
                options={MOTIVOS_AJUSTE.map((m) => ({ value: m, label: m }))}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <NumericStepper value={ajusteValor} onChange={setAjusteValor} min={0} max={99999} />
              <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{insumoEnAccion.unidad === "ML" ? "ml" : "u."} (nuevo conteo)</span>
            </div>
            {accionError && <p style={{ color: "var(--status-danger)", fontSize: 13, marginBottom: 12 }}>{accionError}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="primary" disabled={procesandoAccion} onClick={confirmarAjuste}>
                {procesandoAccion ? "Guardando…" : "Guardar ajuste"}
              </Button>
              <Button variant="ghost" onClick={cerrarModalAccion}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modalAccion === "kardex"} title="Kardex" onClose={cerrarModalAccion}>
        {insumoEnAccion && (
          <div style={{ minWidth: 320, maxWidth: 440 }}>
            <div style={{ color: "var(--text-secondary)", marginBottom: 14 }}>
              {insumoEnAccion.nombre} · {insumoEnAccion.unidad === "ML" ? "ml" : "u."}
            </div>
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {cargandoKardex ? (
                <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Cargando…</p>
              ) : kardex.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Sin movimientos registrados.</p>
              ) : (
                kardex.map((mov) => (
                  <div
                    key={mov.id}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    <div>
                      <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 14 }}>{mov.tipo}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                        {new Date(mov.fecha).toLocaleDateString()} · {mov.usuario.nombre}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "var(--color-gold)", fontWeight: 700 }}>
                        {Number(mov.cantidad) > 0 && mov.tipo !== "SALIDA" ? "+" : mov.tipo === "SALIDA" ? "-" : ""}
                        {Number(mov.cantidad)}
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Saldo: {mov.saldo}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ marginTop: 16 }}>
              <Button variant="ghost" onClick={cerrarModalAccion}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={wizardOpen} title="Nuevo producto de venta" onClose={cerrarWizard}>
        <div style={{ minWidth: 340, maxWidth: 420, maxHeight: "80vh", overflowY: "auto", paddingRight: 4 }}>
          {wizardPaso === 1 ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
                <Input label="Nombre del producto" placeholder="Ej. Michelada especial" value={wizardNombre} onChange={(e) => setWizardNombre(e.target.value)} />
                <Select
                  label="Categoría de venta"
                  value={wizardCategoriaId}
                  onChange={(e) => setWizardCategoriaId(e.target.value)}
                  options={[{ value: "", label: "Elegir…" }, ...categorias.map((c) => ({ value: String(c.id), label: c.nombre }))]}
                />
                <Input label="Precio" type="number" placeholder="0" value={wizardPrecio} onChange={(e) => setWizardPrecio(e.target.value)} />
              </div>
              {wizardError && <p style={{ color: "var(--status-danger)", fontSize: 13, marginBottom: 12 }}>{wizardError}</p>}
              <div style={{ display: "flex", gap: 10 }}>
                <Button
                  variant="primary"
                  disabled={!wizardNombre.trim() || !wizardCategoriaId || !wizardPrecio}
                  onClick={() => setWizardPaso(2)}
                >
                  Siguiente
                </Button>
                <Button variant="ghost" onClick={cerrarWizard}>
                  Cancelar
                </Button>
              </div>
            </>
          ) : (
            <>
              <div style={{ color: "var(--text-secondary)", marginBottom: 12, fontSize: 13 }}>Receta · insumos que consume este producto</div>
              <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 12 }}>
                {wizardReceta.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: 13, padding: "10px 0" }}>Aún no agregas insumos a la receta.</p>
                ) : (
                  wizardReceta.map((r) => {
                    const insumo = insumos.find((i) => String(i.id) === r.insumoId);
                    return (
                      <div key={r.insumoId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                        <span style={{ color: "var(--text-primary)", fontSize: 14, flex: 1 }}>{insumo?.nombre}</span>
                        <NumericStepper
                          value={r.cantidad}
                          onChange={(v) => setWizardReceta((prev) => prev.map((row) => (row.insumoId === r.insumoId ? { ...row, cantidad: v } : row)))}
                          min={1}
                          max={999}
                        />
                        <span style={{ color: "var(--text-muted)", fontSize: 12, width: 40 }}>{insumo?.unidad === "ML" ? "ml" : "u."}</span>
                        <button onClick={() => quitarFilaReceta(r.insumoId)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16 }}>
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 18 }}>
                <div style={{ flex: 1 }}>
                  <Select
                    label="Agregar insumo"
                    value={wizardAddInsumoId}
                    onChange={(e) => setWizardAddInsumoId(e.target.value)}
                    options={[
                      { value: "", label: "Elegir…" },
                      ...insumos
                        .filter((i) => !wizardReceta.some((r) => r.insumoId === String(i.id)))
                        .map((i) => ({ value: String(i.id), label: i.nombre })),
                    ]}
                  />
                </div>
                <Button variant="outline" onClick={agregarFilaReceta}>
                  Agregar
                </Button>
              </div>
              {wizardError && <p style={{ color: "var(--status-danger)", fontSize: 13, marginBottom: 12 }}>{wizardError}</p>}
              <div style={{ display: "flex", gap: 10 }}>
                <Button variant="primary" disabled={wizardGuardando} onClick={guardarProducto}>
                  {wizardGuardando ? "Guardando…" : "Guardar producto"}
                </Button>
                <Button variant="ghost" onClick={() => setWizardPaso(1)}>
                  Atrás
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
