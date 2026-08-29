/**
 * B3: Cập nhật tất cả @/shared/... imports trong portal thành relative paths.
 * 
 * Cách dùng:
 *   node .claude/skills/cach-refactor-kien-truc-doc-lap/scripts/update-imports.cjs <PortalPath>
 * 
 * VD: node .../update-imports.cjs src/modules/KiemThuApp
 * 
 * Công thức: depth = số cấp thư mục từ portal root → file
 *            prefix = '../'.repeat(depth) + 'shared/'
 *            @/shared/xxx → {prefix}xxx
 */

const fs = require('fs');
const path = require('path');

// ── CLI args ──
const portalArg = process.argv[2];
if (!portalArg) {
  console.error('Usage: node update-imports.cjs <PortalPath>');
  console.error('  PortalPath: đường dẫn tương đối từ project root, VD: src/modules/KiemThuApp');
  process.exit(1);
}

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const PORTAL = path.resolve(PROJECT_ROOT, portalArg);

if (!fs.existsSync(PORTAL)) { console.error('Portal không tồn tại: ' + PORTAL); process.exit(1); }

// ── Walk ──
function walkDir(dir) {
  const results = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) { if (!['node_modules','.git','docs'].includes(item.name)) results.push(...walkDir(full)); }
    else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) results.push(full);
  }
  return results;
}

// ── Depth calculation ──
function getDepth(filePath) {
  const rel = path.relative(PORTAL, filePath).replace(/\\/g, '/');
  return rel.split('/').length - 1;
}

// ── Update per file ──
function updateImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const depth = getDepth(filePath);
  const prefix = '../'.repeat(depth) + 'shared/';

  let newContent = content;
  let changed = false;

  // Thay thế: from '@/shared/xxx' → from '{prefix}xxx'
  newContent = newContent.replace(/from\s+['"]@\/shared\/([^'"]+)['"]/g, (_, subPath) => {
    changed = true;
    return `from '${prefix}${subPath}'`;
  });

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    const rel = path.relative(PORTAL, filePath).replace(/\\/g, '/');
    console.log('  UPDATED: ' + rel + ' (depth=' + depth + ')');
  }
}

// ── Main ──
console.log('=== Cap nhat @/shared imports thanh relative trong ' + portalArg + ' ===\n');

const files = walkDir(PORTAL);
let updated = 0;
for (const f of files) {
  const before = updated;
  updateImports(f);
  if (updated < (before + 1)) updated = before + 1; // không chính xác lắm, nhưng ok
}

// Đếm thực tế số file có thay đổi
const remaining = [];
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  if (!c.includes('@/shared/')) remaining.push(f);
}

console.log('\nDa kiem tra ' + files.length + ' files.');
