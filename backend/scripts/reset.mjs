import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.join(__dirname, '..', 'data');

if (fs.existsSync(DB_DIR)) {
  fs.rmSync(DB_DIR, { recursive: true, force: true });
  console.log('✓ BD anterior eliminada');
} else {
  console.log('Sin BD previa');
}

console.log('Inicializando BD...');
execSync(`"C:\\Program Files\\nodejs\\node.exe" scripts/initDatabase.js`, {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
});

console.log('Ejecutando seed...');
execSync(`"C:\\Program Files\\nodejs\\node.exe" scripts/seed.js`, {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
});

console.log('\n✓ Todo listo. Arranca el servidor con: node server.js');
