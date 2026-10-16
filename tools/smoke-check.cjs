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

// 로컬 src/href가 실제로 존재하는지 (배포 후 404 방지)
const refRe = /<(?:script|link)\b[^>]*?\b(?:src|href)="([^"]+)"/g;
const missing = [];
while ((m = refRe.exec(html)) !== null) {
  const ref = m[1];
  if (/^(?:[a-z]+:)?\/\//i.test(ref) || /^(?:data|mailto|javascript):/i.test(ref)) continue;
  if (ref.startsWith('/')) {
    missing.push(ref + ' (사이트 루트 절대경로 — GitHub Pages 하위 경로에서 404)');
    continue;
  }
  const rel = ref.split(/[?#]/)[0];
  if (!fs.existsSync(path.join(root, rel))) missing.push(ref);
}
if (missing.length) {
  console.error('Missing local assets referenced by index.html:', missing);
  process.exit(1);
}

// 인라인 <script> 문법 검사
const vm = require('vm');
const inlineRe = /<script\b(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
let n = 0;
while ((m = inlineRe.exec(html)) !== null) {
  if (/type="(?!text\/javascript|module)/i.test(m[1])) continue;
  n++;
  try {
    new vm.Script(m[2], { filename: 'index.html#inline' + n });
  } catch (e) {
    console.error('Inline script #' + n + ' syntax error:', e.message);
    process.exit(1);
  }
}

console.log('smoke-check OK (' + jsFiles.length + ' JS file(s), ' + n + ' inline script(s))');
