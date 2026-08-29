// ============================================================
// 🎯 Phục vụ skill: quy-tac-code (Comments tiếng Việt + JSDoc)
// check-vietnamese.cjs — Kiểm tra comments tiếng Việt
// ============================================================
// 📋 Kiểm tra: Export functions thiếu JSDoc tiếng Việt
//              Comment trong code phải bằng tiếng Việt (quy tắc dự án)
// 📤 Output:   PASS nếu đủ | FAIL + file:line thiếu comment
// 📊 Severity: WARNING — convention, không gây crash
// 💡 Example:  node check-vietnamese.cjs src/modules/KetoanApp
// ============================================================
const fs = require('fs'); const p = require('path'); const g = require('glob');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-vietnamese.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);
let files = g.sync(TARGET + '/**/*.{ts,tsx}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }

const errors = [];

// Vietnamese character detection
const VIET_CHARS = /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

files.forEach(file => {
  const c = fs.readFileSync(file, 'utf8');
  const lines = c.split('\n');
  const rel = p.relative(TARGET, file).replace(/\\/g, '/');

  // Find exported functions
  const exportFns = [];
  lines.forEach((l, i) => {
    const m = l.match(/(?:export\s+(?:async\s+)?function\s+|export\s+const\s+)(\w+)/);
    if (m) exportFns.push({ name: m[1], line: i+1 });
  });

  // Check if function has JSDoc comment above it
  exportFns.forEach(fn => {
    let hasJSDoc = false;
    let hasViComment = false;
    // ✅ Fix v3: quét toàn bộ vùng 25 dòng trước function
    // - Có JSDoc nếu vùng chứa '/**'
    // - Có tiếng Việt nếu bất kỳ dòng nào trong vùng (kể cả JSDoc của interface phía trên) chứa ký tự Việt
    // Tránh false positive cả 2 chiều: JSDoc dài (tiếng Việt đầu JSDoc) + interface chặn giữa
    const regionStart = Math.max(0, fn.line - 26);
    const region = lines.slice(regionStart, fn.line - 1);
    hasJSDoc = region.some(l => l.includes('/**'));
    hasViComment = region.some(l => VIET_CHARS.test(l));

    // Only flag if it's a significant function (not trivial getter/setter)
    const fnCode = lines.slice(fn.line - 1, fn.line + 3).join('\n');
    const isTrivial = fnCode.length < 50 || fn.name.startsWith('get') || fn.name.startsWith('set');
    
    if (!hasJSDoc && !isTrivial && fn.name !== 'index') {
      errors.push(rel + ':' + fn.line + ': fn "' + fn.name + '" thiếu JSDoc (nên có comment tiếng Việt)');
    } else if (hasJSDoc && !hasViComment && !isTrivial) {
      // Has JSDoc but in English — should be Vietnamese
      if (!file.includes('node_modules') && !file.includes('shared/services')) {
        errors.push(rel + ':' + fn.line + ': fn "' + fn.name + '" JSDoc không có tiếng Việt');
      }
    }
  });

  // Check for English-only comments in feature code (not shared services)
  if (!file.includes('shared/services') && !file.includes('node_modules')) {
    const hasCommentBlock = /\*\s+This\s|\*\s+Create|\*\s+Get|\*\s+Update|\*\s+Delete|\*\s+Fetch/i.test(c);
    if (hasCommentBlock && !VIET_CHARS.test(c)) {
      // File has English comments but no Vietnamese — might be acceptable for API services
    }
  }
});

const label = ' B3. Vietnamese comments ';
if (errors.length === 0) { console.log(label + '-'.repeat(Math.max(1, 35)) + ' PASS'); }
else { console.log(label + '-'.repeat(Math.max(1, 35)) + ' FAIL (' + errors.length + ' issues)'); errors.slice(0, 8).forEach(e => console.log('     ' + e)); }
process.exit(errors.length > 0 ? 1 : 0);
