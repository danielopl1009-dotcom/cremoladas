@echo off
setlocal enabledelayedexpansion

echo === CAMBIAR A NUEVA CUENTA DE GIT ===
echo.

echo 1. Configurando nueva cuenta...
git config --global user.name "Daniel OPL"
git config --global user.email "danielopl1009@gmail.com"

echo 2. Eliminando remote anterior...
git remote remove origin

echo 3. Agregando nuevo remote...
git remote add origin https://github.com/danielopl1009-dotcom/cremoladas.git

echo 4. Subiendo a tu nueva cuenta en GitHub...
git push -u origin main

echo.
echo === COMPLETADO ===
echo Tu proyecto está en: https://github.com/danielopl1009-dotcom/cremoladas
echo.
pause