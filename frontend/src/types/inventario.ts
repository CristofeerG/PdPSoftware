export type UnidadMedida = "ML" | "UNIDAD";
export type TipoMovimiento = "ENTRADA" | "SALIDA" | "AJUSTE";

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Insumo {
  id: number;
  nombre: string;
  categoriaId: number;
  categoria: Categoria;
  unidad: UnidadMedida;
  costo: string;
  stockActual: string;
  stockMinimo: string;
  createdAt: string;
}

export interface UsuarioResumen {
  id: number;
  nombre: string;
  usuario: string;
}

export interface MovimientoInventario {
  id: number;
  insumoId: number;
  tipo: TipoMovimiento;
  cantidad: string;
  costo: string | null;
  proveedor: string | null;
  motivo: string | null;
  fecha: string;
  usuarioId: number;
  usuario: UsuarioResumen;
}

export interface RecetaItem {
  id: number;
  productoVentaId: number;
  insumoId: number;
  cantidad: string;
  insumo: { id: number; nombre: string; unidad: UnidadMedida };
}

export interface ProductoVenta {
  id: number;
  nombre: string;
  categoriaId: number;
  categoria: Categoria;
  precioVenta: string;
  recetaItems: RecetaItem[];
}

export function stockBajo(insumo: Pick<Insumo, "stockActual" | "stockMinimo">): boolean {
  return Number(insumo.stockActual) <= Number(insumo.stockMinimo);
}
