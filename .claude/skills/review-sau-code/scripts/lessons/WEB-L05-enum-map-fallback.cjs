// WEB-L05 — Map enum int -> nhãn/union bằng X_MAP[value] phải có fallback khi BE trả giá trị mới (thêm cuối enum) -
//          nếu không UI hiện undefined/raw (App từng hiện raw status "supplyFailed" - commit 378fca6; Website dùng cùng pattern _MAP).
// Phát hiện: biểu thức `X_MAP[...]` hoặc `X_LABELS[...]` không đi kèm `??`/`||`/`?.`.
const L = require('../lib.cjs');
function check(rootDir) {
  const issues = [];
  for (const f of L.walk(L.moduleRoot(rootDir))) {
    if (!L.inScope(rootDir, f)) continue;
    const src = L.stripComments(L.read(f));
    for (const m of src.matchAll(/\b(\w+_(?:MAP|LABELS))\[([^\]]+)\]/g)) {
      const tail = src.slice(m.index + m[0].length, m.index + m[0].length + 12);
      const before = src.slice(Math.max(0, m.index - 20), m.index);
      if (/^\s*(\?\?|\|\|)/.test(tail) || /\?\.\s*$/.test(before) || /=\s*\[/.test(before) || /\bin\b\s*$/.test(before)) continue;
      if (/indexOf|includes|\.length/.test(src.slice(m.index - 30, m.index))) continue;
      issues.push({ file: f, level: 'WARN', rule: 'WEB-L05', message: `${m[1]}[${m[2].trim()}] không có fallback (?? 'unknown'/nhãn mặc định) - BE thêm giá trị enum mới sẽ hiện undefined`, line: L.lineOf(src, m.index) });
    }
  }
  return L.group(rootDir, issues);
}
module.exports = { id: 'WEB-L05', title: 'Map enum phải có fallback giá trị lạ', source: 'App 378fca6 raw enum label; pattern _MAP Website', check };
