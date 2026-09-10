# Guía de instalación paso a paso

## 1. Instalar Node.js (si no lo tienes)

Descarga desde: https://nodejs.org (versión LTS recomendada)

Verifica la instalación:
```
node --version   # debe mostrar v18 o superior
npm --version
```

## 2. Instalar PostgreSQL (si no lo tienes)

Descarga desde: https://www.postgresql.org/download/windows/

Durante la instalación:
- Anota el puerto (por defecto 5432)
- Anota la contraseña del usuario `postgres`

## 3. Crear la base de datos

Abre **pgAdmin** o **psql** y ejecuta:
```sql
CREATE DATABASE cremoladas_db;
```

## 4. Configurar el backend

Abre el archivo `backend\.env` y cambia la contraseña de PostgreSQL:
```
DB_PASSWORD=TU_CONTRASEÑA_POSTGRES
```

## 5. Abrir dos terminales en esta carpeta

### Terminal 1 — Instalar y preparar el backend:
```bash
cd backend
npm install
node scripts/initDatabase.js
node scripts/seed.js
npm run dev
```

### Terminal 2 — Instalar y arrancar el frontend:
```bash
cd frontend
npm install
npm run dev
```

## 6. Abrir en el navegador

Ir a: **http://localhost:5173**

### Credenciales de prueba:
| Email | Password | Rol |
|-------|----------|-----|
| admin@cremoladas.com | admin123 | Administrador |
| carlos@cremoladas.com | 123456 | Jalador |
| ana@cremoladas.com | 123456 | Servidor |
| jose@cremoladas.com | 123456 | Entregador |

---

## Solución de problemas comunes

**"npm no se reconoce"**  
→ Instala Node.js y abre una terminal nueva después de instalarlo.

**"Error de conexión a base de datos"**  
→ Verifica que PostgreSQL esté corriendo y que la contraseña en `backend/.env` sea correcta.

**"Puerto 3000 ocupado"**  
→ Cambia `PORT=3001` en `backend/.env` y `VITE_API_URL=http://localhost:3001/api` en `frontend/.env`.
