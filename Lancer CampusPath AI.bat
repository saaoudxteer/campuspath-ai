@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\start-dev.ps1"
timeout /t 8 /nobreak >nul
start "" http://127.0.0.1:3000/
