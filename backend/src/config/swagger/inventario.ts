import { errorResponse, idParam } from "./common";

export const inventarioTags = [
  { name: "Categorias", description: "Categorias de insumos y productos de venta" },
  { name: "Insumos", description: "Stock real del bar, movimientos y kardex" },
  { name: "Productos de Venta", description: "Items del menu y su receta" },
];

export const inventarioSchemas = {
  Categoria: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      nombre: { type: "string", example: "Licores" },
    },
  },
  CategoriaInput: {
    type: "object",
    required: ["nombre"],
    properties: {
      nombre: { type: "string", example: "Licores" },
    },
  },
  Insumo: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      nombre: { type: "string", example: "Tequila" },
      categoriaId: { type: "integer", example: 2 },
      categoria: { $ref: "#/components/schemas/Categoria" },
      unidad: { type: "string", enum: ["ML", "UNIDAD"], example: "ML" },
      costo: { type: "string", example: "0.60" },
      stockActual: { type: "string", example: "750.00" },
      stockMinimo: { type: "string", example: "150.00" },
    },
  },
  InsumoInput: {
    type: "object",
    required: ["nombre", "categoriaId", "unidad", "costo"],
    properties: {
      nombre: { type: "string", example: "Tequila" },
      categoriaId: { type: "integer", example: 2 },
      unidad: { type: "string", enum: ["ML", "UNIDAD"], example: "ML" },
      costo: { type: "number", example: 0.6 },
      stockActual: { type: "number", example: 0, description: "Opcional, por defecto 0. Conteo fisico inicial." },
      stockMinimo: { type: "number", example: 150 },
    },
  },
  InsumoUpdateInput: {
    type: "object",
    properties: {
      nombre: { type: "string" },
      categoriaId: { type: "integer" },
      unidad: { type: "string", enum: ["ML", "UNIDAD"] },
      costo: { type: "number" },
      stockActual: {
        type: "number",
        description: "Ajusta el stock directamente, sin generar un MovimientoInventario. Para dejar rastro, usar /entradas o /ajustes.",
      },
      stockMinimo: { type: "number" },
    },
  },
  MovimientoInventario: {
    type: "object",
    properties: {
      id: { type: "integer", example: 10 },
      insumoId: { type: "integer", example: 2 },
      tipo: { type: "string", enum: ["ENTRADA", "SALIDA", "AJUSTE"], example: "ENTRADA" },
      cantidad: { type: "string", example: "750.00" },
      costo: { type: "string", nullable: true, example: "0.60", description: "Costo de esta entrada (RF3), solo aplica a ENTRADA" },
      proveedor: { type: "string", nullable: true, example: "Distribuidora ABC", description: "Proveedor de esta entrada (RF3), solo aplica a ENTRADA" },
      motivo: { type: "string", nullable: true, example: "Compra a Distribuidora ABC" },
      fecha: { type: "string", format: "date-time" },
      usuarioId: { type: "integer", example: 1 },
      usuario: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nombre: { type: "string" },
          usuario: { type: "string" },
        },
      },
    },
  },
  EntradaInput: {
    type: "object",
    required: ["cantidad"],
    properties: {
      cantidad: { type: "number", example: 750, description: "Debe ser mayor a 0" },
      costo: {
        type: "number",
        example: 0.6,
        description: "Opcional. Costo de esta compra (RF3); si se envia, tambien actualiza el costo de referencia del insumo",
      },
      proveedor: { type: "string", example: "Distribuidora ABC", description: "Opcional (RF3)" },
      motivo: { type: "string", example: "Compra a Distribuidora ABC" },
      fecha: { type: "string", format: "date-time", description: "Opcional, por defecto ahora" },
    },
  },
  AjusteInput: {
    type: "object",
    required: ["cantidad", "motivo"],
    properties: {
      cantidad: {
        type: "number",
        example: -50,
        description: "Positivo suma stock, negativo lo resta (merma/rotura)",
      },
      motivo: { type: "string", example: "Botella rota en barra" },
    },
  },
  MovimientoConStock: {
    type: "object",
    properties: {
      movimiento: { $ref: "#/components/schemas/MovimientoInventario" },
      insumo: { $ref: "#/components/schemas/Insumo" },
    },
  },
  RecetaItem: {
    type: "object",
    properties: {
      id: { type: "integer", example: 5 },
      productoVentaId: { type: "integer", example: 2 },
      insumoId: { type: "integer", example: 2 },
      cantidad: { type: "string", example: "75.00" },
      insumo: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nombre: { type: "string" },
          unidad: { type: "string", enum: ["ML", "UNIDAD"] },
          stockActual: { type: "string", example: "750.00" },
        },
      },
    },
  },
  RecetaItemInput: {
    type: "object",
    required: ["insumoId", "cantidad"],
    properties: {
      insumoId: { type: "integer", example: 2 },
      cantidad: { type: "number", example: 75 },
    },
  },
  ProductoVenta: {
    type: "object",
    properties: {
      id: { type: "integer", example: 2 },
      nombre: { type: "string", example: "Tequila — Shot" },
      categoriaId: { type: "integer", example: 2 },
      categoria: { $ref: "#/components/schemas/Categoria" },
      precioVenta: { type: "string", example: "60.00" },
      recetaItems: { type: "array", items: { $ref: "#/components/schemas/RecetaItem" } },
    },
  },
  ProductoVentaInput: {
    type: "object",
    required: ["nombre", "categoriaId", "precioVenta"],
    properties: {
      nombre: { type: "string", example: "Tequila — Shot" },
      categoriaId: { type: "integer", example: 2 },
      precioVenta: { type: "number", example: 60 },
      receta: {
        type: "array",
        description: "Opcional: lineas de receta a crear junto con el producto",
        items: { $ref: "#/components/schemas/RecetaItemInput" },
      },
    },
  },
  ProductoVentaUpdateInput: {
    type: "object",
    properties: {
      nombre: { type: "string" },
      categoriaId: { type: "integer" },
      precioVenta: { type: "number" },
    },
  },
};

export const inventarioPaths = {
  "/categorias": {
    get: {
      tags: ["Categorias"],
      summary: "Listar categorias",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Lista de categorias",
          content: {
            "application/json": {
              schema: { type: "array", items: { $ref: "#/components/schemas/Categoria" } },
            },
          },
        },
        "401": errorResponse("Token no proporcionado o invalido"),
      },
    },
    post: {
      tags: ["Categorias"],
      summary: "Crear categoria (solo admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/CategoriaInput" } } },
      },
      responses: {
        "201": {
          description: "Categoria creada",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Categoria" } } },
        },
        "400": errorResponse("nombre invalido"),
        "401": errorResponse("Token no proporcionado o invalido"),
        "403": errorResponse("Requiere rol ADMIN"),
        "409": errorResponse("Ya existe una categoria con ese nombre"),
      },
    },
  },
  "/categorias/{id}": {
    get: {
      tags: ["Categorias"],
      summary: "Obtener una categoria",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID de la categoria")],
      responses: {
        "200": {
          description: "Categoria",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Categoria" } } },
        },
        "404": errorResponse("Categoria no encontrada"),
      },
    },
    put: {
      tags: ["Categorias"],
      summary: "Actualizar categoria (solo admin)",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID de la categoria")],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/CategoriaInput" } } },
      },
      responses: {
        "200": {
          description: "Categoria actualizada",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Categoria" } } },
        },
        "400": errorResponse("nombre invalido"),
        "403": errorResponse("Requiere rol ADMIN"),
        "404": errorResponse("Categoria no encontrada"),
        "409": errorResponse("Ya existe una categoria con ese nombre"),
      },
    },
    delete: {
      tags: ["Categorias"],
      summary: "Eliminar categoria (solo admin)",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID de la categoria")],
      responses: {
        "204": { description: "Categoria eliminada" },
        "403": errorResponse("Requiere rol ADMIN"),
        "404": errorResponse("Categoria no encontrada"),
        "409": errorResponse("Hay insumos o productos de venta usando esta categoria"),
      },
    },
  },
  "/insumos": {
    get: {
      tags: ["Insumos"],
      summary: "Listar insumos",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "categoriaId",
          in: "query",
          required: false,
          schema: { type: "integer" },
          description: "Filtrar por categoria",
        },
      ],
      responses: {
        "200": {
          description: "Lista de insumos",
          content: {
            "application/json": {
              schema: { type: "array", items: { $ref: "#/components/schemas/Insumo" } },
            },
          },
        },
      },
    },
    post: {
      tags: ["Insumos"],
      summary: "Crear insumo (solo admin)",
      description: "stockActual es opcional (por defecto 0) para cargar el conteo fisico inicial. Para compras/reabastecimientos posteriores, usar POST /insumos/{id}/entradas.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/InsumoInput" } } },
      },
      responses: {
        "201": {
          description: "Insumo creado",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Insumo" } } },
        },
        "400": errorResponse("Datos invalidos"),
        "403": errorResponse("Requiere rol ADMIN"),
      },
    },
  },
  "/insumos/stock-bajo": {
    get: {
      tags: ["Insumos"],
      summary: "Insumos con stock igual o por debajo del minimo",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Insumos en alerta de stock bajo",
          content: {
            "application/json": {
              schema: { type: "array", items: { $ref: "#/components/schemas/Insumo" } },
            },
          },
        },
      },
    },
  },
  "/insumos/{id}": {
    get: {
      tags: ["Insumos"],
      summary: "Obtener un insumo",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID del insumo")],
      responses: {
        "200": {
          description: "Insumo",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Insumo" } } },
        },
        "404": errorResponse("Insumo no encontrado"),
      },
    },
    put: {
      tags: ["Insumos"],
      summary: "Actualizar insumo (solo admin)",
      description: "stockActual es opcional: si se envia, ajusta el stock directamente sin generar un MovimientoInventario (uso: correccion manual). Para dejar rastro auditable, usar /entradas o /ajustes.",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID del insumo")],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/InsumoUpdateInput" } } },
      },
      responses: {
        "200": {
          description: "Insumo actualizado",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Insumo" } } },
        },
        "400": errorResponse("Datos invalidos"),
        "403": errorResponse("Requiere rol ADMIN"),
        "404": errorResponse("Insumo no encontrado"),
      },
    },
    delete: {
      tags: ["Insumos"],
      summary: "Eliminar insumo (solo admin)",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID del insumo")],
      responses: {
        "204": { description: "Insumo eliminado" },
        "403": errorResponse("Requiere rol ADMIN"),
        "404": errorResponse("Insumo no encontrado"),
        "409": errorResponse("El insumo tiene recetas o movimientos registrados"),
      },
    },
  },
  "/insumos/{id}/movimientos": {
    get: {
      tags: ["Insumos"],
      summary: "Kardex: historial de movimientos del insumo",
      security: [{ bearerAuth: [] }],
      parameters: [
        idParam("ID del insumo"),
        {
          name: "tipo",
          in: "query",
          required: false,
          schema: { type: "string", enum: ["ENTRADA", "SALIDA", "AJUSTE"] },
        },
      ],
      responses: {
        "200": {
          description: "Movimientos ordenados por fecha descendente",
          content: {
            "application/json": {
              schema: { type: "array", items: { $ref: "#/components/schemas/MovimientoInventario" } },
            },
          },
        },
        "404": errorResponse("Insumo no encontrado"),
      },
    },
  },
  "/insumos/{id}/entradas": {
    post: {
      tags: ["Insumos"],
      summary: "Registrar una entrada de inventario (compra/reabastecimiento, RF3, solo admin)",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID del insumo")],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/EntradaInput" } } },
      },
      responses: {
        "201": {
          description: "Entrada registrada, stock actualizado",
          content: { "application/json": { schema: { $ref: "#/components/schemas/MovimientoConStock" } } },
        },
        "400": errorResponse("cantidad debe ser mayor a 0"),
        "403": errorResponse("Requiere rol ADMIN"),
        "404": errorResponse("Insumo no encontrado"),
      },
    },
  },
  "/insumos/{id}/ajustes": {
    post: {
      tags: ["Insumos"],
      summary: "Registrar un ajuste manual de inventario (merma, rotura, consumo interno; solo admin)",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID del insumo")],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/AjusteInput" } } },
      },
      responses: {
        "201": {
          description: "Ajuste registrado, stock actualizado",
          content: { "application/json": { schema: { $ref: "#/components/schemas/MovimientoConStock" } } },
        },
        "400": errorResponse("cantidad invalida, motivo faltante, o dejaria el stock negativo"),
        "403": errorResponse("Requiere rol ADMIN"),
        "404": errorResponse("Insumo no encontrado"),
      },
    },
  },
  "/productos-venta": {
    get: {
      tags: ["Productos de Venta"],
      summary: "Listar productos de venta (con su receta)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "categoriaId",
          in: "query",
          required: false,
          schema: { type: "integer" },
        },
      ],
      responses: {
        "200": {
          description: "Lista de productos de venta",
          content: {
            "application/json": {
              schema: { type: "array", items: { $ref: "#/components/schemas/ProductoVenta" } },
            },
          },
        },
      },
    },
    post: {
      tags: ["Productos de Venta"],
      summary: "Crear producto de venta, opcionalmente con su receta (solo admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/ProductoVentaInput" } } },
      },
      responses: {
        "201": {
          description: "Producto creado",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProductoVenta" } } },
        },
        "400": errorResponse("Datos invalidos, o insumoId de la receta inexistente"),
        "403": errorResponse("Requiere rol ADMIN"),
      },
    },
  },
  "/productos-venta/{id}": {
    get: {
      tags: ["Productos de Venta"],
      summary: "Obtener un producto de venta (con su receta)",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID del producto de venta")],
      responses: {
        "200": {
          description: "Producto de venta",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProductoVenta" } } },
        },
        "404": errorResponse("Producto de venta no encontrado"),
      },
    },
    put: {
      tags: ["Productos de Venta"],
      summary: "Actualizar producto de venta (solo admin)",
      description: "Actualiza nombre/categoria/precio. La receta se gestiona con los endpoints /receta.",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID del producto de venta")],
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: { $ref: "#/components/schemas/ProductoVentaUpdateInput" } },
        },
      },
      responses: {
        "200": {
          description: "Producto actualizado",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProductoVenta" } } },
        },
        "400": errorResponse("Datos invalidos"),
        "403": errorResponse("Requiere rol ADMIN"),
        "404": errorResponse("Producto de venta no encontrado"),
      },
    },
    delete: {
      tags: ["Productos de Venta"],
      summary: "Eliminar producto de venta (solo admin)",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID del producto de venta")],
      responses: {
        "204": { description: "Producto eliminado" },
        "403": errorResponse("Requiere rol ADMIN"),
        "404": errorResponse("Producto de venta no encontrado"),
        "409": errorResponse("El producto tiene consumos registrados"),
      },
    },
  },
  "/productos-venta/{id}/receta": {
    get: {
      tags: ["Productos de Venta"],
      summary: "Listar la receta de un producto de venta",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID del producto de venta")],
      responses: {
        "200": {
          description: "Lineas de receta",
          content: {
            "application/json": {
              schema: { type: "array", items: { $ref: "#/components/schemas/RecetaItem" } },
            },
          },
        },
        "404": errorResponse("Producto de venta no encontrado"),
      },
    },
    post: {
      tags: ["Productos de Venta"],
      summary: "Agregar una linea de receta (solo admin)",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID del producto de venta")],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/RecetaItemInput" } } },
      },
      responses: {
        "201": {
          description: "Linea de receta creada",
          content: { "application/json": { schema: { $ref: "#/components/schemas/RecetaItem" } } },
        },
        "400": errorResponse("Datos invalidos o insumoId inexistente"),
        "403": errorResponse("Requiere rol ADMIN"),
        "404": errorResponse("Producto de venta no encontrado"),
        "409": errorResponse("Ya existe una linea de receta para ese insumo"),
      },
    },
  },
  "/productos-venta/{id}/receta/{recetaItemId}": {
    put: {
      tags: ["Productos de Venta"],
      summary: "Actualizar la cantidad de una linea de receta (solo admin)",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID del producto de venta"), idParam("ID de la linea de receta")],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["cantidad"],
              properties: { cantidad: { type: "number", example: 90 } },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Linea de receta actualizada",
          content: { "application/json": { schema: { $ref: "#/components/schemas/RecetaItem" } } },
        },
        "400": errorResponse("cantidad invalida"),
        "403": errorResponse("Requiere rol ADMIN"),
        "404": errorResponse("Linea de receta no encontrada para este producto"),
      },
    },
    delete: {
      tags: ["Productos de Venta"],
      summary: "Quitar una linea de receta (solo admin)",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID del producto de venta"), idParam("ID de la linea de receta")],
      responses: {
        "204": { description: "Linea de receta eliminada" },
        "403": errorResponse("Requiere rol ADMIN"),
        "404": errorResponse("Linea de receta no encontrada para este producto"),
      },
    },
  },
};
