import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { isNonEmptyString, parseIntParam } from "../../lib/validation";

export const categoriasRouter = Router();

categoriasRouter.use(authenticate);

categoriasRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const categorias = await prisma.categoria.findMany({ orderBy: { nombre: "asc" } });
    res.json(categorias);
  }),
);

categoriasRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const categoria = await prisma.categoria.findUnique({ where: { id } });
    if (!categoria) return res.status(404).json({ error: "Categoria no encontrada" });

    res.json(categoria);
  }),
);

categoriasRouter.post(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { nombre } = req.body ?? {};
    if (!isNonEmptyString(nombre)) {
      return res.status(400).json({ error: "nombre es requerido" });
    }

    try {
      const categoria = await prisma.categoria.create({ data: { nombre: nombre.trim() } });
      res.status(201).json(categoria);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una categoria con ese nombre" });
      }
      throw error;
    }
  }),
);

categoriasRouter.put(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const { nombre } = req.body ?? {};
    if (!isNonEmptyString(nombre)) {
      return res.status(400).json({ error: "nombre es requerido" });
    }

    try {
      const categoria = await prisma.categoria.update({
        where: { id },
        data: { nombre: nombre.trim() },
      });
      res.json(categoria);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") return res.status(404).json({ error: "Categoria no encontrada" });
        if (error.code === "P2002") {
          return res.status(409).json({ error: "Ya existe una categoria con ese nombre" });
        }
      }
      throw error;
    }
  }),
);

categoriasRouter.delete(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    try {
      await prisma.categoria.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") return res.status(404).json({ error: "Categoria no encontrada" });
        if (error.code === "P2003") {
          return res.status(409).json({
            error: "No se puede eliminar: hay insumos o productos de venta usando esta categoria",
          });
        }
      }
      throw error;
    }
  }),
);
