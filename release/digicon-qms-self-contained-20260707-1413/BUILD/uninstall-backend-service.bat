@echo off
setlocal enableextensions

rem Execute como Administrador.
set SERVICE_NAME=DigiconQMS

sc.exe query "%SERVICE_NAME%" >nul 2>&1
if not %errorlevel%==0 (
  echo Servico "%SERVICE_NAME%" nao encontrado.
  exit /b 0
)

echo Parando servico "%SERVICE_NAME%"...
sc.exe stop "%SERVICE_NAME%" >nul 2>&1
timeout /t 2 /nobreak >nul

echo Removendo servico "%SERVICE_NAME%"...
sc.exe delete "%SERVICE_NAME%"
if errorlevel 1 (
  echo ERRO: falha ao remover o servico.
  exit /b 1
)

echo Removendo regra de firewall...
netsh advfirewall firewall delete rule name="Digicon QMS" >nul 2>&1

echo Concluido.
exit /b 0
