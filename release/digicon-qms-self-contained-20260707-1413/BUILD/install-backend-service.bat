@echo off
setlocal enableextensions

rem Execute como Administrador.
set SERVICE_NAME=DigiconQMS
set INSTALL_DIR=C:\digicon-qms
set BACKEND_EXE=%INSTALL_DIR%\backend\backend.exe
set PORT=5081
set BIND_ADDR=0.0.0.0
set URL=http://%BIND_ADDR%:%PORT%
set CONTENT_ROOT=%INSTALL_DIR%\backend

if not exist "%BACKEND_EXE%" (
  echo ERRO: backend.exe nao encontrado em "%BACKEND_EXE%"
  echo Copie a pasta backend deste pacote para %INSTALL_DIR%\backend antes de instalar.
  exit /b 1
)

echo Instalando servico "%SERVICE_NAME%"...
sc.exe query "%SERVICE_NAME%" >nul 2>&1
if %errorlevel%==0 (
  echo Servico existente encontrado. Removendo...
  sc.exe stop "%SERVICE_NAME%" >nul 2>&1
  sc.exe delete "%SERVICE_NAME%" >nul 2>&1
  timeout /t 2 /nobreak >nul
)

set BINPATH="\"%BACKEND_EXE%\" --contentRoot \"%CONTENT_ROOT%\" --urls %URL%"

sc.exe create "%SERVICE_NAME%" binPath= %BINPATH% start= auto
if errorlevel 1 (
  echo ERRO: falha ao criar o servico.
  exit /b 1
)

sc.exe description "%SERVICE_NAME%" "Digicon QMS"
sc.exe failure "%SERVICE_NAME%" reset= 0 actions= restart/60000

echo Configurando regra de firewall para a porta %PORT%...
netsh advfirewall firewall delete rule name="Digicon QMS" >nul 2>&1
netsh advfirewall firewall add rule name="Digicon QMS" dir=in action=allow protocol=TCP localport=%PORT%

echo Iniciando servico...
sc.exe start "%SERVICE_NAME%"
if errorlevel 1 (
  echo ERRO: falha ao iniciar o servico.
  exit /b 1
)

echo Concluido.
echo Servico: %SERVICE_NAME%
echo URL: %URL%
exit /b 0
