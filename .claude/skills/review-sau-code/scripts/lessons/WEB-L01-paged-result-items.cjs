// WEB-L01 — BE trả PagedResult<T> ({items, total, page...}) nhưng ApiService ép thẳng `result.data` thành mảng ->
//          crash "result.data.map is not a function" (Admin referral: tab Giao dịch, trang báo cáo - 2026-09-02, commit 6fc51fd/c53c51e).
// Phát hiện: method ApiService gửi query page/limit (dấu hiệu endpoint phân trang) rồi dùng .data.map/.filter/.length mà không đọc .items.
const L = require('../lib.cjs');
function check(rootDir) {
  const issues = [];
  for (const f of L.walk(L.moduleRoot(rootDir))) {
    if (!/ApiService\w*\.ts$/.test(f) || !L.inScope(rootDir, f)) continue;
    const src = L.stripComments(L.read(f));
    for (const m of src.matchAll(/static\s+async\s+(\w+)\s*\([^)]*\)[^{]*\{/g)) {
      let depth = 1, i = m.index + m[0].length;
      while (i < src.length && depth > 0) { if (src[i] === '{') depth++; else if (src[i] === '}') depth--; i++; }
      const body = src.slice(m.index, i);
      const paged = /\b(page|limit|pageSize)\s*:/.test(body) || /PagedResult/.test(body);
      if (paged && /\.data\.(map|filter|length|forEach|find)\b/.test(body) && !/\.items\b/.test(body)) issues.push({ file: f, level: 'ERROR', rule: 'WEB-L01', message: `${m[1]}: endpoint phân trang nhưng dùng result.data như mảng - BE trả PagedResult, phải đọc .data.items`, line: L.lineOf(src, m.index) });
    }
  }
  return L.group(rootDir, issues);
}
module.exports = { id: 'WEB-L01', title: 'PagedResult phải đọc .items', source: 'Admin referral crash 2026-09-02 (6fc51fd, c53c51e)', check };
