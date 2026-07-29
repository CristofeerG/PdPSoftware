import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth, type Rol } from "../context/AuthContext";
import { ds, type NavItem as DsNavItem } from "../lib/designSystem";

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

  if (!usuario) return null;

  const { AppShellDesktop, AppShellMobile } = ds();

  const allowedKeys = SECCIONES_POR_ROL[usuario.rol];
  const active = seccionActivaDesde(location.pathname);
  const userInfo = { name: usuario.nombre, roleLabel: usuario.rol === "ADMIN" ? "Administrador" : "Mesero" };

  function handleNav(key: string) {
    navigate(RUTA_POR_SECCION[key as SeccionKey]);
  }

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
    </div>
  );
}
