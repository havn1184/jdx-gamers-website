// ============================================================
// 🎯 Phục vụ skill: tao-apiservice + tich-hop-api-ui
// check-be-dto-fields.cjs — Đối chiếu field FE "*Dto" với property Backend C#
// ============================================================
// 📋 Bối cảnh: bug 2026-09-02 — `/jgame/quan-tri/doi-tac-referral` và
//              `/jgame/quan-tri/doi-tac-referral/bao-cao` crash runtime
//              (`Cannot read properties of undefined (reading 'toFixed')`,
//              `Object.entries(undefined)`) vì FE dùng thẳng type MOCK cũ
//              (`ReferralPartnerAdmin`, `ReferralReportSummaryAdmin`) làm type
//              cho response BE thật — trong khi BE trả field khác hẳn
//              (`AffiliatePartnerResponse.cs` không có `name`/`status`/
//              `refundRatePercent`; `ReferralAdminReportResponse.cs` không có
//              `totalCommission`/`totalCommissionByStatus`/`totalOwed`).
//              Check tĩnh KHÔNG thể tự phát hiện việc "dùng nhầm type" —
//              nhưng có thể xác minh: nếu dev đã khai báo đúng 1 interface
//              "raw DTO" (hậu tố `Dto`, có JSDoc ghi rõ tên file Backend
//              dạng `XxxResponse.cs`) để mapper đọc, thì field trong đó
//              PHẢI khớp property thật của DTO Backend — tránh lặp lại kiểu
//              sai lệch tương tự (đoán nhầm tên field) ở các API mới sau này.
// 📐 Quy ước bắt buộc để check này áp dụng được (đặt ra sau bug trên):
//    - Interface đại diện response thô của BE đặt tên kết thúc bằng `Dto`.
//    - Ngay phía trên interface đó có JSDoc/comment nhắc tên file Backend
//      dạng `XxxResponse.cs` (backtick) — VD: `AffiliatePartnerResponse.cs`.
//    → Nếu 1 method GET mới không theo quy ước này (không có `*Dto` + mapper),
//      check-be-dto-fields.cjs bỏ qua (không suy đoán) — chỉ cảnh báo khi
//      dev ĐÃ khai báo Dto nhưng field sai so với Backend thật.
// 📤 Output:   PASS nếu mọi field trong "*Dto" đều khớp property Backend
//              | FAIL kèm file:line + tên field sai + file Backend liên quan
// 📊 Severity: HIGH — field sai tên → runtime crash khi nhận `undefined`
// 💡 Example:  node check-be-dto-fields.cjs src/modules/JGameApp
// ============================================================
const fs = require('fs'); const p = require('path'); const g = require('glob');

const args = process.argv.slice(2);
const portalPath = args[0]; const featureFilter = args[1];
if (!portalPath) { console.log('Usage: node check-be-dto-fields.cjs <PortalPath> [feature]'); process.exit(1); }

const TARGET = p.resolve(portalPath);
// Backend nằm cạnh Website trong cùng workspace (k:/JDX-Gamers/{Backend,Website}) —
// script luôn chạy với cwd = thư mục gốc Website (đúng convention `node check-all.cjs src/modules/...`)
const BACKEND_ROOT = p.resolve(process.cwd(), '../Backend');

let files = g.sync(TARGET + '/**/services/*.ts');
if (featureFilter) { files = files.filter(f => p.relative(TARGET, f).replace(/\\/g, '/').startsWith(featureFilter)); }

const errors = [];

if (!fs.existsSync(BACKEND_ROOT)) {
  // Không tìm thấy Backend cạnh Website (VD: chạy check ở máy khác/CI chỉ có FE) → bỏ qua, không FAIL oan
  console.log(' B?. BE↔FE Dto field match ' + '-'.repeat(30) + ' PASS (skip: no Backend/ found)');
  process.exit(0);
}

// Cache nội dung .cs đã đọc theo tên file để khỏi quét lại toàn Backend nhiều lần
const csFileCache = new Map(); // 'XxxResponse.cs' -> { path, properties: Set<PascalName> }

function findBackendDtoFile(csFileName) {
  if (csFileCache.has(csFileName)) return csFileCache.get(csFileName);
  const matches = g.sync(BACKEND_ROOT + '/**/' + csFileName, { nodir: true, ignore: '**/bin/**' });
  if (matches.length === 0) { csFileCache.set(csFileName, null); return null; }
  const content = fs.readFileSync(matches[0], 'utf8');
  const properties = new Set();
  // public <Type> <PropName> { get; ... }  (giữ tối giản — đủ dùng cho DTO thuần field)
  const re = /public\s+(?:required\s+)?[\w<>[\],.?]+\s+(\w+)\s*\{\s*get;/g;
  let m;
  while ((m = re.exec(content)) !== null) properties.add(m[1]);
  const entry = { path: matches[0], properties };
  csFileCache.set(csFileName, entry);
  return entry;
}

function pascalCase(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

files.forEach(file => {
  const c = fs.readFileSync(file, 'utf8');
  const lines = c.split('\n');
  const rel = p.relative(TARGET, file).replace(/\\/g, '/');

  // Tìm từng interface "...Dto" kèm JSDoc/comment phía trên ghi tên file Backend `Xxx.cs`
  const interfaceRe = /interface\s+(\w*Dto)\s*\{([^}]*)\}/g;
  let im;
  while ((im = interfaceRe.exec(c)) !== null) {
    const [full, dtoName, body] = im;
    const startLine = c.substring(0, im.index).split('\n').length;

    // Quét ngược tối đa 6 dòng phía trên để tìm comment nhắc tên file Backend
    const back = lines.slice(Math.max(0, startLine - 7), startLine - 1).join('\n');
    const csMatch = back.match(/`(\w+\.cs)`/);
    if (!csMatch) continue; // không theo quy ước → bỏ qua, không suy đoán

    const csFileName = csMatch[1];
    const backend = findBackendDtoFile(csFileName);
    if (!backend) {
      errors.push(rel + ':' + startLine + ': interface "' + dtoName + '" ghi chú backend `' + csFileName + '` nhưng không tìm thấy file này trong Backend/ — comment sai hoặc file đã đổi tên');
      return;
    }

    // Field trong interface: "  fieldName: type" hoặc "  fieldName?: type" (bỏ dòng comment)
    const fieldRe = /^\s*(\w+)\s*\??\s*:/gm;
    let fm;
    while ((fm = fieldRe.exec(body)) !== null) {
      const feField = fm[1];
      const beField = pascalCase(feField);
      if (!backend.properties.has(beField)) {
        errors.push(rel + ':' + startLine + ': "' + dtoName + '.' + feField + '" không khớp property nào trong ' + csFileName + ' (' + p.relative(BACKEND_ROOT, backend.path).replace(/\\/g, '/') + ') — kiểm tra lại tên field trước khi map, tránh crash undefined như bug doi-tac-referral 2026-09-02');
      }
    }
  }
});

const label = ' B?. BE↔FE Dto field match ';
if (errors.length === 0) { console.log(label + '-'.repeat(20) + ' PASS'); }
else {
  console.log(label + '-'.repeat(20) + ' FAIL (' + errors.length + ' issues)');
  errors.slice(0, 15).forEach(e => console.log('     ' + e));
}
process.exit(errors.length > 0 ? 1 : 0);
