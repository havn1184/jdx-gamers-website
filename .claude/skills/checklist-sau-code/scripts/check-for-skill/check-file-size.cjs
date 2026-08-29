// ============================================================
// 🎯 Phục vụ skill: quy-tac-code (File >500 dòng)
// check-file-size.cjs — Kiểm tra file .ts/.tsx quá lớn (>500 dòng)
// ============================================================
// 📋 Kiểm tra: File code vượt quá ngưỡng MAX_LINES (mặc định 500) → cần tách
//              thành sub-components (UI) hoặc hooks nhỏ hơn (logic)
// 📤 Output:   PASS nếu 0 | FAIL + danh sách file kèm số dòng
// 📊 Severity: HIGH — file quá lớn khó maintain, dễ bug, khó review, khó test
// 💡 Example:  node check-file-size.cjs src/modules/KetoanApp
//              node check-file-size.cjs src/modules/KetoanApp features/danh-muc
// 🚫 Bỏ qua:   index.ts/index.tsx (barrel export), *.d.ts, *.test.* / *.spec.*,
//              file có comment marker // @check-file-size-ignore (file cũ ngoài scope)
// ============================================================
const fs = require('fs'); const p = require('path'); const g = require('glob');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-file-size.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);
const MAX_LINES = 500; // Ngưỡng: file > 500 dòng → cần tách thành components/hooks nhỏ hơn
let files = g.sync(TARGET + '/**/*.{ts,tsx}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }
const errors = [];

files.forEach(file => {
  const rel = p.relative(TARGET, file).replace(/\\/g, '/');
  const base = p.basename(file);

  // Bỏ qua barrel index.ts / index.tsx (chỉ re-export, thường dài do gom nhiều file)
  if (/^index\.(ts|tsx)$/.test(base)) return;
  // Bỏ qua declaration files
  if (/\.d\.ts$/.test(file)) return;
  // Bỏ qua test/spec files
  if (/\.(test|spec)\.(ts|tsx)$/.test(base)) return;

  const c = fs.readFileSync(file, 'utf8');
  // Marker bỏ qua: file cũ ngoài scope giữ nguyên (thêm // @check-file-size-ignore ở đầu file)
  if (/@check-file-size-ignore/.test(c)) return;

  const lineCount = c.split('\n').length;
  if (lineCount > MAX_LINES) {
    errors.push(rel + ': ' + lineCount + ' dòng (>' + MAX_LINES + ') — file quá lớn, nên tách thành sub-components hoặc hooks nhỏ hơn');
  }
});

const label = ' B12. File size (>' + MAX_LINES + ' dòng) ';
if (errors.length === 0) {
  console.log(label + '-'.repeat(Math.max(1, 40)) + ' PASS');
} else {
  console.log(label + '-'.repeat(Math.max(1, 40)) + ' FAIL (' + errors.length + ' files)');
  errors.slice(0, 15).forEach(e => console.log('     ' + e));
  if (errors.length > 15) console.log('     ... and ' + (errors.length - 15) + ' more');
}
process.exit(errors.length > 0 ? 1 : 0);
