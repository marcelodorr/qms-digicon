param(
    [string]$BackendPath = "C:\DigiconQMS\backend",
    [string]$ServiceName = "DigiconQMS"
)

$ErrorActionPreference = "Continue"

$exe = Join-Path $BackendPath "backend.exe"
$log = Join-Path $BackendPath "startup-error.log"

Write-Host "Servico:"
Get-Service -Name $ServiceName -ErrorAction SilentlyContinue | Format-List * | Out-String | Write-Host

Write-Host "Caminho registrado no Windows:"
Get-CimInstance Win32_Service -Filter "Name='$ServiceName'" |
    Select-Object Name, State, StartMode, PathName, StartName |
    Format-List | Out-String | Write-Host

Write-Host "Arquivos principais:"
Get-ChildItem $BackendPath -Filter "backend*" -ErrorAction SilentlyContinue |
    Select-Object Name, Length, LastWriteTime |
    Format-Table | Out-String | Write-Host

Write-Host "Porta 5081:"
netstat -ano | Select-String ":5081" | Out-String | Write-Host

if (Test-Path $log) {
    Write-Host "Ultimas linhas de startup-error.log:"
    Get-Content $log -Tail 80 | Out-String | Write-Host
}

if (Test-Path $exe) {
    Write-Host "Executando backend.exe por 15 segundos para capturar erro de console..."
    Push-Location $BackendPath
    $process = Start-Process -FilePath $exe -NoNewWindow -PassThru
    Start-Sleep -Seconds 15
    if (!$process.HasExited) {
        Write-Host "Processo ficou ativo. Encerrando teste de console..."
        Stop-Process -Id $process.Id -Force
    } else {
        Write-Host "Processo encerrou com codigo $($process.ExitCode)."
    }
    Pop-Location
} else {
    Write-Warning "backend.exe nao encontrado em $BackendPath"
}
