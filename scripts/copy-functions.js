import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Créer le dossier functions dans build/client
const functionsDir = join(rootDir, 'build', 'client', 'functions');
mkdirSync(functionsDir, { recursive: true });

// Copier build/server dans build/client pour que les fonctions puissent l'importer
const serverSource = join(rootDir, 'build', 'server');
const serverDest = join(rootDir, 'build', 'client', 'build', 'server');
cpSync(serverSource, serverDest, { recursive: true });

// Copier le fichier functions avec le bon chemin d'import
const sourceFile = join(rootDir, 'functions', '[[path]].ts');
const destFile = join(functionsDir, '[[path]].ts');

let content = readFileSync(sourceFile, 'utf-8');
// Corriger le chemin d'import pour qu'il pointe vers ../build/server/index.js depuis build/client/functions
// Gérer les deux formats possibles: '../build/server' et '../build/server/index.js'
content = content.replace(
  /from ['"]\.\.\/build\/server['"]/,
  "from '../build/server/index.js'"
);
content = content.replace(
  /from ['"]\.\.\/build\/server\/index\.js['"]/,
  "from '../build/server/index.js'"
);

writeFileSync(destFile, content, 'utf-8');

console.log('✅ Functions and server build copied to build/client/');

