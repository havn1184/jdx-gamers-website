// ============================================================
// check-hook-props.cjs — B14. Phát hiện LỆCH API giữa Page ↔ Hook / Page ↔ Component
// ============================================================
// 🎯 Phát hiện lỗi runtime: "Cannot read properties of undefined (reading 'length')"
//    khi page dùng `page.xxx` nhưng hook KHÔNG return 'xxx' (→ undefined)
//    hoặc page truyền prop không tồn tại vào component (props interface thiếu).
//
// Check A — Hook-return mismatch:
//   Page:  const page = useSettingsMemberPage(...)  + dùng page.projectIds
//          const { projectIds } = useXxx(...)
//   Hook:  return { items, loading, ... }  ← thiếu projectIds → FAIL
//
// Check B — Component-props mismatch:
//   Page:  <SettingsMemberTable projectNameById={...} onStatusChange={...} />
//   Component: function SettingsMemberTable({ items, ... }: Props) ← thiếu prop → FAIL
//
// 💡 Ví dụ thực tế: SettingsMembersPage dùng 13 field hook không return
//    (projectIds, loadProjectOptions, statusFilter, searchText, canManageProject...)
//    → TableSearchComboboxMultiple nhận values={undefined} → crash.
//    TS compiler bắt được nhưng Vite dev (esbuild) KHÔNG type-check → lỗi runtime.
//
// 📊 Output: CHỈ in FAIL (file:line: mô tả). Không in PASS.
// 💡 Example:
//   node check-hook-props.cjs src/modules/KiemThuApp
//   node check-hook-props.cjs src/modules/KiemThuApp features/settings/members
// ============================================================
const fs = require('fs');
const p = require('path');

const portalPath = process.argv[2];
const featureFilter = process.argv[3];

if (!portalPath || !fs.existsSync(portalPath)) {
  console.log('Usage: node check-hook-props.cjs <PortalPath> [feature]');
  process.exit(1);
}

// ===== Helpers =====

/** Duyệt thư mục lấy danh sách file .ts/.tsx (bỏ .d.ts) */
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = p.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'build', 'coverage'].includes(e.name)) continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(e.name) && !e.name.endsWith('.d.ts')) {
      out.push(full);
    }
  }
  return out;
}

/** Lọc file theo featureFilter (nếu có) — filter là đường dẫn tương đối chứa trong file */
function matchFeature(file, feature) {
  if (!feature) return true;
  const norm = file.split('\\').join('/');
  return norm.includes(feature.split('\\').join('/'));
}

/** Resolve import specifier → đường dẫn file thực tế (thử .ts/.tsx/index) */
function resolveImport(fromFile, specifier) {
  let base;
  if (specifier.startsWith('.')) {
    base = p.resolve(p.dirname(fromFile), specifier);
  } else if (specifier.startsWith('@/')) {
    // @/modules/JGameApp/... hoặc @/shared/... — chỉ resolve trong module (JGameApp thực tế dùng relative import,
    // regex này giữ lại phòng khi có alias @/ được thêm sau này)
    const m = specifier.match(/^@\/(modules\/(?:JGameApp)\/.*)$/);
    if (!m) return null;
    base = p.resolve(p.dirname(portalPath), '..', '..', m[1]);
  } else {
    return null; // node_modules / thư viện → bỏ qua
  }
  const candidates = [base, base + '.ts', base + '.tsx', base + '.tsx', base + '.ts'];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  // Barrel: thử index.ts / index.tsx
  for (const idx of [p.join(base, 'index.ts'), p.join(base, 'index.tsx')]) {
    if (fs.existsSync(idx)) return idx;
  }
  return null;
}

/** Tìm import statement cho symbol → resolve path file (theo cả barrel export) */
function findImportPath(file, symbol) {
  const content = fs.readFileSync(file, 'utf8');
  // import { A, B, useXxx } from '...'
  const reNamed = new RegExp('import\\s*\\{([^}]*)\\}\\s*from\\s*[\'"]([^\'"]+)[\'"]', 'g');
  let m;
  while ((m = reNamed.exec(content))) {
    const names = m[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0]);
    if (names.includes(symbol)) {
      return followBarrel(resolveImport(file, m[2]), symbol);
    }
  }
  // import useXxx from '...'
  const reDefault = new RegExp('import\\s+' + symbol + '\\s+from\\s*[\'"]([^\'"]+)[\'"]');
  m = reDefault.exec(content);
  if (m) return followBarrel(resolveImport(file, m[1]), symbol);
  // import * as X from '...' → X.useXxx
  const reNs = new RegExp('import\\s*\\*\\s*as\\s+(\\w+)\\s+from\\s*[\'"]([^\'"]+)[\'"]', 'g');
  while ((m = reNs.exec(content))) {
    if (new RegExp('\\b' + m[1] + '\\.' + symbol + '\\b').test(content)) {
      return followBarrel(resolveImport(file, m[2]), symbol);
    }
  }
  return null;
}

/**
 * Nếu file resolve được là barrel (index.ts re-export) → theo dõi tiếp
 * export { useXxx } from './useXxx.page' cho tới khi tìm thấy file chứa định nghĩa thật.
 */
function followBarrel(file, symbol) {
  if (!file) return null;
  let current = file;
  const visited = new Set();
  while (current && !visited.has(current)) {
    visited.add(current);
    const src = fs.readFileSync(current, 'utf8');
    // Chứa định nghĩa thật (function/const) → dừng
    if (new RegExp('(?:export\\s+)?function\\s+' + symbol + '\\s*\\(').test(src) ||
        new RegExp('(?:export\\s+)?const\\s+' + symbol + '\\s*=').test(src)) {
      return current;
    }
    // export { useXxx } from './path' — resolve tiếp
    const reExport = new RegExp('export\\s*\\{[^}]*\\b' + symbol + '\\b[^}]*\\}\\s*from\\s*[\'"]([^\'"]+)[\'"]');
    const em = reExport.exec(src);
    if (em) {
      const next = resolveImport(current, em[1]);
      if (!next || visited.has(next)) return null;
      current = next;
      continue;
    }
    return null; // không phải barrel re-export → dừng
  }
  return null;
}

/** Tìm index của ký tự đóng khối (brace/paren) cân bằng từ openIndex (trỏ tới ký tự mở) */
function matchClose(str, openIndex) {
  const open = str[openIndex];
  const close = open === '{' ? '}' : open === '(' ? ')' : open === '[' ? ']' : null;
  if (!close) return -1;
  let depth = 0;
  let inStr = null;
  for (let i = openIndex; i < str.length; i++) {
    const ch = str[i];
    if (inStr) {
      if (ch === '\\') { i++; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '{' || ch === '(' || ch === '[') depth++;
    else if (ch === '}' || ch === ')' || ch === ']') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Lấy block return {...} của function — chọn return có NHIỀU KEYS NHẤT (return chính) */
function getReturnObjectKeys(hookFile, hookName) {
  const src = fs.readFileSync(hookFile, 'utf8');
  // Tìm signature: export function useXxx( hoặc export const useXxx =
  const sigRe = new RegExp('(?:export\\s+)?function\\s+' + hookName + '\\s*\\(');
  let sigIndex = sigRe.exec(src)?.index;
  if (sigIndex === undefined) {
    // Arrow function: export const useXxx = (...) => { ... }
    const arrowRe = new RegExp('(?:export\\s+)?const\\s+' + hookName + '\\s*=\\s*(?:async\\s*)?\\(');
    const am = arrowRe.exec(src);
    if (!am) return null;
    sigIndex = am.index;
  }
  // Thu thập TẤT CẢ return object sau signature, chọn set nhiều keys nhất
  // (return sớm trong useState initializer / useCallback có ít keys hơn return chính)
  let searchFrom = sigIndex;
  let best = null;
  while (true) {
    const ri = src.indexOf('return {', searchFrom);
    if (ri === -1) break;
    const parsed = parseReturnBlock(src, ri);
    if (parsed.keys.size > 0 && (!best || parsed.keys.size > best.keys.size)) best = parsed;
    searchFrom = ri + 8;
  }
  // Return có spread ({ ...state, ... }) → không xác định được keys đầy đủ → skip
  if (!best || best.hasSpread) return null;
  return best.keys; // null = không có return object → hook return delegate (skip)
}

/** Parse 'return {' tại ri → { keys, hasSpread } (keys top-level) */
function parseReturnBlock(src, ri) {
  const openIdx = src.indexOf('{', ri);
  if (openIdx === -1) return { keys: new Set(), hasSpread: false };
  const closeIdx = matchClose(src, openIdx);
  if (closeIdx === -1) return { keys: new Set(), hasSpread: false };
  const body = src.slice(openIdx + 1, closeIdx);
  const keys = new Set();
  let hasSpread = false;
  // Tách top-level theo dấu phẩy (track depth + string)
  let depth = 0, inStr = null, seg = '', segments = [];
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inStr) {
      seg += ch;
      if (ch === '\\') { seg += body[i + 1] ?? ''; i++; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; seg += ch; continue; }
    if (ch === '{' || ch === '(' || ch === '[') { depth++; seg += ch; continue; }
    if (ch === '}' || ch === ')' || ch === ']') { depth--; seg += ch; continue; }
    if (ch === ',' && depth === 0) { segments.push(seg); seg = ''; continue; }
    seg += ch;
  }
  if (seg.trim()) segments.push(seg);

  for (const rawSeg of segments) {
    // Bỏ comment // và /* */
    let s = rawSeg.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    s = s.trim();
    if (!s) continue;
    // Bỏ segment spread: ...state (không biết keys bên trong → không tính)
    if (s.startsWith('...')) { hasSpread = true; continue; }
    let key = s;
    if (s.includes(':')) key = s.slice(0, s.indexOf(':'));
    key = key.replace(/\?\s*$/, '').trim();
    // Lấy token trước : — handle 'handleXxx: useCallback('
    key = key.split(' ')[0];
    if (key) keys.add(key);
  }
  return { keys, hasSpread };
}

/** Thu thập keys page dùng từ hook: destructure hoặc member access page.xxx */
function collectHookUsages(file, content) {
  const usages = []; // { hookName, keys: Set }
  // Pattern 1: const { a, b } = useXxx(...)
  const reDestr = /const\s*\{([^}]*)\}\s*=\s*use([A-Z][A-Za-z0-9]*)\s*\(/g;
  let m;
  while ((m = reDestr.exec(content))) {
    const keys = new Set();
    m[1].split(',').forEach(part => {
      let k = part.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '').trim();
      // Bỏ spread trong destructure: const { ...rest } = useXxx()
      if (k.startsWith('...')) return;
      if (k.includes(':')) k = k.slice(0, k.indexOf(':')).trim();
      k = k.replace(/\?\s*$/, '').replace(/^\.\.\./, '').trim();
      if (k) keys.add(k);
    });
    if (keys.size) usages.push({ hookName: 'use' + m[2], keys });
  }
  // Pattern 2: const page = useXxx(...) → page.xxx
  const reAssign = /const\s+(\w+)\s*=\s*use([A-Z][A-Za-z0-9]*)\s*\(/g;
  while ((m = reAssign.exec(content))) {
    const local = m[1];
    const hookName = 'use' + m[2];
    // Tránh trùng với pattern 1 (destructure) — pattern 1 không match const {x} =
    const keys = new Set();
    const reAccess = new RegExp('\\b' + local + '\\.([A-Za-z_$][\\w$]*)\\b', 'g');
    let am;
    while ((am = reAccess.exec(content))) {
      // Bỏ method call thông thường của object (không phải hook) — vẫn tính để chắc
      keys.add(am[1]);
    }
    if (keys.size) usages.push({ hookName, keys });
  }
  return usages;
}

// ===== React hooks cần loại trừ (không phải custom hook cần check) =====
const SKIP_HOOKS = new Set([
  'useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'useContext',
  'useReducer', 'useLayoutEffect', 'useImperativeHandle', 'useDebugValue',
  'useNavigate', 'useLocation', 'useSearchParams', 'useParams', 'useRouteMatch',
  'useDebounce', 'useDebouncedValue', 'usePermission', 'useKiemThuNavigation',
  'useMediaQuery', 'useLocalStorage', 'useTheme', 'useTranslation',
]);

// ===== Common HTML/React props — bỏ qua khi check component props =====
const COMMON_PROPS = new Set([
  'className', 'style', 'id', 'key', 'children', 'title', 'ref', 'name', 'type',
  'value', 'placeholder', 'disabled', 'checked', 'role', 'tabIndex', 'maxLength',
  'minLength', 'min', 'max', 'step', 'autoFocus', 'readOnly', 'required',
  'target', 'href', 'rel', 'src', 'alt', 'width', 'height', 'size', 'variant',
  'align', 'onClick', 'onChange', 'onFocus', 'onBlur', 'onKeyDown', 'onKeyUp',
  'onKeyPress', 'onMouseEnter', 'onMouseLeave', 'onMouseDown', 'onMouseUp',
  'onSubmit', 'onScroll', 'onWheel', 'onDoubleClick', 'onSelect', 'onInput',
  'data-qa', 'aria-label', 'aria-hidden', 'aria-expanded', 'aria-describedby',
  'aria-labelledby', 'aria-checked', 'aria-selected', 'aria-current', 'aria-live',
  'defaultValue', 'defaultChecked', 'multiple', 'accept', 'autoComplete', 'autoCapitalize',
  'spellCheck', 'inputMode', 'pattern', 'dir', 'draggable', 'contentEditable', 'hidden',
  // HTML table/label attributes (TableCell, Label wrapper...)
  'colSpan', 'rowSpan', 'htmlFor', 'scope', 'headers', 'abbr',
  // HTML form attributes (Textarea wrapper...)
  'rows', 'cols', 'wrap',
  // Radix primitive props (Select/Dialog/Popover/DropdownMenu/Tooltip wrapper)
  'onValueChange', 'onOpenChange', 'onSelect', 'onCheckedChange', 'onFocusChange',
  'onValueCommit', 'onPointerDownOutside', 'onInteractOutside', 'onEscapeKeyDown',
  'asChild', 'forceMount', 'modal', 'portal', 'defaultOpen', 'open', 'position', 'side',
  'alignOffset', 'sideOffset', 'avoidCollisions', 'collisionPadding', 'sticky', 'hideWhenDetached',
  'showArrow', 'allowCustomValue', 'isSearchable', 'isMulti', 'maxDropdownHeight', 'emptyText',
  'delayDuration', 'skipDelayDuration', 'disableHoverableContent', 'tabIndex',
  // cmdk (Command) props
  'shouldFilter', 'filter', 'loop', 'disablePointerSelection', 'disableSelectedItemInteraction',
  'defaultFilter', 'defaultValue', 'defaultChecked', 'multiple',
]);

/** Thu thập props page truyền vào component JSX: [{ component, props:Set }] */
function collectComponentProps(file, content) {
  const usages = [];
  const reJsx = /<([A-Z][\w.]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(?:\/?>)/g;
  let m;
  while ((m = reJsx.exec(content))) {
    const comp = m[1];
    const propsArea = m[2] ?? '';
    const props = new Set();
    // CHỈ bắt props dạng prop={expression} — tránh nhầm arrow param (e => ...) và props string
    const reProp = /(\w[\w-]*)\s*=\s*\{/g;
    let pm;
    while ((pm = reProp.exec(propsArea))) {
      const name = pm[1];
      if (!COMMON_PROPS.has(name) && !name.startsWith('data-') && !name.startsWith('aria-')) {
        props.add(name);
      }
    }
    if (props.size) usages.push({ component: comp, props });
  }
  return usages;
}

/** Parse destructure params: function Xxx({ a, b = {}, c: alias }: Props) → Set<string> */
function parseDestructuredParams(src, parenIdx) {
  // parenIdx trỏ tới '(' — destructure bắt đầu ngay sau đó
  if (src[parenIdx + 1] !== '{') return null;
  const closeParen = matchClose(src, parenIdx);
  if (closeParen === -1) return null;
  const body = src.slice(parenIdx + 1, closeParen);
  // body = '{ a, b = {}, c: alias }: XxxProps' — lấy khối { } đầu tiên
  const braceIdx = body.indexOf('{');
  if (braceIdx === -1) return null;
  const destClose = matchClose(body, braceIdx);
  if (destClose === -1) return null;
  const destBody = body.slice(braceIdx + 1, destClose);

  // Tách top-level theo dấu phẩy (track depth + string)
  const keys = new Set();
  let depth = 0, inStr = null, seg = '';
  const segments = [];
  for (let i = 0; i < destBody.length; i++) {
    const ch = destBody[i];
    if (inStr) { seg += ch; if (ch === inStr) inStr = null; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; seg += ch; continue; }
    if (ch === '{' || ch === '(' || ch === '[') { depth++; seg += ch; continue; }
    if (ch === '}' || ch === ')' || ch === ']') { depth--; seg += ch; continue; }
    if (ch === ',' && depth === 0) { segments.push(seg); seg = ''; continue; }
    seg += ch;
  }
  if (seg.trim()) segments.push(seg);

  for (const raw of segments) {
    let s = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '').trim();
    if (!s || s.startsWith('...')) continue;
    // Alias: a: rename | Default: c = 'x' | Optional: a?
    let key = s;
    if (s.includes(':')) key = s.slice(0, s.indexOf(':')).trim();
    else if (s.includes('=')) key = s.slice(0, s.indexOf('=')).trim();
    key = key.replace(/\?\s*$/, '').trim();
    if (key) keys.add(key);
  }
  return keys;
}

/**
 * Parse toàn bộ props khai báo của component — UNION destructure + interface COMPProps.
 * (Không return sớm — component có thể khai báo prop chỉ trong interface, destructure chỉ dùng 1 phần)
 */
function getDeclaredProps(compFile, component) {
  const src = fs.readFileSync(compFile, 'utf8');
  const declared = new Set();

  // --- 1) Destructure params: function Xxx({...}: Props) | const Xxx = ({...}: Props) => | memo(({...}: Props) =>
  const reSig = new RegExp(
    '(?:function\\s+' + component + '\\s*\\(|\\b' + component + '\\s*=\\s*(?:memo\\s*\\(\\s*)?(?:function\\s+' + component + '\\s*)?\\()',
    'g'
  );
  let m;
  while ((m = reSig.exec(src))) {
    const parenIdx = m.index + m[0].lastIndexOf('(');
    if (parenIdx === -1 || src[parenIdx + 1] !== '{') continue;
    const keys = parseDestructuredParams(src, parenIdx);
    if (keys) keys.forEach(k => declared.add(k));
  }

  // --- 2) Interface COMPProps { ... } — property depth 1
  const reIface = new RegExp('interface\\s+(?:\\w*\\.)?' + component + 'Props\\s*\\{');
  const im = reIface.exec(src);
  if (im) {
    const openIdx = src.indexOf('{', im.index);
    const closeIdx = matchClose(src, openIdx);
    if (closeIdx !== -1) {
      const body = src.slice(openIdx + 1, closeIdx);
      const reProp = /^\s{2,4}(\w+)\??\s*:/gm;
      let pm;
      while ((pm = reProp.exec(body))) declared.add(pm[1]);
    }
  }

  // --- 3) Type Props trong signature (khác tên): function Xxx({...}: MyCustomProps)
  //     → tìm type alias/interface cùng tên + 'Props' hậu tố
  const reType = new RegExp('function\\s+' + component + '\\s*\\([^)]*\\)\\s*:\s*(\\w+)');
  const tm = reType.exec(src);
  if (tm) {
    const typeName = tm[1];
    const reAlias = new RegExp('(?:interface|type)\\s+' + typeName + '\\s*(?:=\s*)?\\{');
    const am = reAlias.exec(src);
    if (am) {
      const openIdx = src.indexOf('{', am.index);
      const closeIdx = matchClose(src, openIdx);
      if (closeIdx !== -1) {
        const body = src.slice(openIdx + 1, closeIdx);
        const reProp = /^\s{2,4}(\w+)\??\s*:/gm;
        let pm;
        while ((pm = reProp.exec(body))) declared.add(pm[1]);
      }
    }
  }

  return declared;
}

// ===== MAIN =====
const files = walk(portalPath).filter(f => matchFeature(f, featureFilter));
let failures = 0;

for (const file of files) {
  if (!/\.tsx$/.test(file)) continue;
  const content = fs.readFileSync(file, 'utf8');

  // ===== Check A: Hook-return mismatch =====
  const hookUsages = collectHookUsages(file, content);
  for (const u of hookUsages) {
    if (SKIP_HOOKS.has(u.hookName)) continue;
    const hookFile = findImportPath(file, u.hookName);
    if (!hookFile) continue; // hook ngoài portal / không resolve được → skip
    const returnKeys = getReturnObjectKeys(hookFile, u.hookName);
    if (!returnKeys || returnKeys.size === 0) continue; // hook return delegate / không parse được → skip
    const missing = [...u.keys].filter(k => !returnKeys.has(k));
    for (const k of missing) {
      const line = content.split('\n').findIndex(l => l.includes('.' + k + '\\b') || l.includes('{' + k + '\\b') || l.includes(k)) + 1;
      failures++;
      console.log('B14. Hook-return mismatch --------------------------------- FAIL');
      console.log('  ' + file.replace(portalPath + p.sep, '') + ': dùng "' + k + '" từ hook ' + u.hookName + ' nhưng hook KHÔNG return "' + k + '" → value undefined khi truy cập');
      console.log('      → Fix: đọc skill [.claude/skills/tich-hop-api-ui/SKILL.md] (hook phải return đủ key page dùng)');
    }
  }

  // ===== Check B: Component-props mismatch =====
  const compUsages = collectComponentProps(file, content);
  for (const cu of compUsages) {
    const compFile = findImportPath(file, cu.component);
    if (!compFile) continue; // component ngoài portal / node_modules → skip
    const declared = getDeclaredProps(compFile, cu.component);
    if (declared.size === 0) continue; // không parse được → skip (tránh false positive)
    const missing = [...cu.props].filter(k => !declared.has(k));
    for (const k of missing) {
      failures++;
      console.log('B14. Component-props mismatch ------------------------------ FAIL');
      console.log('  ' + file.replace(portalPath + p.sep, '') + ': truyền prop "' + k + '" vào <' + cu.component + '> nhưng component KHÔNG khai báo prop này');
      console.log('      → Fix: đọc skill [.claude/skills/tao-ui-giao-dien/SKILL.md] (props phải khai báo đủ trong component)');
    }
  }
}

if (failures === 0) {
  console.log('B14. Hook/Component props --------------------------------------- PASS');
}
process.exit(failures > 0 ? 1 : 0);
