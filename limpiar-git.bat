@echo off
echo === LIMPIANDO CREDENCIALES DE GIT ===
echo.

REM Limpiar config global
echo Borrando configuración global...
git config --global --unset user.name
git config --global --unset user.email
git config --global --unset credential.helper

REM Limpiar credenciales guardadas en Windows
echo Borrando credenciales guardadas de Windows...
cmdkey /delete:git:https://github.com
cmdkey /delete:https://github.com

REM Mostrar config actual
echo.
echo === CONFIGURACIÓN ACTUAL ===
git config --global --list

echo.
echo ✓ Credenciales limpias!
pause