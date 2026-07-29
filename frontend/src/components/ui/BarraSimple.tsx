interface BarraSimpleProps {
  etiqueta: string;
  valor: number;
  maximo: number;
  detalle: string;
}

/** Barra horizontal minimalista (sin libreria de graficos) para reportes. */
export function BarraSimple({ etiqueta, valor, maximo, detalle }: BarraSimpleProps) {
  const porcentaje = maximo > 0 ? (valor / maximo) * 100 : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
        <span className="font-medium text-texto">{etiqueta}</span>
        <span className="text-texto-secundario">{detalle}</span>
      </div>
      <div className="h-2 rounded-full bg-black/30">
        <div
          className="h-2 rounded-full bg-dorado transition-all"
          style={{ width: `${Math.min(porcentaje, 100)}%` }}
        />
      </div>
    </div>
  );
}
