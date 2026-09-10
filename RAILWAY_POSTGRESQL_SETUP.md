# Configuración de PostgreSQL en Railway

## Pasos para configurar Cremoladas con PostgreSQL en Railway

### 1. Crear un Servicio PostgreSQL en Railway

1. Accede a tu proyecto en Railway: https://railway.app
2. En el proyecto "ingenious-commitment":
   - Click en "+ Create" (botón azul)
   - Selecciona "Database"
   - Elige "PostgreSQL"
   - Espera a que Railway cree la base de datos

### 2. Conectar la Base de Datos al Backend

Una vez PostgreSQL esté listo:

1. En Railway, ve al servicio de tu aplicación backend
2. En "Variables" (tab), añade estas variables de entorno:
   - `DB_HOST`: (Railway lo proporciona en los detalles de PostgreSQL)
   - `DB_PORT`: 5432
   - `DB_NAME`: (el nombre de tu base de datos - por defecto "railway")
   - `DB_USER`: (el usuario de PostgreSQL - por defecto "postgres")
   - `DB_PASSWORD`: (la contraseña - Railway la genera automáticamente)

   **O mejor aún**, Railway vincula automáticamente los servicios. Solo asegúrate de que:
   - El servicio PostgreSQL está en el mismo proyecto
   - Las variables se establecen automáticamente con el prefijo `DATABASE_*`

### 3. Configurar las Variables de Entorno

En Railway, en tu aplicación backend, configura:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=tu-secreto-muy-seguro-aqui-cambiar
JWT_EXPIRES_IN=7d
DB_HOST=your-postgresql-host.railway.internal
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=tu-password-aqui
FRONTEND_URL=https://tu-dominio.com
```

### 4. Deploy Automático

Railway detectará cambios en GitHub y hará deploy automático. El comando de inicio en `railway.toml` ejecutará:

```bash
cd backend && npm install && npm run init-db && npm run seed && npm start
```

Esto:
- Instala dependencias
- Crea las tablas
- Inserta datos iniciales (usuario admin, productos, sabores)
- Inicia el servidor

### 5. Verificar que el Deploy Fue Exitoso

En Railway:
- Ve a "Deployments"
- Busca el último deployment
- Si está en verde ✓, el deploy fue exitoso
- Si está rojo ✗, haz click para ver los logs y diagnosticar el problema

Busca estas líneas en los logs:

```
✓ PostgreSQL conectado: postgres@host:5432/railway
✓ Tablas creadas
✓ Base de datos inicializada
✓ 7 usuarios creados
✓ 3 productos creados
✓ 22 sabores creados

╔══════════════════════════════════════╗
║   CREMOLADAS MANAGER                 ║
╠══════════════════════════════════════╣
║  Puerto  : 3000                       ║
║  Entorno : production                 ║
╚══════════════════════════════════════╝
```

### 6. Problemas Comunes

**Problema**: "Base de datos no inicializada"
- **Solución**: Revisa que las variables `DB_*` estén configuradas correctamente

**Problema**: "npm install falla"
- **Solución**: Asegúrate de que `backend/package.json` tiene el flag `"type": "module"`

**Problema**: "ECONNREFUSED - conexión rechazada"
- **Solución**: El host de PostgreSQL debe usar `.railway.internal` en Railway

**Problema**: "Tablas no se crean"
- **Solución**: Revisa los logs. Si hay error en `npm run init-db`, verifica la sintaxis SQL (PostgreSQL usa `$1, $2` no `?`)

### 7. Credenciales Iniciales

Después del primer deploy exitoso, puedes login con:

- **Email**: admin@cremoladas.com
- **Contraseña**: admin123

**IMPORTANTE**: Cambia esta contraseña en producción inmediatamente.

### 8. Cambios Realizados en la Migración

Este proyecto ha sido migrado de SQLite a PostgreSQL:

**Cambios de dependencias**:
- Removido: `sql.js`, `better-sqlite3`
- Añadido: `pg` (PostgreSQL Node.js driver)

**Cambios en código**:
- `backend/config/database.js`: Ahora usa PostgreSQL Pool
- `backend/models/*.js`: Queries ahora son asincrónicas
- `backend/controllers/*.js`: Todos usan `await` para queries
- `backend/scripts/initDatabase.js`: Ahora es asincrónico
- `backend/scripts/seed.js`: Ahora es asincrónico
- SQL syntax: Cambio de `?` a `$1, $2, $3` (parámetros PostgreSQL)
- Timestamps: Cambio de `datetime('now')` a `NOW()`

### 9. Variables de Entorno por Ambiente

**Desarrollo Local**:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cremoladas
DB_USER=postgres
DB_PASSWORD=postgres
NODE_ENV=development
```

**Production (Railway)**:
```
DB_HOST=your-db.railway.internal  (Railway lo proporciona)
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=tu-password-secure
NODE_ENV=production
```

## Comandos Útiles

### Desarrollo Local con PostgreSQL

```bash
# Instalar dependencias
cd backend
npm install

# Crear la base de datos (primero crea manualmente en PostgreSQL)
npm run init-db

# Insertar datos iniciales
npm run seed

# Iniciar en modo desarrollo
npm run dev

# Iniciar en modo producción
npm start
```

### Limpiar y Resetear (Desarrollo)

```bash
npm run reset  # Elimina y recrea todas las tablas
npm run seed   # Reinsertar datos iniciales
```

---

**Documento generado**: 2024
**Compatibilidad**: Node.js 18+ / PostgreSQL 12+
