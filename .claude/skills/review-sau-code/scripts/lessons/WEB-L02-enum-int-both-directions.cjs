// WEB-L02 — Enum BE là int. FE phải map CẢ 2 chiều: đọc (int -> string union, normalize*) và GHI (string -> int trước khi
//          POST/PUT). Gửi chuỗi 'vip'/'manual' lên BE -> [ApiController] trả 400 ValidationProblemDetails, FE nuốt lỗi.
// Nguồn: 20260901-nc_shop-owner-zone-ve-crud.md 1.3 (setSyncMode - đã xảy ra thật).
// Phát hiện: trong *ApiService.ts, lời gọi apiCall POST/PUT/PATCH có body chứa key status/type/mode/kind/category
//            mà giá trị không qua indexOf(/toXxxInt(/Number(/ *_MAP.
const L = require('../lib.cjs');
const KEYS = /\b(status|type|mode|kind|category|syncMode|zoneType|currency|provider)\s*:\s*([^,}\n]+)/g;
function check(rootDir) {
  const issues = [];
  for (const f of L.walk(L.moduleRoot(rootDir))) {
    if (!/ApiService\w*\.ts$/.test(f) || !L.inScope(rootDir, f)) continue;
    const src = L.stripComments(L.read(f));
    for (const m of src.matchAll(/method:\s*'(POST|PUT|PATCH)'[\s\S]{0,400}?body:\s*(\{[\s\S]*?\}|\w+)/g)) {
      const bodyText = m[2];
      if (!bodyText.startsWith('{')) continue; // body: data - không phân tích được, review thủ công
      for (const k of bodyText.matchAll(KEYS)) {
        const v = k[2].trim();
        if (/indexOf\(|Int\(|Number\(|_MAP|toInt|as number|\d+$/.test(v)) continue;
        if (/^['"]/.test(v) || /^\w+(\.\w+)*$/.test(v)) issues.push({ file: f, level: 'WARN', rule: 'WEB-L02', message: `body.${k[1]} = ${v} - gửi chuỗi enum lên BE? Map sang int (X_MAP.indexOf / toXxxInt) trước khi gửi`, line: L.lineOf(src, m.index + m[0].indexOf(k[0])) });
      }
    }
  }
  return L.group(rootDir, issues);
}
module.exports = { id: 'WEB-L02', title: 'Enum: map int cả chiều đọc lẫn chiều ghi', source: 'nc_shop-owner-zone-ve-crud 1.3 (setSyncMode 400)', check };
