#!/usr/bin/env node

/**
 * ============================================================================
 * tao-dialog-new.cjs — Kiểm tra tuân thủ skill tao-dialog-new
 * ============================================================================
 *
 * Mục đích: Quét các file dialog (.tsx trong thư mục dialog(s)/) để phát hiện
 *           vi phạm các rule trong .claude/skills/tao-dialog-new/rules/*.rule.md
 *
 * Rule ID: DLGNEW-01 .. DLGNEW-16 kiểm tra tự động (port từ check-dialog-new.cjs).
 *          DLGNEW-17 .. DLGNEW-20 chỉ có tài liệu, kiểm tra thủ công (không sinh
 *          issue tự động — xem rules/17-20 để biết chi tiết).
 *          DLGNEW-09 (nhận diện pattern) không phát sinh ERROR/WARN, chỉ dùng
 *          nội bộ để quyết định các rule theo pattern (11, 12, 13, 16) có áp
 *          dụng hay không.
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

function isDialogFile(filePath) {
  const rel = filePath.replace(/\\/g, '/');
  return /\.tsx$/.test(rel) && /(dialog|Dialog)/.test(rel);
}

function detectPattern(code) {
  if (/DmFormField/.test(code)) return 'danh-muc';
  if (/<Label/.test(code) && /SearchCombobox/.test(code)) return 'nghiep-vu';
  return 'custom';
}

// ============================================================================
// CHECKS — mỗi hàm trả về 1 issue hoặc null
// ============================================================================

/** DLGNEW-01 */
function checkDialogContentImport(code) {
  if (/import\s+\{[^}]*\bDialogContent\b[^}]*\}\s+from\s+['"]@\/shared\/components\/ui\/dialog['"]/.test(code)
    || /import\s+\{[^}]*\bDialogContent\b[^}]*\}\s+from\s+['"]\.\.\/.*shared\/components\/ui\/dialog['"]/.test(code)) {
    return null;
  }
  return { level: 'ERROR', rule: 'DLGNEW-01', message: 'Thiếu import DialogContent từ @/shared/components/ui/dialog.' };
}

/** DLGNEW-02 */
function checkMaxWidth(code) {
  if (/maxWidth\s*[=:]/.test(code) || /max-w-\[?\d/.test(code)) return null;
  return { level: 'ERROR', rule: 'DLGNEW-02', message: 'Thiếu maxWidth hoặc max-w-[X] để kiểm soát chiều rộng dialog.' };
}

/** DLGNEW-03 */
function checkCloseButton(code) {
  if (/data-qa\s*=\s*["']btn_dong_dialog["']/.test(code)
    || /data-qa\s*=\s*["']btn_dong["']/.test(code)
    || (/<X\b/.test(code) && /variant\s*=\s*["']ghost["']/.test(code))) {
    return null;
  }
  return { level: 'ERROR', rule: 'DLGNEW-03', message: 'Thiếu nút X đóng dialog (icon X + data-qa btn_dong_dialog).' };
}

/** DLGNEW-04 */
function checkThreeModes(code) {
  if (/isReadonly|isReadOnly|isView|viewOnly/.test(code)) return null;
  if (/mode\s*===?\s*['"]view/.test(code) || /mode\s*===?\s*['"]create/.test(code)) return null;
  return { level: 'WARN', rule: 'DLGNEW-04', message: 'Nên có isReadonly flag hoặc so sánh mode cho 3 chế độ View/Create/Edit.' };
}

/** DLGNEW-05 */
function checkViewModeDisplay(code) {
  if (/DmFieldValue/.test(code) || /DmTabFieldValue/.test(code)) return null;
  if (/isReadOnly|isReadonly|isView/.test(code)) {
    if (/\{[^}]*\?\s*\(?\s*<div/.test(code) || /\{[^}]*\?\s*\(?\s*<span/.test(code)) return null;
    return { level: 'WARN', rule: 'DLGNEW-05', message: 'Có thể đang dùng input disabled thay vì div/span cho view mode.' };
  }
  return null;
}

/** DLGNEW-06 */
function checkValidationErrorDialog(code) {
  if (/ValidationErrorDialog/.test(code) || /serverError/.test(code)) return null;
  return { level: 'ERROR', rule: 'DLGNEW-06', message: 'Thiếu ValidationErrorDialog cho lỗi server.' };
}

/** DLGNEW-07 */
function checkFooter(code) {
  if (/DmDialogFooter/.test(code)) return null;
  if (/btn_huy/.test(code) && /btn_luu/.test(code)) return null;
  return { level: 'WARN', rule: 'DLGNEW-07', message: 'Thiếu footer (Hủy + Lưu hoặc DmDialogFooter).' };
}

/** DLGNEW-08 */
function checkDataQaFields(code) {
  const matches = code.match(/data-qa\s*=\s*["'][^"']*["']/g) || [];
  const fieldQa = matches.filter(m => /data-qa\s*=\s*["'](i_|sel_|dt_|chk_|r_)/.test(m));
  if (fieldQa.length >= 2) return null;
  return { level: 'ERROR', rule: 'DLGNEW-08', message: `Chỉ có ${fieldQa.length} field data-qa (cần >= 2).` };
}

/** DLGNEW-10 */
function checkValidateOnBlur(code) {
  if (/handleBlur/.test(code) || /onBlur\s*=\s*\{/.test(code)) return null;
  return { level: 'WARN', rule: 'DLGNEW-10', message: 'Nên validate onBlur thay vì onChange.' };
}

/** DLGNEW-11 (chỉ áp dụng pattern danh-muc) */
function checkPatternAFooter(code, pattern) {
  if (pattern !== 'danh-muc') return null;
  if (/DmDialogFooter/.test(code) || (/btn_luu/.test(code) && /Thêm mới|Them moi/i.test(code))) return null;
  return { level: 'WARN', rule: 'DLGNEW-11', message: 'Pattern Danh Mục nên có Lưu & Thêm mới.' };
}

/** DLGNEW-12 (chỉ áp dụng pattern nghiep-vu) */
function checkPatternBFooter(code, pattern) {
  if (pattern !== 'nghiep-vu') return null;
  if (/formatCurrency|formatNumber|Tong tien|Ghi sổ|Ghi so/.test(code)) return null;
  return { level: 'WARN', rule: 'DLGNEW-12', message: 'Pattern Nghiệp Vụ nên có tổng tiền hoặc Ghi sổ.' };
}

/** DLGNEW-13 (bỏ qua pattern danh-muc) */
function checkNumberInput(code, pattern) {
  if (pattern === 'danh-muc') return null;
  if (/inputMode\s*=\s*["']numeric["']/.test(code)) return null;
  if (/type\s*=\s*["']number["']/.test(code)) {
    return { level: 'WARN', rule: 'DLGNEW-13', message: 'Đang dùng type="number" — nên dùng type="text" inputMode="numeric".' };
  }
  return null;
}

/** DLGNEW-14 */
function checkTabsTrigger(code) {
  if (/DmTabTrigger/.test(code) || /tab_hach_toan/.test(code)) return null;
  if (!/<Tab/.test(code) && !/tab/.test(code)) return null;
  return { level: 'WARN', rule: 'DLGNEW-14', message: 'Nên dùng DmTabTrigger cho tabs.' };
}

/** DLGNEW-15 */
function checkHookSeparation(code) {
  if (/use\w+DialogForm|use\w+DlgForm/.test(code)) return null;
  return { level: 'ERROR', rule: 'DLGNEW-15', message: 'Thiếu hook form riêng (useXxxDialogForm).' };
}

/** DLGNEW-16 (chỉ áp dụng pattern danh-muc) */
function checkGridForm(code, pattern) {
  if (pattern !== 'danh-muc') return null;
  if (/grid-cols-\d/.test(code)) return null;
  return { level: 'WARN', rule: 'DLGNEW-16', message: 'Pattern Danh Mục nên dùng grid-cols layout.' };
}

// ============================================================================
// ENTRYPOINT THEO HỢP ĐỒNG
// ============================================================================

function checkFile(filePath, code) {
  if (!isDialogFile(filePath)) return [];

  const pattern = detectPattern(code);
  const issues = [];

  const plainChecks = [
    checkDialogContentImport,
    checkMaxWidth,
    checkCloseButton,
    checkThreeModes,
    checkViewModeDisplay,
    checkValidationErrorDialog,
    checkFooter,
    checkDataQaFields,
    checkValidateOnBlur,
    checkTabsTrigger,
    checkHookSeparation,
  ];
  for (const fn of plainChecks) {
    const r = fn(code);
    if (r) issues.push(r);
  }

  const patternChecks = [checkPatternAFooter, checkPatternBFooter, checkNumberInput, checkGridForm];
  for (const fn of patternChecks) {
    const r = fn(code, pattern);
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
    if (!isDialogFile(f)) continue;
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
    console.log('✅ Tất cả file đều đạt quy tắc skill tao-dialog-new!');
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
