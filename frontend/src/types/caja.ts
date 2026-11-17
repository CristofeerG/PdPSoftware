import type { MetodoPago } from "./reportes";

export type CategoriaGasto = "SUELDOS" | "COMIDA_PERSONAL" | "INSUMOS" | "OTRO";

export const CATEGORIAS_GASTO: { valor: CategoriaGasto; label: string }[] = [
  { valor: "SUELDOS", label: "Sueldos" },
  { valor: "COMIDA_PERSONAL", label: "Comida del personal" },
  { valor: "INSUMOS", label: "Insumos" },
  { valor: "OTRO", label: "Otro" },
];

export const CATEGORIA_GASTO_LABEL: Record<CategoriaGasto, string> = {
  SUELDOS: "Sueldos",
  COMIDA_PERSONAL: "Comida del personal",
  INSUMOS: "Insumos",
  OTRO: "Otro",
};

export interface Gasto {
  id: number;
  fecha: string;
  concepto: string;
  categoria: CategoriaGasto;
  monto: string;
  metodoPago: MetodoPago;
  usuario: { id: number; nombre: string } | null;
}

export interface CierreDeCaja {
  fecha: string;
  cerrado: boolean;
  montoInicial: string;
  ventasEfectivo: string;
  gastosEfectivo: string;
  montoEsperado: string;
  montoContado: string | null;
  diferencia: string | null;
  notas: string | null;
  usuario: { id: number; nombre: string } | null;
  /** true si lo guardado (ventasEfectivo/gastosEfectivo) ya no coincide con lo que hay registrado hoy para ese dia. */
  desactualizado: boolean;
}
