import { errorResponse, idParam } from "./common";

export const mesasTags = [
  { name: "Mesas", description: "Estado de mesas, apertura y union de mesas" },
  { name: "Cuentas", description: "Consumo, division de cuentas y cierre" },
];

export const mesasSchemas = {
  Mesa: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      numero: { type: "integer", example: 1 },
      estado: { type: "string", enum: ["LIBRE", "OCUPADA", "POR_COBRAR"], example: "LIBRE" },
      cuentaAbierta: {
        nullable: true,
        allOf: [{ $ref: "#/components/schemas/Cuenta" }],
      },
    },
  },
  ItemConsumo: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      cuentaId: { type: "integer", example: 1 },
      productoVentaId: { type: "integer", example: 3 },
      cantidad: { type: "integer", example: 1 },
      precioUnitario: { type: "string", example: "90.00" },
      subtotal: { type: "string", example: "90.00" },
      productoVenta: {
        type: "object",
        properties: { id: { type: "integer" }, nombre: { type: "string" } },
      },
    },
  },
  Cuenta: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      mesaId: { type: "integer", example: 1 },
      usuarioId: { type: "integer", nullable: true, example: 2 },
      fechaApertura: { type: "string", format: "date-time" },
      fechaCierre: { type: "string", format: "date-time", nullable: true },
      estado: { type: "string", enum: ["ABIERTA", "CERRADA"], example: "ABIERTA" },
      total: {
        type: "string",
        example: "160.00",
        description: "Suma de los items; una vez cerrada la cuenta, ya tiene el descuento restado (RF14)",
      },
      descuento: { type: "string", example: "0.00", description: "Monto descontado al cerrar (RF14)" },
      metodoPago: {
        type: "string",
        enum: ["EFECTIVO", "TARJETA", "TRANSFERENCIA"],
        nullable: true,
      },
      itemsConsumo: { type: "array", items: { $ref: "#/components/schemas/ItemConsumo" } },
    },
  },
  AbrirMesaInput: {
    type: "object",
    properties: {
      usuarioId: {
        type: "integer",
        nullable: true,
        description: "Opcional. Si se omite, se asigna el usuario autenticado. Puede enviarse null.",
        example: 2,
      },
    },
  },
  UnirMesasInput: {
    type: "object",
    required: ["mesaOrigenId"],
    properties: {
      mesaOrigenId: {
        type: "integer",
        description: "Mesa cuya cuenta abierta se fusiona/traslada a la mesa destino (la de la URL)",
        example: 3,
      },
    },
  },
  AgregarItemInput: {
    type: "object",
    required: ["productoVentaId", "cantidad"],
    properties: {
      productoVentaId: { type: "integer", example: 3 },
      cantidad: { type: "integer", example: 1, description: "Entero mayor a 0" },
    },
  },
  EditarItemInput: {
    type: "object",
    required: ["cantidad"],
    properties: {
      cantidad: { type: "integer", example: 2, description: "Entero mayor a 0" },
    },
  },
  CerrarCuentaInput: {
    type: "object",
    required: ["pagos"],
    properties: {
      pagos: {
        type: "array",
        description: "Uno o mas pagos (permite pago mixto); la suma de monto debe igualar el monto a cobrar",
        items: {
          type: "object",
          required: ["metodoPago", "monto"],
          properties: {
            metodoPago: { type: "string", enum: ["EFECTIVO", "TARJETA", "TRANSFERENCIA"], example: "EFECTIVO" },
            monto: { type: "number", example: 30.5 },
          },
        },
        example: [
          { metodoPago: "EFECTIVO", monto: 30.5 },
          { metodoPago: "TRANSFERENCIA", monto: 20 },
        ],
      },
      descuento: {
        type: "number",
        example: 0,
        description: "Opcional (RF14). Monto fijo a descontar del total; no puede superar el total de la cuenta",
      },
    },
  },
  DividirCuentaInput: {
    type: "object",
    required: ["mesaDestinoId", "itemIds"],
    properties: {
      mesaDestinoId: {
        type: "integer",
        description: "Mesa destino: debe estar LIBRE (se abre una cuenta nueva) o tener una cuenta abierta (se fusionan ahi)",
        example: 3,
      },
      itemIds: {
        type: "array",
        items: { type: "integer" },
        description: "IDs de items de consumo de la cuenta origen a mover",
        example: [3],
      },
    },
  },
  DividirCuentaResponse: {
    type: "object",
    properties: {
      cuentaOrigen: { $ref: "#/components/schemas/Cuenta" },
      cuentaDestino: { $ref: "#/components/schemas/Cuenta" },
    },
  },
};

export const mesasPaths = {
  "/mesas": {
    get: {
      tags: ["Mesas"],
      summary: "Ver el estado de todas las mesas",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Lista de mesas con su cuenta abierta (si existe)",
          content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Mesa" } } } },
        },
      },
    },
  },
  "/mesas/{id}": {
    get: {
      tags: ["Mesas"],
      summary: "Obtener una mesa",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID de la mesa")],
      responses: {
        "200": {
          description: "Mesa",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Mesa" } } },
        },
        "404": errorResponse("Mesa no encontrada"),
      },
    },
  },
  "/mesas/{id}/abrir": {
    post: {
      tags: ["Mesas"],
      summary: "Abrir una mesa (crea una cuenta nueva)",
      description: "La mesa debe estar LIBRE. El mesero asignado es opcional (por defecto, el usuario autenticado).",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID de la mesa")],
      requestBody: {
        required: false,
        content: { "application/json": { schema: { $ref: "#/components/schemas/AbrirMesaInput" } } },
      },
      responses: {
        "201": {
          description: "Cuenta abierta",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Cuenta" } } },
        },
        "400": errorResponse("usuarioId invalido"),
        "404": errorResponse("Mesa no encontrada"),
        "409": errorResponse("La mesa no esta libre"),
      },
    },
  },
  "/mesas/{id}/solicitar-cobro": {
    post: {
      tags: ["Mesas"],
      summary: "Solicitar el cobro de una mesa",
      description:
        "La mesa debe estar OCUPADA con una cuenta ABIERTA. Marca la mesa como POR_COBRAR y notifica por socket ('cobro:solicitado') para que un ADMIN vaya a cerrarla; no cierra la cuenta.",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID de la mesa")],
      responses: {
        "200": {
          description: "Mesa actualizada a POR_COBRAR",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Mesa" } } },
        },
        "404": errorResponse("Mesa no encontrada"),
        "409": errorResponse("La mesa no esta ocupada, o no tiene una cuenta abierta"),
      },
    },
  },
  "/mesas/{id}/unir": {
    post: {
      tags: ["Mesas"],
      summary: "Unir mesas (RF16)",
      description:
        "Fusiona la cuenta abierta de mesaOrigenId con la de la mesa destino (la de la URL). Si la mesa destino no tiene cuenta abierta, se le traslada la cuenta completa; si ya tiene una, se fusionan los items y la cuenta origen se cierra. La mesa origen queda LIBRE.",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID de la mesa destino")],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/UnirMesasInput" } } },
      },
      responses: {
        "200": {
          description: "Cuenta resultante en la mesa destino",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Cuenta" } } },
        },
        "400": errorResponse("mesaOrigenId invalido o la mesa origen no tiene cuenta abierta"),
        "404": errorResponse("Mesa origen o destino no encontrada"),
      },
    },
  },
  "/cuentas": {
    get: {
      tags: ["Cuentas"],
      summary: "Listar/buscar cuentas (historial)",
      description: "Soporta filtros por estado, mesa y rango de fecha de apertura. Util para el historial de cuentas cerradas (RF15).",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "estado", in: "query", schema: { type: "string", enum: ["ABIERTA", "CERRADA"] } },
        { name: "mesaId", in: "query", schema: { type: "integer" } },
        {
          name: "desde",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Fecha minima (ISO). Si estado=CERRADA, filtra por fecha de cierre; si no, por fecha de apertura.",
        },
        {
          name: "hasta",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Fecha maxima (ISO). Si estado=CERRADA, filtra por fecha de cierre; si no, por fecha de apertura.",
        },
      ],
      responses: {
        "200": {
          description: "Lista de cuentas",
          content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Cuenta" } } } },
        },
        "400": errorResponse("Filtros invalidos"),
      },
    },
  },
  "/cuentas/{id}": {
    get: {
      tags: ["Cuentas"],
      summary: "Obtener una cuenta con su detalle de consumo",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID de la cuenta")],
      responses: {
        "200": {
          description: "Cuenta",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Cuenta" } } },
        },
        "404": errorResponse("Cuenta no encontrada"),
      },
    },
  },
  "/cuentas/{id}/items": {
    post: {
      tags: ["Cuentas"],
      summary: "Agregar un producto de venta al consumo (RF11)",
      description:
        "Recorre la receta del producto y descuenta stock de cada insumo (cantidad de la receta x cantidad pedida). Si algun insumo no tiene stock suficiente, no se agrega nada.",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID de la cuenta")],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/AgregarItemInput" } } },
      },
      responses: {
        "201": {
          description: "Cuenta actualizada con el item agregado",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Cuenta" } } },
        },
        "400": errorResponse("Datos invalidos, producto inexistente o stock insuficiente"),
        "404": errorResponse("Cuenta no encontrada"),
        "409": errorResponse("La cuenta no esta abierta"),
      },
    },
  },
  "/cuentas/{id}/items/{itemId}": {
    put: {
      tags: ["Cuentas"],
      summary: "Editar la cantidad de un item de consumo (RF12)",
      description: "Si la cantidad aumenta, descuenta mas stock (validando disponibilidad); si disminuye, devuelve el stock sobrante.",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID de la cuenta"), idParam("ID del item de consumo")],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/EditarItemInput" } } },
      },
      responses: {
        "200": {
          description: "Cuenta actualizada",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Cuenta" } } },
        },
        "400": errorResponse("cantidad invalida o stock insuficiente para aumentar"),
        "404": errorResponse("Cuenta o item no encontrado"),
        "409": errorResponse("La cuenta no esta abierta"),
      },
    },
    delete: {
      tags: ["Cuentas"],
      summary: "Quitar un item de consumo (RF12)",
      description: "Devuelve al stock la cantidad de cada insumo que ese item habia consumido.",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID de la cuenta"), idParam("ID del item de consumo")],
      responses: {
        "204": { description: "Item eliminado" },
        "404": errorResponse("Cuenta o item no encontrado"),
        "409": errorResponse("La cuenta no esta abierta"),
      },
    },
  },
  "/cuentas/{id}/cerrar": {
    post: {
      tags: ["Cuentas"],
      summary: "Cerrar cuenta (RF14)",
      description:
        "Fija el total final (restando el descuento, si se envia) y el metodo de pago, y libera la mesa. Requiere rol ADMIN.",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID de la cuenta")],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/CerrarCuentaInput" } } },
      },
      responses: {
        "200": {
          description: "Cuenta cerrada",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Cuenta" } } },
        },
        "400": errorResponse("pagos invalido, suma de pagos distinta al monto a cobrar, o descuento invalido/mayor al total"),
        "403": errorResponse("Requiere rol ADMIN"),
        "404": errorResponse("Cuenta no encontrada"),
        "409": errorResponse("La cuenta ya esta cerrada"),
      },
    },
  },
  "/cuentas/{id}/dividir": {
    post: {
      tags: ["Cuentas"],
      summary: "Dividir cuenta (RF16)",
      description:
        "Mueve items seleccionados a otra mesa: si esta libre, se abre una cuenta nueva ahi; si ya tiene una cuenta abierta, los items se fusionan en ella.",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID de la cuenta origen")],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/DividirCuentaInput" } } },
      },
      responses: {
        "200": {
          description: "Cuentas origen y destino actualizadas",
          content: { "application/json": { schema: { $ref: "#/components/schemas/DividirCuentaResponse" } } },
        },
        "400": errorResponse("Datos invalidos"),
        "404": errorResponse("Cuenta o mesa destino no encontrada"),
        "409": errorResponse("La cuenta no esta abierta, o la mesa destino no esta libre ni tiene cuenta abierta"),
      },
    },
  },
};
