import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH   = path.join(__dirname, '..', 'cremoladas.db');

// Singleton — se inicializa una vez al arrancar el servidor
let _db = null;

export const initDB = () => {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  console.log('✓ SQLite listo:', DB_PATH);
  return _db;
};

export const getDB = () => {
  if (!_db) throw new Error('Base de datos no inicializada. Llama a initDB() primero.');
  return _db;
};

/**
 * Helper query — retorna un array de filas (mejor-sqlite3 es síncrono)
 */
export const query = (text, params = []) => {
  const db = getDB();
  try {
    const stmt = db.prepare(text);
    if (text.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(...params);
    } else {
      return stmt.run(...params);
    }
  } catch (err) {
    console.error('Query error:', text, params, err);
    throw err;
  }
};

/**
 * Transacción — síncrona
 */
export const transaction = (callback) => {
  const db = getDB();
  const tx = db.transaction(() => callback(db));
  return tx();
};

export default { initDB, getDB, query, transaction };
