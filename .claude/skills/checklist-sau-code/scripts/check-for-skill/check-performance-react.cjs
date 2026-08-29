// ============================================================
// 🎯 Phục vụ skill: quy-tac-code (React performance)
// check-performance-react.cjs — Kiểm tra pattern gây re-render, phá memo & vòng lặp vô hạn
// ============================================================
// 📋 Kiểm tra: 1. Inline object/array trong JSX props → phá React.memo
//              2. useState(fnCall()) thay vì lazy init useState(() => fnCall())
//              3. useEffect thiếu dependency array → chạy mỗi render
//              4. .map() JSX thiếu key prop
//              5. key={index} / key={i} → dùng index làm key
//              6. Component export không React.memo (nhận props > 0)
//              7. useEffect setState trên state trong chính deps → VÒNG LẶP VÔ HẠN
//              8. useEffect deps có inline object/array/function + setState → VÒNG LẶP VÔ HẠN
//              9. setState gọi trực tiếp trong render body → "Too many re-renders"
//             10. Context.Provider value={inline obj/fn} → rerender toàn bộ subtree
//             11. Component định nghĩa bên trong component (unstable nested)
//             12. Arrow function / .bind() trong JSX props (jsx-no-bind)
// 📤 Output:   PASS nếu 0 | FAIL + file:line của từng vi phạm
// 📊 Severity: HIGH — gây render thừa, giảm hiệu năng UI, crash trình duyệt
// 💡 Example:  node check-performance-react.cjs src/modules/KetoanApp
//              node check-performance-react.cjs src/modules/KetoanApp features/danh-muc/khach-hang
// ============================================================
const fs = require('fs'); const p = require('path'); const g = require('glob');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-performance-react.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);
let files = g.sync(TARGET + '/**/*.{ts,tsx}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }
const errors = [];

files.forEach(file => {
  const c = fs.readFileSync(file, 'utf8'); const lines = c.split('\n');
  const rel = p.relative(TARGET, file).replace(/\\/g, '/');

  // CHECK 1: Inline object trong JSX props — {prop={{key: value}}} hoặc prop={{...}}
  // Regex: attribute={ {...} } hoặc attribute={{ key: value }}
  lines.forEach((l, i) => {
    // Bỏ qua comment, import, và string literals chứa {{
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('*') || t.startsWith('import')) return;

    // Phát hiện inline object: ={{ ... }}  (không phải style={{{}}})
    // Pattern: xxx={{   (có 2 dấu { liên tiếp sau dấu =)
    if (/\w+=\{\{/.test(l) && !/style=\{\{/.test(l)) {
      errors.push(rel + ':' + (i + 1) + ': inline object prop — phá React.memo, nên dùng useMemo/const bên ngoài');
    }

    // CHECK 1b: Inline array trong JSX props — prop={[...]} hoặc prop={[1,2,3]}
    if (/=\{\s*\[/.test(l) && !t.startsWith('import')) {
      errors.push(rel + ':' + (i + 1) + ': inline array prop — phá React.memo, nên dùng useMemo/const bên ngoài');
    }
  });

  // CHECK 2: useState(expensiveFn()) thay vì lazy init
  // Pattern: useState(fnName()) hoặc useState(obj.prop()) - gọi hàm trong useState
  const useStateCalls = c.match(/useState\s*\(\s*\w[\w.]*\(/g);
  if (useStateCalls) {
    useStateCalls.forEach(match => {
      // Tìm line chứa match này
      const idx = c.indexOf(match);
      if (idx >= 0) {
        const lineNum = c.substring(0, idx).split('\n').length;
        // Bỏ qua nếu là () => ... (lazy init đúng)
        if (!match.includes('=>')) {
          errors.push(rel + ':' + lineNum + ': useState(fn()) — nên dùng lazy init useState(() => fn()) để tránh gọi lại mỗi render');
        }
      }
    });
  }

  // CHECK 3: useEffect không có dependency array (mảng rỗng cũng tính là có)
  // ✅ Fix v2: dùng brace-balance parser thay regex non-greedy (regex dừng sớm tại `})`
  // của hàm lồng như subscribe(async () => {...}) → false positive "thiếu deps")
  const ueFindRe = /\buseEffect\s*\(/g;
  let ueFindMatch;
  while ((ueFindMatch = ueFindRe.exec(c)) !== null) {
    const ueBodyStart = ueFindRe.lastIndex; // ngay sau '('
    const ueBodyEnd = findEffectBodyEnd(c, ueBodyStart);
    if (ueBodyEnd < 0) continue;
    const afterBody = c.substring(ueBodyEnd + 1).replace(/^\s*/, '');
    // Có deps nếu sau `}` body là `, [deps])`
    const hasDeps = /^,\s*\[/.test(afterBody);
    if (!hasDeps) {
      const lineNum = c.substring(0, ueFindMatch.index).split('\n').length;
      errors.push(rel + ':' + lineNum + ': useEffect thiếu dependency array → chạy mỗi render, có thể gây infinite loop');
    }
  }

  // CHECK 4 & 5: .map() trong JSX return — chỉ kiểm tra file .tsx
  if (file.endsWith('.tsx')) {
    const mapPatterns = c.match(/\.map\s*\(\s*\([\s\S]*?\)\s*=>\s*[\s\S]*?(?:<[A-Za-z])/g);
    if (mapPatterns) {
      // Tìm các dòng .map có return JSX
      lines.forEach((l, i) => {
        if (l.includes('.map(') && (l.includes('=>') || l.includes('return'))) {
          // ✅ Skip logic map (không phải JSX render): map(...).join() / map(...).filter() chain
          // JSX map không bao giờ chain method sau khi đóng — logic map thì có
          const nextLine = (lines[i + 1] || '').trim();
          if (/\.map\([^)]*\)\s*\./.test(l) || nextLine.startsWith('.')) return;

          // ✅ Chỉ xem là JSX map nếu <tag xuất hiện trong 5 dòng đầu sau map
          // (logic map như draftValues.map(...) → return JSX của component cách xa → không phải)
          const jsxWindow = lines.slice(i, Math.min(i + 5, lines.length)).join('\n');
          if (!/<\w+/.test(jsxWindow)) return;

          // CHECK 4: Thiếu key trong context gần đó (kiểm tra 12 dòng sau — map JSX thường return multi-line)
          const context = lines.slice(i, Math.min(i + 12, lines.length)).join('\n');
          if (!/\bkey\s*=/.test(context)) {
            // Chỉ báo khi map return JSX element (có <tag)
            if (/<\w+/.test(context)) {
              errors.push(rel + ':' + (i + 1) + ': .map() JSX thiếu key prop → React cảnh báo + render sai');
            }
          }

          // CHECK 5: Dùng index làm key
          if (/\bkey\s*=\s*\{\s*(index|i|idx)\s*\}/.test(l)) {
            errors.push(rel + ':' + (i + 1) + ': key={index} — dùng index làm key gây sai lệch khi list thay đổi, nên dùng id duy nhất');
          }
        }
      });
    }
  }

  // ==========================================================
  // CHECKS 7-9: VÒNG LẶP VÔ HẠN (INFINITE LOOP)
  // ==========================================================

  // Xây dựng map stateVar → setterName từ tất cả useState trong file
  const stateToSetter = {};
  const usPattern = /const\s*\[\s*(\w+)\s*,\s*(set\w+)\s*\]\s*=\s*useState/g;
  let usm;
  while ((usm = usPattern.exec(c)) !== null) {
    stateToSetter[usm[1]] = usm[2];
  }

  // Trích xuất tất cả useEffect có dependency array (dùng brace-balance parser — regex cũ dừng sớm)
  const ueDepRe = /\buseEffect\s*\(/g;
  let ueDepMatch;
  while ((ueDepMatch = ueDepRe.exec(c)) !== null) {
    const bodyStart = ueDepRe.lastIndex;
    const bodyEnd = findEffectBodyEnd(c, bodyStart);
    if (bodyEnd < 0) continue;
    const ueBody = c.substring(bodyStart, bodyEnd);
    const ueIdx = ueDepMatch.index;
    // Trích deps từ phần sau body: , [deps])
    const afterBody = c.substring(bodyEnd + 1);
    const depsMatch = afterBody.match(/^\s*,\s*\[([^\]]*)\]/);
    if (!depsMatch) continue;
    const ueDeps = depsMatch[1];

    // CHECK 7: setState trên state nằm trong chính deps của nó
    // ✅ Chỉ báo khi setter gọi TRỰC TIẾP ở top-level body — nếu trước setter có
    // `=>` / `function` / `if` / `.map` / `.then` / addEventListener → setter trong
    // handler/guard → AN TOÀN, không báo (fix false positive của regex cũ)
    const firstBrace = ueBody.indexOf('{');
    const innerBody = firstBrace >= 0 ? ueBody.substring(firstBrace + 1) : ueBody;
    const depNames = ueDeps.split(',').map(function(d) { return d.trim().replace(/\/\/.*/, '').trim(); }).filter(Boolean);
    depNames.forEach(function(dep) {
      if (!/^[a-zA-Z_]\w*$/.test(dep)) return;
      const setter = stateToSetter[dep];
      if (!setter) return;
      const setterRe = new RegExp('\\b' + setter + '\\s*\\(', 'm');
      if (setterRe.test(innerBody)) {
        const firstIdx = innerBody.search(setterRe);
        const prefix = innerBody.substring(0, firstIdx);
        const guarded = /=>|function\s*\(|if\s*\(|for\s*\(|while\s*\(|\.map\s*\(|\.forEach\s*\(|\.then\s*\(|\.catch\s*\(|addEventListener|\.on\s*\(|subscribe\s*\(/.test(prefix);
        if (!guarded) {
          var lineNum7 = c.substring(0, Math.max(0, ueIdx)).split('\n').length;
          errors.push(rel + ':' + lineNum7 + ': useEffect setState(' + dep + ') — state NẰM TRONG chính deps + gọi trực tiếp → VÒNG LẶP VÔ HẠN. Dùng useCallback hoặc điều kiện guard');
        }
      }
    });

    // CHECK 8: Deps chứa inline object/array/function → reference mới mỗi render
    var hasInlineDeps = /\{\s*[a-zA-Z]/.test(ueDeps) || /\[\s*[a-zA-Z]/.test(ueDeps) || /=>/.test(ueDeps);
    if (hasInlineDeps) {
      var hasSetStateInBody = /\bset\w+\s*\(/.test(ueBody);
      if (hasSetStateInBody) {
        var lineNum8 = c.substring(0, Math.max(0, ueIdx)).split('\n').length;
        errors.push(rel + ':' + lineNum8 + ': useEffect deps có inline object/array/function → reference MỚI mỗi render + có setState → VÒNG LẶP VÔ HẠN');
      }
    }
  }

  // CHECK 9: setState gọi trực tiếp trong render body (không trong event handler/effect)
  if (file.endsWith('.tsx')) {
    var insideCallback = false;
    var braceDepth = 0;
    var callbackBraceDepth = 0;
    lines.forEach(function(l, i) {
      var t = l.trim();
      if (t.startsWith('//') || t.startsWith('*') || t.startsWith('import')) return;

      // Phát hiện vào callback: useEffect, useCallback, event handler, function declaration
      // ✅ Fix v2: thêm React. prefix (React.useCallback) + class method (componentDidCatch)
      // ✅ Fix v3: thêm function component boundary (function Xxx({...) — tránh setState
      // trong callback con bị nhầm là render body (sidebar.tsx, dialogs...)
      if (!insideCallback) {
        if (/(?:React\.)?useEffect\s*\(/.test(t) || /(?:React\.)?useCallback\s*\(/.test(t) ||
            /(?:React\.)?useMemo\s*\(/.test(t) || /(?:React\.)?useLayoutEffect\s*\(/.test(t) ||
            /\bon\w+\s*[=:]\s*(?:\(|async|function|\{)/.test(t) ||
            /\b(?:async\s+)?function\s+[a-z]\w*\s*\(/.test(t) ||
            // Function component (uppercase): function Xxx({ ... }) → boundary, tránh false positive
            /\b(?:export\s+(?:default\s+)?)?function\s+[A-Z]\w*\s*\(/.test(t) ||
            /\bconst\s+[a-z]\w*\s*=\s*(?:\([^)]*\)|async\s*\([^)]*\))\s*=>/.test(t) ||
            // Class method: indented method name(params) { → componentDidCatch, handleXxx...
            /^\s{2,}[a-z]\w*\s*\([^)]*\)\s*\{/.test(t)) {
          insideCallback = true;
          callbackBraceDepth = braceDepth;
        }
      }

      // Đếm brace depth
      var opens = (l.match(/\{/g) || []).length;
      var closes = (l.match(/\}/g) || []).length;
      braceDepth += opens - closes;

      // Thoát callback khi brace về lại mức ban đầu
      if (insideCallback && braceDepth <= callbackBraceDepth) {
        insideCallback = false;
      }
      if (insideCallback) return;

      // Phát hiện setXxx(...) gọi trực tiếp
      var setterMatch = t.match(/\b(set\w+)\s*\(/);
      if (setterMatch && !/=>/.test(t) && !/^\s*\}/.test(t)) {
        if (/^\s*(?:const|let|var)\s+set\w+/.test(t)) return;
        // ✅ Skip class component: this.setState(...) — gọi trong lifecycle hợp lệ
        if (t.startsWith('this.')) return;
        // ✅ Chỉ báo khi setter KHỚP với state đã khai báo qua useState
        // (loại sessionStorage.setItem, setTimeout, setAttribute, setData... — không phải React setter)
        if (!Object.values(stateToSetter).includes(setterMatch[1])) return;
        errors.push(rel + ':' + (i + 1) + ': ' + setterMatch[1] + '() gọi TRỰC TIẾP trong render → React "Too many re-renders" / VÒNG LẶP VÔ HẠN');
      }
    });
  }

  // ==========================================================
  // CHECK 10: Context.Provider với value inline
  // ==========================================================
  if (file.endsWith('.tsx')) {
    lines.forEach(function(l, i) {
      var t = l.trim();
      if (t.startsWith('//') || t.startsWith('*')) return;
      if (/\.Provider\s+value=\{\{/.test(t)) {
        errors.push(rel + ':' + (i + 1) + ': Context.Provider value={{...}} — gây rerender toàn bộ subtree consumer, nên bọc value trong useMemo()');
      }
      if (/\.Provider\s+value=\{\s*(?:[a-zA-Z_]\w*\s*\(|\s*\(\s*\)\s*=>)/.test(t)) {
        errors.push(rel + ':' + (i + 1) + ': Context.Provider value={fn()} — function mới mỗi render gây rerender subtree, nên dùng useCallback()');
      }
    });
  }

  // ==========================================================
  // CHECK 11: Unstable nested component (simplified)
  // ==========================================================
  // Chỉ flag khi function component định nghĩa lồng INDENT > 2 spaces so với component cha
  if (file.endsWith('.tsx')) {
    var parentIndent = -1;
    lines.forEach(function(l, i) {
      var t = l.trim();
      if (t.startsWith('//') || t.startsWith('*')) return;

      // Detect parent component start (top-level or export)
      if (parentIndent === -1 && /\b(?:export\s+(?:default\s+)?function\s+[A-Z]|function\s+[A-Z]|const\s+[A-Z]\w*\s*=\s*(?:\([^)]*\)\s*=>|React\.\w+))/.test(t)) {
        parentIndent = l.search(/\S/);
        return;
      }

      // Only check nested after parent found
      if (parentIndent >= 0) {
        var curIndent = l.search(/\S/);
        // Nested function/const with uppercase name at indentation > parent's (clearly nested)
        if (curIndent > parentIndent && curIndent > 4) {
          var nestedFn = t.match(/\bfunction\s+([A-Z]\w*)\s*\(/);
          var nestedConst = t.match(/\bconst\s+([A-Z]\w*)\s*=\s*(?:\(|async\s*\()/);
          if (nestedFn && nestedFn[1] !== 'Function') {
            errors.push(rel + ':' + (i + 1) + ': ' + nestedFn[1] + '() định nghĩa trong component → unstable nested, mất state mỗi re-render');
          } else if (nestedConst && nestedConst[1] !== 'Function') {
            errors.push(rel + ':' + (i + 1) + ': ' + nestedConst[1] + ' = () => định nghĩa trong component → unstable nested');
          }
        }
      }
    });
  }

  // ==========================================================
  // CHECK 12: Arrow function / .bind() trong JSX props (jsx-no-bind)
  // ==========================================================
  if (file.endsWith('.tsx')) {
    lines.forEach(function(l, i) {
      var t = l.trim();
      if (t.startsWith('//') || t.startsWith('*')) return;
      // Only flag arrow function passed to custom component (Capitalized), not DOM elements
      if (/\s<[A-Z]\w*[^>]*\bon\w+\s*=\s*\{\s*(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>/.test(l)) {
        errors.push(rel + ':' + (i + 1) + ': arrow function inline trong prop component — function moi moi render, nen dung useCallback()');
      }
      if (/\bon\w+\s*=\s*\{[^}]*\.bind\s*\(/.test(t)) {
        errors.push(rel + ':' + (i + 1) + ': .bind() trong JSX prop — mỗi lần bind tạo function mới, nên dùng useCallback()');
      }
    });
  }

});

// CHECK 6: Component export nhận props nhưng không bọc React.memo
// Phát hiện: export function TênComponent({ prop1, prop2... }) không có memo
if (featureFilter) {
  files.filter(f => f.endsWith('.tsx')).forEach(file => {
    const c = fs.readFileSync(file, 'utf8');
    const rel = p.relative(TARGET, file).replace(/\\/g, '/');

    // Tìm component export nhận destructured props
    const hasDestructuredProps = /export\s+(?:default\s+)?function\s+\w+\s*\(\s*\{[\s\S]*?\}\s*(?::[\s\S]*?)?\)/.test(c);
    const hasMemo = /\bReact\.memo\s*\(/.test(c) || /\bmemo\s*\(/.test(c);
    // Bỏ qua page component (tên kết thúc bằng Page)
    const isPage = /export\s+(?:default\s+)?function\s+\w*Page\b/.test(c);

    if (hasDestructuredProps && !hasMemo && !isPage) {
      const match = c.match(/export\s+(?:default\s+)?function\s+(\w+)/);
      if (match) {
        const compName = match[1];
        const idx = c.indexOf(match[0]);
        const lineNum = c.substring(0, idx).split('\n').length;
        errors.push(rel + ':' + lineNum + ': ' + compName + ' nhận props nhưng không bọc React.memo → re-render khi parent render');
      }
    }
  });
}

const label = ' B8. React performance ';
if (errors.length === 0) {
  console.log(label + '-'.repeat(Math.max(1, 40)) + ' PASS');
} else {
  console.log(label + '-'.repeat(Math.max(1, 40)) + ' FAIL (' + errors.length + ' issues)');
  errors.slice(0, 8).forEach(e => console.log('     ' + e));
  if (errors.length > 8) console.log('     ... and ' + (errors.length - 8) + ' more');
}
process.exit(errors.length > 0 ? 1 : 0);

/**
 * Tìm vị trí kết thúc body của arrow function (từ sau 'useEffect(').
 * Dùng brace-balance đếm trên content gốc, BỎ QUA strings/comments/template literals.
 * Trả về index của '}' đóng body, hoặc -1 nếu không tìm thấy.
 * ✅ Khắc phục lỗi regex non-greedy dừng sớm tại '})' của hàm lồng
 * (VD: subscribe(async () => {...}) bên trong body) → false positive "thiếu deps".
 */
function findEffectBodyEnd(content, startIdx) {
  let depth = 0;
  let inSingle = false, inDouble = false, inBacktick = false;
  let inLineComment = false, inBlockComment = false;
  for (let i = startIdx; i < content.length; i++) {
    const ch = content[i];
    const prev = i > 0 ? content[i - 1] : '';
    const next = content[i + 1];

    // Track strings
    if (!inLineComment && !inBlockComment) {
      if (ch === "'" && !inDouble && !inBacktick && prev !== '\\') inSingle = !inSingle;
      else if (ch === '"' && !inSingle && !inBacktick && prev !== '\\') inDouble = !inDouble;
      else if (ch === '`' && !inSingle && !inDouble && prev !== '\\') inBacktick = !inBacktick;
    }

    // Track comments
    if (!inSingle && !inDouble && !inBacktick) {
      if (!inBlockComment && ch === '/' && next === '/') { inLineComment = true; i++; continue; }
      else if (!inLineComment && ch === '/' && next === '*') { inBlockComment = true; i++; continue; }
      else if (inBlockComment && ch === '*' && next === '/') { inBlockComment = false; i++; continue; }
    }
    if (ch === '\n') inLineComment = false;
    if (inSingle || inDouble || inBacktick || inLineComment || inBlockComment) continue;

    // Đếm brace
    if (ch === '{') {
      if (depth === 0) { depth = 1; continue; } // mở body
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) return i; // đóng body
    }
  }
  return -1;
}
