# Arranque automatico de PM2 al iniciar Windows.
# Lo dispara una tarea programada (trigger "at startup") para que el backend
# quede en linea aunque nadie haya iniciado sesion en la PC del bar.
$ErrorActionPreference = "Continue"

$pm2Cmd = "C:\Users\User\AppData\Roaming\npm\pm2.cmd"
$carpetaLogs = Join-Path $PSScriptRoot "..\logs"
if (-not (Test-Path $carpetaLogs)) {
    New-Item -ItemType Directory -Path $carpetaLogs | Out-Null
}
$logFile = Join-Path $carpetaLogs "pm2-resurrect.log"

function Log($msg) {
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg" | Out-File -FilePath $logFile -Append -Encoding utf8
}

Log "----- Inicio de pm2-resurrect.ps1 -----"

if (-not (Test-Path $pm2Cmd)) {
    Log "ERROR: no se encontro pm2 en $pm2Cmd. Revisa la instalacion global de pm2 (npm install -g pm2)."
    exit 1
}

# PostgreSQL corre como servicio de Windows y arranca solo, pero puede tardar
# unos segundos mas que esta tarea en quedar listo. Esperamos hasta 60s.
$servicioPg = Get-Service -Name "postgresql-x64-*" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($servicioPg) {
    $intentos = 0
    while ($servicioPg.Status -ne "Running" -and $intentos -lt 30) {
        Start-Sleep -Seconds 2
        $servicioPg.Refresh()
        $intentos++
    }
    Log "Estado de PostgreSQL ($($servicioPg.Name)): $($servicioPg.Status)"
} else {
    Log "AVISO: no se encontro un servicio de PostgreSQL (postgresql-x64-*). Continuo de todas formas."
}

try {
    $salida = & $pm2Cmd resurrect 2>&1
    $salida | Out-File -FilePath $logFile -Append -Encoding utf8
    Log "pm2 resurrect ejecutado (codigo de salida: $LASTEXITCODE)."
} catch {
    Log "ERROR al ejecutar pm2 resurrect: $_"
}

Log "----- Fin de pm2-resurrect.ps1 -----"
