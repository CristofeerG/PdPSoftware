# Puesta en producción — La Posada del Palomo (PC del bar, Windows)

Esta guía describe cómo quedó configurado el sistema para operar todos los
días en esta PC, y qué hacer si algo falla.

## 1. Cómo está corriendo el sistema

- El **backend Express** sirve la API (`/api/...`) y también el **build de
  producción del frontend** (`frontend/dist`) desde el mismo puerto — no hace
  falta un servidor web aparte para el frontend.
- **PM2** mantiene el backend vivo (`posada-del-palomo`), lo reinicia solo si
  se cae, y lo vuelve a levantar cuando arranca Windows (ver sección 4).
- **PostgreSQL** corre como servicio de Windows (`postgresql-x64-17`), arranca
  solo con el sistema operativo.
- **Puerto**: `3000` (definido en `backend/.env`, variable `PORT`).

### Rutas clave
- Código: `C:\SoftwarePV\PdP\PdPSoftware`
- Config de PM2: `backend\ecosystem.config.js`
- Build del frontend: `frontend\dist` (se regenera con `npm run build`)
- Backups de la base de datos: `backend\backups\`
- Logs de arranque automático de PM2: `backend\logs\pm2-resurrect.log`

## 2. IP local fija (para que el celular siempre la encuentre)

Hoy esta PC tiene la IP **`192.168.100.6`** (adaptador `Ethernet`, MAC
`F4-B5-20-44-99-F8`), asignada por DHCP del router (gateway `192.168.100.1`).
Si no se fija, el router puede cambiarla en el futuro y la app "desaparece"
del celular.

**Opción recomendada — reserva DHCP en el router** (así el router sigue
manejando la red, pero siempre le da la misma IP a esta PC):
1. Entra al panel del router (normalmente `http://192.168.100.1`).
2. Busca la sección de "DHCP reservation" / "Reserva de IP" / "IP estática
   por dispositivo" (el nombre varía según la marca del router).
3. Crea una reserva para la MAC `F4-B5-20-44-99-F8` → IP `192.168.100.6`.
4. Reinicia la PC (o renueva el DHCP con `ipconfig /release` + `ipconfig /renew`
   en una terminal) para confirmar que sigue tomando esa misma IP.

**Alternativa — IP estática en el adaptador de Windows** (si no tienes acceso
al router). Ejecutar como administrador:
```powershell
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.100.6 -PrefixLength 24 -DefaultGateway 192.168.100.1
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 8.8.8.8,1.1.1.1
```
Antes de correrlo, confirma con tu router que `192.168.100.6` está **fuera**
del rango que reparte el DHCP, para que no la vuelva a asignar a otro
dispositivo y choquen las dos IPs.

Con cualquiera de las dos opciones, la dirección para el celular queda fija:

```
http://192.168.100.6:3000
```

## 3. Verificar que el celular se conecta

1. Conecta el celular a la **misma red Wi-Fi** que reparte ese router (no
   datos móviles).
2. Abre el navegador del celular y entra a `http://192.168.100.6:3000`.
3. Deberías ver la pantalla de login de la app. Si no carga:
   - Confirma que la PC está encendida y PM2 tiene el proceso `online`
     (`pm2 status`, ver sección 4).
   - Confirma que la regla de Firewall del puerto 3000 ya se creó (sección 5
     de la conversación / punto pendiente de administrador).
   - Verifica que el celular y la PC están en la misma red (mismo SSID, sin
     "aislamiento de clientes" activado en el router — algunos routers lo
     traen activado y bloquea que los dispositivos Wi-Fi se vean entre sí).
   - Desde otra PC en la misma red puedes probar `ping 192.168.100.6`.

## 4. Ver logs de PM2 / reiniciar si algo falla

Desde una terminal en esta PC (no hace falta administrador):

```powershell
pm2 status                          # ver si el proceso está online
pm2 logs posada-del-palomo          # logs en vivo (Ctrl+C para salir)
pm2 logs posada-del-palomo --lines 100 --nostream   # últimas 100 líneas, sin quedarse pegado
pm2 restart posada-del-palomo       # reiniciar el backend
pm2 stop posada-del-palomo          # apagar el backend
pm2 start posada-del-palomo         # volver a encenderlo
```

Si haces cambios de código y necesitas reconstruir producción:
```powershell
cd C:\SoftwarePV\PdP\PdPSoftware\frontend
npm run build
cd C:\SoftwarePV\PdP\PdPSoftware\backend
npm run build
pm2 restart posada-del-palomo
```

Si el proceso desaparece de `pm2 status` por completo (no solo "stopped"),
puede que la lista guardada se haya perdido; recupérala con:
```powershell
pm2 resurrect
```
(esto es justamente lo que hace automáticamente la tarea programada al
iniciar Windows — ver `backend\logs\pm2-resurrect.log` para confirmar que
corrió bien la última vez que se reinició la PC).

## 5. Backups diarios

`backend\scripts\backup-db.ps1` corre todos los días a las 5:00 a.m. (tarea
programada, ver checklist final) y guarda un `.sql` con fecha en
`backend\backups\`, conservando los últimos 30 días. Para correrlo a mano:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\SoftwarePV\PdP\PdPSoftware\backend\scripts\backup-db.ps1"
```
