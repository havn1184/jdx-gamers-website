// WEB-L03 — Hook fetch có setLoading(true) mà không có try/catch/finally -> khi API lỗi, trang treo "Đang tải..." vĩnh viễn,
//          người dùng không thấy lỗi (useShopZonesTickets/useShopSync - nc_shop-owner-zone-ve-crud 1.3, đã xảy ra thật).
// Phát hiện: file hooks/*.ts có setLoading(true)/setIsLoading(true) nhưng thiếu `finally` (WARN) hoặc thiếu cả `catch` (ERROR).
const L = require('../lib.cjs');
function check(rootDir) {
  const issues = [];
  for (const f of L.walk(L.moduleRoot(rootDir), ['.ts'])) {
    if (!/[\\/]hooks[\\/]/.test(f) || !L.inScope(rootDir, f)) continue;
    const src = L.stripComments(L.read(f));
    const m = src.match(/set(?:Is)?Loading\(true\)/);
    if (!m) continue;
    if (!/\bcatch\b/.test(src)) issues.push({ file: f, level: 'ERROR', rule: 'WEB-L03', message: 'setLoading(true) nhưng không có catch - lỗi API sẽ treo "Đang tải" và không hiển thị lỗi', line: L.lineOf(src, m.index) });
    else if (!/\bfinally\b/.test(src)) issues.push({ file: f, level: 'WARN', rule: 'WEB-L03', message: 'setLoading(true) nhưng không có finally { setLoading(false) } - đảm bảo tắt loading cả khi lỗi', line: L.lineOf(src, m.index) });
    if (!/set(?:Error|ErrorMessage|Err)\w*\(/.test(src)) issues.push({ file: f, level: 'WARN', rule: 'WEB-L03', message: 'Hook không có state lỗi (setError/errorMessage) để trang hiển thị khi API thất bại' });
  }
  return L.group(rootDir, issues);
}
module.exports = { id: 'WEB-L03', title: 'Hook fetch phải có catch/finally + state lỗi', source: 'nc_shop-owner-zone-ve-crud 1.3', check };
