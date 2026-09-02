#!/usr/bin/env node

/**
 * ============================================================================
 * filter-phan-trang.cjs — Kiểm tra tuân thủ skill filter-phan-trang
 * ============================================================================
 *
 * Mục đích: Quét mã nguồn TS/TSX (chủ yếu page file trong pages/) để phát
 *           hiện vi phạm các rule trong
 *           .claude/skills/filter-phan-trang/rules/*.rule.md
 *
 * Rule ID: FPT-01 .. FPT-12 (xem thư mục rules/ để biết chi tiết từng rule)
 *
 * Ghi chú: Bản gốc (check-pagination.cjs) có tính năng tự động gộp nội dung
 * hook cùng feature (pages/XxxPage.tsx -> hooks/useXxx.ts) trước khi check để
 * giảm false-positive. Bản port này giữ nguyên toàn bộ logic của 12 rule,
 * nhưng kiểm tra theo từng file độc lập (đúng hợp đồng checkFile(filePath, code))
 * — không tự gộp file hook liên quan.
 * ============================================================================
 */

const fs = require('node:fs');
const path = require('node:path');

// ============================================================================
// HELPERS
// ============================================================================

function collectFiles(dir) {
  const result = [];
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return result;
  for (const entry of fs.readdirSync(dir)) {
    if (['node_modules', 'dist', 'build', '.git'].includes(entry)) continue;
    const full = path.join(dir, entry);
    let st;
    try {
      st = fs.statSync(full);
    } catch (e) {
      continue;
    }
    if (st.isDirectory()) {
      result.push(...collectFiles(full));
    } else if (st.isFile() && /\.(ts|tsx)$/.test(entry)) {
      result.push(full);
    }
  }
  return result;
}

function isPageFile(filePath) {
  const rel = filePath.replace(/\\/g, '/');
  return /\/pages\/[^/]+\.tsx$/.test(rel);
}

// ============================================================================
// CHECKS — mỗi hàm trả về 1 issue hoặc null
// ============================================================================

/** FPT-01: import PagingUtils/SimplePaging */
function checkPagingUtilsImport(code) {
  const hasImport = /import\s+\{[^}]*\b(PagingUtils|SimplePaging)\b[^}]*\}\s+from\s+['"]@\/shared\/utils(\/PagingUtils)?['"]/.test(code)
    || /import\s+\{[^}]*\b(PagingUtils|SimplePaging)\b[^}]*\}\s+from\s+['"]\.\.\/.*shared\/utils(\/PagingUtils)?['"]/.test(code);
  if (!hasImport) {
    return { level: 'ERROR', rule: 'FPT-01', message: 'Thiếu import PagingUtils/SimplePaging từ @/shared/utils/PagingUtils.' };
  }
  return null;
}

/** FPT-02: cấm pagination thư viện ngoài */
function checkNoExternalPagination(code) {
  const externalPatterns = [
    /from\s+['"]@mui\/material['"]/,
    /from\s+['"]antd['"]/,
    /from\s+['"]react-bootstrap['"]/,
    /import\s+\{[^}]*\bPagination\b[^}]*\}\s+from\s+['"](?!@\/shared)/,
  ];
  for (const p of externalPatterns) {
    if (p.test(code)) {
      return { level: 'ERROR', rule: 'FPT-02', message: 'Phát hiện import Pagination từ thư viện ngoài (MUI/AntD/Bootstrap). Phải dùng PagingUtils của dự án.' };
    }
  }
  return null;
}

/** FPT-03: cấm tự viết pagination thủ công */
function checkNoCustomPagination(code) {
  const customPattern = /<button[^>]*onClick\s*=\s*\{[^}]*setPage\b[^}]*\}[^>]*>/i;
  const customPattern2 = /onClick\s*=\s*\{[^}]*=>\s*setCurrentPage\s*\([^)]*\)[^}]*\}/i;
  if (customPattern.test(code) || customPattern2.test(code)) {
    return { level: 'ERROR', rule: 'FPT-03', message: 'Phát hiện nút pagination thủ công. Phải dùng <PagingUtils> component.' };
  }
  return null;
}

/** FPT-04: getPageSizeFromStorage */
function checkGetPageSizeFromStorage(code) {
  if (/getPageSizeFromStorage/.test(code)) return null;
  return { level: 'WARN', rule: 'FPT-04', message: 'Không tìm thấy getPageSizeFromStorage(). Nên dùng để khởi tạo pageSize từ localStorage.' };
}

/** FPT-05: useDebounce cho searchTerm */
function checkUseDebounceForSearch(code) {
  if (/useDebounce\s*\(/.test(code)) {
    const match = code.match(/useDebounce\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)/);
    if (match) {
      const delay = parseInt(match[2], 10);
      if (delay === 800) return null;
      return { level: 'WARN', rule: 'FPT-05', message: `useDebounce có delay=${delay}ms, nên dùng 800ms.` };
    }
    return null;
  }
  if (!/searchTerm|search|keyword/.test(code)) return null;
  return { level: 'WARN', rule: 'FPT-05', message: 'Có ô tìm kiếm nhưng thiếu useDebounce. Nên debounce 800ms để tránh gọi API quá nhiều.' };
}

/** FPT-06: sessionStorage cho currentPage */
function checkSessionStoragePage(code) {
  const hasStorage = /sessionStorage\.(setItem|getItem)\s*\([^)]*\b(page|currentPage|current_page)\b/i.test(code)
    || /STORAGE_KEY|PAGE_KEY|PAGE_STORAGE_KEY/.test(code)
    || /saveCurrentPageToStorage|getCurrentPageFromStorage|clearCurrentPageFromStorage/.test(code);
  if (hasStorage) return null;
  return { level: 'WARN', rule: 'FPT-06', message: 'Không tìm thấy sessionStorage cho currentPage. Nên lưu để giữ trạng thái trang.' };
}

/** FPT-07: reset page về 1 khi filter đổi */
function checkResetPageOnFilterChange(code) {
  const hasFilterReset = /setCurrentPage\s*\(\s*1\s*\)/.test(code)
    || /\.page\s*=\s*1/.test(code)
    || /page\s*:\s*1/.test(code)
    || /'page',\s*1/.test(code);
  const hasClearStorage = /clearCurrentPageFromStorage/.test(code);
  const hasSetFiltersPage1 = /setFilters\s*\([^)]*page\s*:\s*1[^)]*\)/.test(code);
  if (hasFilterReset || hasClearStorage || hasSetFiltersPage1) return null;
  return { level: 'ERROR', rule: 'FPT-07', message: 'Không phát hiện reset page về 1 khi filter thay đổi. Khi filter đổi phải reset page=1.' };
}

/** FPT-08: nút Làm mới */
function checkRefreshButton(code) {
  if (/RefreshCw|Lam moi|lam moi|refresh/i.test(code)) return null;
  return { level: 'WARN', rule: 'FPT-08', message: 'Không tìm thấy nút Làm mới. Nên thêm để user có thể refresh dữ liệu.' };
}

/** FPT-09: refresh reset page về 1 */
function checkRefreshResetsPage(code) {
  if (!/RefreshCw|Lam moi|lam moi|refresh/i.test(code)) return null;
  const refreshFunc = code.match(/const\s+(handleRefresh|onRefresh|refresh)\s*=[\s\S]{0,500}?}/i);
  if (refreshFunc) {
    const body = refreshFunc[0];
    if (/setCurrentPage\s*\(\s*1\s*\)/.test(body) || /page\s*:\s*1/.test(body)) return null;
  }
  if (/refresh.*page.*1|page.*1.*refresh/i.test(code)) return null;
  return { level: 'WARN', rule: 'FPT-09', message: 'Nút Refresh nên reset page về 1 khi làm mới.' };
}

/** FPT-10: useEffect dùng debounced value */
function checkDebouncedInUseEffect(code) {
  const useEffects = code.match(/useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?\},\s*\[([\s\S]*?)\]\s*\)/g);
  if (!useEffects) return null;
  for (const eff of useEffects) {
    const deps = eff.match(/,\s*\[([\s\S]*?)\]\s*\)/);
    if (deps) {
      const depStr = deps[1];
      if (/\bsearchTerm\b|\bsearch\b/.test(depStr) && !/\bdebounced/i.test(depStr)) {
        return { level: 'ERROR', rule: 'FPT-10', message: 'useEffect dependency đang dùng raw searchTerm/search thay vì debouncedSearchTerm. Sẽ gây gọi API quá nhiều.' };
      }
    }
  }
  return null;
}

/** FPT-11: pageSize lưu localStorage */
function checkPageSizeLocalStorage(code) {
  if (/localStorage\.(setItem|getItem)\s*\([^)]*page.?size/i.test(code)
    || /getPageSizeFromStorage/.test(code)
    || /app_page_size/.test(code)
    || /PagingUtils/.test(code)) {
    return null;
  }
  return { level: 'WARN', rule: 'FPT-11', message: 'Không tìm thấy localStorage cho pageSize. Nên dùng getPageSizeFromStorage().' };
}

/** FPT-12: pageSizeOptions chuẩn */
function checkPageSizeOptions(code) {
  const match = code.match(/pageSizeOptions\s*[=:]\s*\[([^\]]*)\]/);
  if (!match) return null;
  const opts = match[1].split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  const standard = [10, 20, 50, 100];
  const allMatch = opts.length === standard.length && opts.every((v, i) => v === standard[i]);
  if (allMatch) return null;
  return { level: 'WARN', rule: 'FPT-12', message: `Page size options hiện tại: [${opts}], chuẩn: [${standard}].` };
}

// ============================================================================
// ENTRYPOINT THEO HỢP ĐỒNG
// ============================================================================

function checkFile(filePath, code) {
  const issues = [];
  const page = isPageFile(filePath);

  // Rule chỉ áp dụng cho page file
  if (page) {
    const r1 = checkPagingUtilsImport(code); if (r1) issues.push(r1);
    const r2 = checkNoExternalPagination(code); if (r2) issues.push(r2);
    const r3 = checkNoCustomPagination(code); if (r3) issues.push(r3);
  }

  // Rule áp dụng cho mọi file (page/hook)
  const checks = [
    checkGetPageSizeFromStorage,
    checkUseDebounceForSearch,
    checkSessionStoragePage,
    checkResetPageOnFilterChange,
    checkRefreshButton,
    checkRefreshResetsPage,
    checkDebouncedInUseEffect,
    checkPageSizeLocalStorage,
    checkPageSizeOptions,
  ];
  for (const fn of checks) {
    const r = fn(code);
    if (r) issues.push(r);
  }

  for (const issue of issues) {
    if (issue.line === undefined) issue.line = null;
  }

  return issues;
}

function check(rootDir) {
  const files = collectFiles(rootDir);
  const fileResults = [];

  for (const f of files) {
    let code;
    try {
      code = fs.readFileSync(f, 'utf-8');
    } catch (e) {
      continue;
    }
    const issues = checkFile(f, code);
    if (issues.length > 0) {
      const rel = path.relative(rootDir, f).replace(/\\/g, '/');
      fileResults.push({ file: rel, issues });
    }
  }

  return fileResults;
}

module.exports = { check, checkFile, collectFiles };

// ============================================================================
// CLI
// ============================================================================

if (require.main === module) {
  const rootDir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '..', '..', '..', '..');
  const fileResults = check(rootDir);

  if (fileResults.length === 0) {
    console.log('✅ Tất cả file đều đạt quy tắc skill filter-phan-trang!');
    process.exit(0);
  }

  let totalErrors = 0;
  let totalWarns = 0;
  for (const fr of fileResults) {
    for (const issue of fr.issues) {
      console.log(`[${issue.level}] ${fr.file}${issue.line ? ':' + issue.line : ''} — ${issue.rule}: ${issue.message}`);
      if (issue.level === 'ERROR') totalErrors++; else totalWarns++;
    }
  }

  console.log(`\n📊 Tổng kết: ❌ ERROR: ${totalErrors}  |  ⚠️ WARN: ${totalWarns}`);
  process.exit(totalErrors > 0 ? 1 : 0);
}
