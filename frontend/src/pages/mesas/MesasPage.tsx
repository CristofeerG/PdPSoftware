import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import { getSocket } from "../../lib/socket";
import { ds } from "../../lib/designSystem";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { ESTADO_MESA_LABEL, nombreMesa, type Mesa } from "../../types/mesas";

function montoPendiente(cuenta: Mesa["cuentaAbierta"]): number {
  if (!cuenta) return 0;
  const pagado = cuenta.itemsConsumo.reduce(
    (acc, item) => acc + item.cantidadPagada * Number(item.precioUnitario),
    0,
  );
  return Number(cuenta.total) - pagado;
}

function tieneSaldoPendiente(mesa: Mesa): boolean {
  return mesa.estado !== "LIBRE" && montoPendiente(mesa.cuentaAbierta) > 0.01;
}

function tileStatus(mesa: Mesa): "free" | "occupied" {
  return mesa.estado === "LIBRE" ? "free" : "occupied";
}

// El Button de la DS no tiene variante "atenuada hasta hover/click": su unica
// variante roja ("secondary") es siempre roja. Estos botones necesitan lo
// contrario — neutros en reposo, rojos solo al pasar el mouse o mientras el
// modal que abren sigue abierto — asi que se arman a mano replicando el
// mismo look base del Button (mismos tokens/tamaños que la variante "s").
const BOTON_ADMIN_BASE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontFamily: "var(--font-body)",
  fontWeight: 700,
  border: "1px solid transparent",
  cursor: "pointer",
  borderRadius: "var(--radius-m)",
  transition: "background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)",
  padding: "8px 14px",
  fontSize: 13,
};

const BOTON_ADMIN_NEUTRO: CSSProperties = {
  background: "transparent",
  color: "var(--text-primary)",
  borderColor: "var(--border-default)",
};

const BOTON_ADMIN_ROJO: CSSProperties = {
  background: "var(--color-red)",
  color: "var(--text-on-red)",
  borderColor: "var(--color-red)",
};

function BotonAdmin({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: ReactNode }) {
  const [hover, setHover] = useState(false);
  const rojo = hover || activo;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...BOTON_ADMIN_BASE, ...(rojo ? BOTON_ADMIN_ROJO : BOTON_ADMIN_NEUTRO) }}
    >
      {children}
    </button>
  );
}

export function MesasPage() {
  const api = useApi();
  const navigate = useNavigate();
  const { Badge, TableTile } = ds();
  const { tema, toggleTema } = useTheme();
  const { usuario } = useAuth();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalNuevaMesa, setModalNuevaMesa] = useState(false);
  const [modalModificarMesas, setModalModificarMesas] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const data = await api<Mesa[]>("/mesas");
        if (activo) setMesas(data);
      } catch (err) {
        if (activo) setError(err instanceof ApiError ? err.message : "No se pudo cargar las mesas");
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();

    const socket = getSocket();
    socket.on("mesa:actualizada", cargar);
    return () => {
      activo = false;
      socket.off("mesa:actualizada", cargar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (cargando) return <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Cargando…</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
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
          Mesas
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-secondary)" }}>
          <span>
            <span style={{ color: "var(--status-free)" }}>●</span> Libre
          </span>
          <span>
            <span style={{ color: "var(--status-occupied)" }}>●</span> Ocupada
          </span>
          <span>
            <span style={{ color: "var(--color-gold)" }}>●</span> Por cobrar
          </span>
        </div>
      </div>

      {error && <p style={{ color: "var(--status-danger)", fontSize: 14 }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 16 }}>
        {mesas.map((mesa) => (
          <div key={mesa.id} style={{ position: "relative", width: 120 }}>
            <TableTile
              number={mesa.nombre ?? mesa.numero}
              status={tileStatus(mesa)}
              total={mesa.cuentaAbierta ? Number(mesa.cuentaAbierta.total).toFixed(2) : undefined}
              onClick={() => navigate(`/mesas/${mesa.id}`)}
            />
            {tieneSaldoPendiente(mesa) && (
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                }}
              >
                <Badge tone="warning">Por cobrar</Badge>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={toggleTema}
        title={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          borderRadius: 999,
          border: "1px solid var(--border-default)",
          background: "var(--surface-2)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-body)",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          zIndex: 50,
        }}
      >
        {tema === "dark" ? "☀️ Modo claro" : "🌙 Modo oscuro"}
      </button>

      {usuario?.rol === "ADMIN" && (
        // Al lado del nombre logueado que pinta el sidebar (AppShellDesktop,
        // vendorizado en _ds_bundle.js) no hay un slot para agregar contenido
        // ahi adentro, asi que se posiciona fixed justo afuera de esa columna
        // (ancho fijo 220px + su padding) para que quede visualmente pegado.
        <div style={{ position: "fixed", bottom: 24, left: 234, display: "flex", gap: 8, zIndex: 50 }}>
          <BotonAdmin activo={modalNuevaMesa} onClick={() => setModalNuevaMesa(true)}>
            Nueva mesa
          </BotonAdmin>
          <BotonAdmin activo={modalModificarMesas} onClick={() => setModalModificarMesas(true)}>
            Modificar
          </BotonAdmin>
        </div>
      )}

      <NuevaMesaModal open={modalNuevaMesa} onClose={() => setModalNuevaMesa(false)} />
      <ModificarMesasModal open={modalModificarMesas} onClose={() => setModalModificarMesas(false)} />
    </div>
  );
}

function NuevaMesaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const api = useApi();
  const { Modal, Input, Button } = ds();
  const [valor, setValor] = useState("");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cerrar() {
    setValor("");
    setError(null);
    onClose();
  }

  async function confirmar() {
    if (!valor.trim()) return;
    setCreando(true);
    setError(null);
    try {
      // No hace falta recargar la lista de mesas a mano: el backend emite
      // mesa:actualizada al crear/reactivar, y el listener de MesasPage
      // (linea ~53) refresca la grilla solo, incluso en esta misma pestaña.
      await api("/mesas", { method: "POST", body: { identificador: valor.trim() } });
      cerrar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear la mesa");
    } finally {
      setCreando(false);
    }
  }

  return (
    <Modal open={open} title="Nueva mesa" onClose={cerrar}>
      <div style={{ minWidth: 320 }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            label="Identificador"
            placeholder="Ej: 9 o BARRA"
            value={valor}
            onChange={(event) => setValor(event.target.value)}
          />
        </div>
        {error && <p style={{ color: "var(--status-danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="primary" disabled={!valor.trim() || creando} onClick={confirmar}>
            {creando ? "Creando…" : "Crear"}
          </Button>
          <Button variant="ghost" onClick={cerrar}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const MESAS_POR_PAGINA = 5;

function iconoFlecha(direccion: "left" | "right") {
  return (
    <img
      src={`https://unpkg.com/lucide-static/icons/chevron-${direccion}.svg`}
      style={{ width: 14, height: 14, filter: "invert(1)", opacity: 0.75 }}
    />
  );
}

function ModificarMesasModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const api = useApi();
  const { Modal, Button, IconButton } = ds();
  // Estado propio del modal: separado del "mesas" de la grilla de fondo, que
  // solo trae mesas activas y se refresca via socket, no a mano.
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [pagina, setPagina] = useState(1);

  async function cargarMesas() {
    setCargando(true);
    setError(null);
    try {
      const data = await api<Mesa[]>("/mesas?incluirInactivas=true");
      setMesas(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar las mesas");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (open) {
      setPagina(1);
      cargarMesas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function alternarActivo(mesa: Mesa) {
    setProcesandoId(mesa.id);
    setError(null);
    try {
      await api(`/mesas/${mesa.id}/${mesa.activo ? "desactivar" : "activar"}`, { method: "POST" });
      await cargarMesas();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar la mesa");
    } finally {
      setProcesandoId(null);
    }
  }

  const totalPaginas = Math.max(1, Math.ceil(mesas.length / MESAS_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const mesasPagina = mesas.slice((paginaSegura - 1) * MESAS_POR_PAGINA, paginaSegura * MESAS_POR_PAGINA);

  return (
    <Modal open={open} title="Modificar mesas" onClose={onClose}>
      <div style={{ minWidth: 360, display: "flex", flexDirection: "column", gap: 10 }}>
        {error && <p style={{ color: "var(--status-danger)", fontSize: 13 }}>{error}</p>}
        {cargando ? (
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Cargando…</p>
        ) : mesas.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>No hay mesas cargadas.</p>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {mesasPagina.map((mesa, index) => {
                // Ni OCUPADA ni POR_COBRAR se pueden desactivar; solo aplica
                // cuando se va a desactivar una mesa activa, no al reactivar.
                const noDesactivable = mesa.activo && mesa.estado !== "LIBRE";
                return (
                  <div
                    key={mesa.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "10px 2px",
                      borderTop: index > 0 ? "1px solid var(--border-subtle)" : undefined,
                    }}
                  >
                    <div>
                      <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 14 }}>{nombreMesa(mesa)}</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                        {ESTADO_MESA_LABEL[mesa.estado]}
                        {!mesa.activo && " · Inactiva"}
                      </div>
                    </div>
                    <div title={noDesactivable ? "Mesa en uso" : undefined}>
                      <Button
                        variant="secondary"
                        disabled={noDesactivable || procesandoId === mesa.id}
                        onClick={() => alternarActivo(mesa)}
                      >
                        {procesandoId === mesa.id ? "…" : mesa.activo ? "Desactivar" : "Activar"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPaginas > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                  marginTop: 4,
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: 10,
                }}
              >
                <div style={paginaSegura <= 1 ? { opacity: 0.35, pointerEvents: "none" } : undefined}>
                  <IconButton icon={iconoFlecha("left")} label="Pagina anterior" onClick={() => setPagina((p) => p - 1)} />
                </div>
                <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                  {paginaSegura} / {totalPaginas}
                </span>
                <div style={paginaSegura >= totalPaginas ? { opacity: 0.35, pointerEvents: "none" } : undefined}>
                  <IconButton icon={iconoFlecha("right")} label="Pagina siguiente" onClick={() => setPagina((p) => p + 1)} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
