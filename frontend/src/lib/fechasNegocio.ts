// Hora local (0-23) en la que "cambia el dia de negocio" para reportes y
// cierres de caja. Debe coincidir con HORA_CORTE_JORNADA en
// backend/src/lib/fechasNegocio.ts: el negocio es un bar que opera de noche
// hasta la madrugada, asi que "hoy" (y "esta semana"/"este mes") no cambia a
// medianoche sino mas tarde, cuando el bar ya esta cerrado con margen -- si
// no, una sola noche de trabajo quedaria partida en dos "dias" distintos en
// los reportes.
const HORA_CORTE_JORNADA = 6;

/**
 * "Ahora", desplazado para que calcular el dia/semana/mes con `date-fns`
 * (`startOfWeek`, `format`, etc.) sobre este valor de el dia de negocio
 * correcto en vez del dia calendario: entre medianoche y las 6am todavia
 * "es ayer" para el negocio.
 */
export function ahoraNegocio(): Date {
  const ahora = new Date();
  ahora.setHours(ahora.getHours() - HORA_CORTE_JORNADA);
  return ahora;
}

/** Fecha de "hoy" ("YYYY-MM-DD") en el dia de negocio (ver `ahoraNegocio`). */
export function hoyNegocioISO(): string {
  const d = ahoraNegocio();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
