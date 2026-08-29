// ============================================================
// 🎯 Phục vụ skill: quy-tac-code (Render performance)
// check-performance-render.cjs — Kiểm tra pattern gây chậm render & blocking paint
// ============================================================
// 📋 Kiểm tra: 1. Tính toán nặng trong render không useMemo (filter/map/reduce/sort)
//              2. useLayoutEffect thay vì useEffect (chặn paint)
//              3. Component file quá lớn >500 dòng → cần split
//              4. React.lazy thiếu <Suspense>
//              5. JSON.stringify/JSON.parse đồng bộ trong render body
// 📤 Output:   PASS nếu 0 | FAIL + file:line của từng vi phạm
// 📊 Severity: HIGH — chặn main thread, chậm First Paint, tăng TBT
// 💡 Example:  node check-performance-render.cjs src/modules/KetoanApp
//              node check-performance-render.cjs src/modules/KetoanApp features/danh-muc
// ============================================================
const fs = require('fs'); const p = require('path'); const g = require('glob');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-performance-render.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);
let files = g.sync(TARGET + '/**/*.{ts,tsx}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }
const errors = [];

// ==========================================================
// CHECKS
// ==========================================================

files.forEach(file => {
  const c = fs.readFileSync(file, 'utf8'); const lines = c.split('\n');
  const rel = p.relative(TARGET, file).replace(/\\/g, '/');
  const ext = p.extname(file).toLowerCase();

  // ==========================================================
  // CHECK 1: Tính toán nặng trong render không useMemo
  // ==========================================================
  // Pattern: .filter().map() / .reduce() / .sort() trong thân function component
  // Chỉ kiểm tra file .tsx — nơi có component render
  if (ext === '.tsx') {
    // Xác định vùng render body của component (từ function declaration đến return)
    // Đơn giản: tìm vị trí cuối cùng của biểu thức chứa .filter().map(), .reduce(), .sort()
    // mà KHÔNG nằm trong useMemo/useCallback/useEffect

    var insideMemo = false;
    var insideCallback = false;
    var braceDepth = 0;
    var memoBraceDepth = 0;

    lines.forEach(function(l, i) {
      var t = l.trim();
      if (t.startsWith('//') || t.startsWith('*') || t.startsWith('import')) {
        // Track braces even in comments for simplicity
        return;
      }

      // Track if we're inside a useMemo / useCallback / useEffect block
      if (/\buseMemo\s*\(/.test(t) || /\buseCallback\s*\(/.test(t) || /\buseEffect\s*\(/.test(t)) {
        insideMemo = true;
        memoBraceDepth = braceDepth;
      }

      var opens = (l.match(/\{/g) || []).length;
      var closes = (l.match(/\}/g) || []).length;
      braceDepth += opens - closes;

      if (insideMemo && braceDepth <= memoBraceDepth) {
        insideMemo = false;
      }

      // Skip if inside memo
      if (insideMemo) return;

      // Phát hiện chain tính toán: .filter(...).map(...), .filter(...).sort(...)
      if (/(?:\.filter\s*\([^)]*\)\s*\.map\s*\(|\.filter\s*\([^)]*\)\s*\.sort\s*\(|\.sort\s*\([^)]*\)\s*\.filter\s*\(|\.sort\s*\([^)]*\)\s*\.map\s*\()/.test(t)) {
        errors.push(rel + ':' + (i + 1) + ': .filter().map() chain trong render — tính lại mỗi lần re-render, nên bọc trong useMemo()');
      }

      // .reduce() trong render
      if (/\.reduce\s*\(/.test(t) && !/useMemo/.test(t)) {
        errors.push(rel + ':' + (i + 1) + ': .reduce() trong render — O(n) mỗi re-render, nên bọc trong useMemo()');
      }

      // Object.entries().map() hoặc Object.keys().map() hoặc Object.values().map()
      if (/\bObject\.(?:entries|keys|values)\s*\([^)]*\)\s*\.map\s*\(/.test(t)) {
        errors.push(rel + ':' + (i + 1) + ': Object.entries().map() trong render — tạo array mới mỗi re-render, nên bọc trong useMemo()');
      }

      // Array chaining nặng: biến.filter().map().reduce() hoặc 3+ chain
      if (/(?:\.filter\(|\.map\(|\.sort\(|\.reduce\()/.test(t)) {
        var chainCount = (t.match(/\.(?:filter|map|sort|reduce|flatMap)\s*\(/g) || []).length;
        if (chainCount >= 3) {
          errors.push(rel + ':' + (i + 1) + ': ' + chainCount + ' array operations chain trong render — O(n*m) mỗi re-render, nên bọc trong useMemo()');
        }
      }
    });
  }

  // ==========================================================
  // CHECK 2: useLayoutEffect (nên dùng useEffect trừ khi cần đo DOM)
  // ==========================================================
  lines.forEach(function(l, i) {
    var t = l.trim();
    if (t.startsWith('//') || t.startsWith('*')) return;

    if (/\buseLayoutEffect\s*\(/.test(t)) {
      // Kiểm tra context: cho phép nếu thực sự cần đo DOM (ref, getBoundingClientRect, scrollTo...)
      var ctx = lines.slice(Math.max(0, i - 3), Math.min(i + 5, lines.length)).join('\n');
      var needsSync = /\b(?:getBoundingClientRect|scrollTo|scrollIntoView|offsetWidth|offsetHeight|clientWidth|clientHeight|focus\(\)|measureText|getComputedStyle|canvas\b|drawImage)/.test(ctx);
      if (!needsSync) {
        errors.push(rel + ':' + (i + 1) + ': useLayoutEffect — chạy đồng bộ chặn paint, nếu không cần đo DOM/layout thì dùng useEffect() thay thế');
      }
    }
  });

  // ==========================================================
  // CHECK 3: Component file quá lớn (>500 dòng)
  // ==========================================================
  if (ext === '.tsx' && lines.length > 500) {
    // Chỉ flag nếu file thực sự chứa component (có export function/const với tên viết hoa)
    var hasComponent = /\b(?:export\s+(?:default\s+)?function\s+[A-Z]|export\s+(?:default\s+)?const\s+[A-Z]|function\s+[A-Z]|const\s+[A-Z]\w*\s*=\s*(?:\([^)]*\)|React\.\w+)\s*=>)/.test(c);
    if (hasComponent) {
      // Tính xem có bao nhiêu section (dựa trên comment marker ==== hoặc Card)
      var sectionCount = (c.match(/=={3,}/g) || []).length;
      if (sectionCount >= 4) {
        errors.push(rel + ': ' + lines.length + ' dòng, ' + sectionCount + ' sections — component quá lớn, nên tách thành sub-components hoặc hooks riêng');
      }
    }
  }

  // ==========================================================
  // CHECK 4: React.lazy không có <Suspense> bao quanh
  // ==========================================================
  // Chỉ kiểm tra file route/config
  if ((file.includes('route') || file.includes('Route') || file.includes('router')) && ext === '.tsx') {
    var hasLazy = /\bReact\.lazy\s*\(/.test(c) || /\blazy\s*\(\s*\(\)\s*=>\s*import\s*\(/.test(c);
    var hasSuspense = /\bSuspense\b/.test(c) || /\b<Suspense\b/.test(c);
    if (hasLazy && !hasSuspense) {
      // Tìm dòng có React.lazy
      lines.forEach(function(l, i) {
        if (/\b(?:React\.)?lazy\s*\(/.test(l)) {
          errors.push(rel + ':' + (i + 1) + ': React.lazy thiếu <Suspense> — không có fallback UI sẽ gây lỗi runtime khi component đang load');
        }
      });
    }
  }

  // ==========================================================
  // CHECK 5: JSON.stringify / JSON.parse đồng bộ trong render
  // ==========================================================
  if (ext === '.tsx') {
    lines.forEach(function(l, i) {
      var t = l.trim();
      if (t.startsWith('//') || t.startsWith('*')) return;

      // JSON.stringify trong render (thường dùng trong key={JSON.stringify(item)})
      if (/\bJSON\.stringify\s*\(/.test(t) && !/\buseMemo|useEffect|useCallback\b/.test(t)) {
        // Bỏ qua nếu dùng trong template literal hoặc debug console
        if (!/console\./.test(t) && !/`/.test(t)) {
          errors.push(rel + ':' + (i + 1) + ': JSON.stringify() trong render — O(n) đồng bộ, nếu object lớn sẽ chặn main thread. Nên memoize key hoặc dùng id');
        }
      }

      // JSON.parse trong render
      if (/\bJSON\.parse\s*\(/.test(t) && !/\buseMemo|useEffect|useCallback\b/.test(t)) {
        errors.push(rel + ':' + (i + 1) + ': JSON.parse() trong render — đồng bộ chặn main thread, nên chuyển vào useEffect hoặc dùng useMemo');
      }
    });
  }
});

// Dedup errors
const seen = new Set();
const unique = errors.filter(function(e) {
  var key = e.replace(/'.*?'/, "'***'");
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

var label = ' B11. Render performance ';
if (unique.length === 0) {
  console.log(label + '-'.repeat(Math.max(1, 40)) + ' PASS');
} else {
  console.log(label + '-'.repeat(Math.max(1, 40)) + ' FAIL (' + unique.length + ' issues)');
  unique.slice(0, 10).forEach(function(e) { console.log('     ' + e); });
  if (unique.length > 10) console.log('     ... and ' + (unique.length - 10) + ' more');
}
process.exit(unique.length > 0 ? 1 : 0);
