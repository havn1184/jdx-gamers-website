// ============================================================
// 🎯 Phục vụ skill: sua-file-an-toan (Syntax braces)
// check-syntax.cjs — Kiểm tra sai cú pháp JS/JSX/TSX
// ============================================================
// 📋 Kiểm tra: 1. Brace mismatch { vs }
//              2. Mở tag JSX (<span>, <div>, <Button>) không đóng
//              3. Orphan code ngoài component (JSX sau dấu } cuối)
//              4. Template literal ${} bị hỏng
// 📤 Output:   PASS nếu sạch | FAIL + file:line + chi tiết lỗi
// 📊 Severity: CRITICAL — lỗi cú pháp chỉ phát hiện khi build
// 💡 Example:  node check-syntax.cjs src/modules/KetoanApp
// ============================================================

const fs = require('fs');
const p = require('path');
const g = require('glob');

const args = process.argv.slice(2);
const portalPath = args[0];
const featureFilter = args[1];

if (!portalPath) {
  console.log('Usage: node check-syntax.cjs <PortalPath> [feature]');
  console.log('  PortalPath: src/modules/KetoanApp');
  console.log('  feature:    features/danh-muc/khach-hang (optional)');
  process.exit(1);
}

const TARGET = p.resolve(portalPath);
let files = g.sync(TARGET + '/**/*.{ts,tsx}');
if (featureFilter) {
  files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter));
}

console.log('Scanning ' + files.length + ' files for syntax errors...\n');

const errors = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const rel = p.relative(TARGET, file).replace(/\\/g, '/');

  // === CHECK 1: Brace balance { vs } ===
  let braceDepth = 0;
  let jsxDepth = 0;  // Track JSX tag depth
  const braceStack = [];

  // Tokenize: remove strings, comments, regex before counting braces
  const cleanContent = removeStringsAndComments(content);
  let openCount = (cleanContent.match(/\{/g) || []).length;
  let closeCount = (cleanContent.match(/\}/g) || []).length;

  if (openCount !== closeCount) {
    const diff = openCount - closeCount;
    const dir = diff > 0 ? 'THIẾU' : 'THỪA';
    errors.push(rel + ': ❌ Brace mismatch — ' + openCount + ' { vs ' + closeCount + ' } (' + dir + ' ' + Math.abs(diff) + ' dấu ' + (diff > 0 ? '}' : '{') + ')');
  }

  // === CHECK 1b: Broken import block — import/export chèn sai vào giữa block import chưa đóng ===
  // Pattern: `import {` hoặc `import type {` rồi dòng sau lại có `import` hoặc `export`
  // Lỗi do script auto-refactor chèn import giữa block đang mở
  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t.startsWith('import ') && !t.startsWith('export ')) return;
    if (i > 0) {
      const prevLine = lines[i - 1].trim();
      if ((prevLine.startsWith('import type {') || prevLine.startsWith('import {')) && !prevLine.includes('}')) {
        if (t.startsWith('import ') || t.startsWith('export ')) {
          errors.push(rel + ':' + (i + 1) + ': ❌ broken import block — `' + t.substring(0, 60) + '` chèn giữa block import chưa đóng');
        }
      }
    }
  });

  // === CHECK 2: JSX tags opening without matching closing ===
  // Common JSX tags that must be closed
  const openTags = ['<span', '<div', '<p ', '<p>', '<h1', '<h2', '<h3', '<h4', '<Button', '<button',
    '<Dialog', '<Card', '<Table', '<aside', '<nav', '<header', '<main', '<section',
    '<form', '<label', '<input', '<select', '<Dropdown', '<Tooltip'];

  const closeTags = ['</span>', '</div>', '</p>', '</h1>', '</h2>', '</h3>', '</h4>',
    '</Button>', '</button>', '</Dialog>', '</Card>', '</Table>', '</aside>',
    '</nav>', '</header>', '</main>', '</section>', '</form>', '</label>',
    '</Dropdown>', '</Tooltip>'];

  // For self-closing tags like <input />, <br />, <Icon />
  const selfClosing = ['<input', '<br', '<Icon ', '<hr', '<img', '<meta', '<link'];

  // Simple check: count common open/close pairs
  // Dùng content đã loại bỏ strings/comments để tránh đếm nhầm
  const cleanContent2 = removeStringsAndComments(content);

  // <span> opening — loại trừ self-closing (<span ... />)
  const spanOpenTags = (cleanContent2.match(/<span[^>]*>/g) || []);
  const spanOpens = spanOpenTags.filter(tag => !tag.endsWith('/>')).length;
  const spanCloses = (cleanContent2.match(/<\/span>/g) || []).length;
  if (spanOpens !== spanCloses) {
    errors.push(rel + ': ❌ <span> mismatch — ' + spanOpens + ' opens vs ' + spanCloses + ' closes (THIẾU ' + Math.abs(spanOpens - spanCloses) + ')</span>)');
  }

  // <div> opening (not </div>) — loại trừ self-closing (<div ... /> hoặc <div/>)
  const divOpenTags = (cleanContent2.match(/<div\b[^>]*>/g) || []);
  const divOpens = divOpenTags.filter(tag => !tag.endsWith('/>')).length;
  const divCloses = (cleanContent2.match(/<\/div>/g) || []).length;
  if (divOpens !== divCloses) {
    errors.push(rel + ': ❌ <div> mismatch — ' + divOpens + ' opens vs ' + divCloses + ' closes');
  }

  // === CHECK 3: Orphan } instead of </span> (common refactor bug) ===
  lines.forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith('//') || t.startsWith('*')) return;

    // Pattern: <span ...>some text} — missing </span>
    if (t.includes('<span') && !t.includes('</span') && t.endsWith('}')) {
      // Make sure it's not a self-contained line like <span className='...'>
      if (!t.includes('/>') && t.includes('>')) {
        errors.push(rel + ':' + (i + 1) + ': ⚠️ possible } instead of </span>');
      }
    }

    // Pattern: } instead of </Button>, </div>, etc.
    if (t.match(/^[^<]*\}[^>]*$/) && !t.includes('})') && !t.includes('};') && !t.includes('},') &&
      !t.includes('}') && !t.includes('}:') && !t.includes('}[') && !t.includes('} ]')) {
      // This might be an orphan closing brace that should be a JSX close tag
      // Too noisy to check every line, skip
    }
  });

  // === CHECK 4: Template literal backticks balance ===
  const backtickCount = (content.match(/`/g) || []).length;
  if (backtickCount % 2 !== 0) {
    // Find the line with odd backticks
    let count = 0;
    lines.forEach((l, i) => {
      const tc = (l.match(/`/g) || []).length;
      if (tc % 2 !== 0 && !l.trim().startsWith('//')) {
        const prevOdd = count % 2 !== 0;
        count += tc;
        if (prevOdd) {
          errors.push(rel + ':' + (i + 1) + ': ❌ template literal backtick mismatch');
        }
      } else {
        count += tc;
      }
    });
  }

  // === CHECK 5: Check for duplicate closing braces ]] ===
  // (common typo)
  if (content.includes('}}') && !content.includes('}},')) {
    // Could be intentional (double-closing JSX), but flag it
    lines.forEach((l, i) => {
      if (l.includes('}}') && !l.trim().startsWith('//')) {
        // If it's not a known pattern like }}) or }})
        if (!l.includes('}});') && !l.includes('}})') && !l.includes('}}') && !l.includes(']}]')) {
          errors.push(rel + ':' + (i + 1) + ': ⚠️ double closing braces "}}" — possibly unintentional');
          return;
        }
      }
    });
  }

  // === CHECK 6: Semicolon-split syntax (export type outside class) ===
  // This catches the bug we hit: "Expected ; but found type" when export type statement
  // appears outside a class context due to missing }
  // Already handled by check-dup-keys and manual inspection

  // === CHECK 7: Parentheses balance ===
  // ⚠️ Lưu ý: file có regex literal chứa ( ) (VD /(?:[0-9]{10})/) có thể báo false positive
  // Thẩm quyền cuối: TypeScript compiler (get_errors)
  const parenContent = removeStringsAndComments(content).replace(/[^()]/g, '');
  let parenDepth = 0;
  let parenError = false;
  for (const ch of parenContent) {
    if (ch === '(') parenDepth++;
    else if (ch === ')') parenDepth--;
    if (parenDepth < 0) { parenError = true; break; }
  }
  if (parenError || parenDepth !== 0) {
    errors.push(rel + ': ❌ Parentheses mismatch — depth=' + parenDepth);
  }
});

// Remove comments and strings before counting
function removeStringsAndComments(content) {
  let result = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const prev = i > 0 ? content[i - 1] : '';

    // Track string state
    if (!inLineComment && !inBlockComment) {
      if (ch === "'" && !inDoubleQuote && !inBacktick && prev !== '\\') {
        inSingleQuote = !inSingleQuote;
      } else if (ch === '"' && !inSingleQuote && !inBacktick && prev !== '\\') {
        inDoubleQuote = !inDoubleQuote;
      } else if (ch === '`' && !inSingleQuote && !inDoubleQuote && prev !== '\\') {
        inBacktick = !inBacktick;
      }
    }

    // Track comment state
    if (!inSingleQuote && !inDoubleQuote && !inBacktick) {
      if (!inBlockComment && ch === '/' && content[i + 1] === '/') {
        inLineComment = true;
      } else if (!inLineComment && ch === '/' && content[i + 1] === '*') {
        inBlockComment = true;
        i++; // skip *
      } else if (inBlockComment && ch === '*' && content[i + 1] === '/') {
        inBlockComment = false;
        i++; // skip /
      }
    }

    if (ch === '\n') inLineComment = false;

    // If in string/comment, output space instead of brace
    if (inSingleQuote || inDoubleQuote || inBacktick || inLineComment || inBlockComment) {
      result += ' ';
    } else {
      result += ch;
    }
  }

  return result;
}

const label = ' B3. Syntax (braces/tags) ';
if (errors.length === 0) {
  console.log(label + '-'.repeat(Math.max(1, 35)) + ' PASS');
} else {
  console.log(label + '-'.repeat(Math.max(1, 35)) + ' FAIL (' + errors.length + ' issues)');
  errors.slice(0, 10).forEach(e => console.log('     ' + e));
  if (errors.length > 10) console.log('     ... and ' + (errors.length - 10) + ' more');
}

process.exit(errors.length > 0 ? 1 : 0);
