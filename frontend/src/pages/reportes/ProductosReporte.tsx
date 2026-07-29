import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import type { ProductoVendido } from "../../types/reportes";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { BarraSimple } from "../../components/ui/BarraSimple";

type Orden = "mas" | "menos";

export function ProductosReporte() {
  const api = useApi();
  const [orden, setOrden] = useState<Orden>("mas");
  const [datos, setDatos] = useState<ProductoVendido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);

    api<ProductoVendido[]>(`/reportes/productos?orden=${orden}&limit=10`)
      .then((data) => activo && setDatos(data))
      .catch((err) => activo && setError(err instanceof ApiError ? err.message : "No se pudo cargar el reporte"))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orden]);

  const maximo = datos.reduce((max, fila) => Math.max(max, fila.cantidadVendida), 0);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-texto">Productos más y menos vendidos</h2>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={orden === "mas" ? "primary" : "secondary"}
            className="px-3 py-1"
            onClick={() => setOrden("mas")}
          >
            Más vendidos
          </Button>
          <Button
            type="button"
            variant={orden === "menos" ? "primary" : "secondary"}
            className="px-3 py-1"
            onClick={() => setOrden("menos")}
          >
            Menos vendidos
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-rojo">{error}</p>}

      {cargando ? (
        <p className="text-sm text-texto-secundario">Cargando…</p>
      ) : datos.length === 0 ? (
        <p className="text-sm text-texto-secundario">Todavía no hay productos de venta cargados.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {datos.map((fila) => (
            <BarraSimple
              key={fila.productoVentaId}
              etiqueta={fila.nombre}
              valor={fila.cantidadVendida}
              maximo={maximo}
              detalle={`${fila.cantidadVendida} u. · $${Number(fila.totalVendido).toFixed(2)}`}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
