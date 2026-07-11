param(
    [Parameter(Mandatory = $true)]
    [string]$ServerInstance,

    [Parameter(Mandatory = $true)]
    [string]$Database,

    [string]$Username = "",
    [string]$Password = "",
    [switch]$IncludeFullSchema
)

$ErrorActionPreference = "Stop"

$PackageRoot = Split-Path -Parent $PSScriptRoot
$SqlRoot = Join-Path $PackageRoot "sql"

if (!(Get-Command sqlcmd -ErrorAction SilentlyContinue)) {
    throw "sqlcmd nao encontrado. Instale o SQL Server command line tools ou aplique os scripts manualmente."
}

if (!(Test-Path $SqlRoot)) {
    throw "Pasta sql do pacote nao encontrada: $SqlRoot"
}

$files = Get-ChildItem $SqlRoot -Filter "*.sql" |
    Where-Object { $IncludeFullSchema -or $_.Name -ne "full-schema.sql" } |
    Sort-Object Name

foreach ($file in $files) {
    Write-Host "Aplicando $($file.Name)..."

    if ($Username.Trim().Length -gt 0) {
        & sqlcmd -S $ServerInstance -d $Database -U $Username -P $Password -b -i $file.FullName
    } else {
        & sqlcmd -S $ServerInstance -d $Database -E -b -i $file.FullName
    }

    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao aplicar $($file.Name). Codigo $LASTEXITCODE."
    }
}

Write-Host "Scripts SQL aplicados com sucesso."
