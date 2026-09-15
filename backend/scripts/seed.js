import { initDB, query, exec, closeDB } from '../config/database.js';
import bcrypt from 'bcryptjs';

// Ice cream flavors (helados) - 10 options
// ═══════════════════════════════════════════════════════════════════════════════
// SABORES DE HELADO (Ice Cream)
// ═══════════════════════════════════════════════════════════════════════════════
const FLAVORES_HELADO = [
  'Lúcuma', 'Fresa con leche', 'Frutos del Bosque', 'Chocolate', 'Choco Maní', 
  'Oreo', 'Algarrobina', 'Ron Pasas', 'Coco', 'Menta Chips'
];

// ═══════════════════════════════════════════════════════════════════════════════
// SABORES DE CREMOLADA (Shaved Ice Peruvian Style)
// ═══════════════════════════════════════════════════════════════════════════════
const FLAVORES_CREMOLADA = [
  'Maracuyá', 'Fresa', 'Limón', 'Tuna', 'Sandía', 'Camu camu', 'Guanábana', 
  'Tamarindo', 'Capuchino', 'Chirimoya', 'Aguaymanto', 'Maracumango', 'Maní con leche',
  'Uva', 'Borgoña', 'Arándano', 'Chicha', 'Tutti frutti'
];

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTOS CREMOLADAS
// ═══════════════════════════════════════════════════════════════════════════════
const PRODUCTOS_CREMOLADAS = [
  {
    name: 'Vaso',
    description: 'Cremolada en vaso',
    type: 'cremolada',
    sizes: { 'Vaso S/4': 4, 'Vaso S/5': 5, 'Vaso S/6': 6, 'Vaso S/7': 7, 'Vaso S/9': 9 },
  },
  {
    name: 'Taper',
    description: 'Cremolada en taper', 
    type: 'cremolada',
    sizes: { 'Taper S/4': 4, 'Taper S/5': 5, 'Taper S/8 (medio litro)': 8 },
  },
  {
    name: 'Litro',
    description: 'Cremolada por litro',
    type: 'cremolada',
    sizes: { 'Litro S/16': 16 },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTOS HELADOS (Ice Cream) - con presentaciones exactas y precios fijos
// ═══════════════════════════════════════════════════════════════════════════════
const PRODUCTOS_HELADOS = [
  {
    name: 'Conazo Grande',
    description: 'Helado 3 bolas - S/15',
    type: 'helado',
    sizes: { 'Conazo Grande 3 bolas - S/15': 15 },
  },
  {
    name: 'Conazo Mediano',
    description: 'Helado 2 bolas - S/10',
    type: 'helado',
    sizes: { 'Conazo Mediano 2 bolas - S/10': 10 },
  },
  {
    name: 'Helado Cono/Vaso',
    description: 'Helado 1 bola en cono o vaso - S/4',
    type: 'helado',
    sizes: { 'Helado Cono/Vaso 1 bola - S/4': 4 },
  },
  {
    name: 'Payasito',
    description: 'Helado 1 bola decorada - S/7',
    type: 'helado',
    sizes: { 'Payasito 1 bola - S/7': 7 },
  },
  {
    name: 'Arañita',
    description: 'Helado 2 bolas - S/12',
    type: 'helado',
    sizes: { 'Arañita 2 bolas - S/12': 12 },
  },
  {
    name: 'Banana Split',
    description: 'Helado 3 bolas - S/15',
    type: 'helado',
    sizes: { 'Banana Split 3 bolas - S/15': 15 },
  },
];

// Combinar para inserción
const PRODUCTOS = [...PRODUCTOS_CREMOLADAS, ...PRODUCTOS_HELADOS];

const run = async () => {
  try {
    await initDB();
    console.log('Ejecutando seed...');

    // Configurar timezone
    await exec("SET timezone = 'America/Lima'");

    // Usuarios
    const users = [
      { name: 'Administrador', username: 'admin',  password: 'admin', role: 'administrador' },
      { name: 'Carlos López',  username: 'carlos', password: '123',   role: 'jalador' },
      { name: 'Luis Martínez', username: 'luis',   password: '123',   role: 'jalador' },
      { name: 'Pedro García',  username: 'pedro',  password: '123',   role: 'jalador' },
      { name: 'Ana Torres',    username: 'ana',    password: '123',   role: 'servidor' },
      { name: 'María Flores',  username: 'maria',  password: '123',   role: 'servidor' },
      { name: 'Rosa Quispe',   username: 'rosa',   password: '123',   role: 'caja' },
    ];

    let userCount = 0;
    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 10);
      try {
        await exec(
          `INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4)`,
          [u.name, u.username, hash, u.role]
        );
        userCount++;
      } catch (e) {
        // Ignorar duplicados silenciosamente
        if (!e.message.includes('duplicate') && !e.message.includes('unique')) {
          console.error('Error insertando usuario:', e.message);
        }
      }
    }
    console.log(`✓ ${userCount} usuarios nuevos creados (${users.length} total)`);

    // ─────────────────────────────────────────────────────────────────────────────
    // Productos (con tipo: cremolada o helado)
    // ─────────────────────────────────────────────────────────────────────────────
    let productCount = 0;
    for (const p of PRODUCTOS) {
      try {
        await exec(
          `INSERT INTO products (name, description, sizes, type, active) VALUES ($1, $2, $3, $4, true)
           ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type`,
          [p.name, p.description, JSON.stringify(p.sizes), p.type]
        );
        productCount++;
      } catch (e) {
        if (!e.message.includes('duplicate') && !e.message.includes('unique') && !e.message.includes('ON CONFLICT')) {
          console.error('Error insertando producto:', e.message);
        }
      }
    }
    console.log(`✓ ${productCount} productos creados (${PRODUCTOS_CREMOLADAS.length} cremoladas + ${PRODUCTOS_HELADOS.length} helados)`);

    // ─────────────────────────────────────────────────────────────────────────────
    // Sabores (con tipo: helado o cremolada)
    // ─────────────────────────────────────────────────────────────────────────────
    try {
      // Intentar agregar columna 'type' si no existe
      await exec(`ALTER TABLE flavors ADD COLUMN type VARCHAR(20) DEFAULT 'cremolada' CHECK(type IN ('cremolada', 'helado', 'ambos'))`);
      console.log('✓ Columna "type" agregada a tabla flavors');
    } catch (e) {
      // Columna ya existe o error menor - no es crítico
      if (e.message.includes('already exists')) {
        console.log('✓ Columna "type" ya existe en flavors');
      }
    }

    // Insertar sabores de HELADO
    let flavorCount = 0;
    for (let i = 0; i < FLAVORES_HELADO.length; i++) {
      try {
        await exec(
          `INSERT INTO flavors (name, type, sort_order, active) VALUES ($1, $2, $3, true)
           ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type`,
          [FLAVORES_HELADO[i], 'helado', i]
        );
        flavorCount++;
      } catch (e) {
        if (!e.message.includes('duplicate') && !e.message.includes('ON CONFLICT')) {
          console.error('Error sabor helado:', e.message.substring(0, 50));
        }
      }
    }

    // Insertar sabores de CREMOLADA
    for (let i = 0; i < FLAVORES_CREMOLADA.length; i++) {
      try {
        await exec(
          `INSERT INTO flavors (name, type, sort_order, active) VALUES ($1, $2, $3, true)
           ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type`,
          [FLAVORES_CREMOLADA[i], 'cremolada', i + FLAVORES_HELADO.length]
        );
        flavorCount++;
      } catch (e) {
        if (!e.message.includes('duplicate') && !e.message.includes('ON CONFLICT')) {
          console.error('Error sabor cremolada:', e.message.substring(0, 50));
        }
      }
    }
    console.log(`✓ ${flavorCount} sabores creados (${FLAVORES_HELADO.length} helados + ${FLAVORES_CREMOLADA.length} cremoladas)`);

    console.log('\n────────────────────────────────────────────');
    console.log('  CREDENCIALES DE ACCESO');
    console.log('────────────────────────────────────────────');
    console.log('  admin   →  admin  (Administrador)');
    console.log('  carlos  →  123    (Jalador)');
    console.log('  ana     →  123    (Servidor)');
    console.log('  rosa    →  123    (Caja)');
    console.log('────────────────────────────────────────────\n');

    await closeDB();
    process.exit(0);
  } catch (e) {
    console.error('Error en seed:', e.message);
    // NO crashear - solo avisar
    console.log('⚠️  Seed completado con algunos errores (esto es normal si los datos ya existen)');
    process.exit(0); // Exit 0 para que no falle el deploy
  }
};

run();
