// ============================================================
// 🎯 Phục vụ skill: cau-truc-du-an (Dead code)
// check-dead-files.cjs — Phát hiện file không được import (tối ưu tốc độ)
// ============================================================
// 📋 Kiểm tra: File .ts/.tsx không được bất kỳ file nào khác import/require
// 📊 Severity: WARNING — dead code làm tăng bundle + khó maintain
// 💡 Example:  node check-dead-files.cjs src/modules/InvoiceApp
// ============================================================
const fs = require('fs'); var p = require('path'); var g = require('glob');
var args = process.argv.slice(2);
var portalPath = args[0]; var featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-dead-files.cjs <PortalPath> [feature]'); process.exit(1); }
var TARGET = p.resolve(portalPath);
var ROOT_SRC = p.resolve('src');

console.log('Scanning portal files...');
var t0 = Date.now();
var portalFiles = g.sync(TARGET + '/**/*.{ts,tsx}');
if (featureFilter) { portalFiles = portalFiles.filter(function(f) { return p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter); }); }
console.log('  Portal: ' + portalFiles.length + ' files (' + (Date.now() - t0) + 'ms)');

// Quet them file ngoai portal (src/App.tsx, cross-portal imports)
var t1 = Date.now();
var externalFiles = g.sync(ROOT_SRC + '/**/*.{ts,tsx}', { ignore: TARGET + '/**' });
console.log('  External src/ (outside portal): ' + externalFiles.length + ' files (' + (Date.now() - t1) + 'ms)');

var allFiles = portalFiles.concat(externalFiles);

// ==========================================================
// Bước 1: Pre-build maps (1 pass)
// ==========================================================
t0 = Date.now();

// lookup: map mọi resolved path có thể → candidate relPath (O(1) lookup)
var lookup = {};
// candidateSizes: cache size cho mỗi candidate
var candidateSizes = {};
// dirChildren: map dir → array of candidate rel paths trong dir đó (dùng cho barrel index)
var dirChildren = {};
// candidateSet: Set các candidate relPath
var candidateSet = new Set();

allFiles.forEach(function(f) {
  var rel = p.relative(TARGET, f).replace(/\\/g, '/');
  var isPortal = !rel.startsWith('..'); // file trong portal, không phải external

  // Bỏ qua barrel index.ts — nhưng lưu trạng thái dir có barrel
  if (p.basename(f) === 'index.ts' || p.basename(f) === 'index.tsx') {
    if (isPortal) { /* dir has barrel */ }
    return;
  }
  if (rel.includes('.test.') || rel.includes('.spec.') || rel.includes('__tests__')) return;
  if (f.endsWith('.d.ts')) return;

  // Chỉ portal files mới là candidate
  if (!isPortal) return;

  candidateSet.add(rel);
  var stat = fs.statSync(f);
  candidateSizes[rel] = stat.size;

  // Build O(1) lookup: mọi cách import có thể resolve đến file này
  var extless = rel.replace(/\.(ts|tsx)$/, '');
  lookup['./' + rel] = rel;
  lookup[rel] = rel;
  lookup['./' + extless] = rel;
  lookup[extless] = rel;

  // Map dir → children
  var dir = p.dirname(rel);
  if (!dirChildren[dir]) dirChildren[dir] = [];
  dirChildren[dir].push(rel);
});

console.log('  ' + candidateSet.size + ' candidates indexed (' + (Date.now() - t0) + 'ms)');

// ==========================================================
// Bước 2: 1-pass scan tất cả import (single regex)
// ==========================================================
t0 = Date.now();
var importRefs = {}; // key: candidate relPath, value: 1

// Single regex: from '...', import('...'), require('...')
var RE = /(?:from\s+|import\s*\(\s*|require\s*\(\s*)['"]([^'"]+)['"]/g;

allFiles.forEach(function(file) {
  var c = fs.readFileSync(file, 'utf8');
  // dir: relative to TARGET for portal files, relative to ROOT_SRC for external
  var isPortal = !p.relative(TARGET, file).startsWith('..');
  var base = isPortal ? TARGET : ROOT_SRC;
  var dir = p.dirname(p.relative(base, file).replace(/\\/g, '/'));

  var m;
  while ((m = RE.exec(c)) !== null) {
    var importPath = m[1];
    if (importPath[0] !== '.') continue;

    var resolved = p.join(dir, importPath).replace(/\\/g, '/');
    resolved = p.normalize(resolved).replace(/\\/g, '/');

    // External file: convert from ROOT_SRC-relative to TARGET-relative
    if (!isPortal) {
      var absResolved = p.join(ROOT_SRC, resolved);
      var relativeToTarget = p.relative(TARGET, absResolved).replace(/\\/g, '/');
      if (!relativeToTarget.startsWith('..')) {
        resolved = relativeToTarget;
      } else {
        // Import does not point into the portal directory — skip
        continue;
      }
    }

    // O(1) lookup — thử 6 variants
    var matchRel = lookup['./' + resolved]
                || lookup[resolved]
                || lookup['./' + resolved + '.ts']
                || lookup['./' + resolved + '.tsx']
                || lookup[resolved + '.ts']
                || lookup[resolved + '.tsx']
                || lookup[resolved + '/index.ts']
                || lookup[resolved + '/index.tsx'];

    if (matchRel) {
      importRefs[matchRel] = 1;
    }

    // Barrel import: đánh dấu toàn bộ file con cùng thư mục (O(1) từ dirChildren)
    var children = dirChildren[resolved];
    if (children) {
      for (var s = 0; s < children.length; s++) {
        importRefs[children[s]] = 1;
      }
    }
  }
});

console.log('  Import scan done (' + (Date.now() - t0) + 'ms)');

// ==========================================================
// Bước 3: Tìm dead files
// ==========================================================
t0 = Date.now();
var deadFiles = [];
candidateSet.forEach(function(rel) {
  if (!importRefs[rel]) {
    deadFiles.push({ rel: rel, size: candidateSizes[rel] });
  }
});
deadFiles.sort(function(a, b) { return b.size - a.size; });
console.log('  Analysis done (' + (Date.now() - t0) + 'ms)');

// ==========================================================
// Output
// ==========================================================
var label = ' B12. Dead files ';
if (deadFiles.length === 0) {
  console.log(label + '-'.repeat(Math.max(1, 40)) + ' PASS');
} else {
  console.log(label + '-'.repeat(Math.max(1, 40)) + ' FAIL (' + deadFiles.length + ' files)');
  deadFiles.slice(0, 10).forEach(function(f) {
    var sizeKB = (f.size / 1024).toFixed(1);
    var lines = 0;
    try { lines = fs.readFileSync(p.join(TARGET, f.rel), 'utf8').split('\n').length; } catch(e) {}
    console.log('     ' + f.rel + '  [' + sizeKB + ' KB, ' + lines + ' lines]');
  });
  if (deadFiles.length > 10) console.log('     ... and ' + (deadFiles.length - 10) + ' more');
}
process.exit(deadFiles.length > 0 ? 1 : 0);
