param(
    [string]$ServiceName = "DigiconQMS",
    [string]$BackendPath = "C:\DigiconQMS\backend",
    [string]$FrontendPath = "",
    [string]$BackupRoot = "C:\DigiconQMS\backups",
    [switch]$SkipServiceRestart
)

$ErrorActionPreference = "Stop"

$PackageRoot = Split-Path -Parent $PSScriptRoot
$BackendSource = Join-Path $PackageRoot "backend"
$FrontendSource = Join-Path $PackageRoot "frontend"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupPath = Join-Path $BackupRoot $Timestamp

function Invoke-Robocopy {
    param(
        [string]$Source,
        [string]$Destination,
        [string[]]$ExtraArgs = @()
    )

    New-Item -ItemType Directory -Force -Path $Destination | Out-Null
    $args = @($Source, $Destination, "/MIR", "/R:2", "/W:2") + $ExtraArgs
    & robocopy @args | Out-Host
    if ($LASTEXITCODE -gt 7) {
        throw "Robocopy falhou com codigo $LASTEXITCODE."
    }
}

if (!(Test-Path $BackendSource)) {
    throw "Pasta backend do pacote nao encontrada: $BackendSource"
}

New-Item -ItemType Directory -Force -Path $BackupPath | Out-Null

if (!$SkipServiceRestart) {
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($service -and $service.Status -ne "Stopped") {
        Write-Host "Parando servico $ServiceName..."
        Stop-Service -Name $ServiceName -Force
        $service.WaitForStatus("Stopped", "00:00:30")
    }
}

if (Test-Path $BackendPath) {
    Write-Host "Criando backup do backend em $BackupPath\backend..."
    Invoke-Robocopy -Source $BackendPath -Destination (Join-Path $BackupPath "backend")
}

Write-Host "Atualizando backend em $BackendPath..."
Invoke-Robocopy `
    -Source $BackendSource `
    -Destination $BackendPath `
    -ExtraArgs @("/XF", "appsettings.json", "appsettings.Development.json", "startup-error.log")

if ($FrontendPath.Trim().Length -gt 0) {
    if (!(Test-Path $FrontendSource)) {
        throw "Pasta frontend do pacote nao encontrada: $FrontendSource"
    }

    if (Test-Path $FrontendPath) {
        Write-Host "Criando backup do frontend em $BackupPath\frontend..."
        Invoke-Robocopy -Source $FrontendPath -Destination (Join-Path $BackupPath "frontend")
    }

    Write-Host "Atualizando frontend em $FrontendPath..."
    Invoke-Robocopy -Source $FrontendSource -Destination $FrontendPath
}

if (!$SkipServiceRestart) {
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($service) {
        Write-Host "Iniciando servico $ServiceName..."
        Start-Service -Name $ServiceName
    } else {
        Write-Warning "Servico $ServiceName nao encontrado. Inicie o servico manualmente ou ajuste -ServiceName."
    }
}

Write-Host "Atualizacao concluida. Backup: $BackupPath"
