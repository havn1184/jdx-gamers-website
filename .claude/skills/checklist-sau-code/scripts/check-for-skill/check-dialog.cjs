// ============================================================
// 🎯 Phục vụ skill: tao-ui-dialog (maxWidth dialog)
// check-dialog.cjs — Kiểm tra kích thước DialogContent (maxWidth)
// ============================================================
// 📋 Kiểm tra:
//   1. DialogContent có className w-[...] NHƯNG thiếu prop maxWidth
//      → chiều rộng KHÔNG hiệu lực (bị fallback sm:max-w-lg = 512px)
//   2. Cú pháp sai: nhét maxWidth= vào bên trong className string
//      (VD: className='maxWidth="800px" w-[800px]...' — sai, phải là prop riêng)
//   3. maxWidth khác w-[...] (mismatch — 2 giá trị không khớp nhau)
// 📤 Output:   PASS nếu 0 | FAIL + file:line của từng vi phạm
// 📊 Severity: HIGH — dialog bị giới hạn 512px, vỡ layout theo thiết kế
// 💡 Example:  node check-dialog.cjs src/modules/KetoanApp
//              node check-dialog.cjs src/modules/KiemThuApp features/release-versions
// ============================================================
const fs = require('fs'); const p = require('path'); const g = require('glob');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-dialog.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);
let files = g.sync(TARGET + '/**/*.{tsx,jsx}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }

var errors = [];

// Đọc một attribute value (hỗ trợ quotes đơn/kép, multi-line)
function getAttrValue(attrs, name) {
  var re = new RegExp('\\b' + name + '\\s*=\\s*["\']([^"\']*)["\']', 'g');
  var m = re.exec(attrs);
  return m ? m[1] : null;
}

files.forEach(function(file) {
  var c;
  try { c = fs.readFileSync(file, 'utf8'); } catch(e) { return; }
  var rel = p.relative(TARGET, file).replace(/\\/g, '/');

  // Tìm mọi <DialogContent ...> (open tag, hỗ trợ multi-line)
  var tagRe = /<DialogContent\b([^>]*?)>/gs;
  var match;
  while ((match = tagRe.exec(c)) !== null) {
    var attrs = match[1];
    var lineNum = c.substring(0, match.index).split('\n').length;

    // CHECK 2: cú pháp sai — maxWidth= nằm TRONG className string
    if (/\bclassName\s*=\s*["'][^"']*maxWidth\s*=/.test(attrs)) {
      errors.push(rel + ':' + lineNum + ': cú pháp sai — maxWidth= nằm trong className string (phải là prop riêng: <DialogContent maxWidth="..." className="w-[...]">)');
      continue;
    }

    var className = getAttrValue(attrs, 'className') || '';
    var maxWidthVal = getAttrValue(attrs, 'maxWidth');

    // Lấy giá trị w-[...] trong className (VD: w-[900px], w-[210mm])
    var widthRe = /w-\[([^\]]+)\]/g;
    var wMatch;
    var hasWidthClass = false;
    var widthValues = [];
    while ((wMatch = widthRe.exec(className)) !== null) {
      hasWidthClass = true;
      widthValues.push(wMatch[1]);
    }

    // CHECK 1: có w-[...] nhưng thiếu maxWidth → chiều rộng KHÔNG hiệu lực
    // (DialogContent fallback sm:max-w-lg = 512px giới hạn mọi w-[...])
    if (hasWidthClass && !maxWidthVal) {
      errors.push(rel + ':' + lineNum + ': DialogContent có className ' + widthValues.map(function(v){ return 'w-[' + v + ']'; }).join(', ') + ' NHƯNG thiếu prop maxWidth → chiều rộng không hiệu lực (bị giới hạn sm:max-w-lg 512px). Thêm maxWidth="' + widthValues[0] + '"');
      continue;
    }

    // CHECK 3: maxWidth ≠ w-[...] (mismatch — 2 giá trị không khớp)
    if (hasWidthClass && maxWidthVal && widthValues.length > 0) {
      widthValues.forEach(function(wv) {
        if (wv !== maxWidthVal) {
          errors.push(rel + ':' + lineNum + ': maxWidth="' + maxWidthVal + '" KHÁC w-[' + wv + '] trong className → không khớp nhau, nên thống nhất 1 giá trị');
        }
      });
    }
  }
});

var label = 'B2. Dialog maxWidth (kích thước) ';
if (errors.length === 0) { console.log(label + '-'.repeat(Math.max(1, 40 - label.length)) + ' PASS'); }
else {
  console.log(label + '-'.repeat(Math.max(1, 40 - label.length)) + ' FAIL (' + errors.length + ' issues)');
  errors.slice(0, 20).forEach(function(e) { console.log('     ' + e); });
}
process.exit(errors.length > 0 ? 1 : 0);
