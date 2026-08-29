// ============================================================
// check-all.cjs — Chạy TẤT CẢ các script kiểm tra (37 scripts)
// ============================================================
// 📋 Kiểm tra: Barrel | Naming | any | console | layer | shared | import-order |
//              import-paths | cross-imports | dup-keys | closing-tags | syntax |
//              encoding | hook-patterns | vietnamese | api-service | api-validation |
//              validate | date-input | grid-span | md-tailwind | performance-react |
//              performance-bundle | performance-render | file-size | app-isolation |
//              menu-routes | security | dead-files | circular-deps | unused-deps |
//              a11y | dialog-maxwidth | ts-strict | undef-symbols | dialog-success-check
// 🎯 Phục vụ skill: checklist-sau-code (Giai đoạn 1 — static check)
// 📤 Output:   CHỈ in các check FAIL (kèm file:line + skill gợi ý đọc).
//              KHÔNG in các check PASS — tránh agent đọc thông tin thừa, tốn token.
// 📊 Severity: Tổng hợp — exit code 1 nếu có bất kỳ check nào FAIL
// 💡 Example:  node check-all.cjs src/modules/KetoanApp
//              node check-all.cjs src/modules/KetoanApp features/danh-muc/khach-hang
// ============================================================
const { execSync } = require('child_process');
const fs = require('fs');
const p = require('path');

const args = process.argv.slice(2);
const portalPath = args[0];
const featureFilter = args[1];

if (!portalPath || !fs.existsSync(portalPath)) {
  console.log('Usage: node check-all.cjs <PortalPath> [feature]');
  console.log('  PortalPath: src/modules/KetoanApp');
  console.log('  feature:    features/danh-muc/khach-hang (optional)');
  process.exit(1);
}

const SCRIPTS = __dirname;
const scope = featureFilter || 'ALL';

// ===== Map script → skill gốc (để gợi ý agent đọc skill khi FAIL) =====
const SCRIPT_TO_SKILL = {
  'check-barrel.cjs': 'quy-tac-code § Barrel',
  'check-naming.cjs': 'dat-ten',
  'check-any.cjs': 'quy-tac-code § TS',
  'check-console.cjs': 'quy-tac-code § Logging',
  'check-layer.cjs': 'tich-hop-api-ui',
  'check-shared.cjs': 'cach-refactor-kien-truc-doc-lap',
  'check-import-order.cjs': 'quy-tac-code § Import',
  'check-import-paths.cjs': 'cau-truc-du-an',
  'check-cross-imports.cjs': 'cach-refactor-kien-truc-doc-lap',
  'check-dup-keys.cjs': 'sua-file-an-toan',
  'check-closing-tags.cjs': 'sua-file-an-toan',
  'check-syntax.cjs': 'sua-file-an-toan',
  'check-encoding.cjs': 'sua-file-an-toan',
  'check-hook-patterns.cjs': 'tich-hop-api-ui + filter-phan-trang',
  'check-vietnamese.cjs': 'quy-tac-code § Comments',
  'check-api-service.cjs': 'tao-apiservice',
  'check-api-validation.cjs': 'tich-hop-api-ui',
  'check-validate.cjs': 'validate-input',
  'check-date-input.cjs': 'date-input',
  'check-grid-span.cjs': 'tao-ui-giao-dien',
  'check-md-tailwind.cjs': 'tao-ui-giao-dien',
  'check-performance-react.cjs': 'quy-tac-code § Perf',
  'check-performance-bundle.cjs': 'quy-tac-code § Bundle',
  'check-performance-render.cjs': 'quy-tac-code § Render',
  'check-file-size.cjs': 'quy-tac-code § File size',
  'check-app-isolation.cjs': 'cach-refactor-kien-truc-doc-lap',
  'check-menu-routes.cjs': 'tao-layout-navmenu-topmenu',
  'check-security.cjs': 'quy-tac-code § Security',
  'check-dead-files.cjs': 'cau-truc-du-an',
  'check-circular-deps.cjs': 'cau-truc-du-an',
  'check-unused-deps.cjs': 'cau-truc-du-an',
  'check-a11y.cjs': 'tao-ui-giao-dien § A11y',
  'check-dialog.cjs': 'tao-ui-dialog § maxWidth',
  'check-dialog-success-check.cjs': 'tich-hop-api-ui + tao-ui-dialog',
  'check-ts-strict.cjs': 'quy-tac-code § TS',
  'check-undef-symbols.cjs': 'quy-tac-code § Import',
  'check-pagination.cjs': 'filter-phan-trang',
  'check-hook-props.cjs': 'tich-hop-api-ui + tao-ui-giao-dien',
};

// ===== Checks chạy =====
const checks = [ // in-folder scripts
  'check-barrel.cjs',
  'check-naming.cjs',
  'check-any.cjs',
  'check-console.cjs',
  'check-layer.cjs',
  'check-shared.cjs',
  'check-import-order.cjs',
  'check-import-paths.cjs',
  'check-cross-imports.cjs',
  'check-dup-keys.cjs',
  'check-closing-tags.cjs',
  'check-syntax.cjs',
  'check-encoding.cjs',
  'check-hook-patterns.cjs',
  'check-vietnamese.cjs',
  'check-api-service.cjs',
  'check-api-validation.cjs',
  'check-validate.cjs',
  'check-date-input.cjs',
  'check-grid-span.cjs',
  'check-md-tailwind.cjs',
  'check-performance-react.cjs',
  'check-performance-bundle.cjs',
  'check-performance-render.cjs',
  'check-file-size.cjs',
  'check-app-isolation.cjs',
  'check-menu-routes.cjs',
  'check-security.cjs',
  'check-dead-files.cjs',
  'check-circular-deps.cjs',
  'check-unused-deps.cjs',
  'check-a11y.cjs',
  'check-dialog.cjs',
  'check-dialog-success-check.cjs',
  'check-ts-strict.cjs',
  'check-undef-symbols.cjs',
  'check-hook-props.cjs',
];

// Add cross-skill script: pagination check
const paginationScript = p.join(SCRIPTS, '../../filter-phan-trang/check-pagination.cjs');
if (fs.existsSync(paginationScript)) {
  checks.push('check-pagination.cjs');
}

let totalFail = 0;
let failedScripts = [];

checks.forEach(script => {
  // Xác định scriptPath: nếu là cross-skill (check-pagination) dùng path tuyệt đối
  const scriptPath = script === 'check-pagination.cjs' ? paginationScript : p.join(SCRIPTS, script);
  const cmdArgs = ['node', scriptPath, portalPath];
  if (featureFilter) cmdArgs.push(featureFilter);

  let out = '';
  try {
    const result = execSync(cmdArgs.join(' '), { encoding: 'utf8', stdio: 'pipe' });
    out = result;
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || '');
  }

  // CHỈ in khi có FAIL — bỏ hẳn các dòng PASS (tiết kiệm token cho agent)
  if (out.includes('FAIL')) {
    totalFail++;
    failedScripts.push(script);
    console.log(out.trim());
    // Gợi ý skill cần đọc để sửa lỗi
    const skill = SCRIPT_TO_SKILL[script] || '?';
    const skillName = skill.split(' ')[0];
    const skillSection = skill.includes(' ') ? skill.split(' ').slice(1).join(' ') : '';
    console.log('      → Fix: đọc skill [.claude/skills/' + skillName + '/SKILL.md]' + (skillSection ? ' (mục ' + skillSection + ')' : '') + '\n');
  }
});

console.log('=== SUMMARY: ' + totalFail + '/' + checks.length + ' checks FAIL ===');
if (totalFail > 0) {
  console.log('Failed: ' + failedScripts.join(', '));
}
process.exit(totalFail > 0 ? 1 : 0);
