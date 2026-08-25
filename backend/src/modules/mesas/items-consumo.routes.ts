import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { parseIntParam } from "../../lib/validation";
import { emitCuentaItemEntregado, emitCuentaItemPagado } from "../../lib/socketEvents";
import { METODOS_PAGO_VALIDOS } from "./cuentas.routes";

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
        itemsConsumo: {
          orderBy: { id: "asc" },
          include: { productoVenta: { select: { id: true, nombre: true, unidadesPorEntrega: true, categoria: { select: { nombre: true } } } } },
        },
      },
    });

    emitCuentaItemEntregado(item.cuenta.mesaId, cuentaActualizada);

    res.json(itemActualizado);
  }),
);

itemsConsumoRouter.patch(
  "/:id/deshacer-entrega",
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const item = await prisma.itemConsumo.findUnique({
      where: { id },
      include: { cuenta: { include: { mesa: true } } },
    });
    if (!item) return res.status(404).json({ error: "Item no encontrado" });
    if (item.cuenta.estado !== "ABIERTA") {
      return res.status(409).json({ error: "La cuenta no esta abierta" });
    }

    if (item.cantidadEntregada <= 0) {
      return res.status(409).json({ error: "El item no tiene entregas para deshacer" });
    }

    const itemActualizado = await prisma.itemConsumo.update({
      where: { id },
      data: { cantidadEntregada: { decrement: 1 } },
      include: { productoVenta: { select: { id: true, nombre: true, unidadesPorEntrega: true, categoria: { select: { nombre: true } } } } },
    });

    const cuentaActualizada = await prisma.cuenta.findUnique({
      where: { id: item.cuentaId },
      include: {
        itemsConsumo: {
          orderBy: { id: "asc" },
          include: { productoVenta: { select: { id: true, nombre: true, unidadesPorEntrega: true, categoria: { select: { nombre: true } } } } },
        },
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

    const { metodoPago } = req.body ?? {};
    if (!METODOS_PAGO_VALIDOS.includes(metodoPago)) {
      return res.status(400).json({ error: `metodoPago debe ser uno de: ${METODOS_PAGO_VALIDOS.join(", ")}` });
    }

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

    const itemActualizado = await prisma.$transaction(async (tx) => {
      const actualizado = await tx.itemConsumo.update({
        where: { id },
        data: { cantidadPagada: { increment: 1 } },
        include: { productoVenta: { select: { id: true, nombre: true, unidadesPorEntrega: true, categoria: { select: { nombre: true } } } } },
      });
      await tx.pago.create({
        data: { cuentaId: item.cuentaId, itemConsumoId: id, monto: item.precioUnitario, metodoPago },
      });
      return actualizado;
    });

    const cuentaActualizada = await prisma.cuenta.findUnique({
      where: { id: item.cuentaId },
      include: {
        itemsConsumo: {
          orderBy: { id: "asc" },
          include: { productoVenta: { select: { id: true, nombre: true, unidadesPorEntrega: true, categoria: { select: { nombre: true } } } } },
        },
      },
    });

    emitCuentaItemPagado(item.cuenta.mesaId, cuentaActualizada);

    res.json(itemActualizado);
  }),
);

itemsConsumoRouter.patch(
  "/:id/deshacer-pago",
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const item = await prisma.itemConsumo.findUnique({
      where: { id },
      include: { cuenta: { include: { mesa: true } } },
    });
    if (!item) return res.status(404).json({ error: "Item no encontrado" });
    if (item.cuenta.estado !== "ABIERTA") {
      return res.status(409).json({ error: "La cuenta no esta abierta" });
    }

    if (item.cantidadPagada <= 0) {
      return res.status(409).json({ error: "El item no tiene pagos para deshacer" });
    }

    const itemActualizado = await prisma.$transaction(async (tx) => {
      // Si hay un registro de pago de este item (lo normal), se borra el mas
      // reciente. Items pagados antes de que existiera este registro no
      // tienen Pago asociado; en ese caso solo se decrementa el contador.
      const ultimoPago = await tx.pago.findFirst({
        where: { itemConsumoId: id },
        orderBy: { id: "desc" },
      });
      if (ultimoPago) {
        await tx.pago.delete({ where: { id: ultimoPago.id } });
      }
      return tx.itemConsumo.update({
        where: { id },
        data: { cantidadPagada: { decrement: 1 } },
        include: { productoVenta: { select: { id: true, nombre: true, unidadesPorEntrega: true, categoria: { select: { nombre: true } } } } },
      });
    });

    const cuentaActualizada = await prisma.cuenta.findUnique({
      where: { id: item.cuentaId },
      include: {
        itemsConsumo: {
          orderBy: { id: "asc" },
          include: { productoVenta: { select: { id: true, nombre: true, unidadesPorEntrega: true, categoria: { select: { nombre: true } } } } },
        },
      },
    });

    emitCuentaItemPagado(item.cuenta.mesaId, cuentaActualizada);

    res.json(itemActualizado);
  }),
);
