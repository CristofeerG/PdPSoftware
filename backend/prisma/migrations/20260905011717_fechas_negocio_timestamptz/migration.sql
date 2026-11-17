-- Convierte fecha_apertura/fecha_cierre/fecha (cuentas, pagos, gastos) de
-- "timestamp" (sin zona horaria) a "timestamptz". Estas columnas siempre se
-- escribieron con Prisma usando los digitos de reloj de UTC (verificado
-- contra datos reales de produccion antes de esta migracion), asi que se
-- reinterpretan explicitamente "AT TIME ZONE 'UTC'" para preservar el
-- instante real de cada fila.
--
-- Sin el "USING ... AT TIME ZONE 'UTC'" explicito, Postgres usaria por
-- defecto la zona horaria de la sesion (America/Bogota, UTC-5) para hacer el
-- cast, lo que correria 5 horas TODOS los timestamps historicos.
ALTER TABLE "cuentas"
  ALTER COLUMN "fecha_apertura" TYPE TIMESTAMPTZ(3) USING "fecha_apertura" AT TIME ZONE 'UTC',
  ALTER COLUMN "fecha_cierre" TYPE TIMESTAMPTZ(3) USING "fecha_cierre" AT TIME ZONE 'UTC';

ALTER TABLE "gastos"
  ALTER COLUMN "fecha" TYPE TIMESTAMPTZ(3) USING "fecha" AT TIME ZONE 'UTC';

ALTER TABLE "pagos"
  ALTER COLUMN "fecha" TYPE TIMESTAMPTZ(3) USING "fecha" AT TIME ZONE 'UTC';
