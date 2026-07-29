import { useState, type CSSProperties, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate, type Location } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

// Replica visual del componente LoginCard del sistema de diseño (POS Login y
// Navegacion). No se usa el componente compilado directamente porque su campo
// de contraseña es un <input> plano sin boton de mostrar/ocultar — esa función
// ya existe en toda la app y se conserva aquí con los mismos tokens de diseño.

const estiloEtiqueta: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-secondary)",
  letterSpacing: "var(--tracking-caps)",
  textTransform: "uppercase",
};

const estiloInput: CSSProperties = {
  background: "var(--surface-sunken)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-m)",
  padding: "12px 14px",
  color: "var(--text-primary)",
  fontSize: 15,
  fontFamily: "var(--font-body)",
  width: "100%",
};

export function LoginPage() {
  const { usuario, login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [usuarioInput, setUsuarioInput] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (usuario) {
    const destino = (location.state as { from?: Location } | null)?.from?.pathname ?? "/";
    return <Navigate to={destino} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await login(usuarioInput, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo conectar con el servidor");
    }
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "var(--surface-2)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-l)",
          boxShadow: "var(--shadow-raised)",
          padding: "var(--space-8) var(--space-7)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-6)",
          fontFamily: "var(--font-body)",
          boxSizing: "border-box",
        }}
      >
        <img src={logo} alt="La Posada del Palomo" style={{ width: 96, height: 96 }} />

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 22,
              color: "var(--text-primary)",
              lineHeight: 1.15,
            }}
          >
            LA POSADA
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 22,
              color: "var(--color-red)",
              lineHeight: 1.15,
            }}
          >
            DEL PALOMO
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "var(--tracking-caps)",
              textTransform: "uppercase",
              color: "var(--color-gold)",
              marginTop: 6,
            }}
          >
            Punto de venta
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={estiloEtiqueta}>Usuario</span>
            <input
              value={usuarioInput}
              onChange={(event) => setUsuarioInput(event.target.value)}
              placeholder="jorge.m"
              autoComplete="username"
              required
              style={estiloInput}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={estiloEtiqueta}>Contraseña</span>
            <div style={{ position: "relative" }}>
              <input
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
                required
                style={{ ...estiloInput, paddingRight: 40 }}
              />
              <button
                type="button"
                aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={mostrarPassword}
                onClick={() => setMostrarPassword((actual) => !actual)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  padding: 4,
                }}
              >
                {mostrarPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    style={{ width: 18, height: 18 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5a10.45 10.45 0 0 0 4.293-.914m3.32-2.089A10.45 10.45 0 0 0 22.066 12c-1.292-4.338-5.31-7.5-10.066-7.5a10.45 10.45 0 0 0-2.516.303"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-5.999.001A3 3 0 0 1 15 12Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 18 18" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    style={{ width: 18, height: 18 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {error && <div style={{ color: "var(--status-danger)", fontSize: 13 }}>{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "14px 20px",
              borderRadius: "var(--radius-m)",
              border: "none",
              background: "var(--color-gold)",
              color: "var(--text-on-gold)",
              fontWeight: 800,
              fontSize: 15,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Ingresando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
