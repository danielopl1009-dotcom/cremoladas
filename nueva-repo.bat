@echo off
cd /d c:\Users\dani\Documents\sistemas

echo === CREANDO NUEVO REPOSITORIO ===
echo.

REM Eliminar carpeta .git completamente
echo Eliminando repositorio viejo...
attrib -h -s .git
for /d %%x in (.git) do rmdir /s /q "%%x" 2>nul
del .git 2>nul

echo Configurando Git...
git config --global user.name "Daniel OPL"
git config --global user.email "danielopl1009@gmail.com"

echo Inicializando nuevo repositorio...
git init

echo Agregando todos los archivos...
git add .

echo Creando commit inicial...
git commit -m "Initial commit: Sistema de Cremoladas"

echo Renombrando rama a main...
git branch -M main

echo Agregando remote...
git remote add origin https://github.com/danielopl1009-dotcom/cremoladas.git

echo Subiendo a GitHub...
git push -u origin main

echo.
echo ✓ COMPLETADO!
echo Tu proyecto está en: https://github.com/danielopl1009-dotcom/cremoladas
echo.
pause