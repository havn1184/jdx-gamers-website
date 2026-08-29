// ============================================================
// 🎯 Phục vụ skill: validate-input
// check-validate.cjs — Kiểm tra validate input đúng quy tắc
// ============================================================
// 📋 Kiểm tra: 1. HTML5 validation (required/pattern/minlength)
//              2. Dùng validateAllFields + showValidationErrorsToast
//              3. validate onBlur (không onChange)
//              4. Visual feedback border-destructive/border-success
//              5. Progressive helper messages
//              6. Gate-keeper: validate trước API call
// 📤 Output:   PASS nếu 0 | FAIL + file:line + chi tiết vi phạm
// 📊 Severity: CRITICAL — sai quy tắc validate gây UX kém + lỗi bảo mật
// 💡 Example:  node check-validate.cjs src/modules/KetoanApp
// ============================================================
const fs = require('fs'); const p = require('path'); const g = require('glob');
const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-validate.cjs <PortalPath> [feature]'); process.exit(1); }
const TARGET = p.resolve(portalPath);
let files = g.sync(TARGET + '/**/*.{ts,tsx}');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }

// Chỉ kiểm tra hooks + dialogs + form components
const formFiles = files.filter(f => {
  const name = f.toLowerCase();
  return name.includes('hook') || name.includes('dialog') || name.includes('.dlg.') || name.includes('.form.');
});

const errors = [];

formFiles.forEach(file => {
  const c = fs.readFileSync(file, 'utf8');
  const lines = c.split('\n');
  const rel = p.relative(TARGET, file).replace(/\\/g, '/');

  // B1: HTML5 validation (PROHIBITED)
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('*')) return;
    if (t.includes(' required') && !t.includes('import') && !t.includes('//') && !t.includes('*'))
      errors.push(rel + ':' + (i+1) + ': ❌ HTML5 "required" — dùng validateRequired() từ shared/utils');
    if (t.includes(' pattern=') && !t.includes('import') && !t.includes('//'))
      errors.push(rel + ':' + (i+1) + ': ❌ HTML5 "pattern" — dùng validate thủ công');
    if (t.includes(' minlength=') || t.includes(' minLength='))
      errors.push(rel + ':' + (i+1) + ': ❌ HTML5 "minlength" — dùng validateMinLength()');
  });

  // B2: Check if this is a form hook (has handleSubmit pattern)
  const hasHandleSubmit = c.includes('handleSubmit');
  const hasValidateAll = c.includes('validateAllFields');
  const hasShowToast = c.includes('showValidationErrorsToast');
  const hasTouched = c.includes("setTouched") || c.includes("touched.");

  if (hasHandleSubmit && !hasValidateAll) {
    // ✅ SKIP pure-UI wrapper dialog: handleSubmit chỉ gọi onSubmit() từ props
    // (validate thật nằm trong delegated hook — VD: useRPSsoCreateEdit chứa validateForm)
    // Pattern: interface có "onSubmit: () => void" VÀ handleSubmit body chỉ có onSubmit()
    const hasOnSubmitProp = /onSubmit\s*:\s*\([^)]*\)\s*=>/.test(c) || /onSubmit\s*:\s*\(\)\s*=>/.test(c);
    const handleSubmitCallsOnSubmitProp = /const\s+handleSubmit\s*=\s*\(e[^)]*\)\s*=>\s*\{\s*e\.preventDefault\(\)\s*\n?\s*onSubmit\(\)/.test(c);
    if (hasOnSubmitProp && handleSubmitCallsOnSubmitProp) {
      // Delegated form — validation nằm trong hook, không flag
    } else if (!c.includes('validate') && !c.includes('errors')) {
      errors.push(rel + ': ⚠️ handleSubmit không có validate client-side');
    }
  }

  // B3: validate onBlur (not onChange)
  let blurCount = 0, changeCount = 0;
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('*')) return;
    if (t.includes('onBlur') && (t.includes('handleBlur') || t.includes('validate'))) blurCount++;
    if (t.includes('onChange') && (t.includes('validate') || t.includes('setErrors') || t.includes('handleChange'))) changeCount++;
  });
  if (changeCount > blurCount && blurCount === 0) {
    errors.push(rel + ': ⚠️ validate onChange thay vì onBlur — nên dùng onBlur');
  }

  // B4: Visual feedback classes
  if (hasTouched && !c.includes('border-destructive') && !c.includes('border-success')) {
    const isFormFile = file.endsWith('.tsx') && (file.includes('Dialog') || file.includes('Form'));
    if (isFormFile) errors.push(rel + ': ⚠️ thiếu visual feedback border-destructive/border-success');
  }

  // B5: Progressive helper
  const hasEmail = c.includes("email");
  const hasPhone = c.includes("phone");
  const hasProgressHelper = c.includes('ProgressMessage');
  if ((hasEmail || hasPhone) && !hasProgressHelper && c.includes('handleSubmit')) {
    errors.push(rel + ': ⚠️ có email/phone field nhưng không dùng MessageProgressHelper');
  }

  // B6: Gate-keeper — toast.error before API (not ValidationErrorDialog)
  // Already checked by check-api-validation.cjs — skip
});

const label = ' B7. Validate input rules ';
if (errors.length === 0) { console.log(label + '-'.repeat(Math.max(1, 40)) + ' PASS'); }
else { console.log(label + '-'.repeat(Math.max(1, 40)) + ' FAIL (' + errors.length + ' issues)'); errors.slice(0, 10).forEach(e => console.log('     ' + e)); if (errors.length > 10) console.log('     ... and ' + (errors.length - 10) + ' more'); }
process.exit(errors.length > 0 ? 1 : 0);
