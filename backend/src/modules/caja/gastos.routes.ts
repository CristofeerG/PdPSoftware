import { Router } from "express";
import { CategoriaGasto } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { isNonEmptyString, isPositiveNumber, parseIntParam } from "../../lib/validation";
import { METODOS_PAGO_VALIDOS } from "../mesas/cuentas.routes";
import { hoyLocalISO, parseFechaDia } from "../../lib/fechasNegocio";

export const gastosRouter = Router();

gastosRouter.use(authenticate, requireRole("ADMIN"));

const CATEGORIAS_GASTO_VALIDAS = Object.values(CategoriaGasto);

gastosRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const fechaParam = req.query.fecha !== undefined ? String(req.query.fecha) : hoyLocalISO();
    const inicio = parseFechaDia(fechaParam);
    if (!inicio) return res.status(400).json({ error: "fecha debe tener formato YYYY-MM-DD" });
    const fin = new Date(inicio.getTime() + 24 * 60 * 60 * 1000 - 1);

    const gastos = await prisma.gasto.findMany({
      where: { fecha: { gte: inicio, lte: fin } },
      orderBy: { fecha: "desc" },
      include: { usuario: { select: { id: true, nombre: true } } },
    });

    res.json(gastos);
  }),
);

gastosRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { concepto, categoria, monto, metodoPago, fecha } = req.body ?? {};

    if (!isNonEmptyString(concepto)) {
      return res.status(400).json({ error: "concepto es requerido" });
    }
    if (categoria !== undefined && !CATEGORIAS_GASTO_VALIDAS.includes(categoria)) {
      return res.status(400).json({ error: `categoria debe ser una de: ${CATEGORIAS_GASTO_VALIDAS.join(", ")}` });
    }
    if (!isPositiveNumber(monto)) {
      return res.status(400).json({ error: "monto debe ser un numero mayor a 0" });
    }
    if (metodoPago !== undefined && !METODOS_PAGO_VALIDOS.includes(metodoPago)) {
      return res.status(400).json({ error: `metodoPago debe ser uno de: ${METODOS_PAGO_VALIDOS.join(", ")}` });
    }

    let fechaGasto = new Date();
    if (fecha !== undefined) {
      const parseada = parseFechaDia(fecha);
      if (!parseada) return res.status(400).json({ error: "fecha debe tener formato YYYY-MM-DD" });
      fechaGasto = parseada;
    }

    const gasto = await prisma.gasto.create({
      data: {
        concepto: concepto.trim(),
        categoria: categoria ?? "OTRO",
        monto,
        metodoPago: metodoPago ?? "EFECTIVO",
        fecha: fechaGasto,
        usuarioId: req.user!.sub,
      },
      include: { usuario: { select: { id: true, nombre: true } } },
    });

    res.status(201).json(gasto);
  }),
);

gastosRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const gasto = await prisma.gasto.findUnique({ where: { id } });
    if (!gasto) return res.status(404).json({ error: "Gasto no encontrado" });

    await prisma.gasto.delete({ where: { id } });
    res.status(204).send();
  }),
);
