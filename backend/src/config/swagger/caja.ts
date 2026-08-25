import { errorResponse, idParam } from "./common";

export const cajaTags = [
  { name: "Gastos", description: "Gastos operativos del dia (sueldos, comida del personal, insumos de urgencia, etc.)" },
  { name: "Cierres de caja", description: "Cuadre diario de efectivo en caja" },
];

const usuarioResumen = {
  type: "object",
  nullable: true,
  properties: {
    id: { type: "integer", example: 1 },
    nombre: { type: "string", example: "Cristofer" },
  },
};

export const cajaSchemas = {
  Gasto: {
    type: "object",
    properties: {
      id: { type: "integer", example: 4 },
      fecha: { type: "string", format: "date-time" },
      concepto: { type: "string", example: "Sueldo mesero turno noche" },
      categoria: { type: "string", enum: ["SUELDOS", "COMIDA_PERSONAL", "INSUMOS", "OTRO"], example: "SUELDOS" },
      monto: { type: "string", example: "25.00" },
      metodoPago: { type: "string", enum: ["EFECTIVO", "TARJETA", "TRANSFERENCIA"], example: "EFECTIVO" },
      usuario: usuarioResumen,
    },
  },
  GastoInput: {
    type: "object",
    required: ["concepto", "monto"],
    properties: {
      concepto: { type: "string", example: "Hielo comprado de urgencia" },
      categoria: { type: "string", enum: ["SUELDOS", "COMIDA_PERSONAL", "INSUMOS", "OTRO"], default: "OTRO" },
      monto: { type: "number", example: 5.5 },
      metodoPago: { type: "string", enum: ["EFECTIVO", "TARJETA", "TRANSFERENCIA"], default: "EFECTIVO" },
      fecha: { type: "string", format: "date", description: "YYYY-MM-DD. Por defecto, ahora mismo." },
    },
  },
  CierreDeCaja: {
    type: "object",
    properties: {
      fecha: { type: "string", example: "2026-08-24" },
      cerrado: { type: "boolean", description: "true si ya se guardo el cierre de ese dia" },
      montoInicial: { type: "string", example: "50.00" },
      ventasEfectivo: { type: "string", example: "120.00" },
      gastosEfectivo: { type: "string", example: "15.00" },
      montoEsperado: { type: "string", example: "155.00" },
      montoContado: { type: "string", nullable: true, example: "150.00" },
      diferencia: { type: "string", nullable: true, example: "-5.00" },
      notas: { type: "string", nullable: true },
      usuario: usuarioResumen,
    },
  },
  CierreDeCajaInput: {
    type: "object",
    required: ["fecha", "montoContado"],
    properties: {
      fecha: { type: "string", format: "date", example: "2026-08-24" },
      montoContado: { type: "number", example: 150 },
      montoInicial: {
        type: "number",
        description: "Opcional: sobrescribe el monto inicial sugerido (el contado del cierre anterior).",
      },
      notas: { type: "string", nullable: true },
    },
  },
};

export const cajaPaths = {
  "/gastos": {
    get: {
      tags: ["Gastos"],
      summary: "Gastos de un dia",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "fecha", in: "query", schema: { type: "string", format: "date" }, description: "Por defecto, hoy." },
      ],
      responses: {
        "200": {
          description: "Gastos del dia",
          content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Gasto" } } } },
        },
        "400": errorResponse("fecha invalida"),
        "403": errorResponse("No tienes permisos para esta accion"),
      },
    },
    post: {
      tags: ["Gastos"],
      summary: "Registrar un gasto",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/GastoInput" } } },
      },
      responses: {
        "201": { description: "Gasto creado", content: { "application/json": { schema: { $ref: "#/components/schemas/Gasto" } } } },
        "400": errorResponse("Datos invalidos"),
        "403": errorResponse("No tienes permisos para esta accion"),
      },
    },
  },
  "/gastos/{id}": {
    delete: {
      tags: ["Gastos"],
      summary: "Eliminar un gasto (correccion de un registro por error)",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID del gasto")],
      responses: {
        "204": { description: "Gasto eliminado" },
        "400": errorResponse("id invalido"),
        "403": errorResponse("No tienes permisos para esta accion"),
        "404": errorResponse("Gasto no encontrado"),
      },
    },
  },
  "/cierres-caja/preview": {
    get: {
      tags: ["Cierres de caja"],
      summary: "Calcula (o devuelve, si ya existe) el cuadre de caja de un dia",
      description:
        "Si el dia ya tiene un cierre guardado devuelve ese registro (cerrado=true). Si no, calcula en vivo el monto inicial sugerido (el contado del cierre anterior), las ventas y gastos en efectivo del dia, y el monto esperado en caja (cerrado=false, montoContado sigue sin definir).",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "fecha", in: "query", schema: { type: "string", format: "date" }, description: "Por defecto, hoy." },
      ],
      responses: {
        "200": { description: "Cuadre de caja", content: { "application/json": { schema: { $ref: "#/components/schemas/CierreDeCaja" } } } },
        "400": errorResponse("fecha invalida"),
        "403": errorResponse("No tienes permisos para esta accion"),
      },
    },
  },
  "/cierres-caja": {
    get: {
      tags: ["Cierres de caja"],
      summary: "Historial de cierres de caja guardados",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "limit", in: "query", schema: { type: "integer", default: 30 } }],
      responses: {
        "200": {
          description: "Cierres mas recientes primero",
          content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/CierreDeCaja" } } } },
        },
        "403": errorResponse("No tienes permisos para esta accion"),
      },
    },
    post: {
      tags: ["Cierres de caja"],
      summary: "Guardar (o corregir) el cierre de caja de un dia",
      description:
        "Recalcula ventas/gastos en efectivo del dia en el servidor y guarda el monto contado fisicamente. Se puede volver a llamar para el mismo dia (upsert) si hubo que corregir el conteo o un gasto olvidado.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/CierreDeCajaInput" } } },
      },
      responses: {
        "200": { description: "Cierre guardado", content: { "application/json": { schema: { $ref: "#/components/schemas/CierreDeCaja" } } } },
        "400": errorResponse("Datos invalidos"),
        "403": errorResponse("No tienes permisos para esta accion"),
      },
    },
  },
};
