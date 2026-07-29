# Backup diario de la base de datos (RNF5). Pensado para correr sin
# supervision desde el Programador de tareas de Windows.
$ErrorActionPreference = "Stop"

$raizBackend = Split-Path -Parent $PSScriptRoot
$archivoEnv = Join-Path $raizBackend ".env"
if (-not (Test-Path $archivoEnv)) {
    throw "No se encontro .env en $archivoEnv"
}

$lineaUrl = Get-Content $archivoEnv | Where-Object { $_ -match '^DATABASE_URL=' }
if (-not $lineaUrl) {
    throw "DATABASE_URL no esta definida en .env"
}

# postgresql://usuario:password@host:puerto/basededatos?schema=public
$patron = 'postgresql://(?<usuario>[^:]+):(?<password>[^@]+)@(?<host>[^:/]+):(?<puerto>\d+)/(?<db>[^?"]+)'
if ($lineaUrl -notmatch $patron) {
    throw "No se pudo interpretar DATABASE_URL"
}
$usuario = $Matches.usuario
$password = $Matches.password
$dbHost = $Matches.host
$puerto = $Matches.puerto
$baseDatos = $Matches.db

$carpetaBackups = Join-Path $raizBackend "backups"
if (-not (Test-Path $carpetaBackups)) {
    New-Item -ItemType Directory -Path $carpetaBackups | Out-Null
}

$fecha = Get-Date -Format "yyyy-MM-dd_HHmmss"
$archivoSalida = Join-Path $carpetaBackups "$baseDatos`_$fecha.sql"

$env:PGPASSWORD = $password
& pg_dump -h $dbHost -p $puerto -U $usuario -d $baseDatos -F p -f $archivoSalida
$codigoSalida = $LASTEXITCODE
Remove-Item Env:\PGPASSWORD

if ($codigoSalida -ne 0) {
    throw "pg_dump termino con codigo $codigoSalida"
}

Write-Host "Backup creado: $archivoSalida"

# Conserva solo los ultimos 30 dias de backups para no llenar el disco.
Get-ChildItem $carpetaBackups -Filter "$baseDatos`_*.sql" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
    Remove-Item -Force
