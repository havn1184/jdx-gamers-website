// ============================================================
// 🎯 Phục vụ skill: cau-truc-du-an (Circular deps)
// check-circular-deps.cjs — Phát hiện import vòng tròn (circular dependencies)
// ============================================================
// 📋 Kiểm tra: Dựng đồ thị import giữa các file, phát hiện cycle bằng DFS
//              A → B → C → A: "A.ts imports B.ts imports C.ts imports A.ts"
// 📤 Output:   PASS nếu không có cycle | FAIL + danh sách từng cycle
// 📊 Severity: CRITICAL — circular import gây undefined runtime, treo webpack/vite
// 💡 Example:  node check-circular-deps.cjs src/modules/KetoanApp
//              node check-circular-deps.cjs src/modules/KetoanApp features/danh-muc/khach-hang
// ============================================================
const fs = require('fs'); const p = require('path'); const g = require('glob');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-circular-deps.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);
let files = g.sync(TARGET + '/**/*.{ts,tsx}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }

console.log('Building import graph from ' + files.length + ' files...');
var t0 = Date.now();

// ==========================================================
// BƯỚC 1: Map file path → index và ngược lại
// ==========================================================
var fileToIdx = {};
var idxToFile = [];
files.forEach(function(f, i) {
  var rel = p.relative(TARGET, f).replace(/\\/g, '/');
  fileToIdx[rel] = i;
  idxToFile.push(rel);
});

// ==========================================================
// BƯỚC 2: Build adjacency list — ai import ai
// ==========================================================
// RE: bắt import from './xxx', import('...'), require('...')
var RE = /(?:from\s+|import\s*\(\s*|require\s*\(\s*)['"]([^'"]+)['"]/g;

// adjacency[i] = Set of indices that file i imports
var adjacency = new Array(files.length);
for (var i = 0; i < files.length; i++) adjacency[i] = new Set();

// reverseMap: để lookup file từ import path
// Mở rộng lookup để resolve import path → relPath chính xác
var pathToIdx = {};
Object.keys(fileToIdx).forEach(function(rel) {
  // Đăng ký tất cả các cách viết tắt
  var extless = rel.replace(/\.(ts|tsx)$/, '');
  pathToIdx[rel] = fileToIdx[rel];
  pathToIdx['./' + rel] = fileToIdx[rel];
  pathToIdx[extless] = fileToIdx[rel];
  pathToIdx['./' + extless] = fileToIdx[rel];
  // index.ts barrel
  var dir = p.dirname(rel);
  if (p.basename(rel).startsWith('index.')) {
    pathToIdx[dir] = fileToIdx[rel];
    pathToIdx['./' + dir] = fileToIdx[rel];
  }
});

files.forEach(function(file, idx) {
  var c;
  try { c = fs.readFileSync(file, 'utf8'); } catch(e) { return; }
  var dir = p.dirname(p.relative(TARGET, file).replace(/\\/g, '/'));

  var m;
  while ((m = RE.exec(c)) !== null) {
    var importPath = m[1];
    // Chỉ quan tâm import nội bộ (relative path)
    if (importPath[0] !== '.') continue;

    var resolved = p.join(dir, importPath).replace(/\\/g, '/');
    resolved = p.normalize(resolved).replace(/\\/g, '/');

    // Thử resolve qua pathToIdx
    var targetIdx = pathToIdx[resolved];
    if (targetIdx === undefined) {
      // Thử thêm extension .ts, .tsx
      targetIdx = pathToIdx[resolved + '.ts'] || pathToIdx[resolved + '.tsx'];
    }
    if (targetIdx !== undefined && targetIdx !== idx) {
      adjacency[idx].add(targetIdx);
    }
  }
});

console.log('  Graph built in ' + (Date.now() - t0) + 'ms');

// ==========================================================
// BƯỚC 3: DFS phát hiện cycle (Tarjan-style / color-marking)
// ==========================================================
t0 = Date.now();
var cycles = []; // mỗi cycle là array các file relPath

// Trạng thái: 0 = chưa thăm, 1 = đang duyệt (trên stack), 2 = đã duyệt xong
var state = new Array(files.length).fill(0);
var stack = []; // stack của DFS hiện tại

function dfs(v) {
  state[v] = 1;
  stack.push(v);

  var neighbors = adjacency[v];
  neighbors.forEach(function(w) {
    if (state[w] === 1) {
      // Tìm thấy cycle: từ vị trí của w trong stack → đến cuối stack + w
      var cycleStart = stack.indexOf(w);
      if (cycleStart === -1) return;
      var cycle = stack.slice(cycleStart).map(function(i) { return idxToFile[i]; });
      cycle.push(idxToFile[w]); // đóng cycle
      cycles.push(cycle);
    } else if (state[w] === 0) {
      dfs(w);
    }
  });

  stack.pop();
  state[v] = 2;
}

for (var i = 0; i < files.length; i++) {
  if (state[i] === 0) dfs(i);
}

// ==========================================================
// BƯỚC 4: Dedup & format cycles (loại bỏ cycle trùng / cycle con)
// ==========================================================

// Chuẩn hóa: xoay cycle sao cho node đầu tiên nhỏ nhất theo alphabet
function normalizeCycle(cycle) {
  // cycle dạng [A, B, C, A] → [A, B, C]
  var nodes = cycle.slice(0, -1);
  var minIdx = 0;
  for (var i = 1; i < nodes.length; i++) {
    if (nodes[i] < nodes[minIdx]) minIdx = i;
  }
  return nodes.slice(minIdx).concat(nodes.slice(0, minIdx));
}

var normalizedSet = new Set();
var uniqueCycles = [];
cycles.forEach(function(cycle) {
  var norm = normalizeCycle(cycle).join(' → ');
  if (!normalizedSet.has(norm)) {
    normalizedSet.add(norm);
    uniqueCycles.push(cycle);
  }
});

// Lọc bỏ cycle dài quá 10 node (thường là false positive do barrel index)
uniqueCycles = uniqueCycles.filter(function(c) { return c.length <= 11; });

// Sort cycle theo độ dài tăng dần
uniqueCycles.sort(function(a, b) { return (a.length - 1) - (b.length - 1); });

// ==========================================================
// BƯỚC 5: Report
// ==========================================================
var label = ' 25. Circular dependencies';
var pad = ' '.repeat(Math.max(1, 45 - label.length));

if (uniqueCycles.length === 0) {
  console.log(label + pad + 'PASS');
  process.exit(0);
} else {
  console.log(label + pad + 'FAIL (' + uniqueCycles.length + ' cycles found)');
  uniqueCycles.slice(0, 10).forEach(function(cycle, i) {
    var nodes = cycle.slice(0, -1); // bỏ node cuối (trùng node đầu)
    var display = nodes.join(' → ');
    console.log('     [' + (i + 1) + '] ' + display);
  });
  if (uniqueCycles.length > 10) {
    console.log('     ... and ' + (uniqueCycles.length - 10) + ' more cycles');
  }
  console.log('  Graph built + DFS: ' + (Date.now() - t0) + 'ms');
  process.exit(1);
}
