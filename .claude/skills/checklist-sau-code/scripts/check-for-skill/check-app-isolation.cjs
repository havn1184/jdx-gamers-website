// ============================================================
// 🎯 Phục vụ skill: cach-refactor-kien-truc-doc-lap (cô lập app)
// check-app-isolation.cjs — Kiểm tra CÔ LẬP domain app
// ============================================================
// 📋 Kiểm tra: Theo quy hoạch mới, mỗi domainApp (SsoApp, InvoiceApp,
//              KetoanApp, CrmApp, TaiSanApp, KiemThuApp, BaseIndexApp,
//              AdminApp, PartnerApp) CHỈ được phép sử dụng code, util,
//              hook, component ở CHÍNH TRONG app đó.
//              Mọi import trỏ RA NGOÀI app hiện tại → VI PHẠM:
//              1. Relative path:  ../../InvoiceApp/...  hoặc ../../shared/...
//              2. Alias root:     @/modules/InvoiceApp/...  hoặc @/shared/...
//              3. Absolute src:   src/modules/InvoiceApp/...  hoặc src/shared/...
// 📤 Output:   PASS nếu 0 | FAIL + chi tiết từng import vi phạm
// 📊 Severity: CRITICAL — phá vỡ quy hoạch cô lập app, gây lỗi build khi tách repo
// 💡 Example:  node check-app-isolation.cjs src/modules/SsoApp
//              node check-app-isolation.cjs src/modules/SsoApp features/danh-muc
// 🚫 Bỏ qua:   node_modules (react, axios...), asset files (.css/.png/.svg...)
//              import KHÔNG tồn tại trên disk (check-import-paths xử lý)
// 💡 Ignore:   // @check-app-isolation-ignore (thêm cuối dòng import hoặc đầu file)
// ============================================================
const fs = require('fs'); const p = require('path'); const g = require('glob');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-app-isolation.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);
const appName = p.basename(TARGET); // e.g. "SsoApp"
const srcRoot = p.resolve(TARGET, '../..');   // .../src (map cho alias @/)
const wsRoot = p.resolve(TARGET, '../../..'); // workspace root (map cho src/)
let files = g.sync(TARGET + '/**/*.{ts,tsx}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }
const errors = [];

// File nằm trong thư mục dir không?
function isInside(filePath, dir) {
  const rel = p.relative(dir, filePath);
  return rel === '' || (!rel.startsWith('..') && !p.isAbsolute(rel));
}

// Resolve import specifier → đường dẫn tuyệt đối (null nếu là node module / asset)
function resolveSpec(dir, spec) {
  spec = spec.split('?')[0].split('#')[0];
  if (!spec) return null;
  // Node modules (react, axios, @mui/...) — không phải domain code
  if (!spec.startsWith('.') && !spec.startsWith('@/') && !spec.startsWith('src/') && !p.isAbsolute(spec)) return null;
  // Asset files — không thuộc phạm vi code isolation
  if (/\.(css|scss|sass|less|png|jpe?g|gif|webp|svg|ico|json|woff2?|ttf|eot|map)$/i.test(spec)) return null;
  if (spec.startsWith('.')) return p.resolve(dir, spec);
  if (spec.startsWith('@/')) return p.resolve(srcRoot, spec.slice(2));
  if (spec.startsWith('src/')) return p.resolve(wsRoot, spec);
  return p.resolve(spec); // absolute path
}

// Import specifier có tồn tại trên disk không (giảm false positive trùng check-import-paths)
function existsOnDisk(resolved) {
  if (fs.existsSync(resolved)) return true;
  if (fs.existsSync(resolved + '.ts')) return true;
  if (fs.existsSync(resolved + '.tsx')) return true;
  if (fs.existsSync(resolved + '/index.ts')) return true;
  if (fs.existsSync(resolved + '/index.tsx')) return true;
  return false;
}

files.forEach(file => {
  const c = fs.readFileSync(file, 'utf8');
  // Marker ignore cả file
  if (/@check-app-isolation-ignore/.test(c)) return;
  const lines = c.split('\n');
  const rel = p.relative(TARGET, file).replace(/\\/g, '/');
  const dir = p.dirname(file);
  // Bắt import specifier: from '...' | import('...') | require('...') | import '...'
  const importRe = /(?:from\s+|import\s*\(\s*|require\s*\(\s*|import\s+['"])['"]([^'"]+)['"]/g;

  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('*')) return;
    if (t.includes('@check-app-isolation-ignore')) return;
    let m;
    importRe.lastIndex = 0;
    while ((m = importRe.exec(t)) !== null) {
      const spec = m[1];
      const resolved = resolveSpec(dir, spec);
      if (!resolved) continue;
      if (!existsOnDisk(resolved)) continue; // import sai path — script check-import-paths lo
      if (!isInside(resolved, TARGET)) {
        errors.push(rel + ':' + (i + 1) + ': import RA NGOÀI app [' + appName + '] → ' + spec + ' — mỗi app chỉ được dùng code trong chính app đó');
      }
    }
  });
});

const label = ' B13. App isolation (chỉ dùng code trong app) ';
if (errors.length === 0) {
  console.log(label + '-'.repeat(Math.max(1, 40)) + ' PASS');
} else {
  console.log(label + '-'.repeat(Math.max(1, 40)) + ' FAIL (' + errors.length + ' issues)');
  errors.slice(0, 15).forEach(e => console.log('     ' + e));
  if (errors.length > 15) console.log('     ... and ' + (errors.length - 15) + ' more');
}
process.exit(errors.length > 0 ? 1 : 0);
