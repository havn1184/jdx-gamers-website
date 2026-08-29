// ============================================================
// 🎯 Phục vụ skill: quy-tac-code (Bảo mật — XSS/secrets)
// check-security.cjs — Kiểm tra lỗ hổng bảo mật trong code React/TypeScript
// ============================================================
// 📋 Kiểm tra: 1. Hardcoded secrets (API key, token, password, secret, private key)
//              2. XSS: dangerouslySetInnerHTML, innerHTML, outerHTML, document.write
//              3. Token/sensitive data trong localStorage/sessionStorage không mã hóa
//              4. eval(), new Function(), setTimeout(string), setInterval(string)
//              5. target="_blank" thiếu rel="noopener noreferrer" (tabnabbing)
//              6. Hardcoded HTTP URL (thay vì HTTPS hoặc biến môi trường)
//              7. console.log dữ liệu nhạy cảm (token, password, secret)
//              8. Math.random() dùng cho mục đích bảo mật (nên dùng crypto)
//              9. Disabled React security: suppressHydrationWarning
//             10. Unsanitized URL redirect (window.location = userInput)
//             11. javascript: URL trong href (jsx-no-script-url)
//             12. dangerouslySetInnerHTML + children cùng lúc (no-danger-with-children)
//             13. iframe thiếu sandbox attribute
//             14. Render lộ giá trị falsy nguy hiểm (0, NaN, false)
//             15. postMessage() thiếu origin validation
//             16. JSON.parse() không try-catch
// 📤 Output:   PASS nếu 0 | FAIL + file:line của từng vi phạm
// 📊 Severity: CRITICAL — lỗ hổng bảo mật có thể bị khai thác
// 💡 Example:  node check-security.cjs src/modules/KetoanApp
//              node check-security.cjs src/modules/KetoanApp features/danh-muc/khach-hang
// ============================================================
const fs = require('fs'); const p = require('path'); const g = require('glob');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-security.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);
let files = g.sync(TARGET + '/**/*.{ts,tsx,js,jsx,json,env,.env,yml,yaml,css,html}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }
const errors = [];

// ==========================================================
// PATTERN DATABASE
// ==========================================================

// CHECK 1: Hardcoded secrets patterns
// Chỉ flag khi value THỰC SỰ là secret (không phải key name, URL path, hay constant identifier)
const SECRET_PATTERNS = [
  // API keys — value phải dài ít nhất 16 ký tự (không phải tên biến)
  { regex: /(?:api[_-]?key|apiKey|API[_-]?KEY)\s*[:=]\s*['"]([^'"]{16,})['"]/gi, label: 'hardcoded API key' },
  // Access tokens — value dài 20+ ký tự (real token, not key name like "vtn_access_token")
  { regex: /(?:access[_-]?token|accessToken|ACCESS_TOKEN)\s*[:=]\s*['"]([^'"]{20,})['"]/gi, label: 'hardcoded access token' },
  // Secret keys — value dài ít nhất 12 ký tự
  { regex: /(?:secret[_-]?key|secretKey|SECRET[_-]?KEY|client[_-]?secret|CLIENT[_-]?SECRET)\s*[:=]\s*['"]([^'"]{12,})['"]/gi, label: 'hardcoded secret key' },
  // Passwords — value KHÔNG được là URL path (bắt đầu bằng / hoặc http)
  // và phải dài ít nhất 4 ký tự không phải identifier
  { regex: /(?:password|passwd|pwd)\s*[:=]\s*['"](?!\/)(?!https?:\/\/)([^'"]{4,})['"]/gi, label: 'hardcoded password' },
  // Private keys (PEM format)
  { regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi, label: 'hardcoded private key' },
  // JWT token trực tiếp (eyJ...)
  { regex: /['"]eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}['"]/g, label: 'hardcoded JWT token' },
  // Bearer token (chỉ flag nếu value thực sự dài — không phải placeholder)
  { regex: /Bearer\s+[a-zA-Z0-9_-]{30,}/g, label: 'hardcoded Bearer token' },
  // Connection strings
  { regex: /(?:mongodb|postgres|mysql|redis|sqlserver):\/\/[^'"\s]{10,}/gi, label: 'hardcoded connection string' },
  // Basic auth (chỉ flag nếu value dài — thực sự là credential)
  { regex: /Basic\s+[a-zA-Z0-9+/=]{20,}/g, label: 'hardcoded Basic auth' },
  // App secret / signing key — value dài 12+ ký tự
  { regex: /(?:app[_-]?secret|APP[_-]?SECRET|signing[_-]?key|SIGNING[_-]?KEY)\s*[:=]\s*['"]([^'"]{12,})['"]/gi, label: 'hardcoded app secret' },
  // Encryption keys — value dài 12+ ký tự
  { regex: /(?:encrypt(?:ion)?[_-]?key|ENCRYPT(?:ION)?[_-]?KEY|cipher[_-]?key)\s*[:=]\s*['"]([^'"]{12,})['"]/gi, label: 'hardcoded encryption key' },
];

// CHECK 7: Sensitive data in console.log
// Chỉ flag khi BIẾN chứa token/password/secret được truyền vào console.log,
// không flag khi từ "token" nằm trong string literal message (vd: "Token saved")
const SENSITIVE_LOG_PATTERNS = [
  // console.log(tokenVar) — biến token được log trực tiếp
  { regex: /\bconsole\.(?:log|error|warn|info|debug)\s*\(\s*(?:[^'"]*[,+]\s*)?(?:accessToken|refreshToken|idToken|bearerToken|authToken|apiKey|password|secret)\b(?!\s*:)/gi, label: 'console.log biến chứa token/secret' },
  // console.log({ token }) hoặc console.log("msg", token)
  { regex: /\bconsole\.(?:log|error|warn|info|debug)\s*\([^)]*\b(?:accessToken|refreshToken|idToken|bearerToken|authToken)\b[^)]*\)/gi, label: 'console.log biến token' },
];

files.forEach(file => {
  // Bỏ qua node_modules, dist, build
  if (file.includes('node_modules') || file.includes('/dist/') || file.includes('/build/')) return;
  // Bỏ qua file test
  if (file.includes('.test.') || file.includes('.spec.') || file.includes('__tests__')) return;
  // Bỏ qua file trong scripts/ của chính skill này
  if (file.includes('checklist-sau-code')) return;

  const c = fs.readFileSync(file, 'utf8'); const lines = c.split('\n');
  const rel = p.relative(TARGET, file).replace(/\\/g, '/');
  const ext = p.extname(file).toLowerCase();

  // ==========================================================
  // CHECK 1: Hardcoded secrets
  // ==========================================================
  SECRET_PATTERNS.forEach(pattern => {
    // Reset regex state
    pattern.regex.lastIndex = 0;
    let m;
    while ((m = pattern.regex.exec(c)) !== null) {
      const idx = m.index;
      const lineNum = c.substring(0, idx).split('\n').length;
      const line = lines[lineNum - 1] || '';

      // Bỏ qua nếu dòng là console.log / ApiLogger (message, không phải hardcode)
      if (/\bconsole\.(?:log|error|warn|info|debug)\s*\(/.test(line)) continue;
      if (/\bApiLogger\.(?:info|log|warn|error|debug)\s*\(/.test(line)) continue;

      // Bỏ qua password nếu value là câu tiếng Việt (validation message, không phải mật khẩu thật)
      if (pattern.label === 'hardcoded password') {
        const val = (m[1] || '').trim();
        // Value chứa dấu cách + tiếng Việt có dấu → validation message, không phải password thật
        if (/\s/.test(val) && /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(val)) continue;
        // Value là URL path (bắt đầu bằng /)
        if (/^\s*\//.test(val)) continue;
      }

      const matchedText = m[0].length > 80 ? m[0].substring(0, 80) + '...' : m[0];
      errors.push(rel + ':' + lineNum + ': ' + pattern.label + ' — ' + matchedText.replace(/\n/g, '\\n'));
    }
  });

  // ==========================================================
  // CHECK 2: XSS vectors
  // ==========================================================
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('*') || t.startsWith('#')) return;

    // dangerouslySetInnerHTML
    if (/\bdangerouslySetInnerHTML\b/.test(t)) {
      // Kiểm tra xem có dùng DOMPurify/sanitize không (cho phép nếu có)
      const hasSanitizer = /\b(?:DOMPurify|sanitize|sanitizeHtml|escapeHtml|xss)\s*\(/.test(c);
      if (!hasSanitizer) {
        errors.push(rel + ':' + (i + 1) + ': dangerouslySetInnerHTML — nguy cơ XSS, nên dùng DOMPurify.sanitize() trước khi render');
      }
    }

    // innerHTML / outerHTML
    if (/\.innerHTML\s*=/.test(t)) {
      errors.push(rel + ':' + (i + 1) + ': .innerHTML = ... — XSS vector, nên dùng .textContent hoặc DOM an toàn');
    }
    if (/\.outerHTML\s*=/.test(t)) {
      errors.push(rel + ':' + (i + 1) + ': .outerHTML = ... — XSS vector, nên tránh hoàn toàn');
    }

    // document.write
    if (/\bdocument\.write\s*\(/.test(t)) {
      errors.push(rel + ':' + (i + 1) + ': document.write() — XSS vector, bị chặn bởi CSP, nên dùng DOM API an toàn');
    }

    // insertAdjacentHTML
    if (/\.insertAdjacentHTML\s*\(/.test(t)) {
      errors.push(rel + ':' + (i + 1) + ': insertAdjacentHTML() — XSS vector, nên dùng insertAdjacentElement() hoặc sanitize input');
    }
  });

  // ==========================================================
  // CHECK 3: Insecure storage of sensitive data
  // ==========================================================
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('*')) return;

    // localStorage.setItem với key chứa "token", "auth", "secret", "password"
    if (/\blocalStorage\.setItem\s*\(\s*['"][^'"]*(?:token|auth|secret|password|credential|jwt)[^'"]*['"]/i.test(t)) {
      errors.push(rel + ':' + (i + 1) + ': localStorage.setItem token/auth/secret — token không mã hóa dễ bị đánh cắp qua XSS, nên dùng httpOnly cookie hoặc mã hóa');
    }
    // sessionStorage tương tự (ít nguy hiểm hơn nhưng vẫn cảnh báo)
    if (/\bsessionStorage\.setItem\s*\(\s*['"][^'"]*(?:token|auth|secret|password|credential)[^'"]*['"]/i.test(t)) {
      errors.push(rel + ':' + (i + 1) + ': sessionStorage.setItem token/auth — token trong sessionStorage vẫn có thể bị đọc bởi XSS, cân nhắc httpOnly cookie');
    }
  });

  // ==========================================================
  // CHECK 4: Code injection — eval, Function, setTimeout string
  // ==========================================================
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('*')) return;

    // eval()
    if (/\beval\s*\(/.test(t) && !t.startsWith('//')) {
      errors.push(rel + ':' + (i + 1) + ': eval() — cho phép thực thi code tùy ý, RCE / XSS nguy hiểm');
    }

    // new Function()
    if (/\bnew\s+Function\s*\(/.test(t)) {
      errors.push(rel + ':' + (i + 1) + ': new Function() — tương đương eval(), RCE / XSS nguy hiểm');
    }

    // setTimeout / setInterval với tham số string (không phải function)
    if (/\bsetTimeout\s*\(\s*['"`]/.test(t) || /\bsetInterval\s*\(\s*['"`]/.test(t)) {
      errors.push(rel + ':' + (i + 1) + ': setTimeout/setInterval với string — tương đương eval(), nên truyền function thay vì string');
    }

    // Function constructor
    if (/\bFunction\s*\(\s*['"`]/.test(t) && !/\bnew\s+Function/.test(t)) {
      errors.push(rel + ':' + (i + 1) + ': Function() gọi trực tiếp — tương đương eval()');
    }
  });

  // ==========================================================
  // CHECK 5: target="_blank" without rel="noopener noreferrer"
  // ==========================================================
  if (['.tsx', '.jsx', '.html'].includes(ext)) {
    lines.forEach((l, i) => {
      // Phát hiện <a target="_blank" hoặc target={"_blank"}
      if (/target\s*=\s*(?:"_blank"|'_blank'|\{["']_blank["']\})/.test(l)) {
        // Kiểm tra có rel="noopener" trong cùng dòng hoặc dòng tiếp theo
        const context = lines.slice(i, Math.min(i + 3, lines.length)).join('\n');
        if (!/\brel\s*=\s*["'][^"']*noopener[^"']*["']/.test(context) &&
            !/\brel\s*=\s*\{["'][^"']*noopener[^"']*["']\}/.test(context)) {
          errors.push(rel + ':' + (i + 1) + ': target="_blank" thiếu rel="noopener noreferrer" → tabnabbing (trang mới có thể redirect trang gốc)');
        }
      }
    });
  }

  // ==========================================================
  // CHECK 6: Hardcoded HTTP URLs (nên dùng HTTPS hoặc env var)
  // ==========================================================
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('*') || t.startsWith('import')) return;

    // http:// URL (không phải localhost)
    const httpMatches = t.match(/['"`]http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)[^'"`\s]{5,}['"`]/g);
    if (httpMatches) {
      httpMatches.forEach(match => {
        errors.push(rel + ':' + (i + 1) + ': hardcoded HTTP URL ' + match + ' — nên dùng HTTPS hoặc biến môi trường VITE_...');
      });
    }
  });

  // ==========================================================
  // CHECK 7: console.log sensitive data
  // ==========================================================
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('*')) return;
    SENSITIVE_LOG_PATTERNS.forEach(pattern => {
      pattern.regex.lastIndex = 0;
      if (pattern.regex.test(t)) {
        errors.push(rel + ':' + (i + 1) + ': ' + pattern.label + ' — lộ thông tin nhạy cảm ra browser console');
      }
    });
  });

  // ==========================================================
  // CHECK 8: Math.random() for security purposes
  // ==========================================================
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('*')) return;

    // Phát hiện Math.random() trong context liên quan đến token/ID/security
    if (/\bMath\.random\s*\(\)/.test(t)) {
      // Kiểm tra context xung quanh có liên quan bảo mật không
      // Chỉ flag khi rõ ràng dùng cho mục đích security (không phải UI animation/test data)
      const context = lines.slice(Math.max(0, i - 2), Math.min(i + 3, lines.length)).join('\n');
      if (/\b(?:token|auth|encrypt|hash|nonce|secure|generate(?:Token|Key|Secret|Session|UUID)|crypto.*random)/i.test(context) &&
          !/\b(?:test|mock|demo|sample|placeholder|example)/i.test(context)) {
        errors.push(rel + ':' + (i + 1) + ': Math.random() dùng cho mục đích bảo mật (token/auth/encrypt) — không an toàn, nên dùng crypto.getRandomValues() hoặc uuid v4');
      }
    }
  });

  // ==========================================================
  // CHECK 9: Disabled React security features
  // ==========================================================
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('*')) return;

    // suppressHydrationWarning — vô hiệu hóa cảnh báo hydration mismatch
    if (/\bsuppressHydrationWarning\b/.test(t)) {
      errors.push(rel + ':' + (i + 1) + ': suppressHydrationWarning — ẩn cảnh báo hydration mismatch thay vì sửa nguyên nhân gốc, có thể dẫn đến UI không nhất quán');
    }

    // dangerouslySetInnerHTML đã được check ở trên, nhưng nếu có __html không từ sanitizer
    if (/\b__html\s*:/.test(t) && /\bdangerouslySetInnerHTML\b/.test(c)) {
      // Đã check ở CHECK 2, skip
    }
  });

  // ==========================================================
  // CHECK 11: javascript: URL (jsx-no-script-url)
  // ==========================================================
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('*')) return;
    if (/['"`]javascript\s*:/.test(t) || /\{\s*['"`]javascript\s*:/.test(t)) {
      errors.push(rel + ':' + (i + 1) + ': javascript: URL — XSS vector, có thể thực thi code trong context của trang');
    }
  });

  // ==========================================================
  // CHECK 12: dangerouslySetInnerHTML + children (no-danger-with-children)
  // ==========================================================
  lines.forEach((l, i) => {
    if (/\bdangerouslySetInnerHTML\b/.test(l) && />\s*\{/.test(l)) {
      errors.push(rel + ':' + (i + 1) + ': dangerouslySetInnerHTML + children — React sẽ ghi đè children, nên tách riêng');
    }
  });

  // ==========================================================
  // CHECK 13: iframe without sandbox
  // ==========================================================
  if (ext === '.tsx' || ext === '.jsx') {
    lines.forEach((l, i) => {
      if (/<iframe\b/.test(l)) {
        // Cửa sổ mở rộng 8 dòng — JSX props thường nhiều dòng (src, title, allow, allowFullScreen, sandbox, className...)
        const ctx = lines.slice(Math.max(0, i - 1), Math.min(i + 8, lines.length)).join('\n');
        if (!/\bsandbox\s*=/.test(ctx)) {
          errors.push(rel + ':' + (i + 1) + ': iframe thiếu sandbox attribute — nên thêm sandbox="allow-scripts allow-same-origin"');
        }
      }
    });
  }

  // ==========================================================
  // CHECK 14: Leaked falsy render ({numVar && <Comp/>})
  // ==========================================================
  if (ext === '.tsx' || ext === '.jsx') {
    lines.forEach((l, i) => {
      const t = l.trim();
      if (t.startsWith('//') || t.startsWith('*')) return;
      const leakedMatch = t.match(/\{(\w+)\s*&&\s*[<\(]/);
      if (leakedMatch && /\b(?:amount|price|total|sum|number|count|index|score|rate|level|quantity|qty|num)\b/i.test(leakedMatch[1])) {
        errors.push(rel + ':' + (i + 1) + ': {numberVar && <Comp/>} — nếu = 0 sẽ render "0", nên dùng {numberVar > 0 && <Comp/>} hoặc {!!numberVar && <Comp/>}');
      }
    });
  }

  // ==========================================================
  // CHECK 15: postMessage() without origin validation
  // ==========================================================
  if (c.includes('postMessage')) {
    const hasOriginCheck = /\b(?:event\.origin|e\.origin|origin\s*===|origin\s*!==|\btargetOrigin\b)/.test(c);
    if (!hasOriginCheck) {
      lines.forEach((l, i) => {
        if (/\.postMessage\s*\(/.test(l)) {
          errors.push(rel + ':' + (i + 1) + ': postMessage() thiếu targetOrigin/event.origin check — luôn chỉ định targetOrigin và kiểm tra event.origin khi nhận');
        }
      });
    }
  }

  // ==========================================================
  // CHECK 16: JSON.parse() without try-catch
  // ==========================================================
  if (c.includes('JSON.parse')) {
    const hasTryCatch = /\btry\s*\{[\s\S]*?JSON\.parse/.test(c);
    if (!hasTryCatch) {
      lines.forEach((l, i) => {
        const t = l.trim();
        if (/\bJSON\.parse\s*\(/.test(t) && !t.startsWith('//') && !t.startsWith('*')) {
          errors.push(rel + ':' + (i + 1) + ': JSON.parse() không try-catch — input lỗi sẽ crash app, nên bọc try-catch hoặc dùng safeJsonParse()');
        }
      });
    }
  }

  // ==========================================================
  // CHECK 10: Unsanitized URL redirect
  // ==========================================================
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('*')) return;

    // window.location.href / window.location.assign / window.location.replace với biến
    const redirectPatterns = [
      /\bwindow\.location\.href\s*=\s*(?!['"`]\/[^'"`]*['"`])(?!['"`]https?:\/\/[^'"`]*['"`])/,
      /\bwindow\.location\.(?:assign|replace)\s*\((?!['"`]\/[^'"`]*['"`])(?!['"`]https?:\/\/[^'"`]*['"`])/,
    ];
    redirectPatterns.forEach(pattern => {
      if (pattern.test(t)) {
        errors.push(rel + ':' + (i + 1) + ': window.location redirect có thể nhận user input → Open Redirect, nên validate URL trước (whitelist origin)');
      }
    });

    // React Router navigate với params động từ URL
    if (/\bnavigate\s*\(\s*(?!['"`]\/)/.test(t) && /\b(?:searchParams|query|params|location\.search)/.test(t)) {
      errors.push(rel + ':' + (i + 1) + ': navigate() với tham số từ URL/searchParams → Open Redirect, nên validate path trước');
    }
  });
});

// Dedup errors (cùng file:line thường do regex trùng)
const seen = new Set();
const unique = errors.filter(e => {
  const key = e.replace(/'.*?'/, "'***'");
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

const label = ' B10. Security ';
if (unique.length === 0) {
  console.log(label + '-'.repeat(Math.max(1, 40)) + ' PASS');
} else {
  console.log(label + '-'.repeat(Math.max(1, 40)) + ' FAIL (' + unique.length + ' issues)');
  unique.slice(0, 10).forEach(e => console.log('     ' + e));
  if (unique.length > 10) console.log('     ... and ' + (unique.length - 10) + ' more');
}
process.exit(unique.length > 0 ? 1 : 0);
