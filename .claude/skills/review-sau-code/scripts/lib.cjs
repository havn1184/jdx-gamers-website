// lib.cjs — helper dùng chung cho lessons/*.cjs (Website JGameApp). Interface check: { id, title, source, check(rootDir) -> FileResult[] }
const fs = require('node:fs');
const path = require('node:path');
function walk(dir, exts = ['.ts', '.tsx']) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (!['node_modules', 'dist', '.git', 'Docs'].includes(e.name)) out.push(...walk(full, exts)); }
    else if (exts.some((x) => e.name.endsWith(x)) && !/\.d\.ts$/.test(e.name)) out.push(full);
  }
  return out.sort();
}
const read = (p) => fs.readFileSync(p, 'utf8');
function stripComments(src) {
  let s = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  s = s.replace(/(^|[^:"'`])\/\/.*$/gm, (m, pre) => pre + ' '.repeat(m.length - pre.length));
  return s;
}
const lineOf = (src, idx) => src.slice(0, idx).split('\n').length;
const rel = (rootDir, f) => path.relative(rootDir, f).replace(/\\/g, '/');
function group(rootDir, issues) {
  const map = new Map();
  for (const i of issues) { const f = rel(rootDir, i.file); if (!map.has(f)) map.set(f, { file: f, issues: [] }); map.get(f).issues.push({ level: i.level, rule: i.rule, message: i.message, line: i.line }); }
  return [...map.values()];
}
/** Thư mục module JGameApp (Website/src/modules/JGameApp) tìm từ rootDir. */
function moduleRoot(rootDir) {
  let d = path.resolve(rootDir);
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(d, 'routes', 'routeConfig.tsx'))) return d;
    if (fs.existsSync(path.join(d, 'src', 'modules', 'JGameApp', 'routes', 'routeConfig.tsx'))) return path.join(d, 'src', 'modules', 'JGameApp');
    d = path.dirname(d);
  }
  return path.resolve(rootDir);
}
const inScope = (rootDir, f) => path.resolve(f).startsWith(path.resolve(rootDir));
module.exports = { fs, path, walk, read, stripComments, lineOf, rel, group, moduleRoot, inScope };
