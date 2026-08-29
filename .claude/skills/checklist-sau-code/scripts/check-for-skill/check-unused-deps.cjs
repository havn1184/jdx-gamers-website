// ============================================================
// 🎯 Phục vụ skill: cau-truc-du-an (Unused npm packages)
// check-unused-deps.cjs — Phát hiện npm packages không được dùng
// ============================================================
// 📋 Kiểm tra: Đối chiếu dependencies/devDependencies trong package.json
//              với tất cả import/require trong source code
//              Báo cáo package được khai báo nhưng không import ở đâu
// 📤 Output:   PASS nếu không có unused | FAIL + danh sách package
// 📊 Severity: HIGH — unused deps tăng bundle size, CVE attack surface
// 💡 Example:  node check-unused-deps.cjs src/modules/KetoanApp
// ============================================================
const fs = require('fs'); const p = require('path'); const g = require('glob');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-unused-deps.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);

// ==========================================================
// BƯỚC 1: Đọc package.json của portal (hoặc root nếu portal ko có)
// ==========================================================
var pkgPath = p.join(TARGET, 'package.json');
var usingRootPkg = false;
if (!fs.existsSync(pkgPath)) {
  // Thử tìm package.json ở root workspace
  pkgPath = p.join(process.cwd(), 'package.json');
  usingRootPkg = true;
}
if (!fs.existsSync(pkgPath)) {
  console.log('  ⚠️  Không tìm thấy package.json — skip');
  process.exit(0);
}
var pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
var allDeps = Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {}, pkg.peerDependencies || {});

// Bỏ qua các package build-time / config-only (không import trực tiếp trong code)
var BUILD_ONLY = new Set([
  // Build tools
  'typescript', 'vite', '@vitejs/plugin-react', '@vitejs/plugin-react-swc',
  '@vitejs/plugin-basic-ssl', 'esbuild', 'terser', 'rollup', 'webpack', 'babel',
  'cross-env', 'concurrently', 'nodemon',
  // CSS/build
  'tailwindcss', 'postcss', 'autoprefixer', '@tailwindcss/vite',
  'tailwindcss-animate', '@tailwindcss/typography',
  // Linting
  'eslint', 'prettier', 'globals',
  'eslint-config-prettier', 'eslint-plugin-prettier',
  'eslint-plugin-react', 'eslint-plugin-react-hooks', 'eslint-plugin-react-refresh',
  '@eslint/js', 'typescript-eslint',
  '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser',
  // Testing
  'vitest', '@vitest/coverage-v8', '@vitest/ui',
  'jsdom', 'playwright', '@playwright/test', '@playwright/mcp',
  '@testing-library/jest-dom', '@testing-library/react', '@testing-library/user-event',
  'msw',
  // Type definitions
  '@types/node', '@types/react', '@types/react-dom',
  '@types/dompurify', '@types/html2canvas', '@types/jsbarcode',
  '@types/qrcode', '@types/qrcode.react', '@types/react-grid-layout',
  '@types/react-syntax-highlighter',
  // Git hooks
  'husky', 'lint-staged',
  // Other config-layer
  'next-themes',
]);

var depNames = Object.keys(allDeps).filter(function(name) { return !BUILD_ONLY.has(name); });

if (depNames.length === 0) {
  console.log('  ⚠️  Không có runtime dependencies — skip');
  process.exit(0);
}

console.log('Scanning ' + depNames.length + ' dependencies...');

// ==========================================================
// BƯỚC 2: Scan tất cả file source tìm import/require
// ==========================================================
var t0 = Date.now();
// Nếu dùng root package.json, scan toàn bộ src/ để tránh false positive
var scanPath = usingRootPkg ? p.join(process.cwd(), 'src') : TARGET;
var files = g.sync(scanPath + '/**/*.{ts,tsx,js,jsx}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }

// Map: packageName → count (số file dùng package đó)
var usageMap = {};

// RE: bắt tất cả import paths
var RE = /(?:from\s+|import\s*\(\s*|require\s*\(\s*)['"]([^'"]+)['"]/g;

files.forEach(function(file) {
  // Bỏ qua node_modules, dist, build, test
  if (file.includes('node_modules') || file.includes('/dist/') || file.includes('/build/')) return;
  if (file.includes('.test.') || file.includes('.spec.') || file.includes('__tests__')) return;

  var c;
  try { c = fs.readFileSync(file, 'utf8'); } catch(e) { return; }

  var m;
  while ((m = RE.exec(c)) !== null) {
    var importPath = m[1];
    // Chỉ quan tâm package imports (không relative)
    if (importPath[0] === '.') continue;

    // Trích xuất tên package (có thể có scope)
    // VD: @radix-ui/react-dialog → @radix-ui/react-dialog
    //     lodash → lodash
    //     lodash/debounce → lodash
    var pkgName = importPath;
    if (pkgName.startsWith('@')) {
      var parts = pkgName.split('/');
      if (parts.length >= 2) pkgName = parts[0] + '/' + parts[1];
    } else {
      pkgName = pkgName.split('/')[0];
    }

    if (!usageMap[pkgName]) usageMap[pkgName] = 0;
    usageMap[pkgName]++;
  }
});

// ==========================================================
// BƯỚC 3: Đối chiếu — package nào trong package.json không có trong usageMap
// ==========================================================
var unused = [];
depNames.forEach(function(name) {
  if (!usageMap[name]) {
    unused.push(name);
  }
});

// ==========================================================
// BƯỚC 4: Report
// ==========================================================
var label = ' 26. Unused npm dependencies';
var pad = ' '.repeat(Math.max(1, 45 - label.length));

if (unused.length === 0) {
  console.log(label + pad + 'PASS');
  process.exit(0);
} else {
  console.log(label + pad + 'FAIL (' + unused.length + ' unused packages)');
  unused.forEach(function(name) {
    console.log('     ' + name + ' — declared in package.json but never imported');
  });
  console.log('  (' + (Date.now() - t0) + 'ms)');
  console.log('  💡 Tip: run "npm uninstall <package>" or add to BUILD_ONLY if it\'s a build tool');
  process.exit(1);
}
