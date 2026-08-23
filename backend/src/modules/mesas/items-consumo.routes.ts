import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { parseIntParam } from "../../lib/validation";
import { emitCuentaItemEntregado, emitCuentaItemPagado } from "../../lib/socketEvents";

export const itemsConsumoRouter = Router();

itemsConsumoRouter.use(authenticate);

itemsConsumoRouter.patch(
  "/:id/entregar",
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const item = await prisma.itemConsumo.findUnique({
      where: { id },
      include: {
        cuenta: { include: { mesa: true } },
        productoVenta: { select: { id: true, nombre: true, unidadesPorEntrega: true, categoria: { select: { nombre: true } } } },
      },
    });
    if (!item) return res.status(404).json({ error: "Item no encontrado" });
    if (item.cuenta.estado !== "ABIERTA") {
      return res.status(409).json({ error: "La cuenta no esta abierta" });
    }

    const maxEntregable = item.cantidad * item.productoVenta.unidadesPorEntrega;
    if (item.cantidadEntregada >= maxEntregable) {
      return res.status(409).json({ error: "El item ya fue entregado por completo" });
    }

    const itemActualizado = await prisma.itemConsumo.update({
      where: { id },
      data: { cantidadEntregada: { increment: 1 } },
      include: { productoVenta: { select: { id: true, nombre: true, unidadesPorEntrega: true, categoria: { select: { nombre: true } } } } },
    });

    const cuentaActualizada = await prisma.cuenta.findUnique({
      where: { id: item.cuentaId },
      include: {
        itemsConsumo: { include: { productoVenta: { select: { id: true, nombre: true, unidadesPorEntrega: true, categoria: { select: { nombre: true } } } } } },
      },
    });

    emitCuentaItemEntregado(item.cuenta.mesaId, cuentaActualizada);

    res.json(itemActualizado);
  }),
);

itemsConsumoRouter.patch(
  "/:id/pagar",
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const item = await prisma.itemConsumo.findUnique({
      where: { id },
      include: {
        cuenta: { include: { mesa: true } },
        productoVenta: { select: { id: true, nombre: true, unidadesPorEntrega: true, categoria: { select: { nombre: true } } } },
      },
    });
    if (!item) return res.status(404).json({ error: "Item no encontrado" });
    if (item.cuenta.estado !== "ABIERTA") {
      return res.status(409).json({ error: "La cuenta no esta abierta" });
    }

    if (item.cantidadPagada >= item.cantidad) {
      return res.status(409).json({ error: "El item ya fue pagado por completo" });
    }

    const itemActualizado = await prisma.itemConsumo.update({
      where: { id },
      data: { cantidadPagada: { increment: 1 } },
      include: { productoVenta: { select: { id: true, nombre: true, unidadesPorEntrega: true, categoria: { select: { nombre: true } } } } },
    });

    const cuentaActualizada = await prisma.cuenta.findUnique({
      where: { id: item.cuentaId },
      include: {
        itemsConsumo: { include: { productoVenta: { select: { id: true, nombre: true, unidadesPorEntrega: true, categoria: { select: { nombre: true } } } } } },
      },
    });

    emitCuentaItemPagado(item.cuenta.mesaId, cuentaActualizada);

    res.json(itemActualizado);
  }),
);
