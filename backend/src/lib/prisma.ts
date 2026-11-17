import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Fuerza la sesion de Postgres a UTC (en vez de heredar la del sistema, ej.
// America/Bogota): @prisma/adapter-pg reconstruye mal los valores
// "timestamptz" cuando la sesion no esta en UTC (le quita el offset en vez de
// aplicarlo, corriendo 5 horas cada fecha leida). Con la sesion en UTC el
// texto que devuelve Postgres siempre trae offset "+00"/"Z", sin ambiguedad.
// El dia calendario del negocio (UTC-5) se calcula aparte, en la app
// (ver lib/fechasNegocio.ts), no depende de la zona horaria de la sesion.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, options: "-c TimeZone=UTC" });

export const prisma = new PrismaClient({ adapter });
