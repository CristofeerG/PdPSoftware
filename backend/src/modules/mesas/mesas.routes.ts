import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { isFiniteNumber, isNonEmptyString, parseIntParam } from "../../lib/validation";
import { emitCobroSolicitado, emitCuentaAbierta, emitMesaActualizada } from "../../lib/socketEvents";
import { calcularMontoPagado } from "./cuentas.routes";

export const mesasRouter = Router();

mesasRouter.use(authenticate);

const cuentaAbiertaInclude = {
  itemsConsumo: {
    orderBy: { id: "asc" },
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
  asyncHandler(async (req, res) => {
    const incluirInactivas = req.query.incluirInactivas === "true";

    const mesas = await prisma.mesa.findMany({
      where: incluirInactivas ? {} : { activo: true },
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

// Identificador puede ser el numero de mesa (texto numerico, ej. "5") o un
// nombre de texto (ej. "Vip"). Si coincide con una mesa inactiva existente,
// se reactiva en vez de duplicarla.
mesasRouter.post(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { identificador } = req.body ?? {};
    // OJO: no convertir a Number() antes de este chequeo. Number("") da 0,
    // no NaN, y un identificador vacio se colaria como "mesa numero 0".
    if (!isNonEmptyString(identificador)) {
      return res.status(400).json({ error: "identificador es requerido" });
    }
    const texto = identificador.trim();

    const numero = Number(texto);
    const esNumerico = Number.isInteger(numero) && numero > 0;

    const existente = esNumerico
      ? await prisma.mesa.findFirst({ where: { numero } })
      : await prisma.mesa.findFirst({ where: { nombre: { equals: texto, mode: "insensitive" } } });

    if (existente) {
      if (!existente.activo) {
        const reactivada = await prisma.mesa.update({ where: { id: existente.id }, data: { activo: true } });
        emitMesaActualizada({ id: reactivada.id, numero: reactivada.numero, estado: reactivada.estado, total: null });
        return res.json(reactivada);
      }
      const descripcion = existente.nombre ?? `numero ${existente.numero}`;
      return res.status(400).json({
        error: `Ya existe una mesa activa con ese nombre/numero (mesa "${descripcion}")`,
      });
    }

    try {
      const mesa = await prisma.$transaction(async (tx) => {
        if (esNumerico) {
          return tx.mesa.create({ data: { numero, nombre: null } });
        }
        // El siguiente numero se calcula sobre TODA la tabla, incluyendo
        // mesas inactivas: si solo se mirara entre las activas se podria
        // repetir el numero de una inactiva y violar el unique constraint.
        const maximo = await tx.mesa.aggregate({ _max: { numero: true } });
        const siguienteNumero = (maximo._max.numero ?? 0) + 1;
        return tx.mesa.create({ data: { numero: siguienteNumero, nombre: texto } });
      });

      emitMesaActualizada({ id: mesa.id, numero: mesa.numero, estado: mesa.estado, total: null });
      res.status(201).json(mesa);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una mesa con ese numero" });
      }
      throw error;
    }
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
  "/:id/solicitar-cobro",
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const mesa = await prisma.mesa.findUnique({ where: { id } });
    if (!mesa) return res.status(404).json({ error: "Mesa no encontrada" });
    if (mesa.estado !== "OCUPADA") {
      return res.status(409).json({ error: "La mesa no esta ocupada" });
    }

    const cuenta = await prisma.cuenta.findFirst({
      where: { mesaId: id, estado: "ABIERTA" },
      include: { itemsConsumo: { select: { cantidadPagada: true, precioUnitario: true } } },
    });
    if (!cuenta) {
      return res.status(409).json({ error: "La mesa no tiene una cuenta abierta" });
    }

    // El total de la cuenta es el consumo bruto; si ya se marcaron items como
    // pagados (flujo "+1 pagado" en la mesa), lo que realmente falta cobrar
    // es el total menos eso. El aviso a caja tiene que llevar ese pendiente,
    // no el total bruto, o el admin termina cobrando de mas.
    const montoPendiente = new Prisma.Decimal(cuenta.total).minus(calcularMontoPagado(cuenta.itemsConsumo));

    const mesaActualizada = await prisma.mesa.update({ where: { id }, data: { estado: "POR_COBRAR" } });

    emitMesaActualizada({
      id: mesaActualizada.id,
      numero: mesaActualizada.numero,
      estado: "POR_COBRAR",
      total: cuenta.total.toString(),
    });
    emitCobroSolicitado({
      mesaId: mesaActualizada.id,
      cuentaId: cuenta.id,
      nombreMesa: mesaActualizada.nombre,
      numero: mesaActualizada.numero,
      total: montoPendiente.toString(),
    });

    res.json(mesaActualizada);
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
        // La cuenta origen se borra abajo; sus pagos (de items marcados
        // "+1 pagado" antes de unir) deben moverse a la cuenta destino para
        // no perder el registro del dinero.
        await tx.pago.updateMany({
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

mesasRouter.post(
  "/:id/activar",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const mesa = await prisma.mesa.findUnique({ where: { id } });
    if (!mesa) return res.status(404).json({ error: "Mesa no encontrada" });

    // Idempotente: si ya esta activa, no hace falta tocar nada.
    const mesaActualizada = mesa.activo ? mesa : await prisma.mesa.update({ where: { id }, data: { activo: true } });

    emitMesaActualizada({
      id: mesaActualizada.id,
      numero: mesaActualizada.numero,
      estado: mesaActualizada.estado,
      total: null,
    });

    res.json(mesaActualizada);
  }),
);

mesasRouter.post(
  "/:id/desactivar",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const mesa = await prisma.mesa.findUnique({ where: { id } });
    if (!mesa) return res.status(404).json({ error: "Mesa no encontrada" });

    // Idempotente: si ya esta inactiva, no hace falta tocar nada (ni
    // validar el estado, que a esta altura ya no es relevante).
    let mesaActualizada = mesa;
    if (mesa.activo) {
      if (mesa.estado !== "LIBRE") {
        return res.status(400).json({ error: "La mesa no esta libre" });
      }
      mesaActualizada = await prisma.mesa.update({ where: { id }, data: { activo: false } });
    }

    emitMesaActualizada({
      id: mesaActualizada.id,
      numero: mesaActualizada.numero,
      estado: mesaActualizada.estado,
      total: null,
    });

    res.json(mesaActualizada);
  }),
);
