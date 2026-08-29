// ============================================================
// 🎯 Phục vụ skill: tich-hop-api-ui (UI thuần, không logic trong .tsx)
// check-layer.cjs — Kiểm tra logic/business code trong .tsx
// ============================================================
// 📋 Kiểm tra:
//    1. File .tsx gọi ApiService/apiCall/fetch/axios (API call trong UI)
//    2. File dialog/component .tsx dùng useState/useEffect/useCallback
//       (phải tách ra hook riêng trong thư mục hooks/)    3. File page .tsx >500 dòng + ≥3 hook usages → cần tách//    3. File .tsx import trực tiếp từ ../services hoặc services/
//       (chỉ hook mới được import service)
// 📤 Output:   PASS nếu 0 | FAIL + file:line + code snippet
// 📊 Severity: CRITICAL — vi phạm kiến trúc Pages→Hooks→Services
// 💡 Example:  node check-layer.cjs src/modules/KetoanApp
// ============================================================

const fs = require('fs'); const p = require('path'); const g = require('glob');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-layer.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);
let files = g.sync(TARGET + '/**/*.{ts,tsx}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }
const errors = [];

/**
 * Kiểm tra 1: API call trực tiếp trong .tsx
 * Pattern: ApiService. | ServiceAdmin. | apiCall( | await fetch | axios
 */
const API_PATTERNS = [
  /ApiService\w*\./,    // MonitorInvoiceApiServiceAdmin.getXxx
  /ServiceAdmin\./,     // fallback nếu tên service không có "Api"
  /apiCall\s*\(/,       // gọi apiCall trực tiếp
  /await\s+fetch\s*\(/, // fetch() thô
  /axios\./,            // axios trực tiếp
];

/**
 * Kiểm tra 2: Hook pattern trong dialog/component (phải ở hooks/)
 * Dialog và Component .tsx KHÔNG được dùng useState/useEffect/useCallback
 * (trừ khi import hook từ hooks/ folder)
 */
const HOOK_PATTERNS = [
  /\buseState\s*\(/,
  /\buseEffect\s*\(/,
  /\buseCallback\s*\(/,
  /\buseMemo\s*\(/,
  /\buseRef\s*\(/,
];

/**
 * Kiểm tra 3: Import service trong .tsx (không phải type-only import)
 * Chỉ hook mới được import service
 */
const SERVICE_IMPORT = /from\s+['"]\.\.\/services['"]/;
const TYPE_ONLY_IMPORT = /import\s+type\s+/;

// Phân loại file
const isDialog = (f) => f.replace(/\\/g,'/').includes('/dialogs/');
const isComponent = (f) => f.replace(/\\/g,'/').includes('/components/');
const isPage = (f) => f.replace(/\\/g,'/').includes('/pages/');

files.filter(f => f.endsWith('.tsx')).forEach(file => {
  const rel = p.relative(TARGET, file).replace(/\\/g, '/');
  const c = fs.readFileSync(file, 'utf8'); const lines = c.split('\n');

  // === Check 1: API calls ===
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('*') || t.startsWith('import')) return;
    for (const pat of API_PATTERNS) {
      if (pat.test(t)) {
        errors.push(rel + ':' + (i+1) + ': [API] ' + t.substring(0, 80));
        break;
      }
    }
  });

  // === Check 2: Hook usage in dialog/component/page ===
  // Dialog và Component: TUYỆT ĐỐI không được dùng useState/useEffect/useCallback/useMemo
  // Page: được phép UI state đơn giản, nhưng nếu >200 dòng VÀ có ≥3 hook → flag cần tách
  if (isDialog(file) || isComponent(file)) {
    // Kiểm tra file có import hook từ hooks/ không
    const importsHook = lines.some(l =>
      /from\s+['"]\.\.\/hooks\//.test(l) || /from\s+['"].*hooks\//.test(l)
    );
    // Nếu không import hook từ hooks/ mà vẫn dùng useState/useEffect → lỗi
    if (!importsHook) {
      lines.forEach((l, i) => {
        const t = l.trim();
        if (t.startsWith('//') || t.startsWith('*') || t.startsWith('import')) return;
        for (const pat of HOOK_PATTERNS) {
          if (pat.test(t)) {
            errors.push(rel + ':' + (i+1) + ': [Hook] ' + t.substring(0, 80) +
              ' — dialog/component phải tách logic ra hook riêng');
            break;
          }
        }
      });
    }
  }

  // Check page files: nếu >500 dòng và có ≥3 hook pattern → cảnh báo cần tách
  if (isPage(file)) {
    const hasApiCall = lines.some((l, i) => {
      const t = l.trim();
      if (t.startsWith('//') || t.startsWith('*') || t.startsWith('import')) return false;
      return API_PATTERNS.some(pat => pat.test(t));
    });
    // API call trong page → CRITICAL (giống check 1, nhưng gắn nhãn riêng)
    if (hasApiCall) {
      // Đã được check 1 bắt, không cần duplicate
    }

    // Đếm hook usages
    let hookCount = 0;
    lines.forEach((l, i) => {
      const t = l.trim();
      if (t.startsWith('//') || t.startsWith('*') || t.startsWith('import')) return;
      for (const pat of HOOK_PATTERNS) {
        if (pat.test(t)) { hookCount++; break; }
      }
    });

    // Ngưỡng: page >500 dòng và có ≥3 hook usages → cần review
    if (lines.length > 500 && hookCount >= 3) {
      errors.push(rel + ': ' + lines.length + ' dòng, ' + hookCount + ' hook usages ' +
        '— page quá nhiều logic, nên tách ra hook riêng trong thư mục hooks/');
    }
  }

  // === Check 3: Service import trong dialog/component (bỏ qua type-only) ===
  if (isDialog(file) || isComponent(file)) {
    const svcLines = lines.filter(l => SERVICE_IMPORT.test(l) && !TYPE_ONLY_IMPORT.test(l));
    if (svcLines.length > 0) {
      const idx = lines.findIndex(l => SERVICE_IMPORT.test(l) && !TYPE_ONLY_IMPORT.test(l));
      errors.push(rel + ':' + (idx+1) + ': [Import] import service trực tiếp — chỉ hook mới được import service');
    }
  }
});

const label = ' B3. API call / logic in .tsx ';
if (errors.length === 0) { console.log(label + '-'.repeat(Math.max(1, 40)) + ' PASS'); }
else { console.log(label + '-'.repeat(Math.max(1, 40)) + ' FAIL (' + errors.length + ' issues)'); errors.slice(0, 10).forEach(e => console.log('     ' + e)); }
process.exit(errors.length > 0 ? 1 : 0);
