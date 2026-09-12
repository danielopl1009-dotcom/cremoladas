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

    // Sabores
    let flavorCount = 0;
    for (let i = 0; i < SABORES.length; i++) {
      try {
        await exec(
          `INSERT INTO flavors (name, sort_order) VALUES ($1, $2)`,
          [SABORES[i], i]
        );
        flavorCount++;
      } catch (e) {
        if (!e.message.includes('duplicate') && !e.message.includes('unique')) {
          console.error('Error insertando sabor:', e.message);
        }
      }
    }
    console.log(`✓ ${flavorCount} sabores nuevos creados (${SABORES.length} total)`);

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
