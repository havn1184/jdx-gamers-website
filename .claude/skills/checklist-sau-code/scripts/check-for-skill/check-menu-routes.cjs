// ============================================================
// 🎯 Phục vụ skill: tao-layout-navmenu-topmenu
// check-menu-routes.cjs — Kiểm tra menu item có mapping route không
// ============================================================
// 📋 Kiểm tra: Mỗi `id` trong menu item (NavMenu/TopMenu) phải có entry
//              trong `pageIdToPath` hoặc `ssoPageIdToPath` của route config.
//              Menu item có `id` nhưng KHÔNG có trong mapping → click menu
//              không navigate được đâu → dead link (BUG runtime).
// 📤 Output:   PASS nếu 0 | FAIL + danh sách các pageId bị đứt liên kết
// 📊 Severity: CRITICAL — menu không hoạt động, user không vào được trang
// 💡 Example:  node check-menu-routes.cjs src/modules/SsoApp
//              node check-menu-routes.cjs src/modules/KetoanApp
// 🔍 Pattern phát hiện:
//    Menu: const menuGroups = [{ items: [{ id: 'xyz', ... }] }]  → id: 'xyz'
//    Route: export const pageIdToPath = { 'xyz': 'path/to/page' }
//           hoặc export const ssoPageIdToPath = { 'xyz': 'path/to/page' }
//    → 'xyz' có trong menu nhưng KHÔNG có trong mapping route → FAIL
// 🚫 Bỏ qua:   group `id` (chỉ là label nhóm, không phải pageId)
//              menu item KHÔNG có trường `id`
// ============================================================
const fs = require('fs'); const p = require('path'); const g = require('glob');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-menu-routes.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);
let files = g.sync(TARGET + '/**/*.{ts,tsx}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }
const errors = [];
const info = [];

// ==========================================================
// STEP 1: Tìm tất cả pageIdToPath mapping trong route files
// ==========================================================
// Pattern: export const xxxPageIdToPath: Record<string, string> = { 'key': 'value', ... }
// Hoặc: export const pageIdToPath: Record<string, string> = { 'key': 'value', ... }
const routePageIds = new Map(); // pageId → { file, line }

files.forEach(file => {
  // Tập trung vào files trong routes/ hoặc có tên chứa "route"
  const rel = p.relative(TARGET, file).replace(/\\/g, '/');
  const base = p.basename(file);
  if (!rel.includes('routes') && !rel.includes('route') && !base.includes('route')) return;
  if (!/\.(ts|tsx)$/.test(file)) return;

  const c = fs.readFileSync(file, 'utf8');
  const lines = c.split('\n');

  // Tìm tất cả exports dạng: export const xxxPageIdToPath: Record<string, string> = {
  // hoặc export const pageIdToPath: Record<string, string> = {
  const pageIdToPathRe = /export\s+const\s+(\w*[Pp]ageIdToPath\w*)\s*(?::\s*Record<string,\s*string>\s*)?=\s*\{/;
  let m = c.match(pageIdToPathRe);

  if (m) {
    // Tìm vị trí trong code
    let foundLine = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(m[1]) && lines[i].includes('= {')) {
        foundLine = i + 1;
        break;
      }
    }

    // Trích xuất tất cả key từ object literal
    // Pattern: 'key': 'value', hoặc "key": "value",
    const startIdx = c.indexOf(m[0]) + m[0].length;
    // Tìm vị trí đóng object (cân bằng braces)
    let depth = 1;
    let endIdx = startIdx;
    for (let i = startIdx; i < c.length && depth > 0; i++) {
      if (c[i] === '{') depth++;
      if (c[i] === '}') depth--;
      if (depth === 0) endIdx = i;
    }
    const objStr = c.substring(startIdx, endIdx);

    // Extract keys: 'key': hoặc "key":
    const keyRe = /['"](\w[\w-]*)['"]\s*:/g;
    let km;
    while ((km = keyRe.exec(objStr)) !== null) {
      const pageId = km[1];
      if (!routePageIds.has(pageId)) {
        routePageIds.set(pageId, rel + ':' + (foundLine));
      }
    }

    const keysFound = [...routePageIds.keys()].filter(k => {
      let v = routePageIds.get(k);
      return v === rel + ':' + foundLine || v.startsWith(rel + ':');
    });

    if (keysFound.length > 0) {
      info.push(rel + ': ' + keysFound.length + ' pageIds (e.g., ' + keysFound.slice(0, 3).join(', ') + (keysFound.length > 3 ? ', ...' : '') + ')');
    }
  }
});

// ==========================================================
// STEP 2: Tìm tất cả menu item `id` trong NavMenu/TopMenu files
// ==========================================================
// Pattern: const menuGroups = [ { items: [ { id: 'xyz', ... } ] } ]
// Hoặc: const navItems = [ { id: 'xyz', ... } ]
// Hoặc trong JSX: <MenuItem id="xyz" ... />

// Menu pageIds cần tìm: các id trong cấu trúc menu item (mảng items)
const menuPageIds = new Map(); // pageId → { file, line }

files.forEach(file => {
  const rel = p.relative(TARGET, file).replace(/\\/g, '/');
  // Tập trung vào layout/ hoặc NavMenu/TopMenu files
  if (!rel.includes('layout') && !rel.includes('NavMenu') && !rel.includes('TopMenu') && !rel.includes('menu')) return;
  if (!/\.(ts|tsx)$/.test(file)) return;

  const c = fs.readFileSync(file, 'utf8');
  const lines = c.split('\n');

  // Cách 1: menuGroups = [{ items: [{ id: 'xyz', ... }] }]
  // Tìm tất cả các object literal có trường `id` trong ngữ cảnh `items:`
  // Regex: tìm lines chứa id: 'xyz' hoặc id: "xyz"
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('*')) return;

    // Match: id: 'key', hoặc id: "key",
    const idMatch = t.match(/^\s*id\s*:\s*['"]([^'"]+)['"],?\s*$/);
    if (!idMatch) return;

    const menuId = idMatch[1];

    // Là group `id` nếu theo sau (1-3 lines) có `items: [` 
    // → đây là group label, không phải menu item clickable → bỏ qua
    const afterCtx = lines.slice(i + 1, Math.min(i + 5, lines.length)).join('\n');
    if (/\bitems\s*:\s*\[/.test(afterCtx)) return;

    // Kiểm tra context: phải nằm trong mảng menu (có items: [ HOẶC navItems top-level)
    const beforeCtx = lines.slice(Math.max(0, i - 30), i + 1).join('\n');
    const hasItemsContext = /\bitems\s*:\s*\[/.test(beforeCtx);
    const isNavItem = /\b(?:navItems|NAV_ITEMS|navItemsTop|NAV_MENU_ITEMS|TOP_MENU_ITEMS)\b/.test(beforeCtx);

    // Phải có context menu
    if (!hasItemsContext && !isNavItem) return;

    if (!menuPageIds.has(menuId)) {
      menuPageIds.set(menuId, rel + ':' + (i + 1));
    }
  });
});

// ==========================================================
// STEP 3: Cross-reference — menu pageId nào không có trong route mapping?
// ==========================================================
if (routePageIds.size === 0) {
  console.log(' B14. Menu ↔ Route links '.padEnd(70, '-') + ' SKIP (no pageIdToPath found)');
  process.exit(0);
}

if (menuPageIds.size === 0) {
  console.log(' B14. Menu ↔ Route links '.padEnd(70, '-') + ' SKIP (no menu items found)');
  process.exit(0);
}

// So sánh: mỗi menu id phải có trong route pageIds
const deadLinks = [];
menuPageIds.forEach((menuLoc, menuId) => {
  if (!routePageIds.has(menuId)) {
    deadLinks.push('menu: ' + menuLoc + ' → id="' + menuId + '" KHÔNG có trong pageIdToPath — click menu sẽ không navigate được');
  }
});

// So sánh ngược: route pageId nào không có trong menu? (cảnh báo — route có nhưng menu không có)
const orphanRoutes = [];
routePageIds.forEach((routeLoc, pageId) => {
  if (!menuPageIds.has(pageId)) {
    orphanRoutes.push('route: ' + routeLoc + ' → "' + pageId + '" có trong pageIdToPath nhưng KHÔNG có menu item tương ứng');
  }
});

const label = ' B14. Menu ↔ Route links ';
if (deadLinks.length === 0) {
  console.log(label + '-'.repeat(Math.max(1, 40)) + ' PASS');
  if (orphanRoutes.length > 0) console.log('     ' + orphanRoutes.length + ' route entries without menu item (warning)');
} else {
  console.log(label + '-'.repeat(Math.max(1, 40)) + ' FAIL (' + deadLinks.length + ' dead links)');
  deadLinks.slice(0, 15).forEach(e => console.log('     ' + e));
  if (deadLinks.length > 15) console.log('     ... and ' + (deadLinks.length - 15) + ' more');
  if (orphanRoutes.length > 0) {
    console.log('\n  Route entries without menu (warning):');
    orphanRoutes.slice(0, 5).forEach(w => console.log('     ' + w));
  }
}

if (info.length > 0) {
  console.log('\n  Mapping sources:');
  info.forEach(i => console.log('     ' + i));
}

process.exit(deadLinks.length > 0 ? 1 : 0);
