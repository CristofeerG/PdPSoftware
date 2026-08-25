import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { isFiniteNumber } from "../../lib/validation";

export const cierresCajaRouter = Router();

cierresCajaRouter.use(authenticate, requireRole("ADMIN"));

function parseFechaDia(valor: unknown): Date | null {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const fecha = new Date(`${valor}T00:00:00.000Z`);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function finDelDia(inicio: Date): Date {
  return new Date(inicio.getTime() + 24 * 60 * 60 * 1000 - 1);
}

/** Efectivo vendido y gastado ese dia calendario (para el cuadre de caja). */
async function calcularMovimientoEfectivo(inicio: Date, fin: Date) {
  const [pagosEfectivo, gastosEfectivo] = await Promise.all([
    prisma.pago.aggregate({
      where: { fecha: { gte: inicio, lte: fin }, metodoPago: "EFECTIVO" },
      _sum: { monto: true },
    }),
    prisma.gasto.aggregate({
      where: { fecha: { gte: inicio, lte: fin }, metodoPago: "EFECTIVO" },
      _sum: { monto: true },
    }),
  ]);

  return {
    ventasEfectivo: new Prisma.Decimal(pagosEfectivo._sum.monto ?? 0),
    gastosEfectivo: new Prisma.Decimal(gastosEfectivo._sum.monto ?? 0),
  };
}

/** montoInicial sugerido de un dia: lo que quedo contado en el cierre anterior (0 si no hay ninguno todavia). */
async function sugerirMontoInicial(fecha: Date) {
  const anterior = await prisma.cierreDeCaja.findFirst({
    where: { fecha: { lt: fecha } },
    orderBy: { fecha: "desc" },
  });
  return anterior ? new Prisma.Decimal(anterior.montoContado) : new Prisma.Decimal(0);
}

cierresCajaRouter.get(
  "/preview",
  asyncHandler(async (req, res) => {
    const fechaParam = req.query.fecha !== undefined ? String(req.query.fecha) : new Date().toISOString().slice(0, 10);
    const inicio = parseFechaDia(fechaParam);
    if (!inicio) return res.status(400).json({ error: "fecha debe tener formato YYYY-MM-DD" });
    const fin = finDelDia(inicio);

    // montoInicial/ventas/gastos/esperado se recalculan siempre en vivo, incluso si
    // el dia ya tiene un cierre guardado: si despues de cerrar se corrige o elimina
    // un gasto, esto tiene que reflejarse de inmediato (antes se devolvia la foto
    // congelada del momento del cierre y quedaba desactualizado). Lo unico que se
    // respeta del registro guardado es montoContado (lo que realmente se conto
    // fisicamente en caja): eso no se puede "recalcular", es un hecho ya ocurrido,
    // y solo cambia si el usuario lo corrige a mano con "Corregir cierre".
    const [existente, montoInicial, movimiento] = await Promise.all([
      prisma.cierreDeCaja.findUnique({
        where: { fecha: inicio },
        include: { usuario: { select: { id: true, nombre: true } } },
      }),
      sugerirMontoInicial(inicio),
      calcularMovimientoEfectivo(inicio, fin),
    ]);
    const montoEsperado = montoInicial.plus(movimiento.ventasEfectivo).minus(movimiento.gastosEfectivo);

    res.json({
      fecha: fechaParam,
      cerrado: existente !== null,
      montoInicial: montoInicial.toFixed(2),
      ventasEfectivo: movimiento.ventasEfectivo.toFixed(2),
      gastosEfectivo: movimiento.gastosEfectivo.toFixed(2),
      montoEsperado: montoEsperado.toFixed(2),
      montoContado: existente ? existente.montoContado.toFixed(2) : null,
      diferencia: existente ? existente.montoContado.minus(montoEsperado).toFixed(2) : null,
      notas: existente?.notas ?? null,
      usuario: existente?.usuario ?? null,
    });
  }),
);

cierresCajaRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const limiteParam = req.query.limit !== undefined ? Number(req.query.limit) : 30;
    const limite = Number.isFinite(limiteParam) && limiteParam > 0 ? Math.min(limiteParam, 90) : 30;

    const cierres = await prisma.cierreDeCaja.findMany({
      orderBy: { fecha: "desc" },
      take: limite,
      include: { usuario: { select: { id: true, nombre: true } } },
    });

    res.json(
      cierres.map((c) => ({
        fecha: c.fecha.toISOString().slice(0, 10),
        montoInicial: c.montoInicial.toFixed(2),
        ventasEfectivo: c.ventasEfectivo.toFixed(2),
        gastosEfectivo: c.gastosEfectivo.toFixed(2),
        montoEsperado: c.montoEsperado.toFixed(2),
        montoContado: c.montoContado.toFixed(2),
        diferencia: c.diferencia.toFixed(2),
        notas: c.notas,
        usuario: c.usuario,
      })),
    );
  }),
);

cierresCajaRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { fecha, montoContado, montoInicial, notas } = req.body ?? {};

    const inicio = parseFechaDia(fecha);
    if (!inicio) return res.status(400).json({ error: "fecha debe tener formato YYYY-MM-DD" });
    if (!isFiniteNumber(montoContado) || montoContado < 0) {
      return res.status(400).json({ error: "montoContado debe ser un numero mayor o igual a 0" });
    }
    if (montoInicial !== undefined && (!isFiniteNumber(montoInicial) || montoInicial < 0)) {
      return res.status(400).json({ error: "montoInicial debe ser un numero mayor o igual a 0" });
    }
    if (notas !== undefined && notas !== null && typeof notas !== "string") {
      return res.status(400).json({ error: "notas debe ser texto" });
    }

    const fin = finDelDia(inicio);
    const [montoInicialFinal, movimiento] = await Promise.all([
      montoInicial !== undefined ? Promise.resolve(new Prisma.Decimal(montoInicial)) : sugerirMontoInicial(inicio),
      calcularMovimientoEfectivo(inicio, fin),
    ]);

    const montoEsperado = montoInicialFinal.plus(movimiento.ventasEfectivo).minus(movimiento.gastosEfectivo);
    const montoContadoDecimal = new Prisma.Decimal(montoContado);
    const diferencia = montoContadoDecimal.minus(montoEsperado);

    const datosComunes = {
      montoInicial: montoInicialFinal,
      ventasEfectivo: movimiento.ventasEfectivo,
      gastosEfectivo: movimiento.gastosEfectivo,
      montoEsperado,
      montoContado: montoContadoDecimal,
      diferencia,
      notas: notas ?? null,
      usuarioId: req.user!.sub,
    };

    const cierre = await prisma.cierreDeCaja.upsert({
      where: { fecha: inicio },
      create: { fecha: inicio, ...datosComunes },
      update: datosComunes,
      include: { usuario: { select: { id: true, nombre: true } } },
    });

    res.json({
      fecha: cierre.fecha.toISOString().slice(0, 10),
      cerrado: true,
      montoInicial: cierre.montoInicial.toFixed(2),
      ventasEfectivo: cierre.ventasEfectivo.toFixed(2),
      gastosEfectivo: cierre.gastosEfectivo.toFixed(2),
      montoEsperado: cierre.montoEsperado.toFixed(2),
      montoContado: cierre.montoContado.toFixed(2),
      diferencia: cierre.diferencia.toFixed(2),
      notas: cierre.notas,
      usuario: cierre.usuario,
    });
  }),
);
