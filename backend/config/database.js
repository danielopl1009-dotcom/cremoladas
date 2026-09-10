import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR    = path.join(__dirname, '..', 'data');
const DB_PATH   = path.join(DB_DIR, 'cremoladas');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

// Singleton — se inicializa una vez al arrancar el servidor
let _db = null;

export const initDB = async () => {
  if (_db) return _db;
  _db = new PGlite(DB_PATH);
  await _db.waitReady;
  console.log('✓ PGlite (PostgreSQL WASM) listo:', DB_PATH);
  return _db;
};

export const getDB = () => {
  if (!_db) throw new Error('Base de datos no inicializada. Llama a initDB() primero.');
  return _db;
};

/**
 * Helper query — misma firma que antes: query(text, params)
 * Retorna { rows, rowCount }
 */
export const query = async (text, params = []) => {
  const db = getDB();
  const result = await db.query(text, params);
  return { rows: result.rows, rowCount: result.rows.length };
};

/**
 * Transacción — callback recibe el objeto db
 */
export const transaction = async (callback) => {
  const db = getDB();
  return db.transaction(() => callback(db));
};

export default { initDB, getDB, query, transaction };
