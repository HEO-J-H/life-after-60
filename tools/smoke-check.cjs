/**
 * Static smoke checks (no browser). Run: node tools/smoke-check.cjs
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');

function walkJs(dir, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '.git' || e.name === 'node_modules') continue;
      walkJs(p, acc);
    } else if (e.isFile() && e.name.endsWith('.js')) acc.push(p);
  }
  return acc;
}

const jsFiles = walkJs(root);
if (!jsFiles.length) {
  console.error('No .js files found under', root);
  process.exit(1);
}
for (const f of jsFiles) {
  console.log('node --check', path.relative(root, f));
  execSync(`node --check "${f}"`, { stdio: 'inherit', shell: true });
}

const idx = path.join(root, 'index.html');
if (!fs.existsSync(idx)) {
  console.error('Missing index.html');
  process.exit(1);
}
const html = fs.readFileSync(idx, 'utf8');
if (!html.includes('regulatory-reference.js')) {
  console.error('index.html must load regulatory-reference.js');
  process.exit(1);
}
if (!html.includes('id="main-tabs"')) {
  console.error('expected #main-tabs in index.html');
  process.exit(1);
}

const idRe = /\bid="([^"]+)"/g;
const seen = new Map();
let m;
while ((m = idRe.exec(html)) !== null) {
  const id = m[1];
  if (id.includes('${')) continue;
  seen.set(id, (seen.get(id) || 0) + 1);
}
const dups = [...seen.entries()].filter(([, c]) => c > 1);
if (dups.length) {
  console.error('Duplicate static id= in index.html:', dups);
  process.exit(1);
}

console.log('smoke-check OK (' + jsFiles.length + ' JS file(s))');
