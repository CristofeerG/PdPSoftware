// Zona horaria real del negocio: UTC-5 (Lima/Bogota), sin horario de verano.
// Es solo para referencia/documentacion aca abajo -- mostrar una hora en
// pantalla (ej. "cerrado a las 11:12 PM") no pasa por este archivo, cada
// pantalla usa la hora real tal cual la da el navegador o el servidor.
export const OFFSET_ZONA_HORARIA = "-05:00";

// Hora local (0-23) en la que "cambia el dia de negocio" para reportes y
// cierres de caja. El negocio es un bar que opera de noche hasta la
// madrugada (ej. 6pm a 4am): si el dia cambiara a medianoche, una sola
// noche de trabajo quedaria partida en dos "dias" -- lo de antes de
// medianoche en un dia, lo de despues en el siguiente -- cortando por la
// mitad una misma jornada (ademas de ser la causa original del bug de
// zona horaria que motivo este archivo). Se corta mas tarde, a una hora en
// la que el bar ya esta cerrado con margen, para que una noche completa
// caiga siempre dentro de un solo dia de negocio.
const HORA_CORTE_JORNADA = 6;

// Offset combinado (zona horaria + corte de jornada) usado UNICAMENTE para
// decidir a que dia de negocio pertenece un timestamp al filtrar/agrupar
// reportes y cierres de caja -- no es el offset real de la zona horaria de
// arriba. Con corte a las 6am, un timestamp de las 2am local todavia cuenta
// para "ayer" (el dia de negocio que sigue abierto hasta las 6am).
export const OFFSET_CORTE_JORNADA = `-${String(5 + HORA_CORTE_JORNADA).padStart(2, "0")}:00`; // "-11:00"

export type LimiteDia = "inicio" | "fin";

/**
 * Convierte un parametro de query de fecha (puede venir como "YYYY-MM-DD" o
 * como timestamp ISO completo) al limite de inicio/fin de ese dia de negocio
 * (corte a las 6am, ver HORA_CORTE_JORNADA). Devuelve `undefined` si el
 * parametro no vino y `null` si vino pero no es una fecha valida.
 */
export function parseFechaQuery(valor: unknown, limite: LimiteDia): Date | null | undefined {
  if (valor === undefined) return undefined;
  const texto = String(valor);
  const esSoloFecha = /^\d{4}-\d{2}-\d{2}$/.test(texto);
  const horaLimite = limite === "inicio" ? "00:00:00.000" : "23:59:59.999";
  const fecha = new Date(esSoloFecha ? `${texto}T${horaLimite}${OFFSET_CORTE_JORNADA}` : texto);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/**
 * Igual que `parseFechaQuery(valor, "inicio")`, pero exige "YYYY-MM-DD"
 * exacto: para endpoints que reciben un solo dia (no un rango).
 */
export function parseFechaDia(valor: unknown): Date | null {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const fecha = new Date(`${valor}T00:00:00.000${OFFSET_CORTE_JORNADA}`);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/** Fin del dia de negocio (23:59:59.999) a partir del inicio devuelto por `parseFechaDia`. */
export function finDelDia(inicio: Date): Date {
  return new Date(inicio.getTime() + 24 * 60 * 60 * 1000 - 1);
}

const OFFSET_CORTE_MINUTOS = -(5 + HORA_CORTE_JORNADA) * 60; // debe coincidir con OFFSET_CORTE_JORNADA

/**
 * Fecha de "hoy" ("YYYY-MM-DD") en el dia de negocio (corte a las 6am),
 * calculada a mano a partir del offset -- no de la zona horaria del sistema
 * operativo del servidor ni del navegador de quien hace la peticion: dos
 * maquinas con el reloj puesto en zonas distintas deben ver siempre el mismo
 * "hoy" de negocio. Un cierre de caja se guardo una vez para un dia que,
 * con el reloj del sistema, todavia no habia empezado precisamente porque
 * esa validacion dependia del reloj de quien hacia la peticion.
 */
export function hoyLocalISO(): string {
  const local = new Date(Date.now() + OFFSET_CORTE_MINUTOS * 60_000);
  const yyyy = local.getUTCFullYear();
  const mm = String(local.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(local.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Inicio del dia de negocio de hoy, como el `Date` que devuelve `parseFechaDia`. */
export function inicioDeHoy(): Date {
  return parseFechaDia(hoyLocalISO()) as Date;
}
