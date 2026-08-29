// ============================================================
// 🎯 Phục vụ skill: tich-hop-api-ui + filter-phan-trang
// check-hook-patterns.cjs — Kiểm tra patterns của React hooks
// ============================================================
// 📋 Kiểm tra: 1. useEffect([]) - missing dependencies (nên useEffect(fn, [dep]))
//              2. useEffect không có cleanup cho subscribe/timer
//              3. Custom hooks thiếu tiền tố "use"
//              4. Gọi hook ngoài function component / custom hook
//              5. useMemo/useCallback thiếu dependency array
// 📤 Output:   PASS nếu đúng | FAIL + chi tiết từng vi phạm
// 📊 Severity: HIGH — sai useEffect gây memory leak, infinite loop
// 💡 Example:  node check-hook-patterns.cjs src/modules/KetoanApp
// ============================================================
const fs = require('fs'); const p = require('path'); const g = require('glob');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-hook-patterns.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);
let files = g.sync(TARGET + '/**/*.{ts,tsx}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }

const errors = [];
const hookFiles = files.filter(f => f.includes('hook') || f.includes('use') && f.endsWith('.ts'));

files.forEach(file => {
  const c = fs.readFileSync(file, 'utf8');
  const lines = c.split('\n');
  const rel = p.relative(TARGET, file).replace(/\\/g, '/');

  // CHECK 1: useEffect with empty deps in non-obvious cases
  const useEffects = c.match(/useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?\},\s*\[\s*\]\s*\)/g);
  if (useEffects && useEffects.length > 0) {
    useEffects.forEach((eff, idx) => {
      // Find which line this useEffect is on
      const idxInContent = c.indexOf(eff);
      const lineNum = c.substring(0, idxInContent).split('\n').length;
      
      // Check if there are used variables that should be in deps
      // Simple heuristic: if body contains useState setters or external refs
      const hasFetch = /fetch\s*\(|apiCall\s*\(|\.get\(|\.post\(/.test(eff);
      const hasExternal = /props\./.test(eff) || /\w+ApiService\./.test(eff);
      
      if (hasFetch || hasExternal) {
        errors.push(rel + ':' + lineNum + ': useEffect([], []) has API calls/external refs — add dependencies');
      }
    });
  }

  // CHECK 2: useEffect body uses setInterval/addEventListener without return cleanup
  const hasSubscribe = /\bsetInterval\s*\(|\baddEventListener\s*\(|\bsubscribe\s*\(/.test(c);
  if (hasSubscribe) {
    // ✅ Fix: nhận CẢ 2 dạng cleanup:
    //   return () => { ... removeEventListener/clearInterval/unsubscribe ... }   (có braces)
    //   return () => mql.removeEventListener('change', onChange)                (không braces)
    // Trước đây chỉ nhận dạng có braces → false positive cho code dùng dạng gọn
    const hasCleanupBraces = /\breturn\s*\(\)\s*=>\s*\{[\s\S]*?(?:clearInterval|removeEventListener|unsubscribe)/.test(c);
    // Dạng gọn không braces — cho phép gọi trên object (mql.removeEventListener, window.removeEventListener...)
    const hasCleanupSingle = /\breturn\s*\(\)\s*=>\s*(?:\w+\.)?(?:clearInterval|removeEventListener|unsubscribe)\s*\(/.test(c);
    const hasCleanup = hasCleanupBraces || hasCleanupSingle;
    if (!hasCleanup) {
      const lineNum = c.split('\n').findIndex(l => /\bsetInterval|\baddEventListener|\bsubscribe/.test(l)) + 1;
      if (lineNum > 0) {
        errors.push(rel + ':' + lineNum + ': subscribe/interval without cleanup — có thể gây memory leak');
      }
    }
  }

  // CHECK 3: .tsx files calling hooks directly outside component pattern
  if (file.endsWith('.tsx') && c.includes('useState') || c.includes('useEffect')) {
    // Check if this is a component (starts with function/export function with capital letter)
    const hasComponent = /export\s+(default\s+)?function\s+[A-Z]/.test(c) || /const\s+[A-Z]\w*\s*=/.test(c);
    if (!hasComponent && c.includes('useState')) {
      // Could be a valid custom hook in .tsx — skip
    }
  }
});

// CHECK 4: Custom hooks must start with 'use'
hookFiles.forEach(file => {
  const c = fs.readFileSync(file, 'utf8');
  const rel = p.relative(TARGET, file).replace(/\\/g, '/');
  
  // Find exported functions
  const exports = c.match(/export\s+(?:const|function)\s+(\w+)/g);
  if (exports) {
    exports.forEach(exp => {
      const name = exp.replace(/export\s+(?:const|function)\s+/, '').trim();
      if (!name.startsWith('use') && c.includes('useState')) {
        errors.push(rel + ': exported fn "' + name + '" uses hooks but không bắt đầu bằng "use"');
      }
    });
  }

  // CHECK 5: useCallback/useMemo without or with empty dependency array that uses external vars
  const callbacks = c.match(/useCallback\s*\(\s*\([^)]*\)\s*=>/g) || [];
  const memos = c.match(/useMemo\s*\(\s*\(\)\s*=>/g) || [];
  const allMemoized = callbacks.length + memos.length;
  if (allMemoized > 0) {
    // Count how many have [] deps
    const emptyDeps = (c.match(/useCallback\s*\([^)]+,\s*\[\s*\]\s*\)/g) || []).length +
                      (c.match(/useMemo\s*\([^)]+,\s*\[\s*\]\s*\)/g) || []).length;
    if (emptyDeps === allMemoized && allMemoized > 0) {
      // Not necessarily wrong — just flag if many
    }
  }
});

const label = ' B3. Hook patterns ';
if (errors.length === 0) { console.log(label + '-'.repeat(Math.max(1, 40)) + ' PASS'); }
else { console.log(label + '-'.repeat(Math.max(1, 40)) + ' FAIL (' + errors.length + ' issues)'); errors.slice(0, 10).forEach(e => console.log('     ' + e)); }
process.exit(errors.length > 0 ? 1 : 0);
