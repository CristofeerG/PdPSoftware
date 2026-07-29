import { stockBajo } from "../../types/inventario";

interface StockBadgeProps {
  stockActual: string;
  stockMinimo: string;
}

export function StockBadge({ stockActual, stockMinimo }: StockBadgeProps) {
  if (!stockBajo({ stockActual, stockMinimo })) return null;

  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-rojo/15 px-2 py-0.5 text-xs font-semibold text-rojo">
      ⚠ Stock bajo
    </span>
  );
}
