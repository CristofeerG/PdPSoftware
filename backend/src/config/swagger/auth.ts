import { errorResponse, idParam } from "./common";

export const authTags = [{ name: "Auth", description: "Login y gestion de usuarios" }];

export const authSchemas = {
  LoginRequest: {
    type: "object",
    required: ["usuario", "password"],
    properties: {
      usuario: { type: "string", example: "admin" },
      password: { type: "string", format: "password", example: "admin123" },
    },
  },
  LoginResponse: {
    type: "object",
    properties: {
      token: { type: "string" },
      usuario: { $ref: "#/components/schemas/UsuarioPublico" },
    },
  },
  UsuarioPublico: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      nombre: { type: "string", example: "Administrador" },
      usuario: { type: "string", example: "admin" },
      rol: { type: "string", enum: ["ADMIN", "MESERO"], example: "ADMIN" },
      activo: { type: "boolean", example: true },
    },
  },
  UsuarioListado: {
    allOf: [
      { $ref: "#/components/schemas/UsuarioPublico" },
      {
        type: "object",
        properties: {
          createdAt: { type: "string", format: "date-time" },
        },
      },
    ],
  },
  CrearUsuarioRequest: {
    type: "object",
    required: ["nombre", "usuario", "password", "rol"],
    properties: {
      nombre: { type: "string", example: "Maria Lopez" },
      usuario: { type: "string", example: "mesero2" },
      password: { type: "string", format: "password", example: "clave123" },
      rol: { type: "string", enum: ["ADMIN", "MESERO"], example: "MESERO" },
    },
  },
  EditarUsuarioRequest: {
    type: "object",
    description: "Todos los campos son opcionales, pero se debe enviar al menos uno.",
    properties: {
      rol: { type: "string", enum: ["ADMIN", "MESERO"], example: "MESERO" },
      password: { type: "string", format: "password", example: "nuevaClave123" },
      activo: {
        type: "boolean",
        description: "En false desactiva al usuario (no puede iniciar sesion). Los usuarios nunca se eliminan.",
        example: false,
      },
    },
  },
};

export const authPaths = {
  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Iniciar sesion",
      description: "Valida usuario/contraseña y devuelve un JWT si son correctos.",
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } },
        },
      },
      responses: {
        "200": {
          description: "Login exitoso",
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } },
          },
        },
        "400": errorResponse("Faltan campos requeridos"),
        "401": errorResponse("Usuario o contraseña incorrectos"),
        "403": errorResponse("El usuario esta desactivado"),
      },
    },
  },
  "/auth/usuarios": {
    get: {
      tags: ["Auth"],
      summary: "Listar usuarios (solo admin)",
      description: "Devuelve todos los usuarios, incluidos los desactivados. Requiere rol ADMIN.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Listado de usuarios",
          content: {
            "application/json": {
              schema: { type: "array", items: { $ref: "#/components/schemas/UsuarioListado" } },
            },
          },
        },
        "401": errorResponse("Token no proporcionado o invalido"),
        "403": errorResponse("El usuario autenticado no es ADMIN"),
      },
    },
    post: {
      tags: ["Auth"],
      summary: "Crear un usuario (solo admin)",
      description:
        "Crea un nuevo usuario (Administrador o Mesero). Requiere un token JWT de un usuario con rol ADMIN.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: { $ref: "#/components/schemas/CrearUsuarioRequest" } },
        },
      },
      responses: {
        "201": {
          description: "Usuario creado",
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UsuarioPublico" } },
          },
        },
        "400": errorResponse("Datos invalidos"),
        "401": errorResponse("Token no proporcionado o invalido"),
        "403": errorResponse("El usuario autenticado no es ADMIN"),
        "409": errorResponse("El nombre de usuario ya existe"),
      },
    },
  },
  "/auth/usuarios/{id}": {
    put: {
      tags: ["Auth"],
      summary: "Editar rol, contraseña o estado de un usuario (solo admin)",
      description:
        "Actualiza rol, contraseña y/o activo de un usuario existente. Para desactivar un usuario (sin eliminarlo, preservando su historial de cuentas y movimientos) se envia activo: false. Requiere rol ADMIN.",
      security: [{ bearerAuth: [] }],
      parameters: [idParam("ID del usuario a editar")],
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: { $ref: "#/components/schemas/EditarUsuarioRequest" } },
        },
      },
      responses: {
        "200": {
          description: "Usuario actualizado",
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UsuarioListado" } },
          },
        },
        "400": errorResponse("Datos invalidos"),
        "401": errorResponse("Token no proporcionado o invalido"),
        "403": errorResponse("El usuario autenticado no es ADMIN"),
        "404": errorResponse("Usuario no encontrado"),
      },
    },
  },
};
