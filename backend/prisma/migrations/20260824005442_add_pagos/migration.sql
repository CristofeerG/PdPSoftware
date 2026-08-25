-- CreateTable
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "cuenta_id" INTEGER NOT NULL,
    "item_consumo_id" INTEGER,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo_pago" "metodo_pago" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_cuenta_id_fkey" FOREIGN KEY ("cuenta_id") REFERENCES "cuentas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_item_consumo_id_fkey" FOREIGN KEY ("item_consumo_id") REFERENCES "items_consumo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
