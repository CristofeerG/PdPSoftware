import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth, type Rol } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { ApiError } from "../lib/api";
import { getSocket } from "../lib/socket";
import { ds, type NavItem as DsNavItem } from "../lib/designSystem";
import { METODOS_PAGO, nombreMesa as formatearNombreMesa, type MetodoPago } from "../types/mesas";

type SeccionKey = "mesas" | "inventario" | "reportes" | "historial" | "usuarios";

const NAV_ITEMS: DsNavItem[] = [
  { key: "mesas", label: "Mesas", icon: "https://unpkg.com/lucide-static/icons/layout-grid.svg" },
  { key: "inventario", label: "Inventario", icon: "https://unpkg.com/lucide-static/icons/boxes.svg" },
  { key: "reportes", label: "Reportes", icon: "https://unpkg.com/lucide-static/icons/bar-chart-3.svg" },
  { key: "historial", label: "Historial", icon: "https://unpkg.com/lucide-static/icons/history.svg" },
  { key: "usuarios", label: "Usuarios", icon: "https://unpkg.com/lucide-static/icons/users.svg" },
];

const SECCIONES_POR_ROL: Record<Rol, SeccionKey[]> = {
  ADMIN: ["mesas", "inventario", "reportes", "historial", "usuarios"],
  MESERO: ["mesas"],
};

const RUTA_POR_SECCION: Record<SeccionKey, string> = {
  mesas: "/mesas",
  inventario: "/admin",
  reportes: "/reportes",
  historial: "/historial",
  usuarios: "/usuarios",
};

function seccionActivaDesde(pathname: string): SeccionKey {
  if (pathname.startsWith("/admin")) return "inventario";
  if (pathname.startsWith("/reportes")) return "reportes";
  if (pathname.startsWith("/historial")) return "historial";
  if (pathname.startsWith("/usuarios")) return "usuarios";
  return "mesas";
}

interface CobroSolicitado {
  mesaId: number;
  cuentaId: number;
  nombreMesa: string | null;
  numero: number;
  total: string;
}

/**
 * Modal de cobro para una solicitud puntual. Se extrae como componente propio
 * (montado con key={solicitud.cuentaId} desde Layout) para que el método/monto
 * arranquen de cero en cada solicitud nueva, sin necesitar un efecto de reset.
 */
function ModalCobroSolicitado({
  solicitud,
  onClose,
  onConfirmado,
}: {
  solicitud: CobroSolicitado;
  onClose: () => void;
  onConfirmado: () => void;
}) {
  const api = useApi();
  const { Modal, Select, Input, Button } = ds();
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("EFECTIVO");
  const [monto, setMonto] = useState(Number(solicitud.total).toFixed(2));
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmarPago() {
    const montoNum = Number(monto);
    if (!Number.isFinite(montoNum) || montoNum <= 0) {
      setError("El monto debe ser un número mayor a 0");
      return;
    }
    setProcesando(true);
    setError(null);
    try {
      await api(`/cuentas/${solicitud.cuentaId}/cerrar`, {
        method: "POST",
        body: { pagos: [{ metodoPago, monto: montoNum }] },
      });
      onConfirmado();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo confirmar el pago");
    } finally {
      setProcesando(false);
    }
  }

  const tituloMesa = formatearNombreMesa({ numero: solicitud.numero, nombre: solicitud.nombreMesa });

  return (
    <Modal open title={`${tituloMesa} solicita cobro`} onClose={onClose}>
      <div style={{ minWidth: 320 }}>
        <div style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
          Monto a cobrar: <strong style={{ color: "var(--text-primary)" }}>${Number(solicitud.total).toFixed(2)}</strong>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Select
            label="Método de pago"
            value={metodoPago}
            onChange={(event) => setMetodoPago(event.target.value as MetodoPago)}
            options={METODOS_PAGO.map((m) => ({ value: m.valor, label: m.label }))}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Input
            label="Monto"
            type="number"
            value={monto}
            onChange={(event) => setMonto(event.target.value)}
            placeholder="0.00"
          />
        </div>

        {error && <p style={{ color: "var(--status-danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="primary" disabled={procesando} onClick={confirmarPago}>
            {procesando ? "Confirmando…" : "Confirmar Pago"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const BREAKPOINT_MOVIL = 860;

function useEsVistaMovil(): boolean {
  const [esMovil, setEsMovil] = useState(() => window.innerWidth < BREAKPOINT_MOVIL);

  useEffect(() => {
    function onResize() {
      setEsMovil(window.innerWidth < BREAKPOINT_MOVIL);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return esMovil;
}

export function Layout() {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const esMovil = useEsVistaMovil();
  const [solicitudesCobro, setSolicitudesCobro] = useState<CobroSolicitado[]>([]);

  useEffect(() => {
    if (usuario?.rol !== "ADMIN") return;

    const socket = getSocket();
    const onCobroSolicitado = (payload: CobroSolicitado) => {
      // Los sockets hoy no llevan autenticacion en el handshake, asi que
      // cualquier cliente conectado podria tecnicamente recibir este evento
      // (esta suscrito a ROOMS.mesasOverview igual que todos). No es un riesgo
      // real: el cierre de verdad exige requireRole("ADMIN") con JWT valido en
      // POST /cuentas/:id/cerrar, asi que un mesero no puede cerrar la cuenta
      // aunque vea la notificacion. Autenticar el handshake y usar una room
      // dedicada para caja queda como endurecimiento futuro opcional.
      setSolicitudesCobro((prev) => (prev.some((s) => s.cuentaId === payload.cuentaId) ? prev : [...prev, payload]));
    };

    socket.on("cobro:solicitado", onCobroSolicitado);
    return () => {
      socket.off("cobro:solicitado", onCobroSolicitado);
    };
  }, [usuario?.rol]);

  if (!usuario) return null;

  const { AppShellDesktop, AppShellMobile } = ds();

  const allowedKeys = SECCIONES_POR_ROL[usuario.rol];
  const active = seccionActivaDesde(location.pathname);
  const userInfo = { name: usuario.nombre, roleLabel: usuario.rol === "ADMIN" ? "Administrador" : "Mesero" };

  function handleNav(key: string) {
    navigate(RUTA_POR_SECCION[key as SeccionKey]);
  }

  function cerrarSolicitud(cuentaId: number) {
    setSolicitudesCobro((prev) => prev.filter((s) => s.cuentaId !== cuentaId));
  }

  const solicitudActual = solicitudesCobro[0] ?? null;
  const modalCobro = solicitudActual && (
    <ModalCobroSolicitado
      key={solicitudActual.cuentaId}
      solicitud={solicitudActual}
      onClose={() => cerrarSolicitud(solicitudActual.cuentaId)}
      onConfirmado={() => cerrarSolicitud(solicitudActual.cuentaId)}
    />
  );

  if (esMovil) {
    // AppShellMobile no trae boton de logout (en el mockup original se
    // superpone uno flotante sobre el lienzo de previsualizacion, pero en la
    // app real eso choca con la barra de pestanas inferior). Se agrega una
    // franja propia arriba en su lugar, sin invadir el shell del sistema de diseno.
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 16px", background: "var(--color-bg)" }}>
          <button
            onClick={logout}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Salir
          </button>
        </div>
        <div className="ds-mobile-shell-fullbleed" style={{ flex: 1, minHeight: 0 }}>
          <AppShellMobile
            items={NAV_ITEMS}
            allowedKeys={allowedKeys}
            active={active}
            onNav={handleNav}
            user={userInfo}
            logoSrc={logo}
          >
            <Outlet />
          </AppShellMobile>
        </div>
        {modalCobro}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <AppShellDesktop
        items={NAV_ITEMS}
        allowedKeys={allowedKeys}
        active={active}
        onNav={handleNav}
        user={userInfo}
        onLogout={logout}
        logoSrc={logo}
      >
        <Outlet />
      </AppShellDesktop>
      {modalCobro}
    </div>
  );
}
