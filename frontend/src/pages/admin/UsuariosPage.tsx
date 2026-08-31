import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../lib/api";
import { ds } from "../../lib/designSystem";
import type { UsuarioAdmin } from "../../types/usuarios";

const ROLES = [
  { value: "MESERO", label: "Mesero" },
  { value: "ADMIN", label: "Administrador" },
] as const;

export function UsuariosPage() {
  const api = useApi();
  const { usuario: sesion } = useAuth();
  const { Card, Button, Input, Select, Modal, Badge } = ds();

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<(typeof ROLES)[number]["value"]>("MESERO");
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [resetId, setResetId] = useState<number | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [reseteando, setReseteando] = useState(false);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<UsuarioAdmin[]>("/auth/usuarios");
      setUsuarios(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirNuevo() {
    setNombre("");
    setNombreUsuario("");
    setPassword("");
    setRol("MESERO");
    setFormError(null);
    setModalNuevoAbierto(true);
  }

  async function crearUsuario() {
    setFormError(null);
    setGuardando(true);
    try {
      await api<UsuarioAdmin>("/auth/usuarios", {
        method: "POST",
        body: { nombre, usuario: nombreUsuario, password, rol },
      });
      setModalNuevoAbierto(false);
      await cargar();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No se pudo guardar el usuario");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarRol(usuarioObjetivo: UsuarioAdmin, nuevoRol: string) {
    setError(null);
    try {
      await api(`/auth/usuarios/${usuarioObjetivo.id}`, { method: "PUT", body: { rol: nuevoRol } });
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar el rol");
    }
  }

  async function cambiarEstado(usuarioObjetivo: UsuarioAdmin) {
    setError(null);
    try {
      await api(`/auth/usuarios/${usuarioObjetivo.id}`, { method: "PUT", body: { activo: !usuarioObjetivo.activo } });
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar el estado del usuario");
    }
  }

  function abrirReset(usuarioObjetivo: UsuarioAdmin) {
    setResetId(usuarioObjetivo.id);
    setResetPassword("");
    setResetError(null);
  }

  async function confirmarReset() {
    if (!resetId) return;
    setResetError(null);
    if (resetPassword.length < 6) {
      setResetError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setReseteando(true);
    try {
      await api(`/auth/usuarios/${resetId}`, { method: "PUT", body: { password: resetPassword } });
      setResetId(null);
    } catch (err) {
      setResetError(err instanceof ApiError ? err.message : "No se pudo restablecer la contraseña");
    } finally {
      setReseteando(false);
    }
  }

  if (loading) return <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Cargando…</p>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
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
          Usuarios
        </div>
        <Button variant="primary" onClick={abrirNuevo}>
          + Nuevo usuario
        </Button>
      </div>

      {error && <p style={{ color: "var(--status-danger)", fontSize: 14, marginBottom: 12 }}>{error}</p>}

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
          <div style={{ flex: 1 }}>Nombre</div>
          <div style={{ width: 150 }}>Rol</div>
          <div style={{ width: 110 }}>Estado</div>
          <div style={{ width: 220 }}>Acciones</div>
        </div>
        {usuarios.length === 0 ? (
          <div style={{ padding: 20, color: "var(--text-secondary)", fontSize: 14 }}>Todavía no hay usuarios.</div>
        ) : (
          usuarios.map((u) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{u.nombre}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>@{u.usuario}</div>
              </div>
              <div style={{ width: 150 }}>
                <Select
                  value={u.rol}
                  onChange={(e) => cambiarRol(u, e.target.value)}
                  options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
                />
              </div>
              <div style={{ width: 110 }}>
                <Badge tone={u.activo ? "free" : "danger"}>{u.activo ? "Activo" : "Inactivo"}</Badge>
              </div>
              <div style={{ width: 220, display: "flex", gap: 6 }}>
                <Button variant="ghost" size="s" onClick={() => abrirReset(u)}>
                  Contraseña
                </Button>
                <Button
                  variant={u.activo ? "secondary" : "outline"}
                  size="s"
                  disabled={u.id === sesion?.id}
                  onClick={() => cambiarEstado(u)}
                >
                  {u.activo ? "Desactivar" : "Activar"}
                </Button>
              </div>
            </div>
          ))
        )}
      </Card>

      <Modal open={modalNuevoAbierto} title="Nuevo usuario" onClose={() => setModalNuevoAbierto(false)}>
        <div style={{ minWidth: 320, maxWidth: 380, display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Nombre completo" placeholder="Ej. Alexis Ramírez" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <Input label="Usuario" placeholder="Ej. AlexR" value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} />
          <Input label="Contraseña" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Select
            label="Rol"
            value={rol}
            onChange={(e) => setRol(e.target.value as (typeof ROLES)[number]["value"])}
            options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
          />
          {formError && <p style={{ color: "var(--status-danger)", fontSize: 13 }}>{formError}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="primary" disabled={guardando} onClick={crearUsuario}>
              {guardando ? "Guardando…" : "Crear usuario"}
            </Button>
            <Button variant="ghost" onClick={() => setModalNuevoAbierto(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={resetId !== null} title="Restablecer contraseña" onClose={() => setResetId(null)}>
        <div style={{ minWidth: 320, display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Nueva contraseña"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
          />
          {resetError && <p style={{ color: "var(--status-danger)", fontSize: 13 }}>{resetError}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="primary" disabled={reseteando} onClick={confirmarReset}>
              {reseteando ? "Guardando…" : "Guardar"}
            </Button>
            <Button variant="ghost" onClick={() => setResetId(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
