import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import {
  isFiniteNumber,
  isNonEmptyString,
  isPositiveNumber,
  parseIntParam,
} from "../../lib/validation";
import { notificarSiStockBajo } from "../../lib/socketEvents";

export const insumosRouter = Router();

const UNIDADES_VALIDAS = ["ML", "UNIDAD"] as const;

insumosRouter.use(authenticate);

insumosRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const categoriaId = req.query.categoriaId ? parseIntParam(String(req.query.categoriaId)) : undefined;
    if (req.query.categoriaId && categoriaId === null) {
      return res.status(400).json({ error: "categoriaId invalido" });
    }

    const insumos = await prisma.insumo.findMany({
      where: categoriaId ? { categoriaId } : undefined,
      include: { categoria: true },
      orderBy: { nombre: "asc" },
    });
    res.json(insumos);
  }),
);

insumosRouter.get(
  "/stock-bajo",
  asyncHandler(async (_req, res) => {
    const insumos = await prisma.insumo.findMany({
      include: { categoria: true },
      orderBy: { nombre: "asc" },
    });

    const stockBajo = insumos.filter((insumo) =>
      new Prisma.Decimal(insumo.stockActual).lessThanOrEqualTo(insumo.stockMinimo),
    );

    res.json(stockBajo);
  }),
);

insumosRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const insumo = await prisma.insumo.findUnique({ where: { id }, include: { categoria: true } });
    if (!insumo) return res.status(404).json({ error: "Insumo no encontrado" });

    res.json(insumo);
  }),
);

insumosRouter.get(
  "/:id/movimientos",
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const insumo = await prisma.insumo.findUnique({ where: { id } });
    if (!insumo) return res.status(404).json({ error: "Insumo no encontrado" });

    const tipo = req.query.tipo ? String(req.query.tipo).toUpperCase() : undefined;
    if (tipo && !["ENTRADA", "SALIDA", "AJUSTE"].includes(tipo)) {
      return res.status(400).json({ error: "tipo debe ser ENTRADA, SALIDA o AJUSTE" });
    }

    const movimientos = await prisma.movimientoInventario.findMany({
      where: { insumoId: id, tipo: tipo as "ENTRADA" | "SALIDA" | "AJUSTE" | undefined },
      include: { usuario: { select: { id: true, nombre: true, usuario: true } } },
      orderBy: { fecha: "desc" },
    });

    res.json(movimientos);
  }),
);

insumosRouter.post(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { nombre, categoriaId, unidad, costo, stockMinimo, stockActual } = req.body ?? {};

    if (!isNonEmptyString(nombre)) {
      return res.status(400).json({ error: "nombre es requerido" });
    }
    if (!isFiniteNumber(categoriaId)) {
      return res.status(400).json({ error: "categoriaId es requerido" });
    }
    if (!UNIDADES_VALIDAS.includes(unidad)) {
      return res.status(400).json({ error: `unidad debe ser una de: ${UNIDADES_VALIDAS.join(", ")}` });
    }
    if (!isFiniteNumber(costo) || costo < 0) {
      return res.status(400).json({ error: "costo debe ser un numero mayor o igual a 0" });
    }
    if (stockMinimo !== undefined && (!isFiniteNumber(stockMinimo) || stockMinimo < 0)) {
      return res.status(400).json({ error: "stockMinimo debe ser un numero mayor o igual a 0" });
    }
    if (stockActual !== undefined && (!isFiniteNumber(stockActual) || stockActual < 0)) {
      return res.status(400).json({ error: "stockActual debe ser un numero mayor o igual a 0" });
    }

    try {
      const insumo = await prisma.insumo.create({
        data: {
          nombre: nombre.trim(),
          categoriaId,
          unidad,
          costo,
          stockMinimo: stockMinimo ?? 0,
          stockActual: stockActual ?? 0,
        },
        include: { categoria: true },
      });
      res.status(201).json(insumo);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        return res.status(400).json({ error: "categoriaId no corresponde a una categoria existente" });
      }
      throw error;
    }
  }),
);

insumosRouter.put(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const { nombre, categoriaId, unidad, costo, stockMinimo, stockActual } = req.body ?? {};
    const data: Prisma.InsumoUpdateInput = {};

    if (nombre !== undefined) {
      if (!isNonEmptyString(nombre)) return res.status(400).json({ error: "nombre invalido" });
      data.nombre = nombre.trim();
    }
    if (categoriaId !== undefined) {
      if (!isFiniteNumber(categoriaId)) return res.status(400).json({ error: "categoriaId invalido" });
      data.categoria = { connect: { id: categoriaId } };
    }
    if (unidad !== undefined) {
      if (!UNIDADES_VALIDAS.includes(unidad)) {
        return res.status(400).json({ error: `unidad debe ser una de: ${UNIDADES_VALIDAS.join(", ")}` });
      }
      data.unidad = unidad;
    }
    if (costo !== undefined) {
      if (!isFiniteNumber(costo) || costo < 0) {
        return res.status(400).json({ error: "costo debe ser un numero mayor o igual a 0" });
      }
      data.costo = costo;
    }
    if (stockMinimo !== undefined) {
      if (!isFiniteNumber(stockMinimo) || stockMinimo < 0) {
        return res.status(400).json({ error: "stockMinimo debe ser un numero mayor o igual a 0" });
      }
      data.stockMinimo = stockMinimo;
    }
    if (stockActual !== undefined) {
      if (!isFiniteNumber(stockActual) || stockActual < 0) {
        return res.status(400).json({ error: "stockActual debe ser un numero mayor o igual a 0" });
      }
      data.stockActual = stockActual;
    }

    try {
      const insumo = await prisma.insumo.update({ where: { id }, data, include: { categoria: true } });
      res.json(insumo);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") return res.status(404).json({ error: "Insumo no encontrado" });
        if (error.code === "P2003") {
          return res.status(400).json({ error: "categoriaId no corresponde a una categoria existente" });
        }
      }
      throw error;
    }
  }),
);

insumosRouter.delete(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    try {
      await prisma.insumo.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") return res.status(404).json({ error: "Insumo no encontrado" });
        if (error.code === "P2003") {
          return res.status(409).json({
            error: "No se puede eliminar: el insumo tiene recetas o movimientos registrados",
          });
        }
      }
      throw error;
    }
  }),
);

insumosRouter.post(
  "/:id/entradas",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const insumo = await prisma.insumo.findUnique({ where: { id } });
    if (!insumo) return res.status(404).json({ error: "Insumo no encontrado" });

    const { cantidad, motivo, fecha, costo, proveedor } = req.body ?? {};
    if (!isPositiveNumber(cantidad)) {
      return res.status(400).json({ error: "cantidad debe ser un numero mayor a 0" });
    }
    if (motivo !== undefined && !isNonEmptyString(motivo)) {
      return res.status(400).json({ error: "motivo invalido" });
    }
    if (costo !== undefined && (!isFiniteNumber(costo) || costo < 0)) {
      return res.status(400).json({ error: "costo debe ser un numero mayor o igual a 0" });
    }
    if (proveedor !== undefined && !isNonEmptyString(proveedor)) {
      return res.status(400).json({ error: "proveedor invalido" });
    }

    let fechaMovimiento: Date | undefined;
    if (fecha !== undefined) {
      fechaMovimiento = new Date(fecha);
      if (Number.isNaN(fechaMovimiento.getTime())) {
        return res.status(400).json({ error: "fecha invalida" });
      }
    }

    const usuarioId = req.user!.sub;

    const [movimiento, insumoActualizado] = await prisma.$transaction([
      prisma.movimientoInventario.create({
        data: {
          insumoId: id,
          tipo: "ENTRADA",
          cantidad,
          costo,
          proveedor,
          motivo,
          fecha: fechaMovimiento,
          usuarioId,
        },
        include: { usuario: { select: { id: true, nombre: true, usuario: true } } },
      }),
      prisma.insumo.update({
        where: { id },
        // El costo de la ultima compra pasa a ser el costo de referencia del
        // insumo (usado para el reporte de inventario valorizado, RF8).
        data: { stockActual: { increment: cantidad }, ...(costo !== undefined && { costo }) },
        include: { categoria: true },
      }),
    ]);

    res.status(201).json({ movimiento, insumo: insumoActualizado });
  }),
);

insumosRouter.post(
  "/:id/ajustes",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const insumo = await prisma.insumo.findUnique({ where: { id } });
    if (!insumo) return res.status(404).json({ error: "Insumo no encontrado" });

    const { cantidad, motivo } = req.body ?? {};
    if (!isFiniteNumber(cantidad) || cantidad === 0) {
      return res.status(400).json({ error: "cantidad debe ser un numero distinto de 0" });
    }
    if (!isNonEmptyString(motivo)) {
      return res.status(400).json({ error: "motivo es requerido para un ajuste" });
    }

    const nuevoStock = new Prisma.Decimal(insumo.stockActual).plus(cantidad);
    if (nuevoStock.lessThan(0)) {
      return res.status(400).json({
        error: `El ajuste dejaria el stock en ${nuevoStock.toFixed(2)}, no puede ser negativo`,
      });
    }

    const [movimiento, insumoActualizado] = await prisma.$transaction([
      prisma.movimientoInventario.create({
        data: { insumoId: id, tipo: "AJUSTE", cantidad, motivo, usuarioId: req.user!.sub },
        include: { usuario: { select: { id: true, nombre: true, usuario: true } } },
      }),
      prisma.insumo.update({
        where: { id },
        data: { stockActual: { increment: cantidad } },
        include: { categoria: true },
      }),
    ]);

    if (cantidad < 0) {
      notificarSiStockBajo(insumoActualizado);
    }

    res.status(201).json({ movimiento, insumo: insumoActualizado });
  }),
);
