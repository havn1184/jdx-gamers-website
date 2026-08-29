// ============================================================
// 🎯 Phục vụ skill: quy-tac-code (TypeScript strict)
// check-ts-strict.cjs — Kiểm tra TypeScript strict mode & type coverage
// ============================================================
// 📋 Kiểm tra: 1. tsconfig.json có "strict": true không
//              2. Đếm số lượng `any` / type assertions dùng regex nâng cao
//              3. Báo tỉ lệ typed vs any trên tổng số khai báo
//              4. Nếu có type-coverage → dùng TS Compiler API chính xác hơn
// 📤 Output:   PASS nếu strict=true + tỉ lệ typed >= 90%
//              FAIL + chi tiết nếu có vi phạm
// 📊 Severity: HIGH — `any` làm mất type safety, dễ gây bug runtime
// 💡 Example:  node check-ts-strict.cjs src/modules/KetoanApp
//              node check-ts-strict.cjs src/modules/KetoanApp features/danh-muc/khach-hang
// ============================================================
const fs = require('fs'); const p = require('path'); const g = require('glob');
const { execSync } = require('child_process');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-ts-strict.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);

var errors = [];
var warnings = [];

console.log('Checking TypeScript strictness...');

// ==========================================================
// CHECK 1: tsconfig.json / tsconfig.app.json có strict: true?
// ==========================================================
var tsconfigPath = p.join(process.cwd(), 'tsconfig.json');
// Thử tsconfig của portal nếu có
var portalTsconfig = p.join(TARGET, 'tsconfig.json');
if (fs.existsSync(portalTsconfig)) tsconfigPath = portalTsconfig;

function findTsconfigWithCompilerOptions(configPath) {
  if (!fs.existsSync(configPath)) return null;
  try {
    // Strip comments (JSON5/JSONC — tsconfig supports comments)
    var raw = fs.readFileSync(configPath, 'utf8');
    raw = raw.replace(/\/\*[\s\S]*?\*\//g, ''); // block comments
    raw = raw.replace(/\/\/.*$/gm, '');          // line comments
    // Remove trailing commas (JSON5)
    raw = raw.replace(/,(\s*[}\]])/g, '$1');
    var cfg = JSON.parse(raw);
    // Nếu có compilerOptions trực tiếp → dùng luôn
    if (cfg.compilerOptions) return cfg;
    // Nếu là project references → tìm file được reference
    if (cfg.references && Array.isArray(cfg.references)) {
      for (var i = 0; i < cfg.references.length; i++) {
        var refPath = p.join(p.dirname(configPath), cfg.references[i].path);
        var refCfg = findTsconfigWithCompilerOptions(refPath);
        if (refCfg && refCfg.compilerOptions) return refCfg;
      }
    }
    // Nếu có extends → resolve
    if (cfg.extends) {
      var extPath = p.join(p.dirname(configPath), cfg.extends);
      return findTsconfigWithCompilerOptions(extPath);
    }
  } catch(e) { return null; }
  return null;
}

var tsconfig = findTsconfigWithCompilerOptions(tsconfigPath);

if (tsconfig && tsconfig.compilerOptions) {
  try {
    var compilerOptions = tsconfig.compilerOptions;

    if (!compilerOptions.strict) {
      errors.push('tsconfig.json: "strict": true chưa được bật');
    }
    if (!compilerOptions.noUnusedLocals) {
      warnings.push('tsconfig.json: nên bật "noUnusedLocals": true');
    }
    if (!compilerOptions.noUnusedParameters) {
      warnings.push('tsconfig.json: nên bật "noUnusedParameters": true');
    }
    if (!compilerOptions.noFallthroughCasesInSwitch) {
      warnings.push('tsconfig.json: nên bật "noFallthroughCasesInSwitch": true');
    }
    if (!compilerOptions.exactOptionalPropertyTypes && compilerOptions.strict) {
      warnings.push('tsconfig.json: nên bật "exactOptionalPropertyTypes": true');
    }
  } catch(e) {
    warnings.push('tsconfig.json: lỗi parse — ' + e.message);
  }
} else {
  warnings.push('Không tìm thấy tsconfig.json trong ' + tsconfigPath);
}

// ==========================================================
// CHECK 2: Đếm any patterns (nâng cao hơn check-any.cjs)
// ==========================================================
var files = g.sync(TARGET + '/**/*.{ts,tsx}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }

// Bỏ qua file .d.ts, test, script
files = files.filter(function(f) {
  if (f.endsWith('.d.ts')) return false;
  if (f.includes('.test.') || f.includes('.spec.') || f.includes('__tests__')) return false;
  if (f.includes('checklist-sau-code')) return false;
  return true;
});

var totalFiles = files.length;
var filesWithAny = 0;
var anyFiles = [];

files.forEach(function(file) {
  var c;
  try { c = fs.readFileSync(file, 'utf8'); } catch(e) { return; }
  var rel = p.relative(TARGET, file).replace(/\\/g, '/');
  var lines = c.split('\n');

  var anyFlags = [];

  lines.forEach(function(line, idx) {
    // Bỏ qua comment
    var codePart = line.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // Pattern 1: explicit `: any`
    if (/:\s*any\b/.test(codePart) && !/:\s*any\[\]/.test(codePart)) {
      anyFlags.push({ line: idx + 1, type: ': any' });
    }
    // Pattern 2: `as any`
    if (/\bas\s+any\b/.test(codePart)) {
      anyFlags.push({ line: idx + 1, type: 'as any' });
    }
    // Pattern 3: `<any>`
    if (/<any>/.test(codePart) && !/<\/?[A-Z]\w*/.test(codePart)) {
      anyFlags.push({ line: idx + 1, type: '<any>' });
    }
    // Pattern 4: Function return type any
    if (/\)\s*:\s*any\s*[=>{]/.test(codePart)) {
      if (!anyFlags.some(function(f) { return f.line === idx + 1; })) {
        anyFlags.push({ line: idx + 1, type: 'return any' });
      }
    }
    // Pattern 5: Array<any> / Promise<any> / v.v.
    if (/<(?:Array|Promise|Set|Map|Record)<any>/.test(codePart)) {
      anyFlags.push({ line: idx + 1, type: 'Generic<any>' });
    }
  });

  if (anyFlags.length > 0) {
    filesWithAny++;
    anyFiles.push({ file: rel, count: anyFlags.length, flags: anyFlags.slice(0, 3) });
  }
});

// Tính type safety score
var typeSafetyPct = totalFiles > 0 ? Math.round((1 - filesWithAny / totalFiles) * 100) : 100;

// ==========================================================
// CHECK 3: Thử chạy type-coverage nếu có (optional)
// ==========================================================
var typeCoverageResult = null;
try {
  var result = execSync('npx type-coverage --at-least 90 --strict --detail ' + TARGET, {
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: 60000,
  });
  typeCoverageResult = result;
} catch(e) {
  // type-coverage not installed or failed — skip, dùng kết quả regex
  if (e.stdout) typeCoverageResult = e.stdout;
}

// ==========================================================
// REPORT
// ==========================================================
var label = ' 28. TypeScript strictness';
var pad = ' '.repeat(Math.max(1, 45 - label.length));

var totalIssues = errors.length + (filesWithAny > 0 ? 1 : 0);

if (totalIssues === 0) {
  console.log(label + pad + 'PASS');
  if (warnings.length > 0) {
    console.log('     ⚠️  Recommendations:');
    warnings.forEach(function(w) { console.log('     ' + w); });
  }
  process.exit(0);
} else {
  console.log(label + pad + 'FAIL (' + totalIssues + ' issues)');

  // Report tsconfig issues
  errors.forEach(function(e) { console.log('     🔴 ' + e); });

  // Report any usage stats
  if (filesWithAny > 0) {
    var anyDesc = 'any usage: ' + filesWithAny + '/' + totalFiles + ' files (' + (100 - typeSafetyPct) + '%) — type safety: ' + typeSafetyPct + '%';
    if (typeSafetyPct >= 90) {
      console.log('     🟢 ' + anyDesc);
    } else if (typeSafetyPct >= 80) {
      console.log('     🟡 ' + anyDesc);
    } else {
      console.log('     🔴 ' + anyDesc);
    }

    // Show top files with most any
    anyFiles.sort(function(a, b) { return b.count - a.count; });
    anyFiles.slice(0, 5).forEach(function(f) {
      console.log('       ' + f.file + ' (' + f.count + ' any)');
      f.flags.forEach(function(flag) {
        console.log('         L' + flag.line + ': ' + flag.type);
      });
    });
    if (anyFiles.length > 5) console.log('       ... and ' + (anyFiles.length - 5) + ' more files');
  }

  // Report type-coverage result if available
  if (typeCoverageResult && typeCoverageResult.trim()) {
    console.log('     ℹ️  type-coverage output:');
    typeCoverageResult.trim().split('\n').slice(0, 5).forEach(function(l) {
      console.log('     ' + l);
    });
  }

  warnings.forEach(function(w) { console.log('     ⚠️  ' + w); });
  process.exit(1);
}
