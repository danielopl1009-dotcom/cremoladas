@echo off
cd /d c:\Users\dani\Documents\sistemas

echo === CONFIGURANDO Y SUBIENDO A GITHUB ===
echo.

echo 1. Configurando Git...
git config --global user.name "Daniel OPL"
git config --global user.email "danielopl1009@gmail.com"

echo 2. Removiendo remote anterior...
git remote remove origin 2>nul

echo 3. Agregando nuevo remote...
git remote add origin https://github.com/danielopl1009-dotcom/cremoladas.git

echo 4. Subiendo a GitHub...
git push -u origin main

echo.
echo ✓ COMPLETADO!
echo Tu proyecto está en: https://github.com/danielopl1009-dotcom/cremoladas
echo.
pause