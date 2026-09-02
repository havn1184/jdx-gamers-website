/**
 * B2: Copy chính xác file từ src/shared (và styles) vào portal.
 * 
 * Cách dùng:
 *   node .claude/skills/cach-refactor-kien-truc-doc-lap/scripts/copy-shared.cjs <PortalPath>
 * 
 *   HOẶC đọc từ stdin (output của analyze-deps.cjs):
 *   node analyze-deps.cjs src/modules/KiemThuApp | tail -n +2 | node copy-shared.cjs src/modules/KiemThuApp --stdin
 * 
 * Trước khi chạy, cần EDIT script này để điều chỉnh danh sách file phù hợp với portal của bạn.
 * Xem output của analyze-deps.cjs để biết danh sách đầy đủ.
 */

const fs = require('fs');
const path = require('path');

// ── CLI args ──
const portalArg = process.argv[2];
const useStdin = process.argv.includes('--stdin');

if (!portalArg) {
  console.error('Usage: node copy-shared.cjs <PortalPath> [--stdin]');
  console.error('  PortalPath: đường dẫn tương đối từ project root, VD: src/modules/KiemThuApp');
  console.error('  --stdin: đọc danh sách file từ stdin (output của analyze-deps.cjs)');
  process.exit(1);
}

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const SHARED = path.join(PROJECT_ROOT, 'src/shared');
const STYLES = path.join(PROJECT_ROOT, 'src/styles');
const TARGET = path.join(PROJECT_ROOT, portalArg, 'shared');
const TARGET_STYLES = path.join(PROJECT_ROOT, portalArg, 'styles');

// ── Danh sách file mẫu (EDIT để điều chỉnh cho từng portal) ──
// GỢI Ý: chạy analyze-deps.cjs trước để biết danh sách đầy đủ

// services/api/ - THƯỜNG copy toàn bộ (tightly coupled)
const API_FILES = [
  'ApiClient.ts','ApiHelpers.ts','ApiLogger.ts','ApiConfig.ts','TokenManager.ts',
  'TokenRefreshService.ts','JwtUtils.ts','BaseActions.ts','useApiRequest.ts','toastHelpers.ts',
  'types.ts','index.ts'
];

// services/ - copy từng file cụ thể
const SERVICE_FILES = ['PermissionService.ts'];

// services/permissionMappings/ - toàn bộ thư mục nhỏ

// utils/
const UTIL_FILES = [
  'FormatUtils.ts','PagingUtils.tsx','ValidationUtils.ts','ValidationToastHelper.tsx',
  'buildFormData.ts','ApiUtils.ts'
];

// hooks/
const HOOK_FILES = ['useDebounce.ts'];

// components/ui/
const UI_FILES = [
  'utils.ts','button.tsx','badge.tsx','table.tsx','card.tsx','dialog.tsx',
  'input.tsx','label.tsx','select.tsx','textarea.tsx','dropdown-menu.tsx','checkbox.tsx',
  'avatar.tsx','tooltip.tsx','tabs.tsx','sheet.tsx','alert-dialog.tsx','popover.tsx',
  'command.tsx','switch.tsx' // dependencies phổ biến
];

// components/common/
const COMMON_FILES = [
  'ConfirmDialog.tsx','ValidationErrorDialog.tsx','DatePicker.tsx',
  'PageLoader.tsx','AppSwitcher.tsx','Pagination.tsx','LucideIcon.tsx',
  'SearchCombobox.tsx' // dùng trong form chọn FK
];

// contexts/
const CONTEXT_FILES = ['PermissionContext.tsx','PortalContainerContext.tsx'];

// constants/
const CONSTANT_FILES = ['app-type.constants.ts'];

// types/
const TYPE_FILES = ['permission.types.ts'];

// features/login-popup-notification/ - toàn bộ (thư mục nhỏ)
const LOGIN_NOTIF_FILES = [
  'index.ts','LoginPopupNotificationProvider.tsx',
  'useLoginPopupNotification.ts','LoginPopupNotificationApiService.ts'
];

// styles/
const STYLE_FILES = ['globals.css'];

// ── Helpers ──
function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }
function copyFile(src, dest) { ensureDir(path.dirname(dest)); fs.copyFileSync(src, dest); console.log('  COPY: ' + path.relative(TARGET, dest)); }
function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) { console.log('  SKIP: ' + srcDir); return; }
  for (const item of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, item.name), d = path.join(destDir, item.name);
    item.isDirectory() ? copyDir(s, d) : copyFile(s, d);
  }
}

// ── Nếu stdin mode: đọc danh sách file từ stdin ──
if (useStdin) {
  let data = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', () => { let chunk; while ((chunk = process.stdin.read()) !== null) data += chunk; });
  process.stdin.on('end', () => {
    const files = data.split('\n').map(l => l.trim()).filter(l => l && l.startsWith(PROJECT_ROOT));
    console.log('Copying ' + files.length + ' files from stdin...\n');
    for (const f of files) {
      const rel = path.relative(SHARED, f).replace(/\\/g, '/');
      copyFile(path.join(SHARED, rel), path.join(TARGET, rel));
    }
    // Tự động sinh barrel index.ts
    generateBarrelIndexes();
    console.log('\nDone!');
  });
  return; // early exit, stdin handler sẽ chạy async
}

// ── Normal mode ──
console.log('=== Copy shared dependencies vao ' + portalArg + ' ===\n');

console.log('[services/api/]');
for (const f of API_FILES) copyFile(path.join(SHARED,'services/api',f), path.join(TARGET,'services/api',f));

console.log('[services/]');
for (const f of SERVICE_FILES) copyFile(path.join(SHARED,'services',f), path.join(TARGET,'services',f));

console.log('[services/permissionMappings/]');
copyDir(path.join(SHARED,'services/permissionMappings'), path.join(TARGET,'services/permissionMappings'));

console.log('[utils/]');
for (const f of UTIL_FILES) copyFile(path.join(SHARED,'utils',f), path.join(TARGET,'utils',f));

console.log('[hooks/]');
for (const f of HOOK_FILES) copyFile(path.join(SHARED,'hooks',f), path.join(TARGET,'hooks',f));

console.log('[components/ui/]');
for (const f of UI_FILES) copyFile(path.join(SHARED,'components/ui',f), path.join(TARGET,'components/ui',f));

console.log('[components/common/]');
for (const f of COMMON_FILES) copyFile(path.join(SHARED,'components/common',f), path.join(TARGET,'components/common',f));

console.log('[contexts/]');
for (const f of CONTEXT_FILES) copyFile(path.join(SHARED,'contexts',f), path.join(TARGET,'contexts',f));

console.log('[constants/]');
for (const f of CONSTANT_FILES) copyFile(path.join(SHARED,'constants',f), path.join(TARGET,'constants',f));

console.log('[types/]');
for (const f of TYPE_FILES) copyFile(path.join(SHARED,'types',f), path.join(TARGET,'types',f));

console.log('[features/login-popup-notification/]');
for (const f of LOGIN_NOTIF_FILES) copyFile(path.join(SHARED,'features/login-popup-notification',f), path.join(TARGET,'features/login-popup-notification',f));

console.log('[styles/]');
for (const f of STYLE_FILES) copyFile(path.join(STYLES,f), path.join(TARGET_STYLES,f));

// ── Hàm tự động tạo barrel index.ts ──
function generateBarrelIndexes() {
  console.log('[generating barrel index.ts]');

  // 1. components/common/index.ts
  const commonDir = path.join(TARGET, 'components/common');
  if (fs.existsSync(commonDir)) {
    const commonFiles = fs.readdirSync(commonDir).filter(f => f.endsWith('.tsx') && f !== 'index.ts');
    const commonExports = commonFiles.map(f => {
      const name = f.replace('.tsx', '');
      return `export { ${name} } from './${name}'`;
    }).join('\n');
    fs.writeFileSync(path.join(commonDir, 'index.ts'),
      `/** Common Components — barrel auto-generated */\n${commonExports}\n`, 'utf8');
    console.log('  GEN: components/common/index.ts (' + commonFiles.length + ' exports)');
  }

  // 2. utils/index.ts
  const utilsDir = path.join(TARGET, 'utils');
  if (fs.existsSync(utilsDir)) {
    const utilFiles = fs.readdirSync(utilsDir).filter(f => (f.endsWith('.ts') || f.endsWith('.tsx')) && f !== 'index.ts');
    const utilExports = utilFiles.map(f => {
      const name = f.replace(/\.tsx?$/, '');
      return `export * from './${name}'`;
    }).join('\n');
    fs.writeFileSync(path.join(utilsDir, 'index.ts'),
      `/** Shared Utils — barrel auto-generated */\nexport { cn } from '../components/ui/utils'\n\n${utilExports}\n`, 'utf8');
    console.log('  GEN: utils/index.ts (' + utilFiles.length + ' exports)');
  }
}

// Gọi generateBarrelIndexes cho cả 2 mode
generateBarrelIndexes();

console.log('\n=== HOAN THANH ===');
