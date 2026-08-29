// disable-dead-files.cjs
// Đọc output từ check-dead-files → rename *.ts/*.tsx → *_disable
// + gỡ export trong barrel index.ts cùng thư mục
const { execSync } = require('child_process');
const fs = require('fs');
const p = require('path');

const PORTAL = process.argv[2] || 'src/modules/InvoiceApp';
const DRY_RUN = process.argv.includes('--dry');
const REVERT = process.argv.includes('--revert');

if (REVERT) {
  console.log('=== REVERT DISABLED FILES ===');
  const T = require('path').resolve(PORTAL);
  const g = require('glob');
  const fs = require('fs');
  const p = require('path');
  var reverted = 0;
  g.sync(T + '/**/*.{ts,tsx}_disable').forEach(function(f) {
    var newName = f.replace(/_disable$/, '');
    fs.renameSync(f, newName);
    console.log('  [REVERT] ' + p.relative(T, newName).replace(/\\/g, '/'));
    reverted++;
  });
  console.log('\nReverted ' + reverted + ' files.');
  process.exit(0);
}

console.log('=== DISABLE DEAD FILES ===');
console.log('Portal: ' + PORTAL);
if (DRY_RUN) console.log('MODE: DRY RUN (không thay đổi thực tế)\n');

// 1. Chạy check-dead-files.cjs, capture stderr (chứa danh sách)
const script = p.join(__dirname, 'check-dead-files.cjs');
let deadPaths = [];
try {
  const out = execSync('node "' + script + '" ' + PORTAL, { encoding: 'utf8', stdio: 'pipe' });
  // Parse: mỗi dòng bắt đầu bằng "     " + relPath + "  ["
  const lines = out.split('\n');
  for (const line of lines) {
    const m = line.match(/^\s{5}(\S+\.(ts|tsx))\s+\[/);
    if (m) deadPaths.push(m[1]);
  }
} catch (e) {
  const out = (e.stdout || '') + (e.stderr || '');
  const lines = out.split('\n');
  for (const line of lines) {
    const m = line.match(/^\s{5}(\S+\.(ts|tsx))\s+\[/);
    if (m) deadPaths.push(m[1]);
  }
}

if (deadPaths.length === 0) {
  console.log('Không có dead files. Dừng.');
  process.exit(0);
}

console.log('Tìm thấy ' + deadPaths.length + ' dead files:\n');

const TARGET = p.resolve(PORTAL);
let renamed = 0;
let barrelCleaned = 0;
const renamedFiles = [];

for (const rel of deadPaths) {
  const abs = p.join(TARGET, rel);
  if (!fs.existsSync(abs)) {
    console.log('  [SKIP] Không tồn tại: ' + rel);
    continue;
  }

  const ext = p.extname(rel); // .ts or .tsx
  const newRel = rel.replace(new RegExp('\\' + ext + '$'), ext + '_disable');
  const newAbs = p.join(TARGET, newRel);

  // Đọc nội dung để tìm tên export được dùng trong barrel index
  const content = fs.readFileSync(abs, 'utf8');
  // Tìm export default hoặc export function/const/class với tên
  const exportNames = [];
  const re = /export\s+(default\s+)?(?:function|const|class|interface|type|enum)\s+(\w+)/g;
  let em;
  while ((em = re.exec(content)) !== null) {
    exportNames.push({ name: em[2], isDefault: !!em[1] });
  }
  // Cũng tìm export { ... }
  const namedExportRe = /export\s*\{\s*(\w+)/g;
  let nem;
  while ((nem = namedExportRe.exec(content)) !== null) {
    if (!exportNames.find(e => e.name === nem[1])) {
      exportNames.push({ name: nem[1], isDefault: false });
    }
  }

  if (DRY_RUN) {
    console.log('  [DRY] ' + rel + ' → ' + newRel);
    renamed++;
  } else {
    fs.renameSync(abs, newAbs);
    console.log('  [RENAME] ' + rel + ' → ' + newRel);
    renamed++;
  }
  renamedFiles.push({ oldRel: rel, newRel: newRel, exports: exportNames });

  // Gỡ export trong barrel index (nếu có) cùng thư mục
  const dir = p.dirname(rel);
  const barrelPaths = [p.join(TARGET, dir, 'index.ts'), p.join(TARGET, dir, 'index.tsx')];
  for (const barrelAbs of barrelPaths) {
    if (!fs.existsSync(barrelAbs)) continue;
    let barrelContent = fs.readFileSync(barrelAbs, 'utf8');
    let barrelRel = p.relative(TARGET, barrelAbs).replace(/\\/g, '/');
    let modified = false;

    // Gỡ dòng export { X } from './fileName' hoặc export { ... } from './fileName'
    const stem = p.basename(rel, ext);
    const fromPatterns = [
      new RegExp("export\\s*\\{[^}]*\\}\\s*from\\s*['\"]\\.\\/" + stem + "['\"]\\s*;?\\s*\\n?", 'g'),
      new RegExp("export\\s+\\*\\s+from\\s*['\"]\\.\\/" + stem + "['\"]\\s*;?\\s*\\n?", 'g'),
      new RegExp("export\\s+\\{\\s*default\\s+as\\s+\\w+\\s*\\}\\s*from\\s*['\"]\\.\\/" + stem + "['\"]\\s*;?\\s*\\n?", 'g'),
    ];

    for (const pat of fromPatterns) {
      if (pat.test(barrelContent)) {
        barrelContent = barrelContent.replace(pat, '');
        modified = true;
      }
    }

    if (modified) {
      if (DRY_RUN) {
        console.log('    [DRY] Barrel cleanup: ' + barrelRel);
      } else {
        fs.writeFileSync(barrelAbs, barrelContent, 'utf8');
        console.log('    [BARREL] Cleaned: ' + barrelRel);
      }
      barrelCleaned++;
    }
  }
}

console.log('\n=== KẾT QUẢ ===');
console.log('  Renamed: ' + renamed + ' files');
console.log('  Barrel cleaned: ' + barrelCleaned + ' index files');
console.log('\nDanh sách file đã đổi tên:');
renamedFiles.forEach(function(f) {
  console.log('  ' + f.newRel);
});
console.log('\nNếu có lỗi runtime, đổi ngược lại *_disable → .tsx/.ts để khôi phục.');
