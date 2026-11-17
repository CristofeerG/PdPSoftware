import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { parseIntParam } from "../../lib/validation";
import { OFFSET_CORTE_JORNADA, hoyLocalISO, parseFechaDia, parseFechaQuery } from "../../lib/fechasNegocio";

export const reportesRouter = Router();

reportesRouter.use(authenticate);

const METODOS_PAGO = ["EFECTIVO", "TARJETA", "TRANSFERENCIA"] as const;

const UNIDADES_TRUNCADO = { dia: "day", semana: "week", mes: "month" } as const;
type Agrupacion = keyof typeof UNIDADES_TRUNCADO;

reportesRouter.get(
  "/ventas",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const agrupacionParam = String(req.query.agrupacion ?? "dia");
    if (!(agrupacionParam in UNIDADES_TRUNCADO)) {
      return res.status(400).json({ error: "agrupacion debe ser dia, semana o mes" });
    }
    const agrupacion = agrupacionParam as Agrupacion;

    let desde: Date;
    const desdeParseada = parseFechaQuery(req.query.desde, "inicio");
    if (desdeParseada === null) return res.status(400).json({ error: "desde invalida" });
    if (desdeParseada === undefined) {
      desde = new Date();
      desde.setDate(desde.getDate() - 30);
    } else {
      desde = desdeParseada;
    }

    let hasta: Date;
    const hastaParseada = parseFechaQuery(req.query.hasta, "fin");
    if (hastaParseada === null) return res.status(400).json({ error: "hasta invalida" });
    hasta = hastaParseada ?? new Date();

    // fecha_cierre es "timestamptz" (instante real, con zona horaria): la
    // comparacion contra desde/hasta es directa, sin ambiguedad. La sesion de
    // Postgres se conecta forzada a UTC (ver lib/prisma.ts), asi que para
    // agrupar "por dia/semana/mes" segun el dia de negocio (corte a las 6am,
    // ver lib/fechasNegocio.ts) hay que convertir explicitamente antes del
    // date_trunc (si no, "por dia" agruparia por dia calendario UTC desde
    // medianoche, partiendo una misma noche de trabajo en dos).
    const filas = await prisma.$queryRaw<
      { periodo: string; total: string; cantidadCuentas: number; efectivo: string; tarjeta: string; transferencia: string }[]
    >`
      WITH pagos_por_cuenta AS (
        SELECT
          cuenta_id,
          SUM(CASE WHEN metodo_pago = 'EFECTIVO' THEN monto ELSE 0 END) as efectivo,
          SUM(CASE WHEN metodo_pago = 'TARJETA' THEN monto ELSE 0 END) as tarjeta,
          SUM(CASE WHEN metodo_pago = 'TRANSFERENCIA' THEN monto ELSE 0 END) as transferencia
        FROM pagos
        GROUP BY cuenta_id
      )
      SELECT
        to_char(date_trunc(${UNIDADES_TRUNCADO[agrupacion]}, c.fecha_cierre AT TIME ZONE ${OFFSET_CORTE_JORNADA}), 'YYYY-MM-DD') as periodo,
        SUM(c.total)::numeric(12,2)::text as total,
        COUNT(*)::int as "cantidadCuentas",
        COALESCE(SUM(pc.efectivo), 0)::numeric(12,2)::text as efectivo,
        COALESCE(SUM(pc.tarjeta), 0)::numeric(12,2)::text as tarjeta,
        COALESCE(SUM(pc.transferencia), 0)::numeric(12,2)::text as transferencia
      FROM cuentas c
      LEFT JOIN pagos_por_cuenta pc ON pc.cuenta_id = c.id
      WHERE c.estado = 'CERRADA'
        AND c.fecha_cierre >= ${desde}
        AND c.fecha_cierre <= ${hasta}
      GROUP BY periodo
      ORDER BY periodo ASC
    `;

    res.json(
      filas.map((fila) => ({
        periodo: fila.periodo,
        total: fila.total,
        cantidadCuentas: fila.cantidadCuentas,
        desglosePagos: { EFECTIVO: fila.efectivo, TARJETA: fila.tarjeta, TRANSFERENCIA: fila.transferencia },
      })),
    );
  }),
);

reportesRouter.get(
  "/productos",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const orden = req.query.orden === "menos" ? "menos" : "mas";

    const limitParam = req.query.limit !== undefined ? parseIntParam(String(req.query.limit)) : 10;
    if (limitParam === null || limitParam <= 0) {
      return res.status(400).json({ error: "limit debe ser un entero mayor a 0" });
    }

    const desde = parseFechaQuery(req.query.desde, "inicio");
    if (desde === null) return res.status(400).json({ error: "desde invalida" });
    const hasta = parseFechaQuery(req.query.hasta, "fin");
    if (hasta === null) return res.status(400).json({ error: "hasta invalida" });

    const fechaCierreFiltro: Prisma.DateTimeFilter = {};
    if (desde) fechaCierreFiltro.gte = desde;
    if (hasta) fechaCierreFiltro.lte = hasta;

    const agrupado = await prisma.itemConsumo.groupBy({
      by: ["productoVentaId"],
      where: {
        cuenta: {
          estado: "CERRADA",
          ...(desde || hasta ? { fechaCierre: fechaCierreFiltro } : {}),
        },
      },
      _sum: { cantidad: true, subtotal: true },
    });
    const sumaPorProducto = new Map(agrupado.map((fila) => [fila.productoVentaId, fila]));

    const productos = await prisma.productoVenta.findMany({ select: { id: true, nombre: true } });

    const detalle = productos
      .map((producto) => {
        const fila = sumaPorProducto.get(producto.id);
        return {
          productoVentaId: producto.id,
          nombre: producto.nombre,
          cantidadVendida: fila?._sum.cantidad ?? 0,
          totalVendido: (fila?._sum.subtotal ?? new Prisma.Decimal(0)).toFixed(2),
        };
      })
      .sort((a, b) => (orden === "mas" ? b.cantidadVendida - a.cantidadVendida : a.cantidadVendida - b.cantidadVendida))
      .slice(0, limitParam);

    res.json(detalle);
  }),
);

reportesRouter.get(
  "/cierre-caja",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const fecha = req.query.fecha !== undefined ? String(req.query.fecha) : hoyLocalISO();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({ error: "fecha debe tener formato YYYY-MM-DD" });
    }

    const inicio = parseFechaDia(fecha);
    if (!inicio) return res.status(400).json({ error: "fecha invalida" });
    const fin = parseFechaQuery(fecha, "fin") as Date;

    const cuentas = await prisma.cuenta.findMany({
      where: { estado: "CERRADA", fechaCierre: { gte: inicio, lte: fin } },
      select: { total: true },
    });

    const totalVendido = cuentas.reduce((acc, c) => acc.plus(c.total), new Prisma.Decimal(0));

    // El desglose por metodo sale de los pagos individuales (no de
    // cuenta.metodoPago, que solo cubre el caso de un metodo unico) para que
    // cuadre con pagos mixtos y con "+1 pagado" cobrado antes del cierre. Se
    // filtra por la cuenta a la que pertenece el pago (misma cuenta que
    // totalVendido/cantidadCuentas arriba), no por la fecha propia del pago:
    // asi los tres numeros de esta respuesta siempre suman consistente y
    // coincide con el desglose de /reportes/ventas para el mismo rango. Un
    // pago hecho un dia antes de que se cierre la cuenta (ej. "+1 pagado"
    // cobrado la noche anterior) se cuenta en el dia en que la cuenta cerro,
    // igual que ya se hace con su monto en totalVendido.
    //
    // Esto es distinto (a proposito) del cuadre de caja fisico en
    // cierres.routes.ts, que si necesita el efectivo por la fecha real en que
    // entro/salio de la caja (calcularMovimientoEfectivo), sin importar
    // cuando se cerro la cuenta.
    const pagosDelDia = await prisma.pago.findMany({
      where: { cuenta: { estado: "CERRADA", fechaCierre: { gte: inicio, lte: fin } } },
      select: { monto: true, metodoPago: true },
    });

    const desglosePorMetodoPago = METODOS_PAGO.map((metodoPago) => {
      const deEsteMetodo = pagosDelDia.filter((p) => p.metodoPago === metodoPago);
      const total = deEsteMetodo.reduce((acc, p) => acc.plus(p.monto), new Prisma.Decimal(0));
      return { metodoPago, total: total.toFixed(2), cantidadPagos: deEsteMetodo.length };
    });

    res.json({
      fecha,
      totalVendido: totalVendido.toFixed(2),
      cantidadCuentas: cuentas.length,
      desglosePorMetodoPago,
    });
  }),
);

reportesRouter.get(
  "/inventario-valorizado",
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const insumos = await prisma.insumo.findMany({
      include: { categoria: true },
      orderBy: { nombre: "asc" },
    });

    const detalle = insumos.map((insumo) => {
      const valorTotal = new Prisma.Decimal(insumo.stockActual).times(insumo.costo);
      return {
        insumoId: insumo.id,
        nombre: insumo.nombre,
        categoria: insumo.categoria.nombre,
        unidad: insumo.unidad,
        stockActual: insumo.stockActual,
        costo: insumo.costo,
        valorTotal: valorTotal.toFixed(2),
      };
    });

    const totalValorizado = detalle
      .reduce((acc, item) => acc.plus(item.valorTotal), new Prisma.Decimal(0))
      .toFixed(2);

    res.json({ detalle, totalValorizado });
  }),
);
