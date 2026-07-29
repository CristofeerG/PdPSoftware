import jwt, { type SignOptions } from "jsonwebtoken";
import type { RolUsuario } from "@prisma/client";

export interface JwtPayload {
  sub: number;
  usuario: string;
  rol: RolUsuario;
}

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("Falta la variable de entorno JWT_SECRET");
}

const expiresIn = (process.env.JWT_EXPIRES_IN ?? "8h") as SignOptions["expiresIn"];

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, secret as string, { expiresIn });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, secret as string) as unknown as JwtPayload;
}
