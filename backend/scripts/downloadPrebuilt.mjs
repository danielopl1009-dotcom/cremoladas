import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// URL del prebuild: better-sqlite3 v11.10.0, Node ABI 137 (v24), win32, x64
const VERSION = 'v11.10.0';
const FILENAME = `better-sqlite3-${VERSION}-node-v137-win32-x64.tar.gz`;
const URL = `https://github.com/WiseLibs/better-sqlite3/releases/download/${VERSION}/${FILENAME}`;
const DEST = path.join(__dirname, FILENAME);

const download = (url, dest) => new Promise((resolve, reject) => {
  const file = fs.createWriteStream(dest);
  const get = (u) => {
    https.get(u, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        get(res.headers.location);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} para ${u}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  };
  get(url);
});

console.log(`Descargando ${FILENAME}...`);
try {
  await download(URL, DEST);
  console.log('✓ Descargado');

  // Extraer en node_modules/better-sqlite3/prebuilds/
  const prebuildDir = path.join(__dirname, '..', 'node_modules', 'better-sqlite3', 'prebuilds', 'win32-x64');
  fs.mkdirSync(prebuildDir, { recursive: true });

  // Usar tar de Windows (disponible en Win 10+)
  execSync(`tar -xzf "${DEST}" -C "${path.join(__dirname, '..', 'node_modules', 'better-sqlite3')}"`, { stdio: 'inherit' });
  console.log('✓ Extraído');

  fs.unlinkSync(DEST);
  console.log('✓ Listo. better-sqlite3 instalado con prebuild.');
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
