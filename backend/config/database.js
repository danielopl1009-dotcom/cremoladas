import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH   = path.join(__dirname, '..', 'cremoladas.db');

let _db = null;
let SQL = null;

export const initDB = async () => {
  if (_db) return _db;
  
  SQL = await initSqlJs();
  
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(buffer);
  } else {
    _db = new SQL.Database();
  }
  
  console.log('✓ SQLite (sql.js) listo:', DB_PATH);
  return _db;
};

export const getDB = () => {
  if (!_db) throw new Error('Base de datos no inicializada. Llama a initDB() primero.');
  return _db;
};

export const saveDB = () => {
  if (!_db) return;
  const data = _db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
};

/**
 * Helper query — retorna un array de filas
 */
export const query = (text, params = []) => {
  const db = getDB();
  try {
    const stmt = db.prepare(text);
    stmt.bind(params);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    
    saveDB();
    return results;
  } catch (err) {
    console.error('Query error:', text, params, err);
    throw err;
  }
};

/**
 * Ejecutar statements sin retornar datos
 */
export const exec = (sql) => {
  const db = getDB();
  try {
    db.run(sql);
    saveDB();
  } catch (err) {
    console.error('Exec error:', sql, err);
    throw err;
  }
};

/**
 * Transacción
 */
export const transaction = (callback) => {
  const db = getDB();
  try {
    exec('BEGIN TRANSACTION');
    const result = callback(db);
    exec('COMMIT');
    saveDB();
    return result;
  } catch (err) {
    exec('ROLLBACK');
    throw err;
  }
};

export default { initDB, getDB, query, exec, transaction, saveDB };
