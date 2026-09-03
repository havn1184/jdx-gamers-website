// WEB-L04 — Dùng class CSS không tồn tại (bg-input-background, icon-warning, icon-danger...) -> style rơi về mặc định,
//          từng làm TOÀN BỘ ô Input vô hình (chữ gần đen trên nền trong suốt) - commit f9f023c 2026-08-29.
// Phát hiện: class tuỳ chỉnh (jgame-*, icon-*, btn-*, bg-input-*, text-foreground...) dùng trong .tsx nhưng không định nghĩa
//            trong styles/jgame-theme.css, src/styles/*.css hoặc @theme của Tailwind v4.
const L = require('../lib.cjs');
function check(rootDir) {
  const mod = L.moduleRoot(rootDir);
  const websiteRoot = L.path.resolve(mod, '..', '..', '..');
  const cssFiles = [...L.walk(L.path.join(mod, 'styles'), ['.css']), ...L.walk(L.path.join(websiteRoot, 'src', 'styles'), ['.css'])];
  const css = cssFiles.map(L.read).join('\n');
  const defined = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));
  const themeVars = new Set([...css.matchAll(/--([\w-]+)\s*:/g)].map((m) => m[1]));
  const issues = [];
  const CUSTOM = /\b((?:jgame|icon|btn)-[\w-]+|bg-input-[\w-]+)\b/g;
  const TOKEN = /\b(?:bg|text|border|ring|from|to|via)-((?:input-background|foreground|muted-foreground|card|popover|primary-foreground|secondary-foreground|accent-foreground|destructive|sidebar)[\w-]*)\b/g;
  for (const f of L.walk(mod, ['.tsx'])) {
    if (!L.inScope(rootDir, f)) continue;
    const src = L.read(f);
    for (const m of src.matchAll(CUSTOM)) if (!defined.has(m[1])) issues.push({ file: f, level: 'ERROR', rule: 'WEB-L04', message: `class "${m[1]}" không có trong jgame-theme.css / src/styles - style sẽ không áp dụng`, line: L.lineOf(src, m.index) });
    for (const m of src.matchAll(TOKEN)) { const base = m[1].replace(/\/\d+$/, ''); if (!themeVars.has(base) && !themeVars.has('color-' + base)) issues.push({ file: f, level: 'WARN', rule: 'WEB-L04', message: `token "${m[0]}" không có biến --${base}/--color-${base} trong theme - có thể là token của theme khác (shadcn)`, line: L.lineOf(src, m.index) }); }
  }
  return L.group(rootDir, issues);
}
module.exports = { id: 'WEB-L04', title: 'Không dùng class/token theme không tồn tại', source: 'Input vô hình toàn site - commit f9f023c 2026-08-29', check };
