/**
 * B1: Phân tích dependencies của 1 portal vào src/shared
 * 
 * Cách dùng:
 *   node .claude/skills/cach-refactor-kien-truc-doc-lap/scripts/analyze-deps.cjs <PortalPath>
 * 
 * VD: node .../analyze-deps.cjs src/modules/KiemThuApp
 * 
 * Kết quả: in ra danh sách tất cả file trong src/shared mà portal sử dụng
 */

const fs = require('fs');
const path = require('path');

// ── CLI args ──
const portalArg = process.argv[2];
if (!portalArg) {
  console.error('Usage: node analyze-deps.cjs <PortalPath>');
  console.error('  PortalPath: đường dẫn tương đối từ project root, VD: src/modules/KiemThuApp');
  process.exit(1);
}

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const PORTAL_ROOT = path.resolve(PROJECT_ROOT, portalArg);
const SHARED_ROOT = path.join(PROJECT_ROOT, 'src/shared');

if (!fs.existsSync(PORTAL_ROOT)) { console.error('Portal không tồn tại: ' + PORTAL_ROOT); process.exit(1); }

// ── Walk portal, tìm @/shared/ imports ──
function walkDir(dir) {
  const results = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) { if (!['node_modules','.git','docs'].includes(item.name)) results.push(...walkDir(full)); }
    else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) results.push(full);
  }
  return results;
}

function findSharedImports(filePath) {
  const imports = new Set();
  for (const line of fs.readFileSync(filePath,'utf8').split('\n')) {
    const m = line.match(/from\s+['"](@\/shared\/[^'"]+)['"]/);
    if (m) imports.add(m[1]);
  }
  return [...imports];
}

// ── Resolve import path → actual file ──
function resolveFile(p) {
  for (const ext of ['.ts','.tsx']) { if (fs.existsSync(p+ext)) return p+ext; }
  for (const ext of ['.ts','.tsx']) { const idx=path.join(p,'index'+ext); if (fs.existsSync(idx)) return idx; }
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  return null;
}

function findImportsInFile(f) {
  const imps=[];
  for (const l of fs.readFileSync(f,'utf8').split('\n')) {
    let m=l.match(/from\s+['"](@\/shared\/[^'"]+)['"]/); if(m){imps.push({t:'abs',v:m[1]});continue}
    m=l.match(/from\s+['"]((?:\.\.?\/)[^'"]+)['"]/); if(m){imps.push({t:'rel',v:m[1]});continue}
    m=l.match(/export\s+\*\s+from\s+['"]((?:\.\.?\/)[^'"]+)['"]/); if(m){imps.push({t:'rel',v:m[1]});continue}
    m=l.match(/export\s+\{[^}]+\}\s+from\s+['"]((?:\.\.?\/)[^'"]+)['"]/); if(m) imps.push({t:'rel',v:m[1]});
  }
  return imps;
}

function resolveRel(base,rel){return resolveFile(path.resolve(path.dirname(base),rel))}

// ── BFS trace ──
const rootImports=new Set();
for(const f of walkDir(PORTAL_ROOT)) for(const imp of findSharedImports(f)) rootImports.add(imp);

const visited=new Set(), result=[], queue=[];
for(const ep of rootImports){const f=resolveFile(path.join(SHARED_ROOT,ep.replace('@/shared/',''))); if(f){queue.push(f);result.push(f)}}

while(queue.length){
  const cur=queue.shift(); if(visited.has(cur))continue; visited.add(cur);
  let imps; try{imps=findImportsInFile(cur)}catch(e){continue}
  for(const imp of imps){
    let next=imp.t==='abs'?resolveFile(path.join(SHARED_ROOT,imp.v.replace('@/shared/',''))):resolveRel(cur,imp.v);
    if(next&&!visited.has(next)&&next.startsWith(SHARED_ROOT)){queue.push(next);if(!result.includes(next))result.push(next)}
  }
}

// ── Output ──
const groups={};
for(const f of result){const rel=path.relative(SHARED_ROOT,f).replace(/\\/g,'/'); const d=path.dirname(rel); groups[d]=[...(groups[d]||[]),path.basename(f)]}

console.log('Portal: '+portalArg);
console.log('Root imports: '+rootImports.size+' unique paths');
console.log('Total files to copy: '+result.length+'\n');
for(const [d,fs] of Object.entries(groups).sort()){console.log('  '+d+'/');for(const n of fs.sort())console.log('    '+n)}
console.log('\n=== FLAT ===');
for(const f of result.sort())console.log(f);
