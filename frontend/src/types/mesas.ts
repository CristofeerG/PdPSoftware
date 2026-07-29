import type { UsuarioResumen } from "./inventario";

export type EstadoMesa = "LIBRE" | "OCUPADA" | "POR_COBRAR";
export type EstadoCuenta = "ABIERTA" | "CERRADA";
export type MetodoPago = "EFECTIVO" | "TARJETA" | "TRANSFERENCIA";

export interface ItemConsumo {
  id: number;
  cuentaId: number;
  productoVentaId: number;
  cantidad: number;
  precioUnitario: string;
  subtotal: string;
  productoVenta: { id: number; nombre: string };
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
  mesa?: { id: number; numero: number; estado: EstadoMesa };
}

export interface Mesa {
  id: number;
  numero: number;
  estado: EstadoMesa;
  cuentaAbierta: Cuenta | null;
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
