# App de Inventario y Gestión de Mesas — Bar Karaoke

## 1. Resumen del proyecto

Aplicación web local para controlar el stock del bar y gestionar el consumo de cada mesa en tiempo real, accesible desde la PC de la barra y desde el celular del mesero, conectados a la misma red WiFi.

**Decisiones de alcance (según tus respuestas):**
- Acceso desde 2 tipos de dispositivo: PC de la barra + celular(es) de mesero.
- Menos de 10 mesas → escala pequeña, baja concurrencia.
- Internet estable disponible, pero **no es necesario depender de la nube**: al ser pocos dispositivos en un mismo local, lo más simple, barato y rápido es correr todo desde la PC del bar y conectar el celular por red local (WiFi). El internet se puede aprovechar después para respaldos automáticos en la nube.

---

## 2. Requisitos Funcionales (RF)

### Módulo de Inventario
- **RF1.** Registrar insumos (stock real del bar): nombre, categoría, unidad de medida (ml o unidad), costo, stock actual, stock mínimo.
- **RF2.** Gestionar categorías (licores, cervezas, refrescos, snacks, etc.).
- **RF3.** Registrar entradas de inventario (compras/reabastecimiento): cantidad, costo, proveedor, fecha.
- **RF4.** Definir productos de venta (ítems del menú, ej. "Chivas — Rocas", "Piña Colada", "3 Coronas en lata") con su receta: qué insumo(s) consume cada uno y en qué cantidad. Un mismo insumo puede venderse de varias formas (rocas, shot, ingrediente de cóctel, botella completa), cada una con su propio precio y receta. Al agregarse a una mesa, el stock se descuenta automáticamente según la receta. Para cócteles con varios ingredientes, solo se controla el licor base — mixers y garnishes no descuentan stock.
- **RF5.** Alertas visuales cuando el stock actual de un insumo llega o baja del stock mínimo.
- **RF6.** Historial de movimientos por insumo (kardex): entradas, salidas, ajustes.
- **RF7.** Ajustes manuales de inventario (mermas, roturas, consumo interno) con motivo registrado.
- **RF8.** Reporte de inventario valorizado y de productos de venta más vendidos.

### Módulo de Mesas
- **RF9.** Vista general de mesas con su estado: libre / ocupada / por cobrar.
- **RF10.** Abrir mesa (nueva cuenta), con mesero asignado (opcional).
- **RF11.** Agregar productos al consumo de una mesa desde la PC o el celular.
- **RF12.** Editar o quitar ítems de una cuenta abierta.
- **RF13.** Ver el total acumulado de cada mesa en tiempo real.
- **RF14.** Cerrar mesa: total final, método de pago (efectivo/tarjeta/transferencia), descuento si aplica.
- **RF15.** Historial de cuentas cerradas por fecha.
- **RF16.** Dividir cuenta o unir mesas.

### Usuarios y sincronización
- **RF17.** Login con roles: **Administrador** (todo, incluyendo inventario y reportes) y **Mesero** (solo mesas y consumo).
- **RF18.** Sincronización en tiempo real: si el mesero agrega un producto desde el celular, la PC lo refleja al instante (y viceversa).
- **RF19.** Gestión de usuarios: el administrador puede crear, listar, editar (rol, contraseña) y desactivar usuarios. Un usuario desactivado no puede iniciar sesión, pero se conserva en el historial de cuentas y movimientos que generó.

### Reportes
- **RF20.** Ventas por día / semana / mes.
- **RF21.** Productos de venta más y menos vendidos.
- **RF22.** Cierre de caja diario (total vendido, desglose por método de pago).

---

## 3. Requisitos No Funcionales (RNF)

| # | Requisito | Detalle |
|---|-----------|---------|
| RNF1 | Rendimiento | Respuesta menor a 1-2 seg en operaciones normales, holgado para el hardware disponible |
| RNF2 | Disponibilidad | Debe iniciar automáticamente con la PC y mantenerse activo todo el horario del bar |
| RNF3 | Multiplataforma | Accesible desde navegador en PC y celular (Android/iOS), sin instalar apps nativas (PWA) |
| RNF4 | Seguridad | Login obligatorio, contraseñas encriptadas (hash), acceso restringido a la red local del bar |
| RNF5 | Respaldo | Backup automático diario de la base de datos (local, y opcionalmente a la nube ya que hay internet) |
| RNF6 | Bajo consumo de recursos | El stack debe correr cómodo en 8GB RAM sin saturar la PC mientras se usa para otras cosas |
| RNF7 | Usabilidad | Interfaz simple, con flujo tipo punto de venta (POS): máximo 1-2 toques para las acciones más frecuentes, catálogo por categorías con buscador, cuenta/ticket siempre visible, botones grandes, legible en ambiente oscuro (típico de un karaoke) |
| RNF8 | Mantenibilidad | Código simple y ordenado, pensado para que tú mismo lo mantengas con ayuda de Claude Code |
| RNF9 | Costo | Sin licencias ni hosting recurrente — todo corre local |

---

## 4. Arquitectura propuesta

```
[ Celular del mesero ]  ---\
                             \
                              --->  [ PC del bar corriendo el servidor ]
                             /           - Backend + Base de datos
[ PC de la barra ]      ---/            - Sirve la app a ambos dispositivos
        (misma red WiFi local)
```

- La PC del bar corre **un único servidor** (backend + frontend + base de datos).
- El celular y la propia PC se conectan a esa app vía navegador, usando la IP local de la PC (ej. `http://192.168.1.50:3000`).
- Se recomienda configurar una **IP local fija** para la PC en el router (DHCP reservation), para que la dirección no cambie.
- Un código QR con esa URL facilita conectar celulares nuevos sin escribir la IP a mano.

Esto evita depender de internet para el funcionamiento diario (si se cae el internet, el bar sigue operando normal, ya que todo es red local).

---

## 5. Stack tecnológico recomendado

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Backend | **Node.js + Express** | Liviano, ideal para el hardware, gran soporte con Claude Code |
| Tiempo real | **Socket.io** | Sincroniza mesas entre PC y celular al instante |
| Base de datos | **PostgreSQL** (con Prisma ORM) | Ya la conoces y sabes administrarla — elimina la curva de aprendizaje. Para <10 mesas es tan liviana como SQLite en este hardware |
| Frontend | **React + Vite + Tailwind CSS** | Interfaz responsive, funciona igual en PC y celular |
| Empaquetado frontend | **PWA** (instalable en el celular) | El mesero abre la app como si fuera nativa, sin tienda de apps |
| Autenticación | JWT o sesiones + roles | Separar Administrador y Mesero |
| Mantener el servidor activo | **PM2** | Reinicia el servidor automáticamente si falla o si se reinicia la PC |
| Backups | Script con `node-cron` que ejecuta `pg_dump` diariamente | Backup estándar de PostgreSQL, fácil de restaurar |

**Por qué NO usar algo más pesado (Docker, microservicios, servidores separados, etc.):**
Con menos de 10 mesas y 1-2 dispositivos conectados, esa complejidad no aporta nada y sí consume recursos que tu i3 de 8GB puede necesitar para otras tareas del bar. Node + PostgreSQL corriendo local en esta escala normalmente usa **entre 300-600MB de RAM en conjunto**, muy cómodo para tu equipo — la diferencia frente a SQLite es mínima a este volumen, y como ya conoces PostgreSQL, sale ganando en mantenibilidad (RNF8).

---

## 6. Modelo de datos simplificado

- **Usuario**: id, nombre, usuario, contraseña (hash), rol, activo
- **Categoria**: id, nombre
- **Insumo** (stock real del bar): id, nombre, categoria_id, unidad (ml o unidad), costo, stock_actual, stock_minimo
- **ProductoVenta** (ítem del menú/app): id, nombre, categoria_id, precio_venta
- **RecetaItem** (qué insumo(s) consume cada producto de venta): id, producto_venta_id, insumo_id, cantidad
- **MovimientoInventario**: id, insumo_id, tipo (entrada/salida/ajuste), cantidad, motivo, fecha, usuario_id
- **Mesa**: id, numero, estado
- **Cuenta**: id, mesa_id, usuario_id, fecha_apertura, fecha_cierre, estado, total, metodo_pago
- **ItemConsumo**: id, cuenta_id, producto_venta_id, cantidad, precio_unitario, subtotal

**Cómo funciona la receta:** un ProductoVenta tiene 1 o más RecetaItem. Para un ítem simple (una cerveza, un snack) es una sola línea: 1 unidad de sí mismo como insumo. Para un licor, el mismo insumo alimenta varios ProductoVenta distintos — rocas (60ml), shot (60ml), botella completa (750ml o el tamaño del insumo), o base de un cóctel (60ml) — cada uno con su propio precio. Un combo (ej. "3 Coronas en lata") es una sola línea con cantidad 3 sobre el mismo insumo.

El stock en ml de un insumo es un acumulado (no se rastrea botella por botella): al registrar una entrada de una botella de 750ml, esos 750ml se suman al stock_actual del insumo.

---

## 7. Roadmap sugerido

1. **MVP**: login + gestión de usuarios + insumos y productos de venta (con recetas) + mesas + agregar consumo + dividir cuenta / unir mesas + cerrar cuenta + descuento automático de stock según receta.
2. **V2**: alertas de stock bajo, reportes de ventas, cierre de caja.
3. **V3**: respaldo automático en la nube, código QR para conectar celulares, impresión de comandas.
