import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let _pool = null;

/**
 * Inicializar el pool de conexiones PostgreSQL
 */
export const initDB = async () => {
  if (_pool) return _pool;

  // Debug: Ver qué variables están disponibles
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);

  // Usar DATABASE_URL si está disponible (Render, Railway, etc.)
  if (process.env.DATABASE_URL) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    console.log('✓ PostgreSQL conectado usando DATABASE_URL');
  } else {
    // Fallback a variables individuales (desarrollo local)
    console.log('⚠️ DATABASE_URL no encontrada, usando variables individuales');
    const dbConfig = {
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      host:     process.env.DB_HOST     || 'localhost',
      port:     process.env.DB_PORT     || 5432,
      database: process.env.DB_NAME     || 'cremoladas',
    };
    _pool = new Pool(dbConfig);
    console.log('✓ PostgreSQL conectado:', `${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  }

  _pool.on('error', (err) => {
    console.error('Pool error:', err);
  });

  try {
    const client = await _pool.connect();
    await client.query('SELECT NOW()');
    client.release();
  } catch (err) {
    console.error('Error conectando a PostgreSQL:', err);
    throw err;
  }

  return _pool;
};

/**
 * Obtener el pool de conexiones
 */
export const getDB = () => {
  if (!_pool) throw new Error('Base de datos no inicializada. Llama a initDB() primero.');
  return _pool;
};

/**
 * Helper query — retorna un array de filas
 */
export const query = async (text, params = []) => {
  const pool = getDB();
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (err) {
    console.error('Query error:', text, params, err);
    throw err;
  }
};

/**
 * Ejecutar un query que retorna resultado (INSERT, UPDATE, DELETE)
 */
export const exec = async (text, params = []) => {
  const pool = getDB();
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err) {
    console.error('Exec error:', text, params, err);
    throw err;
  }
};

/**
 * Ejecutar múltiples queries en una transacción
 */
export const transaction = async (callback) => {
  const client = await getDB().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Cerrar el pool
 */
export const closeDB = async () => {
  if (_pool) {
    await _pool.end();
    _pool = null;
    console.log('✓ Pool de PostgreSQL cerrado');
  }
};

export default { initDB, getDB, query, exec, transaction, closeDB };
