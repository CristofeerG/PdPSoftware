export interface InventarioValorizadoItem {
  insumoId: number;
  nombre: string;
  categoria: string;
  unidad: "ML" | "UNIDAD";
  stockActual: string;
  costo: string;
  valorTotal: string;
}

export interface InventarioValorizado {
  detalle: InventarioValorizadoItem[];
  totalValorizado: string;
}

export interface VentasPorPeriodo {
  periodo: string;
  total: string;
  cantidadCuentas: number;
  desglosePagos: Record<MetodoPago, string>;
}

export interface ProductoVendido {
  productoVentaId: number;
  nombre: string;
  cantidadVendida: number;
  totalVendido: string;
}

export type MetodoPago = "EFECTIVO" | "TARJETA" | "TRANSFERENCIA";

export interface DesgloseMetodoPago {
  metodoPago: MetodoPago;
  total: string;
  cantidadPagos: number;
}

export interface CierreCaja {
  fecha: string;
  totalVendido: string;
  cantidadCuentas: number;
  desglosePorMetodoPago: DesgloseMetodoPago[];
}

export const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  TARJETA: "Tarjeta",
  TRANSFERENCIA: "Transferencia",
};
