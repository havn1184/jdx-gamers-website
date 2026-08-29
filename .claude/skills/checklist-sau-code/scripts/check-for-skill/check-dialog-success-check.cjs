/**
 * check-dialog-success-check.cjs — Kiểm tra pattern "dialog đóng không báo lỗi BE"
 *
 * 📋 Kiểm tra 4 lỗi pattern trong các Dialog (*Dialog.tsx) + form hooks (thư mục hooks/):
 *   [BUG-1] 🔴 CRITICAL — Submit gọi API + toast.success nhưng KHÔNG check res.success
 *            → BE trả success:false (kể cả HTTP 400 được apiCall normalize) nhưng dialog
 *            vẫn toast thành công + đóng → user mất dữ liệu, không thấy lỗi.
 *   [BUG-2] 🔴 CRITICAL — useState<any> cho serverError (vi phạm cấm any)
 *   [BUG-3] 🔴 CRITICAL — errorCode={serverError?.name} (sai prop, đúng là errorCode)
 *   [BUG-4] 🟡 HIGH — toast.error khi API lỗi (ngoài catch block) thay vì ValidationErrorDialog
 *
 * 🎯 Phục vụ skill: checklist-sau-code (Giai đoạn 1 — static check)
 * 📤 Output: CHỈ in các dòng FAIL kèm file:line + mô tả. PASS → im lặng.
 *
 * 💡 Cách chạy:
 *   node check-dialog-success-check.cjs src/modules/KiemThuApp
 *   node check-dialog-success-check.cjs src/modules/KiemThuApp features/yeu-cau-phan-mem
 */

const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
const portalPath = args[0]
const featureFilter = args[1]

if (!portalPath || !fs.existsSync(portalPath)) {
  console.log('Usage: node check-dialog-success-check.cjs <PortalPath> [feature]')
  console.log('  PortalPath: src/modules/KiemThuApp')
  console.log('  feature:    features/yeu-cau-phan-mem (optional)')
  process.exit(1)
}

const IGNORE_DIRS = ['node_modules', 'dist', 'build', '.git']
const ROOT = path.resolve(portalPath)

// ============================================================
// Helpers
// ============================================================

/** Brace-match từ vị trí `{` — trả về index đóng brace hoặc -1 */
function matchBrace(code, openIdx) {
  let depth = 1
  let inStr = null
  for (let i = openIdx + 1; i < code.length; i++) {
    const ch = code[i]
    if (inStr) {
      if (ch === '\\') { i++; continue }
      if (ch === inStr) inStr = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue }
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

/**
 * Tìm function chứa vị trí idx — trả về { text, name, start } hoặc null.
 * Hỗ trợ: const X = (...) => {...}, const X = (...) : ReturnType => {...},
 *          const X = useCallback(... => {...}, []), function X(...) {...}
 */
function findContainingFn(code, idx) {
  const re =
    /(?:const|let)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z0-9_$]+)\s*(?::[^{=]*?)?=>|(?:const|let)\s+([A-Za-z0-9_$]+)\s*=\s*useCallback\s*\(\s*(?:async\s*)?\([^)]*\)\s*(?::[^{=]*?)?=>|(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/g
  let m
  let last = null
  while ((m = re.exec(code))) {
    if (m.index > idx) break
    last = m
  }
  if (!last) return null
  const ob = code.indexOf('{', last.index)
  if (ob === -1 || ob > idx) return null
  const end = matchBrace(code, ob)
  if (end === -1 || end < idx) return null
  const name = last[1] || last[2] || last[3] || '(anonymous)'
  return { name, start: last.index, end, text: code.slice(last.index, end + 1) }
}

/** Lấy số dòng của offset trong code (1-based) */
function lineAt(code, offset) {
  return code.slice(0, offset).split('\n').length
}

/** Tìm khoảng [start,end] của các catch block trong body */
function findCatchRanges(body) {
  const ranges = []
  const re = /catch\s*(?:\([^)]*\))?\s*\{|\.catch\s*(?:\([^)]*\))?\s*(?:=>\s*\{|\([^)]*\)\s*=>\s*\{)/g
  let m
  while ((m = re.exec(body))) {
    const braceIdx = body.indexOf('{', m.index)
    if (braceIdx === -1) continue
    const end = matchBrace(body, braceIdx)
    if (end !== -1) ranges.push([m.index, end])
  }
  return ranges
}

/** Thu thập file cần scan: *Dialog.tsx + mọi file .ts/.tsx trong thư mục hooks */
function collectTargetFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.includes(entry.name)) continue
      collectTargetFiles(path.join(dir, entry.name), out)
    } else {
      const name = entry.name
      const isDialog = /^.*Dialog\.tsx$/.test(name)
      const inHooksDir =
        entry.parentPath.endsWith(path.sep + 'hooks') ||
        entry.parentPath.includes(path.sep + 'hooks' + path.sep)
      if (isDialog || (inHooksDir && /\.(ts|tsx)$/.test(name))) {
        out.push(path.join(dir, entry.name))
      }
    }
  }
  return out
}

// ============================================================
// Main
// ============================================================

const SERVICE_CALL_RE = /\b[A-Z][A-Za-z0-9_$]*ApiService\.[A-Za-z0-9_$]+\s*\(|\b[A-Z][A-Za-z0-9_$]*Service\.[A-Za-z0-9_$]+\s*\(/g

let targetFiles = collectTargetFiles(ROOT)
// Lọc theo feature nếu có
if (featureFilter) {
  const featureAbs = path.resolve(ROOT, featureFilter)
  targetFiles = targetFiles.filter(f => f.startsWith(featureAbs))
}

let issueCount = 0

for (const file of targetFiles) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/')
  const code = fs.readFileSync(file, 'utf8')

  const handlerSet = new Map()
  let m
  while ((m = SERVICE_CALL_RE.exec(code))) {
    const fn = findContainingFn(code, m.index)
    if (fn && !handlerSet.has(fn.start)) handlerSet.set(fn.start, fn)
  }

  for (const fn of handlerSet.values()) {
    const body = fn.text
    const hasToastSuccess = /toast\.success\s*\(/.test(body)
    // Loại trừ toast.success — chỉ tính check thực sự (res.success / !res.success / ...)
    const hasSuccessCheck = /(?<!toast)\.success/.test(body)

    // [BUG-1] gọi API + toast.success nhưng KHÔNG check success
    if (hasToastSuccess && !hasSuccessCheck) {
      const lineNo = lineAt(code, fn.start + body.indexOf('toast.success'))
      console.log(`[FAIL] [CRITICAL] ${rel}:${lineNo} [dialog-success-check] ${fn.name}: submit gọi API + toast.success nhưng KHÔNG check res.success → BE lỗi vẫn đóng dialog`)
      issueCount++
    }

    // [BUG-2] useState<any> cho serverError
    if (/useState\s*<\s*any\s*>/.test(code)) {
      const lineNo = lineAt(code, code.indexOf('useState<any>'))
      console.log(`[FAIL] [CRITICAL] ${rel}:${lineNo} [dialog-success-check] ${fn.name}: useState<any> cho serverError — phải dùng ApiResponse<unknown> | null`)
      issueCount++
    }

    // [BUG-3] errorCode={serverError?.name}
    const badErr = /errorCode\s*=\s*\{\s*serverError\??\.name\s*\}/.exec(code)
    if (badErr) {
      console.log(`[FAIL] [CRITICAL] ${rel}:${lineAt(code, badErr.index)} [dialog-success-check] ${fn.name}: errorCode={serverError?.name} sai — dùng serverError?.errorCode`)
      issueCount++
    }

    // [BUG-4] toast.error khi API lỗi — CHỈ flag khi nằm NGOÀI catch block
    // VÀ xuất hiện SAU service call đầu tiên (loại bỏ toast.error validate client-side trước call)
    const catchRanges = findCatchRanges(body)
    const firstCallIdx = body.search(
      /\b[A-Z][A-Za-z0-9_$]*ApiService\.[A-Za-z0-9_$]+\s*\(|\b[A-Z][A-Za-z0-9_$]*Service\.[A-Za-z0-9_$]+\s*\(/
    )
    const teRe = /toast\.error\s*\(/g
    let te
    while ((te = teRe.exec(body))) {
      const inCatch = catchRanges.some(([s, e]) => te.index > s && te.index < e)
      if (inCatch) continue
      if (firstCallIdx !== -1 && te.index < firstCallIdx) continue // validate client-side
      console.log(`[FAIL] [HIGH] ${rel}:${lineAt(code, fn.start + te.index)} [dialog-success-check] ${fn.name}: toast.error khi API lỗi — phải dùng ValidationErrorDialog + setServerError(res)`)
      issueCount++
      break
    }
  }
}

if (issueCount > 0) {
  console.log(`check-dialog-success-check: ${issueCount} issue(s) — Fix: đọc skill [.claude/skills/tich-hop-api-ui/SKILL.md] (mục Xử lý response success:false) + [.claude/skills/tao-ui-dialog/SKILL.md] (mục ValidationErrorDialog)`)
  process.exit(1)
}
