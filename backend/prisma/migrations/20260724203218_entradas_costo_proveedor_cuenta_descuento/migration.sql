-- AlterTable
ALTER TABLE "cuentas" ADD COLUMN     "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "movimientos_inventario" ADD COLUMN     "costo" DECIMAL(10,2),
ADD COLUMN     "proveedor" TEXT;
