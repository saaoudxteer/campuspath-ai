@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo === Publication de CampusPath sur GitHub ===
echo.
echo Depot distant :
git remote get-url origin
echo.
echo Une fenetre de connexion GitHub peut apparaitre. Autorisez-la.
echo.
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Le push a echoue.
  echo Verifiez que le depot campuspath-ai existe bien sur votre compte GitHub,
  echo et que ce depot est vide, sans README ni licence.
) else (
  echo.
  echo Termine. Le code est en ligne.
)
echo.
pause
