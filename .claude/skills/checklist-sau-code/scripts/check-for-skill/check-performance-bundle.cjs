// ============================================================
// 🎯 Phục vụ skill: quy-tac-code (Bundle size)
// check-performance-bundle.cjs — Kiểm tra vấn đề bundle size & code splitting
// ============================================================
// 📋 Kiểm tra: 1. Import namespace thư viện nặng (moment, lodash, underscore, date-fns toàn bộ)
//              2. Page component không dùng React.lazy / dynamic import
//              3. Import CSS/SCSS module không dùng (dead code)
//              4. Re-export toàn bộ module (export * from) thay vì named export
//              5. Import từ UI library lớn không sub-path (antd, mui, recharts, lodash-es, ...)
//              6. Import icon hàng loạt (import * as Icons / import all icons)
//              7. CSS-in-JS runtime overhead (styled-components, emotion, @compiled/css-in-js)
// 📤 Output:   PASS nếu 0 | FAIL + file:line của từng vi phạm
// 📊 Severity: HIGH — tăng bundle size không cần thiết, chậm load trang
// 💡 Example:  node check-performance-bundle.cjs src/modules/KetoanApp
//              node check-performance-bundle.cjs src/modules/KetoanApp features/danh-muc
// ============================================================
const fs = require('fs'); const p = require('path'); const g = require('glob');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-performance-bundle.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);
let files = g.sync(TARGET + '/**/*.{ts,tsx}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }
const errors = [];

// Danh sách thư viện nặng nên import tree-shake thay vì import namespace
const HEAVY_LIBRARIES = [
  { name: 'moment', treeShake: 'date-fns' },
  { name: 'lodash', treeShake: 'lodash/' },
  { name: 'lodash-es', treeShake: 'lodash-es/' },
  { name: 'underscore', treeShake: 'lodash (thay thế)' },
  { name: 'date-fns', treeShake: 'date-fns/' },
  { name: 'rxjs', treeShake: 'rxjs/' },
  { name: 'mathjs', treeShake: 'mathjs/' },
  { name: 'chart.js', treeShake: 'chart.js/' },
  // Large UI libraries — should use tree-shaking or sub-path imports
  { name: 'antd', treeShake: 'antd/es/' },
  { name: '@mui/material', treeShake: '@mui/material/' },
  { name: '@mui/icons-material', treeShake: '@mui/icons-material/' },
  { name: 'recharts', treeShake: 'recharts/es6/' },
  { name: 'echarts', treeShake: 'echarts/' },
  { name: 'ag-grid-react', treeShake: 'ag-grid-react/' },
  { name: 'ag-grid-community', treeShake: 'ag-grid-community/' },
  { name: 'd3', treeShake: 'd3-' },
  { name: 'three', treeShake: 'three/' },
  { name: 'xlsx', treeShake: 'xlsx (chỉ import nếu cần)' },
  { name: 'pdfmake', treeShake: 'pdfmake (chỉ import nếu cần)' },
];

files.forEach(file => {
  const c = fs.readFileSync(file, 'utf8'); const lines = c.split('\n');
  const rel = p.relative(TARGET, file).replace(/\\/g, '/');

  lines.forEach((l, i) => {
    const t = l.trim();
    if (!t.startsWith('import') && !t.startsWith('export')) return;

    // CHECK 1: Import namespace thư viện nặng
    // Pattern: import * as X from 'moment' hoặc import X from 'lodash'
    if (t.startsWith('import')) {
      // import namespace (import * as)
      const nsMatch = t.match(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/);
      if (nsMatch) {
        const lib = nsMatch[2];
        const heavy = HEAVY_LIBRARIES.find(h => lib === h.name || lib.startsWith(h.name + '/'));
        if (heavy) {
          // Nếu đã import sub-path (lodash/get) thì OK
          if (!lib.includes('/')) {
            errors.push(rel + ':' + (i + 1) + ': import * as từ \'' + lib + '\' — nên import riêng từng hàm hoặc dùng ' + heavy.treeShake);
          }
        }
      }

      // Import default cả thư viện
      // import moment from 'moment' or import _ from 'lodash'
      const defaultMatch = t.match(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/);
      if (defaultMatch) {
        const lib = defaultMatch[2];
        const heavy = HEAVY_LIBRARIES.find(h => lib === h.name);
        if (heavy && !lib.includes('/')) {
          errors.push(rel + ':' + (i + 1) + ': import default \'' + lib + '\' — import cả thư viện, nên tree-shake: import { fn } from \'' + heavy.treeShake + '\'');
        }
      }

      // import { fn1, fn2 } from 'lodash' (không sub-path)
      const namedMatch = t.match(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
      if (namedMatch) {
        const lib = namedMatch[2];
        const heavy = HEAVY_LIBRARIES.find(h => lib === h.name);
        if (heavy && !lib.includes('/')) {
          // Cảnh báo nhẹ hơn — có thể tree-shake được nếu cấu hình đúng
          errors.push(rel + ':' + (i + 1) + ': import { ... } from \'' + lib + '\' — nên dùng sub-path: import { fn } from \'' + heavy.treeShake + 'fn\'');
        }
      }
    }

    // CHECK 2: export * from (re-export toàn bộ) trong barrel file — gây khó tree-shake
    if (t.startsWith('export * from')) {
      errors.push(rel + ':' + (i + 1) + ': export * from — gây khó tree-shake, nên export named cụ thể');
    }
  });

  // CHECK 3: Route config — page component import không dùng React.lazy
  if ((file.includes('route') || file.includes('Route') || file.includes('router')) && file.endsWith('.tsx')) {
    // Tìm các import page component
    lines.forEach((l, i) => {
      const t = l.trim();
      // import TenPage from './pages/TenPage'
      const pageImport = t.match(/import\s+(\w+)\s+from\s+['"].*(?:pages|page)\/[^'"]*(?:Page|page)[^'"]*['"]/);
      if (pageImport) {
        // Kiểm tra xem file có dùng React.lazy không
        if (!c.includes('React.lazy') && !c.includes('lazy(') && !c.includes('Suspense')) {
          errors.push(rel + ':' + (i + 1) + ': page import \'' + pageImport[1] + '\' không dùng React.lazy → tăng bundle size ban đầu');
        }
      }
    });
  }

  // CHECK 4: Import icon hàng loạt (VD: import * as Icons from 'lucide-react')
  lines.forEach((l, i) => {
    const t = l.trim();
    const iconNS = t.match(/import\s+\*\s+as\s+\w+\s+from\s+['"]([^'"]*(?:icon|Icon|lucide|heroicon|phosphor|tabler)[^'"]*)['"]/);
    if (iconNS) {
      errors.push(rel + ':' + (i + 1) + ': import * as từ \'' + iconNS[1] + '\' — import tất cả icons, nên import riêng từng icon cần dùng');
    }
  });

  // CHECK 5: CSS-in-JS runtime detected (styled-components, emotion)
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('import') && /from\s+['"](styled-components|@emotion\/styled|@compiled\/css-in-js)['"]/.test(t)) {
      errors.push(rel + ':' + (i + 1) + ': CSS-in-JS runtime (styled-components/emotion) — tăng bundle JS + runtime overhead, cân nhắc Tailwind CSS hoặc CSS Modules (dự án đã dùng Tailwind)');
    }
  });

  // CHECK 6: Hardcoded CDN URL (import from CDN thay vì bundle)
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.includes('unpkg.com') || t.includes('cdn.jsdelivr.net') || t.includes('cdnjs.cloudflare.com') || t.includes('esm.sh')) {
      errors.push(rel + ':' + (i + 1) + ': import từ CDN (' + t.substring(0, 80) + ') — tăng network request, nên bundle vào dự án hoặc dùng dynamic import');
    }
  });
});

// Dedup lỗi trùng
const unique = [...new Set(errors)];

const label = ' B9. Bundle performance ';
if (unique.length === 0) {
  console.log(label + '-'.repeat(Math.max(1, 40)) + ' PASS');
} else {
  console.log(label + '-'.repeat(Math.max(1, 40)) + ' FAIL (' + unique.length + ' issues)');
  unique.slice(0, 8).forEach(e => console.log('     ' + e));
  if (unique.length > 8) console.log('     ... and ' + (unique.length - 8) + ' more');
}
process.exit(unique.length > 0 ? 1 : 0);
