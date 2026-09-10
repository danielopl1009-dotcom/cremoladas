@echo off
setlocal enabledelayedexpansion

echo === CONFIGURANDO GIT Y SUBIENDO A GITHUB ===
echo.

echo 1. Configurando Git...
git config --global user.name "Sistema Cremoladas"
git config --global user.email "admin@cremoladas.com"

echo 2. Inicializando repositorio...
git init

echo 3. Agregando todos los archivos...
git add .

echo 4. Creando commit inicial...
git commit -m "Initial commit: Sistema de Cremoladas con SQLite - Listo para Railway"

echo 5. Renombrando rama a main...
git branch -M main

echo 6. Agregando remote origin...
git remote add origin https://github.com/danielbadillo0809-source/CREMOLADAS.git

echo 7. Subiendo a GitHub...
git push -u origin main

echo.
echo === COMPLETADO ===
echo Tu proyecto está en GitHub!
echo.
echo PRÓXIMO PASO: Ve a https://railway.app
echo 1. Conecta con GitHub
echo 2. Crea nuevo proyecto
echo 3. Selecciona el repositorio CREMOLADAS
echo 4. Railway hará el deploy automáticamente
echo.
pause