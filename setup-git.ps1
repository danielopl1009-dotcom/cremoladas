# Script para configurar Git y subir a GitHub
Write-Host "=== CONFIGURACIÓN DE GIT Y GITHUB ===" -ForegroundColor Green

# Inicializar Git
git init
Write-Host "✓ Git inicializado" -ForegroundColor Green

# Configurar Git (cambiar por tu información)
git config user.name "Sistema Cremoladas"
git config user.email "admin@cremoladas.com"

# Agregar archivos
git add .
Write-Host "✓ Archivos agregados" -ForegroundColor Green

# Commit inicial
git commit -m "Initial commit: Sistema de Cremoladas con SQLite"
Write-Host "✓ Commit inicial creado" -ForegroundColor Green

# Crear repositorio en GitHub
Write-Host "PASOS SIGUIENTES:" -ForegroundColor Yellow
Write-Host "1. Ve a https://github.com/new"
Write-Host "2. Crea un repositorio público llamado 'sistema-cremoladas'"
Write-Host "3. NO inicialices con README (ya existe)"
Write-Host "4. Copia la URL del repositorio y ejecuta:"
Write-Host ""
Write-Host "git remote add origin https://github.com/TU-USUARIO/sistema-cremoladas.git"
Write-Host "git branch -M main"
Write-Host "git push -u origin main"
Write-Host ""
Write-Host "5. Después ve a Railway.app para hacer el deploy"