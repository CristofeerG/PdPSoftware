-- CreateEnum
CREATE TYPE "categoria_gasto" AS ENUM ('SUELDOS', 'COMIDA_PERSONAL', 'INSUMOS', 'OTRO');

-- CreateTable
CREATE TABLE "gastos" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concepto" TEXT NOT NULL,
    "categoria" "categoria_gasto" NOT NULL DEFAULT 'OTRO',
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo_pago" "metodo_pago" NOT NULL DEFAULT 'EFECTIVO',
    "usuario_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cierres_caja" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "monto_inicial" DECIMAL(10,2) NOT NULL,
    "ventas_efectivo" DECIMAL(10,2) NOT NULL,
    "gastos_efectivo" DECIMAL(10,2) NOT NULL,
    "monto_esperado" DECIMAL(10,2) NOT NULL,
    "monto_contado" DECIMAL(10,2) NOT NULL,
    "diferencia" DECIMAL(10,2) NOT NULL,
    "notas" TEXT,
    "usuario_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cierres_caja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cierres_caja_fecha_key" ON "cierres_caja"("fecha");

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierres_caja" ADD CONSTRAINT "cierres_caja_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
