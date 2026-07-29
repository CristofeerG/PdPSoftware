import type { Request, Response, NextFunction } from "express";
import type { RolUsuario } from "@prisma/client";
import { verifyToken, type JwtPayload } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = header.slice("Bearer ".length);

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Token invalido o expirado" });
  }
}

export function requireRole(...roles: RolUsuario[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: "No tienes permisos para esta accion" });
    }
    next();
  };
}
