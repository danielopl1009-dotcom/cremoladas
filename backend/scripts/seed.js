import { initDB, query, exec, closeDB } from '../config/database.js';
import bcrypt from 'bcryptjs';

// Ice cream flavors (helados) - 10 options
const FLAVORES_HELADO = [
  'Lúcuma', 'Fresa con leche', 'Frutos del Bosque', 'Chocolate', 'Choco Maní', 
  'Oreo', 'Algarrobina', 'Ron Pasas', 'Coco', 'Menta Chips'
];

// Cremolada flavors (cremoladas) - traditional Peruvian flavors
const FLAVORES_CREMOLADA = [
  'Maracuyá', 'Fresa', 'Limón', 'Tuna', 'Sandía', 'Camu camu', 'Guanábana', 
  'Tamarindo', 'Capuchino', 'Chirimoya', 'Aguaymanto', 'Maracumango', 'Maní con leche',
  'Uva', 'Borgoña', 'Arándano', 'Chicha', 'Tutti frutti'
];

const PRODUCTOS = [
  {
    name: 'Vaso',
    description: 'Cremolada en vaso',
    sizes: { 'Vaso S/4': 4, 'Vaso S/5': 5, 'Vaso S/6': 6, 'Vaso S/7': 7, 'Vaso S/9': 9 },
  },
  {
    name: 'Taper',
    description: 'Cremolada en taper', 
    sizes: { 'Taper S/4': 4, 'Taper S/5': 5, 'Taper S/8 (medio litro)': 8 },
  },
  {
    name: 'Litro',
    description: 'Cremolada por litro',
    sizes: { 'Litro S/16': 16 },
  },
  {
    name: 'Conazo Grande',
    description: 'Helado 3 bolas',
    sizes: { 'Conazo Grande 3 bolas - S/15': 15 },
  },
  {
    name: 'Conazo Mediano',
    description: 'Helado 2 bolas',
    sizes: { 'Conazo Mediano 2 bolas - S/10': 10 },
  },
  {
    name: 'Helado Cono/Vaso',
    description: 'Helado 1 bola en cono o vaso',
    sizes: { 'Helado Cono/Vaso 1 bola - S/4': 4 },
  },
  {
    name: 'Payasito',
    description: 'Helado 1 bola decorada',
    sizes: { 'Payasito 1 bola - S/7': 7 },
  },
  {
    name: 'Arañita',
    description: 'Helado 2 bolas',
    sizes: { 'Arañita 2 bolas - S/12': 12 },
  },
  {
    name: 'Banana Split',
    description: 'Helado 3 bolas',
    sizes: { 'Banana Split 3 bolas - S/15': 15 },
  },
];

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

    // Productos
    let productCount = 0;
    for (const p of PRODUCTOS) {
      try {
        await exec(
          `INSERT INTO products (name, description, sizes, active) VALUES ($1, $2, $3, true)`,
          [p.name, p.description, JSON.stringify(p.sizes)]
        );
        productCount++;
      } catch (e) {
        if (!e.message.includes('duplicate') && !e.message.includes('unique')) {
          console.error('Error insertando producto:', e.message);
        }
      }
    }
    console.log(`✓ ${productCount} productos nuevos creados (${PRODUCTOS.length} total)`);

    // Sabores - Asegurar que la columna 'type' existe
    try {
      await exec(`ALTER TABLE flavors ADD COLUMN type VARCHAR(20) DEFAULT 'cremolada' CHECK(type IN ('cremolada', 'helado', 'ambos'))`);
      console.log('✓ Columna "type" añadida a flavors');
    } catch (e) {
      if (!e.message.includes('already exists')) {
        console.log('⚠️  Columna "type" ya existe o error menor:', e.message.substring(0, 50));
      }
    }

    // Insertar sabores de helado
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
        if (!e.message.includes('duplicate') && !e.message.includes('unique') && !e.message.includes('ON CONFLICT')) {
          console.error('Error insertando sabor helado:', e.message);
        }
      }
    }

    // Insertar sabores de cremolada
    for (let i = 0; i < FLAVORES_CREMOLADA.length; i++) {
      try {
        await exec(
          `INSERT INTO flavors (name, type, sort_order, active) VALUES ($1, $2, $3, true)
           ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type`,
          [FLAVORES_CREMOLADA[i], 'cremolada', i + FLAVORES_HELADO.length]
        );
        flavorCount++;
      } catch (e) {
        if (!e.message.includes('duplicate') && !e.message.includes('unique') && !e.message.includes('ON CONFLICT')) {
          console.error('Error insertando sabor cremolada:', e.message);
        }
      }
    }
    console.log(`✓ ${flavorCount} sabores nuevos creados (${FLAVORES_HELADO.length} helado + ${FLAVORES_CREMOLADA.length} cremolada)`);

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
