// ============================================================
// 🎯 Phục vụ skill: tao-ui-giao-dien (Grid layout)
// check-grid-span.cjs — 2 lỗi Tailwind v4 Grid trên portal
// ============================================================
// 🔴 CHECK 1: col-span-N — Tailwind v4 KHÔNG generate đúng
//             grid-template-columns → col-span-4 → auto, input vỡ
// 🔴 CHECK 2: grid-cols-1 sm:/md:/lg:grid-cols-N — responsive
//             breakpoint không scan được trong portal → luôn 1 cột
//
// ✅ FIX 1:   col-span → flex layout flex-[2] min-w-0 + flex-1 min-w-0
// ✅ FIX 2:   grid-cols-1 sm:grid-cols-N → grid-cols-N (bỏ responsive)
//
// 🔬 VERIFIED (2026-07-15): DashboardPage bị vỡ do dùng
//    lg:grid-cols-2, md:grid-cols-3, lg:grid-cols-2 — sửa thành
//    grid-cols-2, grid-cols-3 là khớp.
//
// 💡 Example:  node check-grid-span.cjs src/modules/InvoiceApp
//              node check-grid-span.cjs src  (toàn bộ src)
// ============================================================

const fs = require('fs'); const p = require('path'); const g = require('glob');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-grid-span.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);
let files = g.sync(TARGET + '/**/*.{ts,tsx}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }
const colSpanErrors = [];
const gridResponsiveErrors = [];

// Regex match col-span-N trong className (kể cả responsive prefix)
// Bắt: col-span-1, col-span-2, md:col-span-2, sm:col-span-3, lg:col-span-1...
const COL_SPAN_RE = /(?:^|\s)(?:\w+:)?col-span-\d+/;

// 🔴 CHECK 2: grid-cols-1 + responsive breakpoint (md:/lg:)grid-cols-N
// Tailwind v4 không scan được breakpoint md:/lg: trong portal → grid collapse 1 cột
// ⚠️ sm: prefix VẪN HOẠT ĐỘNG trong Tailwind v4 — không cần fix
// Bắt: grid-cols-1 md:grid-cols-2, grid-cols-1 md:grid-cols-3, grid-cols-1 lg:grid-cols-2...
const GRID_RESPONSIVE_RE = /grid-cols-1\s+(?:md|lg):grid-cols-([2-9]|\d{2,})/;

files.filter(f => f.endsWith('.tsx')).forEach(file => {
  const c = fs.readFileSync(file, 'utf8'); const lines = c.split('\n');
  lines.forEach((l, i) => { const t = l.trim(); if (t.startsWith('//') || t.startsWith('*')) return;
    // Chỉ kiểm tra trong className attribute
    const classMatch = t.match(/className\s*=\s*["'`{]((?:[^"'`{}]|{[^}]*})*)["'`}]/);
    if (!classMatch) return;

    // CHECK 1: col-span-N
    if (COL_SPAN_RE.test(classMatch[1])) {
      const rel = p.relative(TARGET, file).replace(/\\/g, '/');
      colSpanErrors.push(rel + ':' + (i+1) + ': ' + t.substring(0, 100).replace(/\s+/g, ' '));
    }

    // CHECK 2: grid-cols-1 <bp>:grid-cols-N
    if (GRID_RESPONSIVE_RE.test(classMatch[1])) {
      const rel = p.relative(TARGET, file).replace(/\\/g, '/');
      gridResponsiveErrors.push(rel + ':' + (i+1) + ': ' + t.substring(0, 120).replace(/\s+/g, ' '));
    }
  });
});

// ── OUTPUT: CHECK 1 ──
const label1 = ' BX. col-span-N in Tailwind v4 ';
const files1 = [...new Set(colSpanErrors.map(e => e.split(':')[0]))];

if (colSpanErrors.length === 0) {
  console.log(label1 + '-'.repeat(40 - label1.length) + ' PASS');
} else {
  console.log(label1 + '-'.repeat(40 - label1.length) + ' FAIL (' + colSpanErrors.length + ' in ' + files1.length + ' files)');
  console.log('  🔬 Fix: thay grid-cols col-span → flex layout');
  colSpanErrors.slice(0, 8).forEach(e => console.log('     ' + e));
  if (colSpanErrors.length > 8) console.log('     ... and ' + (colSpanErrors.length - 8) + ' more');
  console.log('');
}

// ── OUTPUT: CHECK 2 ──
const label2 = ' BX. grid-cols-1 <bp>:grid-cols-N ';
const files2 = [...new Set(gridResponsiveErrors.map(e => e.split(':')[0]))];

if (gridResponsiveErrors.length === 0) {
  console.log(label2 + '-'.repeat(40 - label2.length) + ' PASS');
} else {
  console.log(label2 + '-'.repeat(40 - label2.length) + ' FAIL (' + gridResponsiveErrors.length + ' in ' + files2.length + ' files)');
  console.log('  🔬 Tailwind v4 không scan breakpoint class → grid luôn 1 cột');
  console.log('  ✅ Fix: bỏ prefix, dùng trực tiếp grid-cols-N');
  gridResponsiveErrors.slice(0, 8).forEach(e => console.log('     ' + e));
  if (gridResponsiveErrors.length > 8) console.log('     ... and ' + (gridResponsiveErrors.length - 8) + ' more');
  console.log('');
}

// ── Affected files ──
const allUniqueFiles = [...new Set([...files1, ...files2])];
if (allUniqueFiles.length > 0) {
  console.log('  📁 Files cần sửa (' + allUniqueFiles.length + '):');
  allUniqueFiles.forEach(f => console.log('     ' + f));
}

const totalErrors = colSpanErrors.length + gridResponsiveErrors.length;
process.exit(totalErrors > 0 ? 1 : 0);
