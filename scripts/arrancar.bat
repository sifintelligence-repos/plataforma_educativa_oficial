@echo off
cd /d "%~dp0.."
where node >nul 2>&1
if errorlevel 1 (
  echo Instala Node.js 22 o mas nuevo: https://nodejs.org
  exit /b 1
)
for /f "tokens=1 delims=." %%a in ('node -p "process.versions.node"') do set MAJOR=%%a
if %MAJOR% LSS 22 (
  echo Hace falta Node.js 22 o mas nuevo.
  node -v
  exit /b 1
)
call npm install
if errorlevel 1 exit /b 1
echo.
echo Campus en http://localhost:8080
echo Para entrar como CEO, crea la cuenta con direccion.sif@gmail.com
call npm run dev
