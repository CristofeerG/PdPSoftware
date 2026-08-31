import type { UsuarioResumen } from "./inventario";

export type EstadoMesa = "LIBRE" | "OCUPADA" | "POR_COBRAR";
export type EstadoCuenta = "ABIERTA" | "CERRADA";
export type MetodoPago = "EFECTIVO" | "TARJETA" | "TRANSFERENCIA";

export interface ItemConsumo {
  id: number;
  cuentaId: number;
  productoVentaId: number;
  cantidad: number;
  cantidadEntregada: number;
  cantidadPagada: number;
  precioUnitario: string;
  subtotal: string;
  productoVenta: { id: number; nombre: string; unidadesPorEntrega: number; categoria: { nombre: string } };
}

export interface Pago {
  id: number;
  cuentaId: number;
  itemConsumoId: number | null;
  monto: string;
  metodoPago: MetodoPago;
  fecha: string;
}

export interface Cuenta {
  id: number;
  mesaId: number;
  usuarioId: number | null;
  fechaApertura: string;
  fechaCierre: string | null;
  estado: EstadoCuenta;
  total: string;
  descuento: string;
  metodoPago: MetodoPago | null;
  itemsConsumo: ItemConsumo[];
  usuario?: UsuarioResumen | null;
  mesa?: { id: number; numero: number; nombre: string | null; estado: EstadoMesa };
  // Solo viene poblado en los endpoints que traen el detalle completo de la
  // cuenta (historial, /:id, cerrar, dividir); cuenta.metodoPago no alcanza
  // para pagos mixtos, ahi queda en null.
  pagos?: Pago[];
}

export interface Mesa {
  id: number;
  numero: number;
  nombre: string | null;
  estado: EstadoMesa;
  activo: boolean;
  cuentaAbierta: Cuenta | null;
}

export function nombreMesa(mesa: { numero: number; nombre: string | null }): string {
  return mesa.nombre ?? `Mesa ${mesa.numero}`;
}

export const METODOS_PAGO: { valor: MetodoPago; label: string }[] = [
  { valor: "EFECTIVO", label: "Efectivo" },
  { valor: "TARJETA", label: "Tarjeta" },
  { valor: "TRANSFERENCIA", label: "Transferencia" },
];

export const ESTADO_MESA_LABEL: Record<EstadoMesa, string> = {
  LIBRE: "Libre",
  OCUPADA: "Ocupada",
  POR_COBRAR: "Por cobrar",
};
