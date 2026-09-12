import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDB } from './config/database.js';
import { initializeSocket } from './config/socket.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Zona horaria Perú
process.env.TZ = 'America/Lima';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

import authRoutes    from './routes/authRoutes.js';
import orderRoutes   from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes    from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app    = express();
const server = createServer(app);
const PORT   = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// ── Seguridad ────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// CORS: en producción acepta cualquier origen (el frontend es el mismo servidor)
app.use(cors({
  origin: IS_PROD ? true : (process.env.FRONTEND_URL || 'http://localhost:5173'),
  credentials: true,
}));

app.use(compression({ level: 6, threshold: 1024 }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: '10mb' }));

// ── API ──────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users',    userRoutes);
app.use('/api',          paymentRoutes);
app.use('/uploads',      express.static(path.join(__dirname, 'uploads')));
app.get('/api/health',   (_, res) => res.json({ ok: true, uptime: process.uptime(), env: process.env.NODE_ENV }));

// ── Servir frontend en producción ────────────────────────────────────────────
const DIST = path.join(__dirname, '..', 'frontend', 'dist');
if (IS_PROD && fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  // Todas las rutas no-API devuelven index.html (SPA)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(DIST, 'index.html'));
    }
  });
  console.log('✓ Sirviendo frontend desde:', DIST);
}

app.use(notFound);
app.use(errorHandler);

// ── Arranque ─────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    const pool = await initDB();
    
    // Auto-seed si no hay productos
    const { rows } = await pool.query('SELECT COUNT(*) as count FROM products');
    if (parseInt(rows[0].count) === 0) {
      console.log('⚠️  No hay productos, ejecutando seed automático...');
      const { exec } = await import('./config/database.js');
      
      const PRODUCTOS = [
        { name: 'Vaso', description: 'Cremolada en vaso', sizes: { 'Vaso S/4': 4, 'Vaso S/5': 5, 'Vaso S/6': 6, 'Vaso S/7': 7, 'Vaso S/9': 9 } },
        { name: 'Taper', description: 'Cremolada en taper', sizes: { 'Taper S/4': 4, 'Taper S/5': 5, 'Taper S/8 (medio litro)': 8 } },
        { name: 'Litro', description: 'Cremolada por litro', sizes: { 'Litro S/16': 16 } },
      ];
      
      for (const p of PRODUCTOS) {
        await exec(
          `INSERT INTO products (name, description, sizes, active) VALUES ($1, $2, $3, true)`,
          [p.name, p.description, JSON.stringify(p.sizes)]
        );
      }
      console.log('✓ Productos insertados automáticamente');
    }
    
    initializeSocket(server);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔══════════════════════════════════════════╗
║   CREMOLADAS ANABEL                      ║
╠══════════════════════════════════════════╣
║  Puerto  : ${String(PORT).padEnd(30)} ║
║  Entorno : ${String(process.env.NODE_ENV || 'development').padEnd(30)} ║
╚══════════════════════════════════════════╝`);
    });
  } catch (err) {
    console.error('Error al iniciar:', err);
    process.exit(1);
  }
};

start();

process.on('uncaughtException',  e => { console.error(e); process.exit(1); });
process.on('unhandledRejection', e => { console.error(e); process.exit(1); });
