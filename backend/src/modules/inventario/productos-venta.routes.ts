import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { isFiniteNumber, isNonEmptyString, isPositiveNumber, parseIntParam } from "../../lib/validation";

export const productosVentaRouter = Router();

const recetaInclude = {
  recetaItems: {
    include: { insumo: { select: { id: true, nombre: true, unidad: true } } },
  },
  categoria: true,
} satisfies Prisma.ProductoVentaInclude;

interface RecetaInput {
  insumoId: number;
  cantidad: number;
}

function validarRecetaInput(receta: unknown): receta is RecetaInput[] {
  if (!Array.isArray(receta)) return false;
  return receta.every(
    (item) =>
      item &&
      typeof item === "object" &&
      isFiniteNumber((item as RecetaInput).insumoId) &&
      isPositiveNumber((item as RecetaInput).cantidad),
  );
}

productosVentaRouter.use(authenticate);

productosVentaRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const categoriaId = req.query.categoriaId ? parseIntParam(String(req.query.categoriaId)) : undefined;
    if (req.query.categoriaId && categoriaId === null) {
      return res.status(400).json({ error: "categoriaId invalido" });
    }

    const productos = await prisma.productoVenta.findMany({
      where: categoriaId ? { categoriaId } : undefined,
      include: recetaInclude,
      orderBy: { nombre: "asc" },
    });
    res.json(productos);
  }),
);

productosVentaRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const producto = await prisma.productoVenta.findUnique({ where: { id }, include: recetaInclude });
    if (!producto) return res.status(404).json({ error: "Producto de venta no encontrado" });

    res.json(producto);
  }),
);

productosVentaRouter.post(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { nombre, categoriaId, precioVenta, receta } = req.body ?? {};

    if (!isNonEmptyString(nombre)) {
      return res.status(400).json({ error: "nombre es requerido" });
    }
    if (!isFiniteNumber(categoriaId)) {
      return res.status(400).json({ error: "categoriaId es requerido" });
    }
    if (!isPositiveNumber(precioVenta)) {
      return res.status(400).json({ error: "precioVenta debe ser un numero mayor a 0" });
    }

    let recetaValidada: RecetaInput[] = [];
    if (receta !== undefined) {
      if (!validarRecetaInput(receta)) {
        return res.status(400).json({
          error: "receta debe ser un arreglo de { insumoId, cantidad (> 0) }",
        });
      }
      recetaValidada = receta;

      const idsUnicos = new Set(recetaValidada.map((r) => r.insumoId));
      if (idsUnicos.size !== recetaValidada.length) {
        return res.status(400).json({ error: "receta no puede repetir el mismo insumoId" });
      }

      const insumosExistentes = await prisma.insumo.findMany({
        where: { id: { in: [...idsUnicos] } },
        select: { id: true },
      });
      if (insumosExistentes.length !== idsUnicos.size) {
        return res.status(400).json({ error: "uno o mas insumoId de la receta no existen" });
      }
    }

    try {
      const producto = await prisma.productoVenta.create({
        data: {
          nombre: nombre.trim(),
          categoriaId,
          precioVenta,
          recetaItems: {
            create: recetaValidada.map((item) => ({
              insumoId: item.insumoId,
              cantidad: item.cantidad,
            })),
          },
        },
        include: recetaInclude,
      });
      res.status(201).json(producto);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        return res.status(400).json({ error: "categoriaId no corresponde a una categoria existente" });
      }
      throw error;
    }
  }),
);

productosVentaRouter.put(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const { nombre, categoriaId, precioVenta } = req.body ?? {};
    const data: Prisma.ProductoVentaUpdateInput = {};

    if (nombre !== undefined) {
      if (!isNonEmptyString(nombre)) return res.status(400).json({ error: "nombre invalido" });
      data.nombre = nombre.trim();
    }
    if (categoriaId !== undefined) {
      if (!isFiniteNumber(categoriaId)) return res.status(400).json({ error: "categoriaId invalido" });
      data.categoria = { connect: { id: categoriaId } };
    }
    if (precioVenta !== undefined) {
      if (!isPositiveNumber(precioVenta)) {
        return res.status(400).json({ error: "precioVenta debe ser un numero mayor a 0" });
      }
      data.precioVenta = precioVenta;
    }

    try {
      const producto = await prisma.productoVenta.update({ where: { id }, data, include: recetaInclude });
      res.json(producto);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") return res.status(404).json({ error: "Producto de venta no encontrado" });
        if (error.code === "P2003") {
          return res.status(400).json({ error: "categoriaId no corresponde a una categoria existente" });
        }
      }
      throw error;
    }
  }),
);

productosVentaRouter.delete(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    try {
      await prisma.productoVenta.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") return res.status(404).json({ error: "Producto de venta no encontrado" });
        if (error.code === "P2003") {
          return res.status(409).json({
            error: "No se puede eliminar: el producto tiene consumos registrados",
          });
        }
      }
      throw error;
    }
  }),
);

// --- Receta ---

productosVentaRouter.get(
  "/:id/receta",
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const producto = await prisma.productoVenta.findUnique({ where: { id } });
    if (!producto) return res.status(404).json({ error: "Producto de venta no encontrado" });

    const receta = await prisma.recetaItem.findMany({
      where: { productoVentaId: id },
      include: { insumo: { select: { id: true, nombre: true, unidad: true } } },
    });
    res.json(receta);
  }),
);

productosVentaRouter.post(
  "/:id/receta",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const producto = await prisma.productoVenta.findUnique({ where: { id } });
    if (!producto) return res.status(404).json({ error: "Producto de venta no encontrado" });

    const { insumoId, cantidad } = req.body ?? {};
    if (!isFiniteNumber(insumoId)) {
      return res.status(400).json({ error: "insumoId es requerido" });
    }
    if (!isPositiveNumber(cantidad)) {
      return res.status(400).json({ error: "cantidad debe ser un numero mayor a 0" });
    }

    try {
      const recetaItem = await prisma.recetaItem.create({
        data: { productoVentaId: id, insumoId, cantidad },
        include: { insumo: { select: { id: true, nombre: true, unidad: true } } },
      });
      res.status(201).json(recetaItem);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") return res.status(400).json({ error: "insumoId no existe" });
        if (error.code === "P2002") {
          return res.status(409).json({ error: "Este producto ya tiene una linea de receta para ese insumo" });
        }
      }
      throw error;
    }
  }),
);

productosVentaRouter.put(
  "/:id/receta/:recetaItemId",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    const recetaItemId = parseIntParam(req.params.recetaItemId);
    if (id === null || recetaItemId === null) {
      return res.status(400).json({ error: "id invalido" });
    }

    const { cantidad } = req.body ?? {};
    if (!isPositiveNumber(cantidad)) {
      return res.status(400).json({ error: "cantidad debe ser un numero mayor a 0" });
    }

    const existente = await prisma.recetaItem.findUnique({ where: { id: recetaItemId } });
    if (!existente || existente.productoVentaId !== id) {
      return res.status(404).json({ error: "Linea de receta no encontrada para este producto" });
    }

    const recetaItem = await prisma.recetaItem.update({
      where: { id: recetaItemId },
      data: { cantidad },
      include: { insumo: { select: { id: true, nombre: true, unidad: true } } },
    });
    res.json(recetaItem);
  }),
);

productosVentaRouter.delete(
  "/:id/receta/:recetaItemId",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    const recetaItemId = parseIntParam(req.params.recetaItemId);
    if (id === null || recetaItemId === null) {
      return res.status(400).json({ error: "id invalido" });
    }

    const existente = await prisma.recetaItem.findUnique({ where: { id: recetaItemId } });
    if (!existente || existente.productoVentaId !== id) {
      return res.status(404).json({ error: "Linea de receta no encontrada para este producto" });
    }

    await prisma.recetaItem.delete({ where: { id: recetaItemId } });
    res.status(204).send();
  }),
);
