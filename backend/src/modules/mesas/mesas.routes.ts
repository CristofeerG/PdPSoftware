import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { isFiniteNumber, parseIntParam } from "../../lib/validation";
import { emitCuentaAbierta, emitMesaActualizada } from "../../lib/socketEvents";

export const mesasRouter = Router();

mesasRouter.use(authenticate);

const cuentaAbiertaInclude = {
  itemsConsumo: {
    include: {
      productoVenta: {
        select: { id: true, nombre: true, unidadesPorEntrega: true, categoria: { select: { nombre: true } } },
      },
    },
  },
  usuario: { select: { id: true, nombre: true, usuario: true } },
} as const;

mesasRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const mesas = await prisma.mesa.findMany({
      orderBy: { numero: "asc" },
      include: { cuentas: { where: { estado: "ABIERTA" }, include: cuentaAbiertaInclude } },
    });

    res.json(
      mesas.map(({ cuentas, ...mesa }) => ({
        ...mesa,
        cuentaAbierta: cuentas[0] ?? null,
      })),
    );
  }),
);

mesasRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const mesa = await prisma.mesa.findUnique({
      where: { id },
      include: { cuentas: { where: { estado: "ABIERTA" }, include: cuentaAbiertaInclude } },
    });
    if (!mesa) return res.status(404).json({ error: "Mesa no encontrada" });

    const { cuentas, ...resto } = mesa;
    res.json({ ...resto, cuentaAbierta: cuentas[0] ?? null });
  }),
);

mesasRouter.post(
  "/:id/abrir",
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const mesa = await prisma.mesa.findUnique({ where: { id } });
    if (!mesa) return res.status(404).json({ error: "Mesa no encontrada" });
    if (mesa.estado !== "LIBRE") {
      return res.status(409).json({ error: "La mesa no esta libre" });
    }

    const body = req.body ?? {};
    let usuarioId: number | null;

    if (Object.prototype.hasOwnProperty.call(body, "usuarioId") && body.usuarioId !== undefined) {
      if (body.usuarioId === null) {
        usuarioId = null;
      } else if (isFiniteNumber(body.usuarioId)) {
        const usuario = await prisma.usuario.findUnique({ where: { id: body.usuarioId } });
        if (!usuario) {
          return res.status(400).json({ error: "usuarioId no corresponde a un usuario existente" });
        }
        usuarioId = body.usuarioId;
      } else {
        return res.status(400).json({ error: "usuarioId invalido" });
      }
    } else {
      usuarioId = req.user!.sub;
    }

    const cuenta = await prisma.$transaction(async (tx) => {
      await tx.mesa.update({ where: { id }, data: { estado: "OCUPADA" } });
      return tx.cuenta.create({
        data: { mesaId: id, usuarioId },
        include: { ...cuentaAbiertaInclude, mesa: true },
      });
    });

    emitMesaActualizada({ id: mesa.id, numero: mesa.numero, estado: "OCUPADA", total: cuenta.total.toString() });
    emitCuentaAbierta(id, cuenta);

    res.status(201).json(cuenta);
  }),
);

mesasRouter.post(
  "/:id/unir",
  asyncHandler(async (req, res) => {
    const destinoId = parseIntParam(req.params.id);
    if (destinoId === null) return res.status(400).json({ error: "id invalido" });

    const { mesaOrigenId } = req.body ?? {};
    if (!isFiniteNumber(mesaOrigenId)) {
      return res.status(400).json({ error: "mesaOrigenId es requerido" });
    }
    if (mesaOrigenId === destinoId) {
      return res.status(400).json({ error: "mesaOrigenId debe ser distinto de la mesa destino" });
    }

    const [mesaDestino, mesaOrigen] = await Promise.all([
      prisma.mesa.findUnique({ where: { id: destinoId } }),
      prisma.mesa.findUnique({ where: { id: mesaOrigenId } }),
    ]);
    if (!mesaDestino) return res.status(404).json({ error: "Mesa destino no encontrada" });
    if (!mesaOrigen) return res.status(404).json({ error: "Mesa origen no encontrada" });

    const cuentaOrigen = await prisma.cuenta.findFirst({
      where: { mesaId: mesaOrigenId, estado: "ABIERTA" },
    });
    if (!cuentaOrigen) {
      return res.status(400).json({ error: "La mesa origen no tiene una cuenta abierta" });
    }

    const cuentaDestinoExistente = await prisma.cuenta.findFirst({
      where: { mesaId: destinoId, estado: "ABIERTA" },
    });

    await prisma.$transaction(async (tx) => {
      if (cuentaDestinoExistente) {
        await tx.itemConsumo.updateMany({
          where: { cuentaId: cuentaOrigen.id },
          data: { cuentaId: cuentaDestinoExistente.id },
        });
        await tx.cuenta.update({
          where: { id: cuentaDestinoExistente.id },
          data: { total: { increment: cuentaOrigen.total } },
        });
        await tx.cuenta.delete({ where: { id: cuentaOrigen.id } });
      } else {
        await tx.cuenta.update({ where: { id: cuentaOrigen.id }, data: { mesaId: destinoId } });
      }

      await tx.mesa.update({ where: { id: mesaOrigenId }, data: { estado: "LIBRE" } });
      await tx.mesa.update({ where: { id: destinoId }, data: { estado: "OCUPADA" } });
    });

    const cuentaFinal = await prisma.cuenta.findFirst({
      where: { mesaId: destinoId, estado: "ABIERTA" },
      include: { ...cuentaAbiertaInclude, mesa: true },
    });

    emitMesaActualizada({ id: mesaOrigen.id, numero: mesaOrigen.numero, estado: "LIBRE", total: null });
    emitMesaActualizada({
      id: mesaDestino.id,
      numero: mesaDestino.numero,
      estado: "OCUPADA",
      total: cuentaFinal?.total.toString() ?? null,
    });

    res.json(cuentaFinal);
  }),
);
