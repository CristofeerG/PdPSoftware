import { errorResponse } from "./common";

export const reportesTags = [{ name: "Reportes", description: "Reportes de inventario y ventas" }];

export const reportesSchemas = {
  InventarioValorizadoItem: {
    type: "object",
    properties: {
      insumoId: { type: "integer", example: 2 },
      nombre: { type: "string", example: "Tequila" },
      categoria: { type: "string", example: "Licores" },
      unidad: { type: "string", enum: ["ML", "UNIDAD"], example: "ML" },
      stockActual: { type: "string", example: "750.00" },
      costo: { type: "string", example: "0.60" },
      valorTotal: { type: "string", example: "450.00" },
    },
  },
  InventarioValorizado: {
    type: "object",
    properties: {
      detalle: {
        type: "array",
        items: { $ref: "#/components/schemas/InventarioValorizadoItem" },
      },
      totalValorizado: { type: "string", example: "3120.50" },
    },
  },
  VentasPorPeriodoItem: {
    type: "object",
    properties: {
      periodo: { type: "string", example: "2026-07-24" },
      total: { type: "string", example: "1250.00" },
      cantidadCuentas: { type: "integer", example: 8 },
    },
  },
  ProductoVendidoItem: {
    type: "object",
    properties: {
      productoVentaId: { type: "integer", example: 2 },
      nombre: { type: "string", example: "Tequila — Shot" },
      cantidadVendida: { type: "integer", example: 34 },
      totalVendido: { type: "string", example: "2040.00" },
    },
  },
  DesgloseMetodoPago: {
    type: "object",
    properties: {
      metodoPago: { type: "string", enum: ["EFECTIVO", "TARJETA", "TRANSFERENCIA"] },
      total: { type: "string", example: "450.00" },
      cantidadPagos: { type: "integer", example: 3, description: "Cantidad de pagos individuales con este metodo (permite pago mixto)" },
    },
  },
  CierreCaja: {
    type: "object",
    properties: {
      fecha: { type: "string", example: "2026-07-24" },
      totalVendido: { type: "string", example: "1250.00" },
      cantidadCuentas: { type: "integer", example: 8 },
      desglosePorMetodoPago: {
        type: "array",
        items: { $ref: "#/components/schemas/DesgloseMetodoPago" },
      },
    },
  },
};

export const reportesPaths = {
  "/reportes/ventas": {
    get: {
      tags: ["Reportes"],
      summary: "Ventas por día, semana o mes (RF20)",
      description:
        "Suma el total de las cuentas cerradas agrupadas por período (según fecha de cierre). Solo ADMIN.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "agrupacion",
          in: "query",
          schema: { type: "string", enum: ["dia", "semana", "mes"], default: "dia" },
        },
        {
          name: "desde",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Fecha de cierre mínima (ISO). Por defecto, 30 días atrás.",
        },
        {
          name: "hasta",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Fecha de cierre máxima (ISO). Por defecto, hoy.",
        },
      ],
      responses: {
        "200": {
          description: "Ventas agrupadas por período",
          content: {
            "application/json": {
              schema: { type: "array", items: { $ref: "#/components/schemas/VentasPorPeriodoItem" } },
            },
          },
        },
        "400": errorResponse("Parámetros inválidos"),
        "403": errorResponse("No tienes permisos para esta accion"),
      },
    },
  },
  "/reportes/productos": {
    get: {
      tags: ["Reportes"],
      summary: "Productos más y menos vendidos (RF21)",
      description:
        "Cantidad y monto vendido por producto de venta, considerando solo cuentas cerradas. Incluye productos sin ventas (útil para 'menos vendidos'). Solo ADMIN.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "orden", in: "query", schema: { type: "string", enum: ["mas", "menos"], default: "mas" } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        {
          name: "desde",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Fecha de cierre mínima (ISO). Sin filtro por defecto.",
        },
        {
          name: "hasta",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Fecha de cierre máxima (ISO). Sin filtro por defecto.",
        },
      ],
      responses: {
        "200": {
          description: "Productos ordenados por cantidad vendida",
          content: {
            "application/json": {
              schema: { type: "array", items: { $ref: "#/components/schemas/ProductoVendidoItem" } },
            },
          },
        },
        "400": errorResponse("Parámetros inválidos"),
        "403": errorResponse("No tienes permisos para esta accion"),
      },
    },
  },
  "/reportes/cierre-caja": {
    get: {
      tags: ["Reportes"],
      summary: "Cierre de caja diario (RF22)",
      description: "Total vendido en el día y desglose por método de pago, sobre cuentas cerradas. Solo ADMIN.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "fecha",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Fecha a cerrar (YYYY-MM-DD). Por defecto, hoy.",
        },
      ],
      responses: {
        "200": {
          description: "Cierre de caja del día",
          content: { "application/json": { schema: { $ref: "#/components/schemas/CierreCaja" } } },
        },
        "400": errorResponse("Fecha inválida"),
        "403": errorResponse("No tienes permisos para esta accion"),
      },
    },
  },
  "/reportes/inventario-valorizado": {
    get: {
      tags: ["Reportes"],
      summary: "Reporte de inventario valorizado (RF8)",
      description: "Valor de stock actual por insumo (stockActual * costo) y el total general. Solo ADMIN.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Reporte de inventario valorizado",
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/InventarioValorizado" } },
          },
        },
        "403": errorResponse("No tienes permisos para esta accion"),
      },
    },
  },
};
