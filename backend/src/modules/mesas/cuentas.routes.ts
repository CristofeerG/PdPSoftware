import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { isFiniteNumber, isPositiveInteger, isPositiveNumber, parseIntParam } from "../../lib/validation";
import {
  emitCuentaCerrada,
  emitCuentaItemAgregado,
  emitCuentaItemEditado,
  emitCuentaItemEliminado,
  emitMesaActualizada,
  notificarSiStockBajo,
} from "../../lib/socketEvents";

export const cuentasRouter = Router();

cuentasRouter.use(authenticate);

export const METODOS_PAGO_VALIDOS = ["EFECTIVO", "TARJETA", "TRANSFERENCIA"] as const;

const itemsInclude = {
  itemsConsumo: {
    orderBy: { id: "asc" },
    include: {
      productoVenta: {
        select: { id: true, nombre: true, unidadesPorEntrega: true, categoria: { select: { nombre: true } } },
      },
    },
  },
} as const;

export function calcularMontoPagado(itemsConsumo: { cantidadPagada: number; precioUnitario: Prisma.Decimal }[]): Prisma.Decimal {
  return itemsConsumo.reduce(
    (acc, item) => acc.plus(new Prisma.Decimal(item.precioUnitario).times(item.cantidadPagada)),
    new Prisma.Decimal(0),
  );
}

const cuentaDetalleInclude = {
  mesa: true,
  usuario: { select: { id: true, nombre: true, usuario: true } },
  // Se incluyen los pagos para poder mostrar el desglose real de la cuenta
  // (cuenta.metodoPago queda en null cuando el pago fue mixto, ver /:id/cerrar).
  pagos: { orderBy: { id: "asc" } },
  ...itemsInclude,
} as const;

function stockInsuficiente(
  recetaItems: { insumoId: number; cantidad: Prisma.Decimal; insumo: { nombre: string; stockActual: Prisma.Decimal } }[],
  multiplicador: number,
): string[] {
  const faltantes: string[] = [];
  for (const receta of recetaItems) {
    const requerido = new Prisma.Decimal(receta.cantidad).times(multiplicador);
    if (new Prisma.Decimal(receta.insumo.stockActual).lessThan(requerido)) {
      faltantes.push(
        `${receta.insumo.nombre} (disponible ${receta.insumo.stockActual}, se requieren ${requerido.toFixed(2)})`,
      );
    }
  }
  return faltantes;
}

cuentasRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { estado, mesaId, desde, hasta } = req.query;
    const where: Prisma.CuentaWhereInput = {};

    if (estado !== undefined) {
      if (!["ABIERTA", "CERRADA"].includes(String(estado))) {
        return res.status(400).json({ error: "estado debe ser ABIERTA o CERRADA" });
      }
      where.estado = String(estado) as "ABIERTA" | "CERRADA";
    }

    if (mesaId !== undefined) {
      const mesaIdNum = parseIntParam(String(mesaId));
      if (mesaIdNum === null) return res.status(400).json({ error: "mesaId invalido" });
      where.mesaId = mesaIdNum;
    }

    // Para el historial de cuentas cerradas (RF15) tiene mas sentido filtrar/ordenar
    // por fecha de cierre que por fecha de apertura; para el resto de los casos
    // (o cuentas todavia abiertas, que no tienen fecha de cierre) se usa apertura.
    const filtrarPorCierre = where.estado === "CERRADA";

    if (desde !== undefined || hasta !== undefined) {
      const rango: Prisma.DateTimeFilter = {};
      if (desde !== undefined) {
        const fechaDesde = new Date(String(desde));
        if (Number.isNaN(fechaDesde.getTime())) return res.status(400).json({ error: "desde invalida" });
        rango.gte = fechaDesde;
      }
      if (hasta !== undefined) {
        const fechaHasta = new Date(String(hasta));
        if (Number.isNaN(fechaHasta.getTime())) return res.status(400).json({ error: "hasta invalida" });
        rango.lte = fechaHasta;
      }
      if (filtrarPorCierre) {
        where.fechaCierre = rango;
      } else {
        where.fechaApertura = rango;
      }
    }

    const cuentas = await prisma.cuenta.findMany({
      where,
      include: cuentaDetalleInclude,
      orderBy: filtrarPorCierre ? { fechaCierre: "desc" } : { fechaApertura: "desc" },
    });

    res.json(cuentas);
  }),
);

cuentasRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ error: "id invalido" });

    const cuenta = await prisma.cuenta.findUnique({ where: { id }, include: cuentaDetalleInclude });
    if (!cuenta) return res.status(404).json({ error: "Cuenta no encontrada" });

    res.json(cuenta);
  }),
);

cuentasRouter.post(
  "/:id/items",
  asyncHandler(async (req, res) => {
    const cuentaId = parseIntParam(req.params.id);
    if (cuentaId === null) return res.status(400).json({ error: "id invalido" });

    const { productoVentaId, cantidad } = req.body ?? {};
    if (!isFiniteNumber(productoVentaId)) {
      return res.status(400).json({ error: "productoVentaId es requerido" });
    }
    if (!isPositiveInteger(cantidad)) {
      return res.status(400).json({ error: "cantidad debe ser un entero mayor a 0" });
    }

    const cuenta = await prisma.cuenta.findUnique({ where: { id: cuentaId }, include: { mesa: true } });
    if (!cuenta) return res.status(404).json({ error: "Cuenta no encontrada" });
    if (cuenta.estado !== "ABIERTA") {
      return res.status(409).json({ error: "La cuenta no esta abierta" });
    }

    const producto = await prisma.productoVenta.findUnique({
      where: { id: productoVentaId },
      include: { recetaItems: { include: { insumo: true } } },
    });
    if (!producto) return res.status(400).json({ error: "productoVentaId no existe" });

    const faltantes = stockInsuficiente(producto.recetaItems, cantidad);
    if (faltantes.length > 0) {
      return res.status(400).json({ error: `Stock insuficiente: ${faltantes.join("; ")}` });
    }

    const subtotal = new Prisma.Decimal(producto.precioVenta).times(cantidad);
    const usuarioId = req.user!.sub;
    const insumosActualizados: { stockActual: Prisma.Decimal; stockMinimo: Prisma.Decimal; nombre: string; id: number; unidad: string }[] = [];

    await prisma.$transaction(async (tx) => {
      await tx.itemConsumo.create({
        data: {
          cuentaId,
          productoVentaId,
          cantidad,
          precioUnitario: producto.precioVenta,
          subtotal,
        },
      });
      await tx.cuenta.update({ where: { id: cuentaId }, data: { total: { increment: subtotal } } });

      for (const receta of producto.recetaItems) {
        const consumo = new Prisma.Decimal(receta.cantidad).times(cantidad);
        const insumoActualizado = await tx.insumo.update({
          where: { id: receta.insumoId },
          data: { stockActual: { decrement: consumo } },
        });
        insumosActualizados.push(insumoActualizado);
        await tx.movimientoInventario.create({
          data: {
            insumoId: receta.insumoId,
            tipo: "SALIDA",
            cantidad: consumo,
            motivo: `Venta: ${producto.nombre} x${cantidad} (cuenta #${cuentaId})`,
            usuarioId,
          },
        });
      }
    });

    const cuentaActualizada = await prisma.cuenta.findUnique({ where: { id: cuentaId }, include: itemsInclude });

    emitCuentaItemAgregado(cuenta.mesaId, cuentaActualizada);
    emitMesaActualizada({
      id: cuenta.mesaId,
      numero: cuenta.mesa.numero,
      estado: "OCUPADA",
      total: cuentaActualizada?.total.toString() ?? null,
    });
    insumosActualizados.forEach(notificarSiStockBajo);

    res.status(201).json(cuentaActualizada);
  }),
);

cuentasRouter.put(
  "/:id/items/:itemId",
  asyncHandler(async (req, res) => {
    const cuentaId = parseIntParam(req.params.id);
    const itemId = parseIntParam(req.params.itemId);
    if (cuentaId === null || itemId === null) return res.status(400).json({ error: "id invalido" });

    const { cantidad: nuevaCantidad } = req.body ?? {};
    if (!isPositiveInteger(nuevaCantidad)) {
      return res.status(400).json({ error: "cantidad debe ser un entero mayor a 0" });
    }

    const cuenta = await prisma.cuenta.findUnique({ where: { id: cuentaId }, include: { mesa: true } });
    if (!cuenta) return res.status(404).json({ error: "Cuenta no encontrada" });
    if (cuenta.estado !== "ABIERTA") {
      return res.status(409).json({ error: "La cuenta no esta abierta" });
    }

    const item = await prisma.itemConsumo.findUnique({
      where: { id: itemId },
      include: { productoVenta: { include: { recetaItems: { include: { insumo: true } } } } },
    });
    if (!item || item.cuentaId !== cuentaId) {
      return res.status(404).json({ error: "Item no encontrado en esta cuenta" });
    }

    const delta = nuevaCantidad - item.cantidad;

    if (delta > 0) {
      const faltantes = stockInsuficiente(item.productoVenta.recetaItems, delta);
      if (faltantes.length > 0) {
        return res.status(400).json({
          error: `Stock insuficiente para aumentar la cantidad: ${faltantes.join("; ")}`,
        });
      }
    }

    const nuevoSubtotal = new Prisma.Decimal(item.precioUnitario).times(nuevaCantidad);
    const diferenciaSubtotal = nuevoSubtotal.minus(item.subtotal);
    const usuarioId = req.user!.sub;
    const insumosActualizados: { stockActual: Prisma.Decimal; stockMinimo: Prisma.Decimal; nombre: string; id: number; unidad: string }[] = [];

    await prisma.$transaction(async (tx) => {
      await tx.itemConsumo.update({
        where: { id: itemId },
        data: { cantidad: nuevaCantidad, subtotal: nuevoSubtotal },
      });
      await tx.cuenta.update({ where: { id: cuentaId }, data: { total: { increment: diferenciaSubtotal } } });

      if (delta !== 0) {
        const motivo =
          delta > 0
            ? `Venta: ${item.productoVenta.nombre} x${delta} (edicion item #${itemId}, cuenta #${cuentaId})`
            : `Reversion por edicion de item #${itemId} (cuenta #${cuentaId})`;

        for (const receta of item.productoVenta.recetaItems) {
          const cantidadMovimiento = new Prisma.Decimal(receta.cantidad).times(Math.abs(delta));
          const insumoActualizado = await tx.insumo.update({
            where: { id: receta.insumoId },
            data: {
              stockActual: delta > 0 ? { decrement: cantidadMovimiento } : { increment: cantidadMovimiento },
            },
          });
          if (delta > 0) insumosActualizados.push(insumoActualizado);
          await tx.movimientoInventario.create({
            data: {
              insumoId: receta.insumoId,
              tipo: delta > 0 ? "SALIDA" : "AJUSTE",
              cantidad: cantidadMovimiento,
              motivo,
              usuarioId,
            },
          });
        }
      }
    });

    const cuentaActualizada = await prisma.cuenta.findUnique({ where: { id: cuentaId }, include: itemsInclude });

    emitCuentaItemEditado(cuenta.mesaId, cuentaActualizada);
    emitMesaActualizada({
      id: cuenta.mesaId,
      numero: cuenta.mesa.numero,
      estado: "OCUPADA",
      total: cuentaActualizada?.total.toString() ?? null,
    });
    insumosActualizados.forEach(notificarSiStockBajo);

    res.json(cuentaActualizada);
  }),
);

cuentasRouter.delete(
  "/:id/items/:itemId",
  asyncHandler(async (req, res) => {
    const cuentaId = parseIntParam(req.params.id);
    const itemId = parseIntParam(req.params.itemId);
    if (cuentaId === null || itemId === null) return res.status(400).json({ error: "id invalido" });

    const cuenta = await prisma.cuenta.findUnique({ where: { id: cuentaId }, include: { mesa: true } });
    if (!cuenta) return res.status(404).json({ error: "Cuenta no encontrada" });
    if (cuenta.estado !== "ABIERTA") {
      return res.status(409).json({ error: "La cuenta no esta abierta" });
    }

    const item = await prisma.itemConsumo.findUnique({
      where: { id: itemId },
      include: { productoVenta: { include: { recetaItems: true } } },
    });
    if (!item || item.cuentaId !== cuentaId) {
      return res.status(404).json({ error: "Item no encontrado en esta cuenta" });
    }

    const usuarioId = req.user!.sub;

    await prisma.$transaction(async (tx) => {
      await tx.itemConsumo.delete({ where: { id: itemId } });
      await tx.cuenta.update({ where: { id: cuentaId }, data: { total: { decrement: item.subtotal } } });

      for (const receta of item.productoVenta.recetaItems) {
        const cantidadMovimiento = new Prisma.Decimal(receta.cantidad).times(item.cantidad);
        await tx.insumo.update({
          where: { id: receta.insumoId },
          data: { stockActual: { increment: cantidadMovimiento } },
        });
        await tx.movimientoInventario.create({
          data: {
            insumoId: receta.insumoId,
            tipo: "AJUSTE",
            cantidad: cantidadMovimiento,
            motivo: `Reversion por eliminacion de item #${itemId} (cuenta #${cuentaId})`,
            usuarioId,
          },
        });
      }
    });

    const cuentaActualizada = await prisma.cuenta.findUnique({ where: { id: cuentaId }, include: itemsInclude });

    emitCuentaItemEliminado(cuenta.mesaId, cuentaActualizada);
    emitMesaActualizada({
      id: cuenta.mesaId,
      numero: cuenta.mesa.numero,
      estado: "OCUPADA",
      total: cuentaActualizada?.total.toString() ?? null,
    });

    res.status(204).send();
  }),
);

cuentasRouter.post(
  "/:id/cerrar",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const cuentaId = parseIntParam(req.params.id);
    if (cuentaId === null) return res.status(400).json({ error: "id invalido" });

    const { pagos: pagosInput, descuento } = req.body ?? {};
    const pagos = Array.isArray(pagosInput) ? pagosInput : [];
    for (const pago of pagos) {
      if (!pago || !METODOS_PAGO_VALIDOS.includes(pago.metodoPago) || !isPositiveNumber(pago.monto)) {
        return res.status(400).json({
          error: `cada pago debe tener metodoPago (${METODOS_PAGO_VALIDOS.join(", ")}) y monto mayor a 0`,
        });
      }
    }
    if (descuento !== undefined && (!isFiniteNumber(descuento) || descuento < 0)) {
      return res.status(400).json({ error: "descuento debe ser un numero mayor o igual a 0" });
    }

    const cuenta = await prisma.cuenta.findUnique({ where: { id: cuentaId }, include: { itemsConsumo: true } });
    if (!cuenta) return res.status(404).json({ error: "Cuenta no encontrada" });
    if (cuenta.estado !== "ABIERTA") {
      return res.status(409).json({ error: "La cuenta ya esta cerrada" });
    }

    const montoPagado = calcularMontoPagado(cuenta.itemsConsumo);
    const montoPendiente = new Prisma.Decimal(cuenta.total).minus(montoPagado);
    const montoDescuento = descuento ?? 0;
    if (new Prisma.Decimal(montoDescuento).greaterThan(montoPendiente)) {
      return res.status(400).json({
        error: `El descuento no puede ser mayor al monto pendiente de cobro ($${montoPendiente.toFixed(2)}, ya se pago $${montoPagado.toFixed(2)} de la cuenta)`,
      });
    }

    // Si ya se pago todo (o el descuento cubre el resto) no hace falta
    // registrar ningun pago nuevo para cerrar la cuenta.
    const montoACobrar = montoPendiente.minus(montoDescuento);
    if (montoACobrar.greaterThan(0.01)) {
      if (pagos.length === 0) {
        return res.status(400).json({ error: `Faltan $${montoACobrar.toFixed(2)} por cobrar; agrega al menos un pago` });
      }
      const sumaPagos = pagos.reduce((acc, pago) => acc.plus(new Prisma.Decimal(pago.monto)), new Prisma.Decimal(0));
      if (sumaPagos.minus(montoACobrar).abs().greaterThan(0.01)) {
        return res.status(400).json({
          error: `La suma de los pagos ($${sumaPagos.toFixed(2)}) debe ser igual al monto a cobrar ($${montoACobrar.toFixed(2)})`,
        });
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.cuenta.update({
        where: { id: cuentaId },
        data: {
          estado: "CERRADA",
          fechaCierre: new Date(),
          metodoPago: pagos.length === 1 ? pagos[0].metodoPago : null,
          descuento: montoDescuento,
          total: { decrement: montoDescuento },
        },
      });
      if (pagos.length > 0) {
        await tx.pago.createMany({
          data: pagos.map((pago) => ({ cuentaId, monto: pago.monto, metodoPago: pago.metodoPago })),
        });
      }
      await tx.mesa.update({ where: { id: cuenta.mesaId }, data: { estado: "LIBRE" } });
    });

    const cuentaCerrada = await prisma.cuenta.findUnique({ where: { id: cuentaId }, include: cuentaDetalleInclude });

    emitCuentaCerrada(cuenta.mesaId, cuentaCerrada);
    emitMesaActualizada({ id: cuenta.mesaId, numero: cuentaCerrada!.mesa.numero, estado: "LIBRE", total: null });

    res.json(cuentaCerrada);
  }),
);

cuentasRouter.post(
  "/:id/dividir",
  asyncHandler(async (req, res) => {
    const origenId = parseIntParam(req.params.id);
    if (origenId === null) return res.status(400).json({ error: "id invalido" });

    const { mesaDestinoId, itemIds } = req.body ?? {};
    if (!isFiniteNumber(mesaDestinoId)) {
      return res.status(400).json({ error: "mesaDestinoId es requerido" });
    }
    if (!Array.isArray(itemIds) || itemIds.length === 0 || !itemIds.every(isFiniteNumber)) {
      return res.status(400).json({ error: "itemIds debe ser un arreglo no vacio de ids" });
    }

    const cuentaOrigen = await prisma.cuenta.findUnique({
      where: { id: origenId },
      include: { itemsConsumo: true },
    });
    if (!cuentaOrigen) return res.status(404).json({ error: "Cuenta no encontrada" });
    if (cuentaOrigen.estado !== "ABIERTA") {
      return res.status(409).json({ error: "La cuenta no esta abierta" });
    }
    if (mesaDestinoId === cuentaOrigen.mesaId) {
      return res.status(400).json({ error: "mesaDestinoId debe ser distinto de la mesa de la cuenta origen" });
    }

    const itemsAMover = cuentaOrigen.itemsConsumo.filter((item) => itemIds.includes(item.id));
    if (itemsAMover.length !== itemIds.length) {
      return res.status(400).json({ error: "uno o mas itemIds no pertenecen a esta cuenta" });
    }

    const mesaDestino = await prisma.mesa.findUnique({ where: { id: mesaDestinoId } });
    if (!mesaDestino) return res.status(404).json({ error: "Mesa destino no encontrada" });

    const cuentaDestinoExistente = await prisma.cuenta.findFirst({
      where: { mesaId: mesaDestinoId, estado: "ABIERTA" },
    });
    if (!cuentaDestinoExistente && mesaDestino.estado !== "LIBRE") {
      return res.status(409).json({ error: "La mesa destino no esta libre ni tiene cuenta abierta" });
    }

    const montoAMover = itemsAMover.reduce((acc, item) => acc.plus(item.subtotal), new Prisma.Decimal(0));

    const resultado = await prisma.$transaction(async (tx) => {
      let destino = cuentaDestinoExistente;
      if (!destino) {
        destino = await tx.cuenta.create({
          data: { mesaId: mesaDestinoId, usuarioId: cuentaOrigen.usuarioId },
        });
        await tx.mesa.update({ where: { id: mesaDestinoId }, data: { estado: "OCUPADA" } });
      }

      await tx.itemConsumo.updateMany({
        where: { id: { in: itemsAMover.map((item) => item.id) } },
        data: { cuentaId: destino.id },
      });
      // Los pagos ya registrados de esos items (p. ej. "+1 pagado" antes de
      // dividir la cuenta) deben moverse con ellos para no quedar huerfanos
      // apuntando a la cuenta origen.
      await tx.pago.updateMany({
        where: { itemConsumoId: { in: itemsAMover.map((item) => item.id) } },
        data: { cuentaId: destino.id },
      });

      await tx.cuenta.update({ where: { id: origenId }, data: { total: { decrement: montoAMover } } });
      await tx.cuenta.update({ where: { id: destino.id }, data: { total: { increment: montoAMover } } });

      const [origenActualizada, destinoActualizada] = await Promise.all([
        tx.cuenta.findUnique({ where: { id: origenId }, include: cuentaDetalleInclude }),
        tx.cuenta.findUnique({ where: { id: destino.id }, include: cuentaDetalleInclude }),
      ]);

      return { cuentaOrigen: origenActualizada, cuentaDestino: destinoActualizada };
    });

    emitMesaActualizada({
      id: cuentaOrigen.mesaId,
      numero: resultado.cuentaOrigen!.mesa.numero,
      estado: "OCUPADA",
      total: resultado.cuentaOrigen!.total.toString(),
    });
    emitMesaActualizada({
      id: mesaDestinoId,
      numero: mesaDestino.numero,
      estado: "OCUPADA",
      total: resultado.cuentaDestino!.total.toString(),
    });

    res.json(resultado);
  }),
);
