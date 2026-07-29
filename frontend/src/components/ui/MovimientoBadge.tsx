import type { TipoMovimiento } from "../../types/inventario";

const estilos: Record<TipoMovimiento, string> = {
  ENTRADA: "bg-dorado/15 text-dorado",
  SALIDA: "bg-rojo/15 text-rojo",
  AJUSTE: "bg-texto-secundario/20 text-texto",
};

const etiquetas: Record<TipoMovimiento, string> = {
  ENTRADA: "Entrada",
  SALIDA: "Salida",
  AJUSTE: "Ajuste",
};

export function MovimientoBadge({ tipo }: { tipo: TipoMovimiento }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${estilos[tipo]}`}>
      {etiquetas[tipo]}
    </span>
  );
}
