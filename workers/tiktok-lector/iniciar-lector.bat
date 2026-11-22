@echo off
title Angeles en el Cielo - Lector TikTok LIVE
cd /d "%~dp0"

if not exist ".env" (
  echo Falta el archivo .env en esta carpeta.
  echo Copia .env.example a .env y configura LIVE_API_URL y LIVE_INGEST_SECRET.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Instalando dependencias del lector por primera vez...
  call npm install
  if errorlevel 1 (
    echo Error instalando dependencias.
    pause
    exit /b 1
  )
)

echo Iniciando lector de chat en modo solo lectura...
node index.mjs
pause
