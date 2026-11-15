import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('dist/index.html does not exist!');
  process.exit(1);
}

const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
console.log('Successfully read dist/index.html (' + html.length + ' bytes)');
if (!html.includes("Rusyaidan Qur'an Mastery")) {
  console.error('Title mismatch in index.html');
  process.exit(1);
}
console.log('Verified index.html contains Rusyaidan Quran Mastery title');
console.log('Static build validation passed!');
