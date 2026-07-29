-- CreateEnum
CREATE TYPE "rol_usuario" AS ENUM ('ADMIN', 'MESERO');

-- CreateEnum
CREATE TYPE "unidad_medida" AS ENUM ('ML', 'UNIDAD');

-- CreateEnum
CREATE TYPE "tipo_movimiento" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "estado_mesa" AS ENUM ('LIBRE', 'OCUPADA', 'POR_COBRAR');

-- CreateEnum
CREATE TYPE "estado_cuenta" AS ENUM ('ABIERTA', 'CERRADA');

-- CreateEnum
CREATE TYPE "metodo_pago" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "rol_usuario" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insumos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "unidad" "unidad_medida" NOT NULL,
    "costo" DECIMAL(10,2) NOT NULL,
    "stock_actual" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock_minimo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_venta" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "precio_venta" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "productos_venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receta_items" (
    "id" SERIAL NOT NULL,
    "producto_venta_id" INTEGER NOT NULL,
    "insumo_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "receta_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id" SERIAL NOT NULL,
    "insumo_id" INTEGER NOT NULL,
    "tipo" "tipo_movimiento" NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "motivo" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesas" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "estado" "estado_mesa" NOT NULL DEFAULT 'LIBRE',

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuentas" (
    "id" SERIAL NOT NULL,
    "mesa_id" INTEGER NOT NULL,
    "usuario_id" INTEGER,
    "fecha_apertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_cierre" TIMESTAMP(3),
    "estado" "estado_cuenta" NOT NULL DEFAULT 'ABIERTA',
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "metodo_pago" "metodo_pago",

    CONSTRAINT "cuentas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_consumo" (
    "id" SERIAL NOT NULL,
    "cuenta_id" INTEGER NOT NULL,
    "producto_venta_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "items_consumo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_usuario_key" ON "usuarios"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "receta_items_producto_venta_id_insumo_id_key" ON "receta_items"("producto_venta_id", "insumo_id");

-- CreateIndex
CREATE UNIQUE INDEX "mesas_numero_key" ON "mesas"("numero");

-- AddForeignKey
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_venta" ADD CONSTRAINT "productos_venta_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta_items" ADD CONSTRAINT "receta_items_producto_venta_id_fkey" FOREIGN KEY ("producto_venta_id") REFERENCES "productos_venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta_items" ADD CONSTRAINT "receta_items_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas" ADD CONSTRAINT "cuentas_mesa_id_fkey" FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas" ADD CONSTRAINT "cuentas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_consumo" ADD CONSTRAINT "items_consumo_cuenta_id_fkey" FOREIGN KEY ("cuenta_id") REFERENCES "cuentas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_consumo" ADD CONSTRAINT "items_consumo_producto_venta_id_fkey" FOREIGN KEY ("producto_venta_id") REFERENCES "productos_venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
