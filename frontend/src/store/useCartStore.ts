import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarrito {
  productoVentaId: number;
  nombre: string;
  precioVenta: string; // mismo formato que ProductoVenta.precioVenta (string, Decimal serializado)
  cantidad: number;
}

interface CartState {
  carritos: Record<number, ItemCarrito[]>; // key = mesaId
  agregarItem: (
    mesaId: number,
    producto: { productoVentaId: number; nombre: string; precioVenta: string },
  ) => void;
  quitarItem: (mesaId: number, productoVentaId: number) => void;
  cambiarCantidad: (mesaId: number, productoVentaId: number, cantidad: number) => void;
  limpiarCarrito: (mesaId: number) => void;
  getTotalCarrito: (mesaId: number) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carritos: {},

      agregarItem: (mesaId, producto) =>
        set((state) => {
          const itemsActuales = state.carritos[mesaId] ?? [];
          const yaExiste = itemsActuales.find((item) => item.productoVentaId === producto.productoVentaId);

          const itemsNuevos = yaExiste
            ? itemsActuales.map((item) =>
                item.productoVentaId === producto.productoVentaId
                  ? { ...item, cantidad: item.cantidad + 1 }
                  : item,
              )
            : [...itemsActuales, { ...producto, cantidad: 1 }];

          return { carritos: { ...state.carritos, [mesaId]: itemsNuevos } };
        }),

      quitarItem: (mesaId, productoVentaId) =>
        set((state) => {
          const itemsActuales = state.carritos[mesaId] ?? [];
          return {
            carritos: {
              ...state.carritos,
              [mesaId]: itemsActuales.filter((item) => item.productoVentaId !== productoVentaId),
            },
          };
        }),

      cambiarCantidad: (mesaId, productoVentaId, cantidad) =>
        set((state) => {
          const itemsActuales = state.carritos[mesaId] ?? [];

          const itemsNuevos =
            cantidad <= 0
              ? itemsActuales.filter((item) => item.productoVentaId !== productoVentaId)
              : itemsActuales.map((item) =>
                  item.productoVentaId === productoVentaId ? { ...item, cantidad } : item,
                );

          return { carritos: { ...state.carritos, [mesaId]: itemsNuevos } };
        }),

      limpiarCarrito: (mesaId) =>
        set((state) => {
          const carritos = { ...state.carritos };
          delete carritos[mesaId];
          return { carritos };
        }),

      getTotalCarrito: (mesaId) => {
        const items = get().carritos[mesaId] ?? [];
        return items.reduce((total, item) => total + item.cantidad * Number(item.precioVenta), 0);
      },
    }),
    {
      name: "posada-palomo-carrito",
    },
  ),
);
