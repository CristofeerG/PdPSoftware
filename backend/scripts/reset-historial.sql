-- Vacía el historial de ventas e inventario para arrancar con datos reales,
-- sin tocar catálogos (usuarios, productos, insumos, categorías, recetas).
BEGIN;

DELETE FROM items_consumo;
DELETE FROM cuentas;
DELETE FROM movimientos_inventario;

ALTER SEQUENCE items_consumo_id_seq RESTART WITH 1;
ALTER SEQUENCE cuentas_id_seq RESTART WITH 1;
ALTER SEQUENCE movimientos_inventario_id_seq RESTART WITH 1;

UPDATE mesas SET estado = 'LIBRE';

COMMIT;
