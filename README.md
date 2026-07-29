# La Posada del Palomo — Inventario y Mesas

Ver `requisitos-app-bar-karaoke.md` para el alcance completo del proyecto.

El esquema de base de datos (Prisma), el módulo de autenticación (login +
JWT + roles), el módulo de Inventario (categorías, insumos, productos de
venta con receta, entradas/ajustes de stock, kardex y reporte valorizado),
el módulo de Mesas y Cuentas (abrir/cerrar mesa, consumo con descuento
automático de stock vía receta, dividir/unir mesas), la sincronización en
tiempo real con Socket.io, la base del frontend (rutas, login, sesión,
identidad visual), las pantallas de Inventario y las pantallas de Mesas ya
están implementadas.

## Estructura

```
ProyectoPdP/
├── backend/    Express + TypeScript + Prisma (PostgreSQL) + Swagger
└── frontend/   React + Vite + Tailwind CSS (PWA)
```

## Requisitos previos

- Node.js 18+ (probado con v18.13.0)
- PostgreSQL corriendo localmente (o accesible por red)

## Backend

```bash
cd backend
cp .env.example .env      # ajustar DATABASE_URL con tus credenciales de Postgres
npm install
npm run prisma:migrate    # crea/actualiza las tablas en Postgres
npm run prisma:seed       # carga usuarios, categorías, insumos, productos y mesas de prueba
npm run dev                # http://localhost:3000
```

- Swagger UI: http://localhost:3000/api-docs (se irá completando módulo por
  módulo).
- Health check: http://localhost:3000/health
- Usuarios de prueba tras el seed: `admin` / `admin123` (rol ADMIN) y
  `mesero1` / `mesero123` (rol MESERO).

### Probar el login en Swagger

1. Abrir http://localhost:3000/api-docs, ir a `POST /auth/login` → "Try it out"
   y enviar `{"usuario": "admin", "password": "admin123"}`. Copiar el `token`
   de la respuesta.
2. Click en el botón "Authorize" (arriba a la derecha) y pegar el token
   (sin la palabra `Bearer`).
3. Ahora se puede probar `POST /auth/usuarios` (requiere rol ADMIN) con el
   candado ya autorizado.

### Módulo de Inventario

Todas las rutas de lectura (`GET`) son accesibles para ADMIN y MESERO; las
de escritura (`POST`/`PUT`/`DELETE`) requieren rol ADMIN. Documentadas en
Swagger bajo los tags **Categorias**, **Insumos**, **Productos de Venta** y
**Reportes**:

- `Categorias` / `Insumos` / `Productos de Venta`: CRUD estándar.
- El stock de un insumo nunca se edita directamente: nace en 0 y solo
  cambia con `POST /insumos/{id}/entradas` (compras) o
  `POST /insumos/{id}/ajustes` (mermas/roturas, con motivo obligatorio).
- `GET /insumos/{id}/movimientos` — kardex del insumo.
- `GET /insumos/stock-bajo` — insumos en o por debajo de su stock mínimo.
- `POST /productos-venta` acepta una `receta` opcional al crear el
  producto; `/productos-venta/{id}/receta` gestiona las líneas después.
- `GET /reportes/inventario-valorizado` — valor de stock (stockActual ×
  costo) por insumo y total general.

### Módulo de Reportes (RF19 a RF21)

Solo ADMIN (403 para MESERO). Trabajan sobre los datos ya existentes de
`Cuenta`/`ItemConsumo` — solo cuentas con `estado=CERRADA` cuentan como
venta, usando su `fechaCierre`. Documentados en Swagger bajo **Reportes**:

- `GET /reportes/ventas?agrupacion=dia|semana|mes&desde=&hasta=` — total
  vendido y cantidad de cuentas agrupado por período (por defecto, últimos
  30 días).
- `GET /reportes/productos?orden=mas|menos&limit=&desde=&hasta=` —
  cantidad y monto vendido por producto de venta; incluye productos sin
  ninguna venta (útil para ver qué nunca se vendió).
- `GET /reportes/cierre-caja?fecha=YYYY-MM-DD` — total vendido en el día
  (por defecto, hoy) y desglose por método de pago.

### Módulo de Mesas y Cuentas

Sin restricción de rol: ADMIN y MESERO tienen acceso completo (es el
dominio de trabajo del mesero). Documentado en Swagger bajo los tags
**Mesas** y **Cuentas**:

- `GET /mesas` — estado de todas las mesas, con su cuenta abierta (si
  tiene) y el total en tiempo real.
- `POST /mesas/{id}/abrir` — abre una cuenta nueva (mesa debe estar LIBRE);
  el mesero asignado es opcional (por defecto, el usuario autenticado).
- `POST /cuentas/{id}/items` — agrega un producto de venta al consumo:
  recorre su receta y descuenta cada insumo (`cantidad de la receta ×
  cantidad pedida`), o rechaza la operación completa (400) si algún insumo
  no tiene stock suficiente. Cada descuento queda registrado como
  movimiento `SALIDA` en el kardex del insumo.
- `PUT` / `DELETE /cuentas/{id}/items/{itemId}` — editar cantidad (ajusta
  el stock por la diferencia) o quitar un ítem (devuelve el stock
  consumido, registrado como `AJUSTE`).
- `POST /mesas/{id}/unir` y `POST /cuentas/{id}/dividir` — unir mesas
  (fusiona o traslada la cuenta abierta de otra mesa) y dividir cuenta
  (mueve ítems seleccionados a otra mesa, libre o con cuenta abierta).
- `POST /cuentas/{id}/cerrar` — fija el total final y el método de pago, y
  libera la mesa.
- `GET /cuentas?estado=CERRADA&desde=...&hasta=...` — historial de cuentas
  cerradas, filtrable por mesa y rango de fechas.

### Sincronización en tiempo real (Socket.io)

Socket.io corre sobre el mismo servidor HTTP/puerto que Express (ver
`src/index.ts` y `src/lib/socket.ts`) — no hay un puerto ni servidor
separado. No requiere autenticación en el handshake todavía (queda como
mejora futura si se expone más allá de la red local).

**Salas (rooms):**

| Sala | Quién se une | Cuándo |
|------|-------------|--------|
| `mesas` | Todos, automático al conectar | Vista general de mesas (RF9) |
| `stock` | Todos, automático al conectar | Alertas de stock bajo (RF5) |
| `mesa:{mesaId}` | Explícito: `socket.emit("mesa:unirse", mesaId)` | Detalle de consumo de una mesa — evita mandarle a todo el mundo cada item que se agrega/edita/quita en cada mesa |

Para salir de la sala de una mesa: `socket.emit("mesa:salir", mesaId)`.

**Eventos emitidos:**

| Evento | Sala | Cuándo |
|--------|------|--------|
| `mesa:actualizada` | `mesas` | Se abre/cierra una mesa, cambia su total, o se unen/dividen mesas |
| `cuenta:abierta` | `mesa:{mesaId}` | Se abre una cuenta nueva en esa mesa |
| `cuenta:item-agregado` | `mesa:{mesaId}` | Se agrega un producto al consumo |
| `cuenta:item-editado` | `mesa:{mesaId}` | Se edita la cantidad de un item |
| `cuenta:item-eliminado` | `mesa:{mesaId}` | Se quita un item |
| `cuenta:cerrada` | `mesa:{mesaId}` | Se cierra la cuenta |
| `insumo:stock-bajo` | `stock` | Una venta o un ajuste deja el stock de un insumo en o por debajo de su mínimo |

**Probar los eventos con el cliente de ejemplo incluido:**

```bash
cd backend
npm run dev                        # terminal 1: servidor

npm run socket:test                # terminal 2: solo mesas + stock
npm run socket:test -- 1           # terminal 3: ademas se une a la mesa con id 1
```

Con los clientes conectados, dispara acciones desde Swagger o `curl` (login
primero para obtener el token) y observa la consola de cada cliente:

```bash
# Abrir la mesa 1 (dispara mesa:actualizada + cuenta:abierta)
curl -X POST http://localhost:3000/api/mesas/1/abrir \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}'

# Agregar un producto (dispara cuenta:item-agregado; usa el id de cuenta
# devuelto en el paso anterior)
curl -X POST http://localhost:3000/api/cuentas/<CUENTA_ID>/items \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"productoVentaId":1,"cantidad":2}'
```

El cliente unido a la mesa (`npm run socket:test -- 1`) debería mostrar
ambos eventos; el cliente sin unirse a esa mesa solo debería ver el
`mesa:actualizada` (prueba de que las salas realmente aíslan el ruido).

También se puede probar con Postman: crear una petición de tipo Socket.IO
(New → Socket.IO Request) apuntando a `http://localhost:3000`, conectar, y
suscribirse a los eventos anteriores desde la pestaña "Events".

## Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Requiere el backend corriendo en `http://localhost:3000` (el dev server de
Vite tiene un proxy de `/api` hacia ahí, ver `vite.config.ts` — así el
frontend siempre puede pedir rutas relativas `/api/...` sin importar desde
qué IP se acceda). También escucha en todas las interfaces de red
(`server.host: true`), así que es accesible desde el celular del mesero
usando la IP local de la PC, ej. `http://192.168.1.50:5173`.

### Qué hay implementado

- **Rutas** (React Router): `/login` (pública) y todo lo demás detrás de
  `ProtectedRoute` (`src/routes/ProtectedRoute.tsx`), que redirige a
  `/login` si no hay sesión. `/admin/*` (Inventario) además exige rol
  `ADMIN` — si un MESERO entra a esa URL, lo manda de vuelta a `/`.
- **Sesión**: `src/context/AuthContext.tsx` hace login contra
  `POST /api/auth/login` y guarda `{ token, usuario }` en `localStorage`
  (persiste al recargar o reabrir la PWA). `src/lib/api.ts` adjunta el
  token a los pedidos autenticados y, si el backend responde 401 con un
  token adjunto (sesión inválida/expirada), cierra la sesión
  automáticamente y vuelve a `/login`.
- **Layout responsive** (`src/components/Layout.tsx`): header con el logo,
  navegación (con el link "Inventario" visible solo para ADMIN), datos
  del usuario y botón de salir; se reordena en pantallas angostas en vez
  de usar un menú hamburguesa aparte.
- **Identidad visual**: logo real en `src/assets/logo.png`, paleta de marca
  en `tailwind.config.js` (`fondo`, `superficie`, `dorado`, `rojo`,
  `texto`, `texto-secundario`) y tipografía Inter autoalojada
  (`@fontsource/inter`, sin depender de Google Fonts en tiempo de
  ejecución).
- **PWA**: manifest (`vite.config.ts`) con nombre "La Posada del Palomo" e
  íconos generados a partir del logo real (`public/pwa-192x192.png`,
  `pwa-512x512.png`).

Probado manualmente en navegador: login con credenciales correctas e
incorrectas (mostrando el error real del backend), navegación por rol
(ADMIN ve "Inventario", MESERO no, y no puede entrar por URL directa),
logout, y persistencia de sesión al recargar.

### Pantallas de Inventario (`/admin/*`, solo ADMIN)

Todas conectadas a los endpoints reales del backend (sin datos mock),
pensadas para completarse rápido y leerse bien en ambiente oscuro (RNF7):

- **`/admin/insumos`** — listado con stock actual/mínimo y un badge rojo
  "⚠ Stock bajo" cuando corresponde (RF5), con un filtro "Solo stock bajo".
  Formulario de alta/edición al costado (el stock **no** se edita ahí:
  nace en 0, se carga desde "Movimientos").
- **`/admin/insumos/:id/movimientos`** — un mismo panel para registrar
  entradas/ajustes (toggle entre los dos modos) y ver el kardex completo
  debajo, con badges de color por tipo de movimiento.
- **`/admin/categorias`** — listado + formulario simple.
- **`/admin/productos-venta`** — listado con receta resumida en línea
  (ej. "60ml Ron"); "Nuevo"/"Editar" llevan a un formulario con un
  constructor de receta (agregar/quitar líneas insumo + cantidad).
- Los "Eliminar" usan una confirmación inline (Confirmar/Cancelar) en vez
  de un `window.confirm`, para no romper el flujo con un diálogo nativo.

Probado en navegador: badge de stock bajo apareciendo/desapareciendo en
vivo al registrar un ajuste, alta y edición de categoría con eliminación,
alta de producto con receta y edición posterior (cambiar cantidad de una
línea existente + agregar una línea nueva en el mismo guardado), y acceso
bloqueado para MESERO.

### Pantallas de Mesas (`/mesas`, ADMIN y MESERO)

Pensadas para el mesero: botones grandes, pocos toques para agregar un
producto, y sincronizadas en tiempo real vía Socket.io (sin polling) para
que los cambios hechos desde un dispositivo se reflejen al instante en los
demás.

- **`/mesas`** — grilla de todas las mesas con su estado (libre/ocupada) y
  el total en vivo si tienen cuenta abierta. Se suscribe a
  `mesa:actualizada` para refrescarse sola.
- **`/mesas/:id`** — detalle de una mesa:
  - Si está libre: botón grande "Abrir mesa", y un panel para traer la
    cuenta de otra mesa ocupada (unir mesas).
  - Si está ocupada: total en vivo, una grilla de productos agrupada por
    categoría para agregar consumo de un toque (si el producto ya está en
    el consumo, el siguiente toque suma cantidad en vez de duplicar la
    línea), la lista de consumo con controles +/- por línea y quitar con
    confirmación inline, y tres acciones: **Cerrar cuenta** (elegir método
    de pago), **Dividir cuenta** (elegir ítems + mesa destino) y **Unir con
    otra mesa** (traer la cuenta de otra mesa ocupada a esta).
  - La pantalla se une a la sala `mesa:{id}` al entrar y sale al salir; se
    refresca sola ante cualquier evento de esa mesa o ante un
    `mesa:actualizada` que la involucre (por ejemplo, si otra persona la
    une o divide desde otra mesa).
  - Si el backend rechaza agregar/editar un producto por falta de stock,
    el mensaje de error real se muestra en la pantalla.

Probado con dos pestañas simultáneas (simulando dos dispositivos): abrir
una mesa y agregar productos en una pestaña se reflejó al instante en la
otra sin recargar; unir la cuenta de la mesa 1 en la mesa 2 liberó la mesa
1 en tiempo real en su propia pestaña; dividir un ítem de la mesa 2 a la
mesa 3 (libre) creó una cuenta nueva ahí con el total correcto; cerrar la
cuenta de la mesa 2 con método "Efectivo" la devolvió a libre. Se verificó
el descuento de stock en cada paso (ml para Tequila/Ron, unidades para
Corona) y su reversión correcta al editar/quitar ítems.

### Pantallas de Reportes (`/reportes`, solo ADMIN)

Tres pestañas, cada una con una tabla/gráfico de barras simple (CSS, sin
librería externa de gráficos):

- **Ventas** (RF19) — total y cantidad de cuentas por período (día/semana/
  mes), con filtro opcional de fechas.
- **Productos** (RF20) — cantidad y monto vendido por producto de venta,
  con toggle "Más vendidos" / "Menos vendidos" (incluye productos con 0
  ventas).
- **Cierre de caja** (RF21) — total vendido de un día (selector de fecha,
  por defecto hoy) y desglose por método de pago.

Probado insertando datos de venta de prueba en distintas fechas y métodos
de pago: la agrupación por día/semana/mes coincidió exactamente con los
totales esperados, el toggle de más/menos vendidos invirtió el orden
correctamente (incluyendo un producto sin ninguna venta), el cierre de
caja mostró el desglose correcto por método de pago y respondió bien al
cambiar la fecha. Se confirmó también que un MESERO recibe 403 desde la
API y es redirigido a `/` si intenta entrar por URL directa.

## Scripts disponibles

| Comando | Backend | Frontend |
|---------|---------|----------|
| `npm run dev` | Servidor con recarga en caliente (`tsx watch`) | Vite dev server |
| `npm run build` | Compila TypeScript a `dist/` | Build de producción + assets PWA |
| `npm run start` | Corre `dist/index.js` (requiere `build` previo) | Sirve el build con `vite preview` |

## Puesta en producción en la PC del bar (RNF2, RNF5)

En producción **no se corre el dev server de Vite**: se compila el
frontend una sola vez y el propio backend Express lo sirve desde el mismo
puerto (3000), junto con la API y Socket.io. Así solo hay un proceso que
mantener vivo.

### 1. Compilar ambos proyectos

```powershell
cd backend
npm install
npm run build          # genera backend/dist

cd ../frontend
npm install
npm run build           # genera frontend/dist
```

`backend/src/app.ts` detecta automáticamente si existe `frontend/dist`: si
está presente, Express sirve esos archivos estáticos y responde con
`index.html` para cualquier ruta que no sea `/api/*` o `/health` (para que
funcione el ruteo del lado del cliente, ej. recargar en `/mesas`). Si no
existe (como en desarrollo), el backend simplemente no la sirve y seguís
usando `npm run dev` en el frontend con normalidad.

Repetí este paso cada vez que se actualice el código (o agregalo a un
script de actualización propio).

### 2. Backend con PM2 (reinicio automático si falla)

PM2 mantiene el proceso de Node corriendo y lo reinicia solo si crashea.
La configuración ya está en `backend/ecosystem.config.js`.

```powershell
npm install -g pm2

cd backend
pm2 start ecosystem.config.js
pm2 save                 # guarda la lista de procesos para poder restaurarla luego
```

Comandos útiles del día a día (también disponibles como `npm run pm2:*`
dentro de `backend/`):

| Comando | Qué hace |
|---------|----------|
| `pm2 status` | Ver si está corriendo y cuántas veces se reinició |
| `pm2 logs posada-del-palomo` | Ver logs en vivo |
| `pm2 restart posada-del-palomo` | Reiniciar manualmente (ej. tras un `build`) |
| `pm2 stop posada-del-palomo` | Detener |

### 3. Arranque automático al encender la PC

Windows no trae soporte nativo para el `pm2 startup` de Linux/macOS, así
que se usa el paquete `pm2-windows-startup`:

```powershell
npm install -g pm2-windows-startup
pm2-startup install
```

Esto registra PM2 para que arranque solo con Windows y "resucite" (`pm2
resurrect`) la lista de procesos guardada en el paso anterior — por eso es
importante haber corrido `pm2 save` primero. A partir de ahí, con solo
encender la PC:

1. Windows arranca su servicio de PostgreSQL automáticamente (el
   instalador oficial ya lo deja configurado así; se puede confirmar con
   `Get-Service postgresql*` — el `Status` debe decir `Running` y el
   `StartType` `Automatic`).
2. PM2 arranca y levanta `posada-del-palomo` (backend + frontend + Socket.io
   en el puerto 3000).

Para probar que funciona sin esperar a un reinicio real: `pm2 kill` y
después abrir una sesión nueva (o simplemente reiniciar la PC).

> `pm2-windows-startup` es la opción más simple y alcanza para este caso
> (un solo proceso, una sola PC). Si más adelante hiciera falta algo más
> robusto (registrar PM2 como Servicio de Windows real), existe también
> `pm2-installer`, pero es más para escenarios con varias apps/servidores.

### 4. Backup diario de la base de datos

`backend/scripts/backup-db.ps1` hace un `pg_dump` completo de la base
(lee las credenciales directamente de `backend/.env`, no hace falta
tocarlo) y lo guarda en `backend/backups/` con la fecha y hora en el
nombre, por ejemplo `pdp_db_2026-07-24_040000.sql`. También borra
automáticamente los backups de más de 30 días para no llenar el disco.

Probarlo a mano:

```powershell
cd backend
npm run backup
```

Para que corra solo todos los días (ej. a las 4 AM, con el bar cerrado),
programarlo con el Programador de tareas de Windows:

```powershell
schtasks /create /tn "PdP - Backup diario" /sc daily /st 04:00 /tr "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"C:\ruta\a\ProyectoPdP\backend\scripts\backup-db.ps1`""
```

(Reemplazar `C:\ruta\a\ProyectoPdP` por la ruta real del proyecto en esa
PC). Se puede verificar que quedó creada con `schtasks /query /tn "PdP -
Backup diario"`, o ejecutarla manualmente para probarla con `schtasks /run
/tn "PdP - Backup diario"`.

Los backups quedan en una carpeta local (`backend/backups/`, ignorada por
git). Si más adelante se quiere subirlos también a la nube (opcional,
mencionado en RNF5), alcanza con agregar al final del script una copia de
ese archivo a la carpeta sincronizada de Google Drive/OneDrive/Dropbox que
haya instalada en la PC.

### 5. Conectar el celular del mesero por WiFi

La PWA se sirve en el puerto 3000 (ya no en el 5173 del dev server). Para
que el celular la vea, la PC y el celular tienen que estar en la **misma
red WiFi**, y hace falta la IP local de la PC en esa red:

```powershell
ipconfig
```

Buscar el bloque **"Adaptador de LAN inalámbrica Wi-Fi"** (o el de
Ethernet si la PC está por cable) y anotar el valor de **"Dirección
IPv4"** — algo como `192.168.1.50`. Desde el celular, entrar a
`http://192.168.1.50:3000` y desde ahí instalar la PWA ("Agregar a
pantalla de inicio" / "Instalar app").

Si el celular no puede conectarse, lo más común es que el Firewall de
Windows esté bloqueando el puerto entrante. Para habilitarlo (una sola
vez, desde una PowerShell como Administrador):

```powershell
New-NetFirewallRule -DisplayName "La Posada del Palomo" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

La IP local puede cambiar si el router la reasigna (DHCP); si el bar
tiene router propio, conviene reservarle una IP fija a la PC desde la
configuración del router para no tener que repetir este paso.
# PdPSoftware
