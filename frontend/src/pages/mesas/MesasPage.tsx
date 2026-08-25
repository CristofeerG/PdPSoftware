import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import { getSocket } from "../../lib/socket";
import { ds } from "../../lib/designSystem";
import { useTheme } from "../../context/ThemeContext";
import type { Mesa } from "../../types/mesas";

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

export function MesasPage() {
  const api = useApi();
  const navigate = useNavigate();
  const { Badge, TableTile } = ds();
  const { tema, toggleTema } = useTheme();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    </div>
  );
}
