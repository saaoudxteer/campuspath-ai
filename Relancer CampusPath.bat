@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo === Relancer CampusPath ===
echo.
echo Arret de l instance precedente...
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\stop-dev.ps1"
timeout /t 2 /nobreak >nul
echo.
echo Demarrage...
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\start-dev.ps1"
timeout /t 10 /nobreak >nul
start "" http://127.0.0.1:3000/
echo.
echo Ouvert sur http://127.0.0.1:3000
echo Logs : backend\data\runtime\dev.log
timeout /t 4 /nobreak >nul
