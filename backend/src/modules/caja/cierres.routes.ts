import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { isFiniteNumber } from "../../lib/validation";
import { finDelDia, hoyLocalISO, inicioDeHoy, parseFechaDia } from "../../lib/fechasNegocio";

export const cierresCajaRouter = Router();

cierresCajaRouter.use(authenticate, requireRole("ADMIN"));

// La ventana de dia calendario local se calcula con parseFechaDia/finDelDia
// (ver lib/fechasNegocio.ts). No afecta los cierres ya guardados:
// CierreDeCaja.fecha es @db.Date (solo fecha, sin hora), y T00:00-05:00 cae
// en el mismo dia UTC que T00:00Z, asi que la clave unica no cambia.

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
    const fechaParam = req.query.fecha !== undefined ? String(req.query.fecha) : hoyLocalISO();
    const inicio = parseFechaDia(fechaParam);
    if (!inicio) return res.status(400).json({ error: "fecha debe tener formato YYYY-MM-DD" });
    if (inicio.getTime() > inicioDeHoy().getTime()) {
      return res.status(400).json({ error: "fecha todavia no ocurre" });
    }
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

    // El registro guardado queda "congelado" con lo que se conocia al momento
    // del cierre. Si despues aparece o se corrige una venta/gasto de ese
    // mismo dia (o, como paso una vez, se guardo el cierre antes de que el
    // dia terminara), lo guardado deja de coincidir con lo que se recalcula
    // en vivo arriba. Antes esto era invisible: la pantalla mostraba el
    // numero en vivo (correcto) sin avisar que el registro persistido ya no
    // coincidia con el, y ese desfase se arrastraba en silencio al
    // montoInicial sugerido del dia siguiente via sugerirMontoInicial.
    const desactualizado =
      existente !== null &&
      (!existente.ventasEfectivo.equals(movimiento.ventasEfectivo) || !existente.gastosEfectivo.equals(movimiento.gastosEfectivo));

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
      desactualizado,
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
    // Un cierre se guardo una vez para un dia que, en la zona horaria del
    // negocio, todavia no habia empezado (quedo con ventas/gastos en $0
    // porque literalmente no habia pasado nada ese dia todavia), y ese
    // registro incompleto se arrastro al dia siguiente via
    // sugerirMontoInicial. No se puede cerrar un dia que todavia no ocurre.
    if (inicio.getTime() > inicioDeHoy().getTime()) {
      return res.status(400).json({ error: "No se puede cerrar un dia que todavia no ocurre" });
    }
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
