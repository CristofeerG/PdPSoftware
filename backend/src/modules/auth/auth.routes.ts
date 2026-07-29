import { Router } from "express";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { signToken } from "../../lib/jwt";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";

export const authRouter = Router();

const ROLES_VALIDOS = ["ADMIN", "MESERO"] as const;

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { usuario, password } = req.body ?? {};

    if (typeof usuario !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "usuario y password son requeridos" });
    }

    const usuarioDb = await prisma.usuario.findUnique({ where: { usuario } });
    if (!usuarioDb) {
      return res.status(401).json({ error: "Credenciales invalidas" });
    }

    const passwordValida = await bcrypt.compare(password, usuarioDb.passwordHash);
    if (!passwordValida) {
      return res.status(401).json({ error: "Credenciales invalidas" });
    }

    if (!usuarioDb.activo) {
      return res.status(403).json({ error: "El usuario esta desactivado. Contacta a un administrador." });
    }

    const token = signToken({
      sub: usuarioDb.id,
      usuario: usuarioDb.usuario,
      rol: usuarioDb.rol,
    });

    res.json({
      token,
      usuario: {
        id: usuarioDb.id,
        nombre: usuarioDb.nombre,
        usuario: usuarioDb.usuario,
        rol: usuarioDb.rol,
      },
    });
  }),
);

authRouter.post(
  "/usuarios",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { nombre, usuario, password, rol } = req.body ?? {};

    if (
      typeof nombre !== "string" ||
      typeof usuario !== "string" ||
      typeof password !== "string" ||
      typeof rol !== "string"
    ) {
      return res.status(400).json({ error: "nombre, usuario, password y rol son requeridos" });
    }

    if (!ROLES_VALIDOS.includes(rol as (typeof ROLES_VALIDOS)[number])) {
      return res.status(400).json({ error: `rol debe ser uno de: ${ROLES_VALIDOS.join(", ")}` });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "password debe tener al menos 6 caracteres" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const nuevoUsuario = await prisma.usuario.create({
        data: { nombre, usuario, passwordHash, rol: rol as "ADMIN" | "MESERO" },
      });

      res.status(201).json({
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        usuario: nuevoUsuario.usuario,
        rol: nuevoUsuario.rol,
        activo: nuevoUsuario.activo,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return res.status(409).json({ error: "El nombre de usuario ya existe" });
      }
      throw error;
    }
  }),
);

authRouter.get(
  "/usuarios",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true, usuario: true, rol: true, activo: true, createdAt: true },
    });

    res.json(usuarios);
  }),
);

authRouter.put(
  "/usuarios/:id",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "id invalido" });
    }

    const { rol, password, activo } = req.body ?? {};

    if (rol === undefined && password === undefined && activo === undefined) {
      return res.status(400).json({ error: "Debes enviar al menos uno de: rol, password, activo" });
    }

    if (rol !== undefined && !ROLES_VALIDOS.includes(rol as (typeof ROLES_VALIDOS)[number])) {
      return res.status(400).json({ error: `rol debe ser uno de: ${ROLES_VALIDOS.join(", ")}` });
    }

    if (password !== undefined && (typeof password !== "string" || password.length < 6)) {
      return res.status(400).json({ error: "password debe tener al menos 6 caracteres" });
    }

    if (activo !== undefined && typeof activo !== "boolean") {
      return res.status(400).json({ error: "activo debe ser true o false" });
    }

    try {
      const usuarioActualizado = await prisma.usuario.update({
        where: { id },
        data: {
          ...(rol !== undefined && { rol: rol as "ADMIN" | "MESERO" }),
          ...(password !== undefined && { passwordHash: await bcrypt.hash(password, 10) }),
          ...(activo !== undefined && { activo }),
        },
        select: { id: true, nombre: true, usuario: true, rol: true, activo: true, createdAt: true },
      });

      res.json(usuarioActualizado);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      throw error;
    }
  }),
);
