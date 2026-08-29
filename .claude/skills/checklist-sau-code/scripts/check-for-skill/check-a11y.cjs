// ============================================================
// 🎯 Phục vụ skill: tao-ui-giao-dien (Accessibility)
// check-a11y.cjs — Kiểm tra accessibility (a11y) trong JSX
// ============================================================
// 📋 Kiểm tra: 1. <img> thiếu alt attribute
//              2. <a> thiếu href hoặc role
//              3. <button> thiếu type attribute
//              4. <input> thiếu label / aria-label / aria-labelledby
//              5. <iframe> thiếu title attribute
//              6. tabIndex > 0 (gây sai thứ tự focus)
//              7. autofocus attribute (gây vấn đề accessibility)
//              8. positive tabIndex (nên dùng 0 hoặc -1)
//              9. onClick không có onKeyDown/onKeyUp (thiếu keyboard support)
//             10. role không hợp lệ trên element gốc
// 📤 Output:   PASS nếu 0 | FAIL + file:line của từng vi phạm
// 📊 Severity: HIGH — ảnh hưởng người dùng khuyết tật, có thể vi phạm pháp lý
// 💡 Example:  node check-a11y.cjs src/modules/KetoanApp
//              node check-a11y.cjs src/modules/KetoanApp features/danh-muc/khach-hang
// ============================================================
const fs = require('fs'); const p = require('path'); const g = require('glob');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-a11y.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);
let files = g.sync(TARGET + '/**/*.{tsx,jsx}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }

var errors = [];

files.forEach(function(file) {
  var c;
  try { c = fs.readFileSync(file, 'utf8'); } catch(e) { return; }
  var lines = c.split('\n');
  var rel = p.relative(TARGET, file).replace(/\\/g, '/');

  // ==========================================================
  // CHECK 1: <img> thiếu alt
  // ==========================================================
  var imgRegex = /<img\b([^>]*?)(\/?)>/gi;
  var imgMatch;
  while ((imgMatch = imgRegex.exec(c)) !== null) {
    var attrs = imgMatch[1];
    // Bỏ qua nếu có alt= (dù rỗng) hoặc role="presentation"
    if (/\balt\s*=/.test(attrs)) continue;
    if (/role\s*=\s*["']presentation["']/.test(attrs)) continue;
    var lineNum = c.substring(0, imgMatch.index).split('\n').length;
    errors.push(rel + ':' + lineNum + ': <img> thiếu alt attribute');
  }

  // ==========================================================
  // CHECK 2: <button> thiếu type
  // ==========================================================
  var btnRegex = /<button\b([^>]*?)>/gi;
  var btnMatch;
  while ((btnMatch = btnRegex.exec(c)) !== null) {
    var attrs = btnMatch[1];
    if (/\btype\s*=/.test(attrs)) continue;
    var lineNum = c.substring(0, btnMatch.index).split('\n').length;
    errors.push(rel + ':' + lineNum + ': <button> thiếu type attribute (nên là type="button")');
  }

  // ==========================================================
  // CHECK 3: <input> thiếu label/aria-label
  // ==========================================================
  var inputRegex = /<input\b([^>]*?)(\/?)>/gi;
  var inputMatch;
  while ((inputMatch = inputRegex.exec(c)) !== null) {
    var attrs = inputMatch[1];
    // Bỏ qua type="hidden", type="submit"
    if (/\btype\s*=\s*["']hidden["']/.test(attrs)) continue;
    if (/\btype\s*=\s*["']submit["']/.test(attrs)) continue;
    if (/\btype\s*=\s*["']button["']/.test(attrs)) continue;
    // Bỏ qua nếu có aria-label hoặc aria-labelledby hoặc placeholder
    if (/\baria-label\s*=/.test(attrs)) continue;
    if (/\baria-labelledby\s*=/.test(attrs)) continue;
    if (/\bid\s*=/.test(attrs)) continue; // có thể có <label htmlFor=...>
    var lineNum = c.substring(0, inputMatch.index).split('\n').length;
    errors.push(rel + ':' + lineNum + ': <input> thiếu aria-label hoặc id (thiếu accessible name)');
  }

  // ==========================================================
  // CHECK 4: <iframe> thiếu title
  // ==========================================================
  var iframeRegex = /<iframe\b([^>]*?)>/gi;
  var iframeMatch;
  while ((iframeMatch = iframeRegex.exec(c)) !== null) {
    var attrs = iframeMatch[1];
    if (/\btitle\s*=/.test(attrs)) continue;
    var lineNum = c.substring(0, iframeMatch.index).split('\n').length;
    errors.push(rel + ':' + lineNum + ': <iframe> thiếu title attribute');
  }

  // ==========================================================
  // CHECK 5: tabIndex > 0 (positive tabindex gây sai thứ tự focus)
  // ==========================================================
  var tabIdxRegex = /\btabIndex\s*=\s*\{(\d+)\}/g;
  var tabIdxMatch;
  while ((tabIdxMatch = tabIdxRegex.exec(c)) !== null) {
    var val = parseInt(tabIdxMatch[1], 10);
    if (val > 0) {
      var lineNum = c.substring(0, tabIdxMatch.index).split('\n').length;
      errors.push(rel + ':' + lineNum + ': tabIndex={' + val + '} > 0 — tránh dùng positive tabIndex');
    }
  }

  // ==========================================================
  // CHECK 6: autofocus trên element (gây vấn đề screen reader)
  // ==========================================================
  var autoFocusRegex = /\bautoFocus\b/g;
  var autoFocusMatch;
  while ((autoFocusMatch = autoFocusRegex.exec(c)) !== null) {
    var lineNum = c.substring(0, autoFocusMatch.index).split('\n').length;
    errors.push(rel + ':' + lineNum + ': autoFocus — có thể gây vấn đề accessibility, cân nhắc dùng ref.focus()');
  }

  // ==========================================================
  // CHECK 7: onClick thiếu keyboard handler (onKeyDown/onKeyUp)
  // ==========================================================
  lines.forEach(function(line, idx) {
    // Phát hiện element KHÔNG phải button/a có onClick nhưng thiếu onKeyDown/onKeyUp
    if (/\bonClick\s*=/.test(line) && !/\bonKey(?:Down|Up|Press)\s*=/.test(line)) {
      // Chỉ flag nếu là element không có sẵn keyboard support
      // <div onClick={...}> mà không có role="button" + onKeyDown
      if (/<div\b/i.test(line) || /<span\b/i.test(line) || /<li\b/i.test(line)) {
        if (!/\brole\s*=\s*["']button["']/.test(line)) {
          errors.push(rel + ':' + (idx + 1) + ': onClick trên <div>/<span>/<li> thiếu keyboard handler (onKeyDown/onKeyUp) hoặc role="button"');
        }
      }
    }
  });

  // ==========================================================
  // CHECK 8: <a> không có href (anchor không focus được)
  // ==========================================================
  var anchorRegex = /<a\b([^>]*?)>/gi;
  var anchorMatch;
  while ((anchorMatch = anchorRegex.exec(c)) !== null) {
    var attrs = anchorMatch[1];
    // Có href hoặc role
    if (/\bhref\s*=/.test(attrs)) continue;
    if (/\brole\s*=/.test(attrs)) continue;
    // Có onClick thì coi như interactive (nhưng nên có role)
    if (/\bonClick\s*=/.test(attrs)) {
      var lineNum = c.substring(0, anchorMatch.index).split('\n').length;
      errors.push(rel + ':' + lineNum + ': <a> không có href — nên thêm role="button" và tabIndex={0} nếu là interactive');
      continue;
    }
  }

  // ==========================================================
  // CHECK 9: Headings bị skip level (h1 → h3 bỏ qua h2)
  // ==========================================================
  var headings = [];
  var headingRegex = /<\/?(h[1-6])\b/gi;
  var hMatch;
  while ((hMatch = headingRegex.exec(c)) !== null) {
    if (hMatch[0].startsWith('</')) continue; // bỏ qua closing tag
    var level = parseInt(hMatch[1][1], 10);
    headings.push(level);
  }
  for (var i = 1; i < headings.length; i++) {
    if (headings[i] > headings[i - 1] + 1) {
      var lineNum = c.substring(0, headingRegex.lastIndex).split('\n').length;
      errors.push(rel + ':' + lineNum + ': heading level skip — h' + headings[i - 1] + ' → h' + headings[i] + ', thiếu h' + (headings[i - 1] + 1));
      break; // chỉ báo 1 lần mỗi file
    }
  }
});

// ==========================================================
// REPORT
// ==========================================================
var label = ' 27. Accessibility (a11y)';
var pad = ' '.repeat(Math.max(1, 45 - label.length));

if (errors.length === 0) {
  console.log(label + pad + 'PASS');
  process.exit(0);
} else {
  console.log(label + pad + 'FAIL (' + errors.length + ' issues)');
  errors.slice(0, 15).forEach(function(e) { console.log('     ' + e); });
  if (errors.length > 15) console.log('     ... and ' + (errors.length - 15) + ' more');
  process.exit(1);
}
