#!/usr/bin/env node

/**
 * ============================================================================
 * tao-ui-master-page.cjs — Kiểm tra tuân thủ skill tao-ui-master-page
 * ============================================================================
 *
 * Mục đích: Quét các file .tsx (chủ yếu page file trong pages/) để phát hiện
 *           vi phạm các rule trong .claude/skills/tao-ui-master-page/rules/*.rule.md
 *
 * Rule ID: MPAGE-01 .. MPAGE-16 kiểm tra tự động (port từ check-master-page.cjs).
 *          MPAGE-17, MPAGE-18 chỉ có tài liệu, kiểm tra thủ công (cấu trúc JSX
 *          phức tạp — không tự động hoá đáng tin cậy bằng regex).
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
    } else if (st.isFile() && /\.tsx$/.test(entry)) {
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
// CHECKS
// ============================================================================

/** MPAGE-01 */
function checkPagingUtilsImport(code) {
  if (/import\s+\{[^}]*\bPagingUtils\b[^}]*\}\s+from\s+['"]@\/shared\/utils/.test(code)
    || /import\s+\{[^}]*\bPagingUtils\b[^}]*\}\s+from\s+['"]\.\.\/.*shared\/utils/.test(code)) {
    return null;
  }
  return { level: 'ERROR', rule: 'MPAGE-01', message: 'Thiếu import PagingUtils.' };
}

/** MPAGE-02 */
function checkHeaderLayout(code) {
  if (/flex-col\s+sm:flex-row/.test(code) && /sm:justify-between/.test(code)) return null;
  if (/flex\s.*justify-between/.test(code)) return null;
  return { level: 'WARN', rule: 'MPAGE-02', message: 'Header nên dùng flex-col sm:flex-row sm:justify-between.' };
}

/** MPAGE-03 */
function checkRefreshButton(code) {
  if (/RefreshCw/.test(code) && /animate-spin/.test(code)) return null;
  if (/RefreshCw/.test(code)) {
    return { level: 'WARN', rule: 'MPAGE-03', message: 'Có RefreshCw nhưng thiếu animate-spin khi loading.' };
  }
  return { level: 'WARN', rule: 'MPAGE-03', message: 'Thiếu nút Làm mới (RefreshCw).' };
}

/** MPAGE-04 */
function checkCreateButton(code) {
  if (/Plus/.test(code) && /btn_them_moi|Them moi/i.test(code)) return null;
  if (!/Them|Create|create|Add/.test(code)) return null;
  return { level: 'WARN', rule: 'MPAGE-04', message: 'Có thể thiếu nút Thêm mới.' };
}

/** MPAGE-05 */
function checkTableOverflow(code) {
  if (/overflow-x-auto/.test(code)) return null;
  return { level: 'ERROR', rule: 'MPAGE-05', message: 'Thiếu overflow-x-auto bao bọc table.' };
}

/** MPAGE-06 */
function checkTableHeaderBg(code) {
  if (/bg-\[#f8f9fa\]/.test(code) || /bg-gray-50/.test(code) || /bg-gray-100/.test(code)) return null;
  return { level: 'WARN', rule: 'MPAGE-06', message: 'TableHeader nên có background #f8f9fa.' };
}

/** MPAGE-07 */
function checkTableRowHover(code) {
  if (/hover:bg-gray-50/.test(code)) return null;
  return { level: 'WARN', rule: 'MPAGE-07', message: 'TableRow nên có hover:bg-gray-50.' };
}

/** MPAGE-08 */
function checkActionColumnOrder(code) {
  const icons = [];
  const iconPattern = /<(Eye|Pencil|Copy|Trash2)\b/g;
  let m;
  while ((m = iconPattern.exec(code)) !== null) icons.push(m[1]);
  if (icons.length === 0) return null;

  const idx = { Eye: 0, Pencil: 1, Copy: 2, Trash2: 3 };
  let lastIdx = -1;
  let orderOk = true;
  for (const icon of icons) {
    if (idx[icon] !== undefined) {
      if (idx[icon] < lastIdx) { orderOk = false; break; }
      lastIdx = idx[icon];
    }
  }
  if (!orderOk && icons.includes('Eye') && icons.includes('Trash2')) {
    const eyePos = code.indexOf('<Eye');
    const trashPos = code.lastIndexOf('<Trash2');
    if (eyePos < trashPos) return null;
    return { level: 'ERROR', rule: 'MPAGE-08', message: 'Sai thứ tự icon: Eye -> Pencil -> Copy -> Trash2.' };
  }
  return null;
}

/** MPAGE-09 */
function checkActionIconClasses(code) {
  const classCheck = [
    { icon: 'Eye', cls: 'icon-primary', re: /<Eye[^>]*className\s*=\s*["'][^"']*icon-primary[^"']*["']/ },
    { icon: 'Pencil', cls: 'icon-warning', re: /<Pencil[^>]*className\s*=\s*["'][^"']*icon-warning[^"']*["']/ },
    { icon: 'Trash2', cls: 'icon-danger', re: /<Trash2[^>]*className\s*=\s*["'][^"']*icon-danger[^"']*["']/ },
  ];
  const issues = [];
  for (const c of classCheck) {
    if (code.includes(`<${c.icon}`) && !c.re.test(code)) issues.push(`${c.icon} thiếu ${c.cls}`);
  }
  if (issues.length > 0) {
    return { level: 'WARN', rule: 'MPAGE-09', message: issues.join('; ') };
  }
  return null;
}

/** MPAGE-10 */
function checkConfirmDialogForDelete(code) {
  const hasConfirmDialog = /ConfirmDialog/.test(code);
  const hasDeleteAction = /Trash2|btn_xoa|xoa|Xoa|delete/i.test(code);
  if (!hasDeleteAction) return null;
  if (hasConfirmDialog) return null;
  return { level: 'ERROR', rule: 'MPAGE-10', message: 'Có chức năng Xóa nhưng thiếu ConfirmDialog để xác nhận.' };
}

/** MPAGE-11 */
function checkDataQaButtons(code) {
  if (/data-qa\s*=\s*["'][^"']*btn_/.test(code)) return null;
  return { level: 'ERROR', rule: 'MPAGE-11', message: 'Thiếu data-qa trên buttons.' };
}

/** MPAGE-12 */
function checkLoadingState(code) {
  if (/PageLoader|loading|isLoading|Dang tai|Loading/i.test(code)) return null;
  return { level: 'WARN', rule: 'MPAGE-12', message: 'Nên có loading state.' };
}

/** MPAGE-13 */
function checkEmptyState(code) {
  if (/length\s*===\s*0|\.length\s*<\s*1|Khong co du lieu|Empty|empty/i.test(code)) return null;
  if (!/<Table|<table/i.test(code)) return null;
  return { level: 'WARN', rule: 'MPAGE-13', message: 'Nên có empty state khi không có dữ liệu.' };
}

/** MPAGE-14 */
function checkPaginationPosition(code) {
  const tableEnd = code.lastIndexOf('</Table>');
  const tableEnd2 = code.lastIndexOf('</table>');
  const paginationStart = code.indexOf('<PagingUtils');
  if (paginationStart === -1) return null;
  const realTableEnd = Math.max(tableEnd, tableEnd2);
  if (realTableEnd === -1 || paginationStart > realTableEnd) return null;
  return { level: 'WARN', rule: 'MPAGE-14', message: 'PagingUtils nên nằm sau Table.' };
}

/** MPAGE-15 */
function checkPageSizeStandard(code) {
  if (!/<PagingUtils/.test(code)) return null;
  if (/pageSizeOptions\s*=\s*\{\s*\[\s*10\s*,\s*20\s*,\s*50\s*,\s*100\s*\]/.test(code)) return null;
  return { level: 'WARN', rule: 'MPAGE-15', message: 'PagingUtils nên có pageSizeOptions={[10, 20, 50, 100]}.' };
}

/** MPAGE-16 (chỉ áp dụng cho file trong pages/) */
function checkPageFeaturesMetadata(code, filePath) {
  if (!isPageFile(filePath)) return null;

  const pageIdMatch = code.match(/export\s+const\s+PAGE_ID\s*=\s*['"]([^'"]+)['"]/);
  const featuresMatch = code.match(/export\s+const\s+PAGE_FEATURES\s*=\s*\[/);

  if (!pageIdMatch) {
    return { level: 'ERROR', rule: 'MPAGE-16', message: "Thiếu export const PAGE_ID = 'page-id'." };
  }
  if (!featuresMatch) {
    return { level: 'ERROR', rule: 'MPAGE-16', message: 'Thiếu export const PAGE_FEATURES = [...].' };
  }

  const featContent = code.match(/export\s+const\s+PAGE_FEATURES\s*=\s*\[([\s\S]*?)\r?\n\]/);
  if (featContent) {
    const featRegex = /\{\s*label:\s*['"]([^'"]+)['"]\s*,\s*code:\s*['"]([^'"]+)['"]\s*\}/g;
    const features = [];
    let fm;
    while ((fm = featRegex.exec(featContent[1])) !== null) features.push({ label: fm[1], code: fm[2] });
    if (features.length === 0) {
      return { level: 'ERROR', rule: 'MPAGE-16', message: 'PAGE_FEATURES rỗng - cần khai báo ít nhất 1 feature.' };
    }
  }

  return null;
}

// ============================================================================
// ENTRYPOINT THEO HỢP ĐỒNG
// ============================================================================

function checkFile(filePath, code) {
  const issues = [];

  const checks = [
    checkPagingUtilsImport,
    checkHeaderLayout,
    checkRefreshButton,
    checkCreateButton,
    checkTableOverflow,
    checkTableHeaderBg,
    checkTableRowHover,
    checkActionColumnOrder,
    checkActionIconClasses,
    checkConfirmDialogForDelete,
    checkDataQaButtons,
    checkLoadingState,
    checkEmptyState,
    checkPaginationPosition,
    checkPageSizeStandard,
  ];
  for (const fn of checks) {
    const r = fn(code);
    if (r) issues.push(r);
  }

  const r16 = checkPageFeaturesMetadata(code, filePath);
  if (r16) issues.push(r16);

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
    console.log('✅ Tất cả file đều đạt quy tắc skill tao-ui-master-page!');
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
