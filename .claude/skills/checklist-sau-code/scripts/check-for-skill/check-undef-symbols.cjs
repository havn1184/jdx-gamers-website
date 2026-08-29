// ============================================================
// check-undef-symbols.cjs — Phát hiện symbol dùng nhưng KHÔNG import/khai báo
// ============================================================
// 🎯 Bắt lỗi: "ReferenceError: X is not defined" khi render
//    VD thực tế: dùng `formatDate(...)` trong .tsx nhưng quên
//    `import { formatDate } from '../../shared/utils'` — TS server
//    đôi khi bỏ sót, lỗi chỉ nổ ở runtime.
//
// 🔍 Phương pháp (heuristic, không cần dependency):
//    1. Loại comments + string literals
//    2. Thu thập: imports (named/default/namespace) + locals
//       (function/const/let/var/destructuring/params/class/type/interface)
//    3. Tìm identifier dùng ở vị trí VALUE:
//       - Function call: `Name(` (loại method call `obj.Name(`)
//       - JSX tag: `<Name` (chỉ Capitalized — lowercase là HTML intrinsic)
//    4. Báo FAIL nếu identifier ∉ imports ∪ locals ∪ globals/builtins
//
// 📤 Output: file: [UNDEF] tên symbol (dòng ~N) — kèm skill gợi ý
// 💡 Example: node check-undef-symbols.cjs src/modules/KiemThuApp [feature]
// ============================================================
const fs = require('fs');
const p = require('path');

const portalPath = process.argv[2];
const featureFilter = process.argv[3];

if (!portalPath || !fs.existsSync(portalPath)) {
  console.log('Usage: node check-undef-symbols.cjs <PortalPath> [feature]');
  process.exit(1);
}

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

const files = featureFilter ? walk(p.join(portalPath, featureFilter)) : walk(portalPath);

/** Globals/builtins cho phép dùng không cần import (JS + browser DOM + TS utilities) */
const GLOBALS = new Set(`
  window document navigator location history screen localStorage sessionStorage
  console JSON Math Date Promise RegExp Map Set WeakMap WeakSet Array Object String
  Number Boolean Symbol BigInt Error TypeError RangeError ReferenceError SyntaxError
  URIError EvalError AggregateError isNaN isFinite parseInt parseFloat encodeURI
  encodeURIComponent decodeURI decodeURIComponent atob btoa fetch URL URLSearchParams
  Blob File FormData FileReader AbortController AbortSignal setTimeout setInterval
  clearTimeout clearInterval requestAnimationFrame cancelAnimationFrame queueMicrotask
  structuredClone performance crypto customElements Event CustomEvent EventTarget
  TextEncoder TextDecoder Worker WebSocket MutationObserver IntersectionObserver
  process global globalThis module exports require Buffer React Fragment JSX
  XMLHttpRequest Headers Request Response undefined null true false Symbol NodeJS
  HTMLElement HTMLDivElement HTMLSpanElement HTMLInputElement HTMLTextAreaElement
  HTMLSelectElement HTMLButtonElement HTMLAnchorElement HTMLImageElement HTMLFormElement
  HTMLTableElement HTMLTableCellElement HTMLTableRowElement HTMLTableHeaderElement
  HTMLCanvasElement HTMLVideoElement HTMLAudioElement HTMLOptionElement HTMLLabelElement
  SVGElement Element Node Text Comment Document DocumentFragment EventTarget
  Exclude Extract Record Partial Required Readonly Pick Omit ReturnType Parameters
  InstanceType NonNullable Awaited Uppercase Lowercase Capitalize Uncapitalize ThisType
  ReactNode ReactElement PropsWithChildren SVGProps CSSProperties FormEvent
  MouseEvent KeyboardEvent ChangeEvent ClipboardEvent FocusEvent SyntheticEvent
  PromiseLike Iterable Iterator AsyncIterable Generator ReadonlyArray
  FileSystemFileHandle FileSystemHandle FileSystemDirectoryHandle FileSystemWritableFileStream
  HeadersInit DOMException PermissionStatus MediaQueryList ResizeObserver InputEvent
  PointerEvent WheelEvent DragEvent TouchEvent CompositionEvent AnimationEvent TransitionEvent
`.split(/\s+/).filter(Boolean));

/** Keywords TS/JS — không phải identifier cần import */
const KEYWORDS = new Set(`
  import export from default const let var function return if else for while do switch
  case break continue new typeof instanceof in of delete void this super class extends
  implements interface type enum namespace declare readonly keyof infer is satisfies as
  await yield async try catch finally throw with get set static private protected public
  abstract any unknown never string number boolean object symbol bigint
`.split(/\s+/).filter(Boolean));

/**
 * Tokenizer giữ NGUYÊN ĐỘ DÀI: thay comment/string bằng khoảng trắng cùng số ký tự.
 * - KHÔNG nuốt dòng khai báo kế tiếp (tránh lỗi regex `'...'` lệch cặp như cũ)
 * - Symbol trong string/comment bị "xóa" nhưng vị trí dòng giữ nguyên
 * - Hỗ trợ: line/block comment, string ' " , template `, escape \ (bỏ qua ${} trong template)
 */
function stripCommentsAndStrings(src) {
  const out = src.split('');
  const n = src.length;
  let i = 0;
  let state = 'code';
  while (i < n) {
    const ch = src[i];
    const next = src[i + 1];
    if (state === 'code') {
      if (ch === '/' && next === '/') { state = 'line-comment'; out[i] = out[i + 1] = ' '; i += 2; continue; }
      if (ch === '/' && next === '*') { state = 'block-comment'; out[i] = out[i + 1] = ' '; i += 2; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { state = ch === '`' ? 'template' : 'string'; out[i] = ' '; i++; continue; }
      i++;
    } else if (state === 'line-comment') {
      if (ch === '\n') { state = 'code'; i++; } else { out[i] = ' '; i++; }
    } else if (state === 'block-comment') {
      if (ch === '*' && next === '/') { out[i] = out[i + 1] = ' '; i += 2; state = 'code'; }
      else { out[i] = ' '; i++; }
    } else if (state === 'string') {
      if (ch === '\\') { out[i] = ' '; if (i + 1 < n) out[i + 1] = ' '; i += 2; continue; }
      if (ch === '"' || ch === "'") { out[i] = ' '; i++; state = 'code'; continue; }
      out[i] = ' '; i++;
    } else if (state === 'template') {
      if (ch === '\\') { out[i] = ' '; if (i + 1 < n) out[i + 1] = ' '; i += 2; continue; }
      if (ch === '`') { out[i] = ' '; i++; state = 'code'; continue; }
      out[i] = ' '; i++;
    }
  }
  return out.join('');
}

/** TRUE nếu identifier nằm trong JSX text `>…(…)…<` — vị trí hiển thị, không phải code */
function isInsideJsxText(clean, idx, nameLen) {
  const after = clean.slice(idx + nameLen, idx + nameLen + 20);
  if (!/^\s*\(/.test(after)) return false;   // sau tên phải là ( bỏ qua space
  if (!after.includes('<')) return false;      // gần đó có tag đóng → text
  const before = clean.slice(Math.max(0, idx - 40), idx);
  return before.includes('>');
}

/** Thu thập tên import: named/default/namespace */
function parseImports(src) {
  const names = new Set();
  let m;
  // import X from '...' / import type X from '...'
  let re = /import\s+(?:type\s+)?([A-Za-z_$][\w$]*)\s+from\s+['"]/g;
  while ((m = re.exec(src))) names.add(m[1]);
  // import { a, b as c } from '...'
  re = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"]/g;
  while ((m = re.exec(src))) {
    m[1].split(',').forEach(part => {
      const t = part.trim();
      if (!t) return;
      const asMatch = t.match(/[A-Za-z_$][\w$]*\s+as\s+([A-Za-z_$][\w$]*)$/);
      if (asMatch) { names.add(asMatch[1]); return; }
      const nm = t.match(/[A-Za-z_$][\w$]*$/);
      if (nm) names.add(nm[0]);
    });
  }
  // import * as X from '...'
  re = /import\s+(?:type\s+)?\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s+['"]/g;
  while ((m = re.exec(src))) names.add(m[1]);
  // import React, { a, b } from '...' / import X, { a } from '...'
  re = /import\s+[A-Za-z_$][\w$]*\s*,\s*\{([^}]*)\}\s+from\s+['"]/g;
  while ((m = re.exec(src))) {
    m[1].split(',').forEach(part => {
      const t = part.trim();
      if (!t) return;
      const asMatch = t.match(/[A-Za-z_$][\w$]*\s+as\s+([A-Za-z_$][\w$]*)$/);
      if (asMatch) { names.add(asMatch[1]); return; }
      const nm = t.match(/[A-Za-z_$][\w$]*$/);
      if (nm) names.add(nm[0]);
    });
  }
  // import X, * as Y from '...'
  re = /import\s+[A-Za-z_$][\w$]*\s*,\s*\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s+['"]/g;
  while ((m = re.exec(src))) names.add(m[1]);
  return names;
}

/** Lấy nội dung trong cặp ( ) cân bằng depth từ vị trí mở */
function extractBalancedParens(src, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) return src.slice(openIdx + 1, i);
    }
  }
  return null;
}

/** Thêm tên từ danh sách param (hỗ trợ destructuring, default, type annotation) */
function addParamName(part, names) {
  part = part.trim();
  if (!part) return;
  part = part.split('=')[0].trim();   // bỏ default: a = 5
  part = part.split(':')[0].trim();   // bỏ type: a: T
  if (part.startsWith('{') || part.startsWith('[')) {
    const inner = part.slice(1, -1);
    inner.split(',').forEach(sub => {
      sub = sub.trim();
      if (!sub) return;
      // a: alias → local name là vế phải của ':' (destructure param alias)
      let nm = sub;
      if (sub.includes(':')) nm = sub.slice(sub.indexOf(':') + 1);
      nm = nm.split('=')[0].trim(); // bỏ default
      const mt = nm.match(/[A-Za-z_$][\w$]*$/);
      if (mt) names.add(mt[0]);
    });
    return;
  }
  const nm = part.match(/[A-Za-z_$][\w$]*$/);
  if (nm) names.add(nm[0]);
}

function collectParams(paramStr, names) {
  let depth = 0;
  let cur = '';
  for (const ch of paramStr) {
    if (ch === '{' || ch === '[' || ch === '<') depth++;
    else if (ch === '}' || ch === ']' || ch === '>') depth--;
    if (ch === ',' && depth === 0) {
      addParamName(cur, names);
      cur = '';
    } else cur += ch;
  }
  addParamName(cur, names);
}

/** Thu thập khai báo local: function/const/let/var/params/class/type/interface */
function parseLocals(src) {
  const names = new Set();
  let m;
  // function name( / export function name( / export default function name(
  let re = /\b(?:export\s+(?:default\s+)?)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(/g;
  while ((m = re.exec(src))) names.add(m[1]);
  // const/let/var name = ...
  re = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?:=|:)/g;
  while ((m = re.exec(src))) names.add(m[1]);
  // const { a, b: c } = ...  — ALIAS: local name là vế phải của ':' (VD loading: nextVersionLoading → nextVersionLoading)
  re = /\b(?:const|let|var)\s+\{([^}]*)\}\s*=/g;
  while ((m = re.exec(src))) {
    m[1].split(',').forEach(part => {
      const t = part.trim();
      if (!t) return;
      let nm = t;
      if (t.includes(':')) nm = t.slice(t.indexOf(':') + 1);
      nm = nm.split('=')[0].trim(); // bỏ default: c = 5
      const mt = nm.match(/[A-Za-z_$][\w$]*$/);
      if (mt) names.add(mt[0]);
    });
  }
  // const [a, b] = ...
  re = /\b(?:const|let|var)\s+\[([^\]]*)\]\s*=/g;
  while ((m = re.exec(src))) {
    m[1].split(',').forEach(part => {
      const t = part.trim();
      if (!t) return;
      const nm = t.split(':')[0].split('=')[0].trim().match(/[A-Za-z_$][\w$]*$/);
      if (nm) names.add(nm[0]);
    });
  }
  // class name
  re = /\bclass\s+([A-Za-z_$][\w$]*)/g;
  while ((m = re.exec(src))) names.add(m[1]);
  // type name = ... / interface name / enum name
  re = /\b(?:type|interface|enum)\s+([A-Za-z_$][\w$]*)/g;
  while ((m = re.exec(src))) names.add(m[1]);
  // function params — dùng depth-aware để chịu được `)` bên trong type/arrow
  re = /\bfunction\s*\*?\s*[A-Za-z_$][\w$]*\s*(?:<[^>]*>)?\s*\(/g;
  let fm;
  while ((fm = re.exec(src))) {
    const openRel = src.slice(fm.index).indexOf('(');
    const innerStr = extractBalancedParens(src, fm.index + openRel);
    if (innerStr !== null) collectParams(innerStr, names);
  }
  // method declarations trong class: [static|async|visibility] name( đầu dòng
  re = /(?:^|\n)\s*(?:(?:public|private|protected)\s+)?(?:static\s+)?(?:async\s+)?([A-Za-z_$][\w$]*)\s*\(/g;
  while ((m = re.exec(src))) names.add(m[1]);
  // arrow params: (a, b) => ... / a =>
  re = /\(/g;
  while ((m = re.exec(src))) {
    const after = src.slice(m.index + 1, m.index + 40);
    if (!after.includes('=>')) continue;
    // chỉ xét cặp ( ) bao quanh => với depth cân bằng tại vị trí này
    const innerStr = extractBalancedParens(src, m.index);
    if (innerStr === null) continue;
    const closeIdx = m.index + 1 + innerStr.length;
    if (src.slice(closeIdx, closeIdx + 3).includes('=>')) {
      collectParams(innerStr, names);
    }
  }
  re = /([A-Za-z_$][\w$]*)\s*=>/g;
  while ((m = re.exec(src))) names.add(m[1]);
  return names;
}

/** Tìm vị trí đóng của { mở tại openIdx (clean đã strip string/comment — chỉ cần cân bằng) */
function matchCloseBrace(clean, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < clean.length; i++) {
    const ch = clean[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Thu thập shorthand key (value ref) trong object literal:
 * - `return { a, b }` — return statement của function/hook
 * - `const x = { a, b }` / `let x = { a, b }` — gán object literal
 *
 * KHÔNG xét destructuring `const { a } = ...` (đó là khai báo local) và
 * key:value (`a: expr`), method shorthand (`foo()`), computed key (`[k]`), spread (`...x`).
 *
 * Bắt lỗi: `return { commentError }` nhưng commentError CHƯA khai báo →
 * ReferenceError runtime (Vite/esbuild không type-check → chỉ nổ khi render).
 */
function collectShorthandRefs(clean, src) {
  const refs = []; // { name, line }
  const scanObj = (openIdx) => {
    const closeIdx = matchCloseBrace(clean, openIdx);
    if (closeIdx === -1) return;
    const body = clean.slice(openIdx + 1, closeIdx);
    let depth = 0;
    let seg = '';
    let segAbsStart = openIdx + 1; // vị trí TUYỆT ĐỐI (trong clean) của đầu segment
    const flush = (endAbs) => {
      const t = seg.trim();
      const relStart = seg.indexOf(t);
      if (
        t && !t.startsWith('...') &&
        !t.includes(':') && !t.includes('=') &&
        !t.includes('(') && !t.includes('[') && !t.includes('.')
      ) {
        const nm = t.match(/^([A-Za-z_$][\w$]*)\??$/);
        // Bỏ tên ngắn ≤ 2 ký tự (id/x/fn...) — thường là param class method parseLocals bỏ sót (consistent với call detection)
        if (nm && nm[1].length > 2) {
          const absIdx = segAbsStart + (relStart >= 0 ? relStart : 0);
          const line = src.slice(0, absIdx).split('\n').length;
          refs.push({ name: nm[1], line });
        }
      }
      seg = '';
      segAbsStart = endAbs;
    };
    for (let i = 0; i < body.length; i++) {
      const ch = body[i];
      if (ch === '{' || ch === '(' || ch === '[') depth++;
      else if (ch === '}' || ch === ')' || ch === ']') depth--;
      if (ch === ',' && depth === 0) flush(openIdx + 1 + i + 1);
      else seg += ch;
    }
    flush(closeIdx); // segment cuối — chỉ để đóng flush
  };
  let m;
  // return { ... }
  const reReturn = /\breturn\s*\{/g;
  while ((m = reReturn.exec(clean))) scanObj(m.index + m[0].length - 1);
  // const x = { ... } — gán object literal (destructuring `const { a }` KHÔNG khớp vì { sau const)
  const reAssign = /\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*\{/g;
  while ((m = reAssign.exec(clean))) scanObj(m.index + m[0].length - 1);
  return refs;
}

const FAIL_LINES = [];

for (const file of files) {
  const rel = p.relative(process.cwd(), file);
  const src = fs.readFileSync(file, 'utf8');
  const clean = stripCommentsAndStrings(src);
  const imports = parseImports(src);
  const locals = parseLocals(clean);

  const used = new Set();
  let m;
  // Function calls: Name( — bỏ method call (đứng sau dấu chấm) + keywords + FP thường gặp
  let re = /([A-Za-z_$][\w$]*)\s*\(/g;
  while ((m = re.exec(clean))) {
    const name = m[1];
    if (name.length <= 2) continue;               // ký tự ngắn từ JSX text còn sót
    if (m.index > 0 && clean[m.index - 1] === '.') continue; // method call
    if (KEYWORDS.has(name)) continue;
    if (/^on[A-Z]/.test(name)) continue;          // props callback onXxx (truyền từ parent)
    if (/^[A-Z][A-Z0-9_]+$/.test(name)) continue; // hằng số UPPER_CASE (BASE_URL, TIMEOUT...)
    if (isInsideJsxText(clean, m.index, name.length)) continue; // text hiển thị `>…(…)…<`
    used.add(name);
  }
  // JSX component tag: <Name (chỉ Capitalized, dài ≥ 3, không phải onXxx/const)
  re = /<([A-Z][\w$]{2,})/g;
  while ((m = re.exec(clean))) {
    const name = m[1];
    if (/^[A-Z][A-Z0-9_]+$/.test(name)) continue; // type generic/hằng số
    used.add(name);
  }

  // Shorthand trong return/object literal: return { a, b } | const x = { a, b }
  // → a/b là VALUE REF — nếu chưa khai báo → ReferenceError runtime
  const shorthandRefs = collectShorthandRefs(clean, src);
  const missingShorthand = shorthandRefs.filter(
    r => !imports.has(r.name) && !locals.has(r.name) && !GLOBALS.has(r.name) && !KEYWORDS.has(r.name)
  );

  const missing = [...used].filter(name => !imports.has(name) && !locals.has(name) && !GLOBALS.has(name) && !KEYWORDS.has(name));

  if (missing.length > 0 || missingShorthand.length > 0) {
    const detail = [
      ...missing.map(name => {
        const idx = clean.indexOf(name);
        const line = idx >= 0 ? src.slice(0, idx).split('\n').length : '?';
        return `${name} (dòng ~${line})`;
      }),
      ...missingShorthand.map(r => `${r.name} (dòng ~${r.line}, shorthand trong return/object)`),
    ].join(', ');
    FAIL_LINES.push(`${rel}: [UNDEF] dùng symbol nhưng thiếu import/khai báo: ${detail}`);
  }
}

if (FAIL_LINES.length > 0) {
  console.log('B13. Undefined symbols (thiếu import) ----------------------- FAIL (' + FAIL_LINES.length + ' issues)');
  FAIL_LINES.forEach(l => console.log('     ' + l));
  console.log('      → Fix: đọc skill [.claude/skills/quy-tac-code/SKILL.md] (mục § Import)');
  process.exit(1);
} else {
  console.log('B13. Undefined symbols --------------------------------------- PASS');
  process.exit(0);
}
