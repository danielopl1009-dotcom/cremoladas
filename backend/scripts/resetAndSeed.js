/**
 * Script de reset completo: elimina la BD existente y la recrea.
 * Útil durante desarrollo para aplicar cambios de esquema.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR  = path.join(__dirname, '..', 'data');

// Eliminar carpeta de datos
if (fs.existsSync(DB_DIR)) {
  fs.rmSync(DB_DIR, { recursive: true, force: true });
  console.log('✓ Base de datos anterior eliminada');
}

// Re-importar y ejecutar init + seed
const { default: initModule } = await import('./initDatabase.js?bust=' + Date.now());
