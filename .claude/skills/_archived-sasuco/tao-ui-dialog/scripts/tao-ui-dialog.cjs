/**
 * Script kiểm tra tuân thủ quy tắc Dialog/Form — SASUCO InvoiceEasy
 * Port từ check-dialog.cjs cũ (giữ nguyên toàn bộ logic 16 rule DLG-01..16),
 * chuyển sang hợp đồng check(rootDir)/checkFile(filePath, code)/collectFiles(dir).
 *
 * Cách dùng CLI: node tao-ui-dialog.cjs [rootDir]
 */

const fs = require('node:fs');
const path = require('node:path');

const CHECKS = {
  'DLG-01': {
    level: 'ERROR',
    desc: 'Import DialogContent từ @/shared/components/ui/dialog',
    check(content) {
      if (/import\s+\{[^}]*\bDialogContent\b[^}]*\}\s+from\s+['"]@\/shared\/components\/ui\/dialog['"]/.test(content)
        || /import\s+\{[^}]*\bDialogContent\b[^}]*\}\s+from\s+['"]\.\.\/.*shared\/components\/ui\/dialog['"]/.test(content)) {
        return { pass: true };
      }
      return { pass: false, detail: 'Thiếu import DialogContent từ @/shared/components/ui/dialog' };
    }
  },
  'DLG-02': {
    level: 'WARN',
    desc: 'Có maxWidth prop hoặc className max-w-[Xpx] để kiểm soát chiều rộng',
    check(content) {
      if (/maxWidth\s*[=:]/.test(content) || /max-w-\[?\d/.test(content) || /max-w-(sm|md|lg|xl|2xl|3xl|4xl)/.test(content)) {
        return { pass: true };
      }
      return { pass: false, detail: 'Thiếu maxWidth prop hoặc max-w-[Xpx] className' };
    }
  },
  'DLG-03': {
    level: 'ERROR',
    desc: 'Nút X đóng dialog với data-qa="btn_dong_dialog", variant="ghost", size="sm"',
    check(content) {
      if (/data-qa\s*=\s*["']btn_dong_dialog["']/.test(content)
        || /data-qa\s*=\s*["']btn_dong["']/.test(content)
        || (/<X\b/.test(content) && /variant\s*=\s*["']ghost["']/.test(content))) {
        return { pass: true };
      }
      if (/DialogContent/.test(content) && !/<X\b/.test(content)) {
        return { pass: false, detail: 'Thiếu nút X đóng dialog (icon X + data-qa btn_dong_dialog)' };
      }
      return { pass: true };
    }
  },
  'DLG-04': {
    level: 'WARN',
    desc: 'DialogTitle thay đổi theo mode (View/Create/Edit)',
    check(content) {
      if (/DialogTitle/.test(content)) {
        if (/isViewOnly|mode\s*===?\s*['"]view|mode\s*===?\s*['"]create|mode\s*===?\s*['"]edit/.test(content)) {
          return { pass: true };
        }
        return { pass: false, detail: 'DialogTitle nên thay đổi theo mode (View/Create/Edit)' };
      }
      return { pass: true };
    }
  },
  'DLG-05': {
    level: 'WARN',
    desc: 'Footer dùng DialogFooter + border-t + gap-3',
    check(content) {
      if (/DialogFooter/.test(content)) return { pass: true };
      if (/DialogContent/.test(content)) {
        return { pass: false, detail: 'Dialog nên có DialogFooter cho buttons' };
      }
      return { pass: true };
    }
  },
  'DLG-06': {
    level: 'ERROR',
    desc: 'Nút submit bị disabled={saving/submitting/loading} đang gọi API',
    check(content) {
      if (/disabled\s*=\s*\{/.test(content) && /submitting|saving|loading/i.test(content)) return { pass: true };
      if (/disabled\s*=\s*\{/.test(content)) return { pass: true };
      return { pass: false, detail: 'Nút submit nên có disabled={submitting} để tránh double-submit' };
    }
  },
  'DLG-07': {
    level: 'ERROR',
    desc: 'Validate onBlur, KHÔNG validate onChange cho input',
    check(content) {
      if (/onBlur\s*=\s*\{/.test(content)) return { pass: true };
      if (/handleSubmit|onSubmit/.test(content) || /formData|useForm/i.test(content)) {
        return { pass: false, detail: 'Thiếu validate onBlur cho form inputs' };
      }
      return { pass: true };
    }
  },
  'DLG-08': {
    level: 'WARN',
    desc: 'Input lỗi có border-destructive + AlertCircle icon',
    check(content) {
      if (/border-destructive/.test(content)) return { pass: true };
      if (/errors|error|touched/.test(content)) {
        return { pass: false, detail: 'Có validate nhưng thiếu border-destructive cho input lỗi' };
      }
      return { pass: true };
    }
  },
  'DLG-09': {
    level: 'ERROR',
    desc: 'Input số dùng type="text" inputMode="numeric", KHÔNG dùng type="number"',
    check(content) {
      if (/type\s*=\s*["']number["']/.test(content) && /inputMode/.test(content)) return { pass: true };
      if (/type\s*=\s*["']number["']/.test(content)) {
        return { pass: false, detail: 'Input số dùng type="number", nên đổi sang type="text" inputMode="numeric"' };
      }
      return { pass: true };
    }
  },
  'DLG-10': {
    level: 'WARN',
    desc: 'Textarea dùng className="invoice-textarea"',
    check(content) {
      if (/invoice-textarea/.test(content)) return { pass: true };
      if (/<Textarea/.test(content)) {
        return { pass: false, detail: 'Textarea nên có className="invoice-textarea"' };
      }
      return { pass: true };
    }
  },
  'DLG-11': {
    level: 'ERROR',
    desc: 'View mode dùng <div> hoặc <span>, KHÔNG dùng input disabled',
    check(content) {
      // Giữ nguyên logic gốc: hiện luôn pass, chỉ cảnh báo tường minh khi thiếu xử lý view mode rõ ràng
      return { pass: true };
    }
  },
  'DLG-12': {
    level: 'INFO',
    desc: 'Dùng SearchCombobox cho trường foreign key',
    check() { return { pass: true }; }
  },
  'DLG-13': {
    level: 'ERROR',
    desc: 'data-qa attribute trên các input/button/select',
    check(content) {
      const hasInputQa = /data-qa\s*=\s*["']i_/.test(content);
      const hasBtnQa = /data-qa\s*=\s*["']btn_/.test(content);
      const hasSelQa = /data-qa\s*=\s*["']sel_/.test(content);
      const hasCmbQa = /data-qa\s*=\s*["']cmb_/.test(content);
      const totalQa = (hasInputQa ? 1 : 0) + (hasBtnQa ? 1 : 0) + (hasSelQa ? 1 : 0) + (hasCmbQa ? 1 : 0);
      if (totalQa >= 2 || hasInputQa || hasBtnQa) return { pass: true };
      return { pass: false, detail: 'Thiếu data-qa trên các phần tử tương tác' };
    }
  },
  'DLG-14': {
    level: 'WARN',
    desc: 'Lỗi hiển thị inline với AlertCircle icon',
    check(content) {
      if (/AlertCircle/.test(content) && /errors|error/.test(content)) return { pass: true };
      if (/errors|error/.test(content) && !/AlertCircle/.test(content)) {
        return { pass: false, detail: 'Có xử lý error nhưng thiếu AlertCircle icon inline' };
      }
      return { pass: true };
    }
  },
  'DLG-15': {
    level: 'INFO',
    desc: 'Dialog header dùng flex items-center justify-between',
    check(content) {
      if (/DialogHeader/.test(content) && /flex.*justify-between/.test(content)) return { pass: true };
      if (/DialogHeader/.test(content)) {
        return { pass: false, detail: 'DialogHeader nên có flex justify-between' };
      }
      return { pass: true };
    }
  },
  'DLG-16': {
    level: 'ERROR',
    desc: 'Hook dialog form có useEffect reset formData/errors khi initialData thay đổi (kèm `open` trong deps)',
    check(content) {
      const hasHookWithInitial = /function\s+use\w*DialogForm\b[\s\S]*?\{[\s\S]*?useState[\s\S]*?initialData/.test(content);
      if (!hasHookWithInitial) return { pass: true };
      const hasResetEffect = /useEffect[\s\S]*?setFormData[\s\S]*?\[\s*initialData/.test(content);
      if (!hasResetEffect) {
        return { pass: false, detail: 'Hook form dialog thiếu useEffect reset formData/errors khi initialData thay đổi. Dialog sẽ không reset được khi đóng/mở lại với record khác.' };
      }
      const hasOpenInDeps = /useEffect[\s\S]*?setFormData[\s\S]*?\[\s*initialData[\s\S]*?open\s*\]/.test(content);
      if (!hasOpenInDeps) {
        return { pass: false, detail: 'Hook dialog form có useEffect reset nhưng THIẾU `open` trong deps. Khi create→đóng→create lại, initialData vẫn null → useEffect không chạy → form không reset. Thêm `open` vào deps: [initialData, cloneMode, open].' };
      }
      return { pass: true };
    }
  },
};

function collectFiles(dir) {
  const result = [];
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectFiles(full));
    } else if (entry.isFile() && /\/dialog(s)?\/[^/]+\.tsx$/.test(full.replace(/\\/g, '/'))) {
      result.push(full);
    }
  }
  return result;
}

function findRelatedHooks(dialogPath) {
  const hooksDir = path.join(path.dirname(path.dirname(dialogPath)), 'hooks');
  if (!fs.existsSync(hooksDir)) return [];
  return fs.readdirSync(hooksDir, { withFileTypes: true })
    .filter(e => e.isFile() && /\.(ts|tsx)$/.test(e.name))
    .map(e => path.join(hooksDir, e.name));
}

function checkFile(filePath, code) {
  const relatedHooks = findRelatedHooks(filePath).filter(h => h !== filePath);
  const merged = relatedHooks.length > 0
    ? code + '\n' + relatedHooks.map(h => { try { return fs.readFileSync(h, 'utf8'); } catch { return ''; } }).join('\n')
    : code;

  const issues = [];
  for (const [rule, def] of Object.entries(CHECKS)) {
    let result = def.check(merged);
    if (!result.pass && relatedHooks.length > 0) {
      const dialogOnly = def.check(code);
      if (dialogOnly.pass !== result.pass) continue; // pass nhờ hook liên quan — bỏ qua, không báo lỗi
    }
    if (!result.pass) {
      issues.push({ level: def.level === 'INFO' ? 'WARN' : def.level, rule, message: `${def.desc} — ${result.detail}`, line: null });
    }
  }
  return issues;
}

function check(rootDir) {
  const fileResults = [];
  for (const filePath of collectFiles(rootDir)) {
    const code = fs.readFileSync(filePath, 'utf8');
    const issues = checkFile(filePath, code);
    if (issues.length > 0) {
      fileResults.push({ file: path.relative(rootDir, filePath).replace(/\\/g, '/'), issues });
    }
  }
  return fileResults;
}

module.exports = { check, checkFile, collectFiles };

if (require.main === module) {
  const rootDir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '..', '..', '..', '..');
  const fileResults = check(rootDir);
  if (fileResults.length === 0) {
    console.log('✅ Tất cả file đều đạt quy tắc skill tao-ui-dialog!');
    process.exit(0);
  }
  let totalErrors = 0, totalWarns = 0;
  for (const fr of fileResults) {
    for (const issue of fr.issues) {
      console.log(`[${issue.level}] ${fr.file}${issue.line ? ':' + issue.line : ''} — ${issue.rule}: ${issue.message}`);
      if (issue.level === 'ERROR') totalErrors++; else totalWarns++;
    }
  }
  console.log(`\n📊 Tổng kết: ❌ ERROR: ${totalErrors}  |  ⚠️ WARN: ${totalWarns}`);
  process.exit(totalErrors > 0 ? 1 : 0);
}
