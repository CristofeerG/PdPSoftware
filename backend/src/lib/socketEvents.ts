import { Prisma } from "@prisma/client";
import { getIo, ROOMS } from "./socket";

export interface MesaResumen {
  id: number;
  numero: number;
  estado: string;
  total?: string | null;
}

export function emitMesaActualizada(mesa: MesaResumen): void {
  getIo().to(ROOMS.mesasOverview).emit("mesa:actualizada", mesa);
}

export function emitCuentaAbierta(mesaId: number, cuenta: unknown): void {
  getIo().to(ROOMS.mesa(mesaId)).emit("cuenta:abierta", cuenta);
}

export function emitCuentaItemAgregado(mesaId: number, cuenta: unknown): void {
  getIo().to(ROOMS.mesa(mesaId)).emit("cuenta:item-agregado", cuenta);
}

export function emitCuentaItemEditado(mesaId: number, cuenta: unknown): void {
  getIo().to(ROOMS.mesa(mesaId)).emit("cuenta:item-editado", cuenta);
}

export function emitCuentaItemEliminado(mesaId: number, cuenta: unknown): void {
  getIo().to(ROOMS.mesa(mesaId)).emit("cuenta:item-eliminado", cuenta);
}

export function emitCuentaItemEntregado(mesaId: number, cuenta: unknown): void {
  getIo().to(ROOMS.mesa(mesaId)).emit("cuenta:item-entregado", cuenta);
}

export function emitCuentaItemPagado(mesaId: number, cuenta: unknown): void {
  getIo().to(ROOMS.mesa(mesaId)).emit("cuenta:item-pagado", cuenta);
}

export function emitCuentaCerrada(mesaId: number, cuenta: unknown): void {
  getIo().to(ROOMS.mesa(mesaId)).emit("cuenta:cerrada", cuenta);
}

export function emitStockBajo(insumo: unknown): void {
  getIo().to(ROOMS.stockAlerts).emit("insumo:stock-bajo", insumo);
}

interface InsumoConStock {
  stockActual: Prisma.Decimal | string | number;
  stockMinimo: Prisma.Decimal | string | number;
}

export function notificarSiStockBajo<T extends InsumoConStock>(insumo: T): void {
  if (new Prisma.Decimal(insumo.stockActual).lessThanOrEqualTo(insumo.stockMinimo)) {
    emitStockBajo(insumo);
  }
}
