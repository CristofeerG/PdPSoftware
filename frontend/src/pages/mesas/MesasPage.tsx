import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import { getSocket } from "../../lib/socket";
import { ds } from "../../lib/designSystem";
import type { Mesa } from "../../types/mesas";

function tileStatus(estado: Mesa["estado"]): "free" | "occupied" {
  return estado === "LIBRE" ? "free" : "occupied";
}

export function MesasPage() {
  const api = useApi();
  const navigate = useNavigate();
  const { Badge, TableTile } = ds();
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
              number={mesa.numero}
              status={tileStatus(mesa.estado)}
              total={mesa.cuentaAbierta ? Number(mesa.cuentaAbierta.total).toFixed(2) : undefined}
              onClick={() => navigate(`/mesas/${mesa.id}`)}
            />
            {mesa.estado === "POR_COBRAR" && (
              <div style={{ position: "absolute", top: -8, right: -8 }}>
                <Badge tone="warning">Por cobrar</Badge>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
