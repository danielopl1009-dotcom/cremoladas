# Sistema de Cremoladas

Sistema de gestión para negocio de cremoladas con roles de usuario, gestión de pedidos, inventario y pagos.

## Tecnologías

- **Backend**: Node.js, Express, SQLite, Socket.io
- **Frontend**: React, Vite, Tailwind CSS
- **Base de Datos**: SQLite (migrado desde PostgreSQL para facilitar despliegue)

## Instalación Local

### Prerrequisitos
- Node.js 18+
- Git

### Backend
```bash
cd backend
npm install
npm run init-db
npm run seed
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Despliegue en Railway

1. Conecta tu repositorio de GitHub a Railway
2. Railway detectará automáticamente el proyecto Node.js
3. Configura las variables de entorno necesarias
4. El build se ejecutará automáticamente

### Variables de Entorno (Railway)
```
NODE_ENV=production
JWT_SECRET=tu-jwt-secret-key-segura
PORT=3000
```

## Estructura del Proyecto

```
sistemas/
├── backend/          # API Node.js
│   ├── config/       # Configuración DB, Socket.io
│   ├── controllers/  # Lógica de negocio
│   ├── models/       # Modelos de datos SQLite
│   ├── routes/       # Rutas API
│   ├── scripts/      # Scripts de inicialización
│   └── server.js     # Punto de entrada
├── frontend/         # Interfaz React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
│   └── dist/         # Build de producción
└── README.md
```

## Credenciales por Defecto

- **Administrador**: admin@cremoladas.com / admin123
- **Jalador**: carlos@cremoladas.com / 123456
- **Servidor**: ana@cremoladas.com / 123456
- **Caja**: rosa@cremoladas.com / 123456

## Características

- ✅ Autenticación JWT
- ✅ Roles: Administrador, Jalador, Servidor, Caja
- ✅ Gestión de pedidos en tiempo real
- ✅ Inventario de productos y sabores
- ✅ Sistema de pagos (efectivo, Yape, Plin)
- ✅ Reportes y estadísticas
- ✅ Notificaciones en tiempo real
- ✅ Base de datos SQLite (fácil despliegue)