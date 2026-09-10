# Desplegar en Railway

## Pasos para desplegar tu Sistema de Cremoladas en Railway (GRATIS)

### 1. Verificar que el código está en GitHub
```bash
git push -u origin main
```
✓ Verifica en: https://github.com/tu-usuario/CREMOLADAS

### 2. Ir a Railway
- Ve a https://railway.app
- Haz click en "Start Project"
- Selecciona "Deploy from GitHub Repo"
- Conecta tu cuenta de GitHub
- Selecciona el repositorio "CREMOLADAS"

### 3. Railway automáticamente:
- Detecta que es un proyecto Node.js
- Lee `nixpacks.toml`
- Instala dependencias
- Ejecuta `npm run init-db && npm run seed`
- Inicia el servidor

### 4. Variables de Entorno en Railway
En Railway, ve a "Variables":
```
NODE_ENV=production
JWT_SECRET=tu-secret-key-super-segura-aqui
FRONTEND_URL=https://tu-proyecto.railway.app
```

### 5. Tu aplicación estará en:
```
https://[project-name].railway.app
```

## Credenciales de Login

- Admin: admin@cremoladas.com / admin123
- Jalador: carlos@cremoladas.com / 123456
- Servidor: ana@cremoladas.com / 123456
- Caja: rosa@cremoladas.com / 123456

## Preguntas Frecuentes

### ¿Es realmente gratis?
Sí, Railway ofrece $5 USD de crédito gratis al mes (suficiente para pequeños proyectos).

### ¿Dónde se guarda la base de datos?
Railway proporciona un volumen persistente para `/app/backend/cremoladas.db`

### ¿Cómo accedo a la base de datos en producción?
Railway mantiene la BD dentro del contenedor. Para respaldar datos, usa Railway's CLI:
```bash
railway run sqlite3 cremoladas.db ".dump" > backup.sql
```

### ¿Qué pasa con los uploads de fotos?
Se guardan en `/app/backend/uploads` (volumen persistente de Railway)

## Comando para conectar Railway localmente
```bash
npm install -g @railway/cli
railway link
railway run npm start
```