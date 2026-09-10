import { initDB, query, exec, closeDB } from '../config/database.js';
import bcrypt from 'bcryptjs';

const SABORES = [
  'Lúcuma', 'Maracuyá', 'Fresa', 'Fresa con leche', 'Limón', 'Tuna', 
  'Sandía', 'Camu camu', 'Guanábana', 'Tamarindo', 'Coco', 'Algarrobina',
  'Capuchino', 'Chirimoya', 'Aguaymanto', 'Maracumango', 'Maní con leche',
  'Uva', 'Borgoña', 'Arándano', 'Chicha', 'Tutti frutti',
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
];

const run = async () => {
  try {
    await initDB();
    console.log('Ejecutando seed...');

    // Usuarios
    const users = [
      { name: 'Administrador', email: 'admin@cremoladas.com',  password: 'admin123', role: 'administrador' },
      { name: 'Carlos López',  email: 'carlos@cremoladas.com', password: '123456',   role: 'jalador' },
      { name: 'Luis Martínez', email: 'luis@cremoladas.com',   password: '123456',   role: 'jalador' },
      { name: 'Pedro García',  email: 'pedro@cremoladas.com',  password: '123456',   role: 'jalador' },
      { name: 'Ana Torres',    email: 'ana@cremoladas.com',    password: '123456',   role: 'servidor' },
      { name: 'María Flores',  email: 'maria@cremoladas.com',  password: '123456',   role: 'servidor' },
      { name: 'Rosa Quispe',   email: 'rosa@cremoladas.com',   password: '123456',   role: 'caja' },
    ];

    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 10);
      try {
        await exec(
          `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
          [u.name, u.email, hash, u.role]
        );
      } catch (e) {
        if (!e.message.includes('unique')) {
          throw e;
        }
      }
    }
    console.log(`✓ ${users.length} usuarios creados`);

    // Productos
    for (const p of PRODUCTOS) {
      try {
        await exec(
          `INSERT INTO products (name, description, sizes, active) VALUES ($1, $2, $3, true)`,
          [p.name, p.description, JSON.stringify(p.sizes)]
        );
      } catch (e) {
        if (!e.message.includes('unique')) {
          throw e;
        }
      }
    }
    console.log(`✓ ${PRODUCTOS.length} productos creados (Vaso, Taper, Litro)`);

    // Sabores
    for (let i = 0; i < SABORES.length; i++) {
      try {
        await exec(
          `INSERT INTO flavors (name, sort_order) VALUES ($1, $2)`,
          [SABORES[i], i]
        );
      } catch (e) {
        if (!e.message.includes('unique')) {
          throw e;
        }
      }
    }
    console.log(`✓ ${SABORES.length} sabores creados`);

    console.log('\n────────────────────────────────────────────');
    console.log('  CREDENCIALES DE ACCESO');
    console.log('────────────────────────────────────────────');
    console.log('  admin@cremoladas.com     →  admin123  (Administrador)');
    console.log('  carlos@cremoladas.com    →  123456    (Jalador)');
    console.log('  ana@cremoladas.com       →  123456    (Servidor)');
    console.log('  rosa@cremoladas.com      →  123456    (Caja)');
    console.log('────────────────────────────────────────────\n');

    await closeDB();
    process.exit(0);
  } catch (e) {
    console.error('Error en seed:', e);
    process.exit(1);
  }
};

run();
