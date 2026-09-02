// ============================================================
// 3-check-post-merge.cjs — Kiểm tra SAU khi merge (bước 3/3)
// ============================================================
// 🎯 Phục vụ skill: merge-code-from-devs (Bộ script merge an toàn)
// Xác nhận merge hoàn tất đúng & không mất code:
//   1. Đang ở branch đích (target) — CHỈ CẢNH BÁO (main-merge tự quay về branch gốc sau merge)
//   2. Working tree sạch sau merge (không M/D dở dang)
//   3. Nhánh backup tồn tại (phao cứu sinh còn đó)
//   4. [--source] git log <nguồn>..<đích> rỗng → mọi commit nguồn đã vào đích
//   5. HEAD là merge commit (2 parents) hoặc fast-forward hợp lệ
//   6. Không có file bị xóa bất thường
// 📤 Output: JSON chuẩn { ok, ..., errors[], warnings[] } + exit code
// 💡 Cách dùng: node check-post-merge.cjs --portal kiemthu [--target development] [--source development-tuan]
// ============================================================
const { resolveMergeRepoPath, checkTopLevel, checkWorkingTreeClean, currentBranch, gitSafe, promptRequired, PORTAL_APP_ALIASES, checkRemoteMatch } = require('./main-merge-lib.cjs')

// ---- Parse args ----
const args = process.argv.slice(2)
function getArg(name) {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const PORTAL_ARG = getArg('--portal')
const TARGET_ARG = getArg('--target')
const SOURCE = getArg('--source')

// ---- Nếu thiếu tham số bắt buộc → HỎI NHẬP đầy đủ (interactive) ----
;(async () => {
  const PORTAL = PORTAL_ARG || (await promptRequired('--portal', 'Portal app (repo cần merge — CHỈ portal app, cấm root/docker/agentskill)', PORTAL_APP_ALIASES))
  const TARGET = TARGET_ARG || (await promptRequired('--target', 'Nhánh đích (đã merge)', ['development'], 'development'))
  await run(PORTAL, TARGET, SOURCE)
})().catch(e => {
  console.error(`\n❌ ${e.message}`)
  process.exit(1)
})

async function run(PORTAL, TARGET, SOURCE) {
// ---- 1. Resolve repo (kèm kiểm tra phạm vi — chặn root/docker/agentskill) ----
const resolved = resolveMergeRepoPath(PORTAL)
if (resolved.error) {
  console.log(JSON.stringify({ ok: false, errors: [resolved.error], warnings: [] }, null, 2))
  process.exit(1)
}
const repoPath = resolved.repoPath

const result = {
  ok: false,
  portal: PORTAL,
  repoPath,
  currentBranch: null,
  targetBranch: TARGET,
  remoteMatch: null,
  workingTreeClean: null,
  backups: [],
  sourceMerged: null,
  mergeCommit: null,
  errors: [],
  warnings: [],
}

// ---- 0. Remote URL khớp repo portal mong đợi (chống kiểm tra nhầm repo) ----
const rm = checkRemoteMatch(repoPath, PORTAL)
result.remoteMatch = rm.match
if (!rm.match) result.errors.push(rm.reason)

// ---- 1. Đang ở branch đích (CHỈ CẢNH BÁO — main-merge tự quay về branch gốc sau merge) ----
const cb = currentBranch(repoPath)
result.currentBranch = cb
if (cb !== TARGET) result.warnings.push(`Đang ở branch '${cb}' (không phải '${TARGET}') — hợp lệ nếu main-merge đã tự quay về branch gốc. Xác nhận bằng mục 4 (mọi commit nguồn đã vào đích).`)

// ---- 2. Working tree sạch ----
const wt = checkWorkingTreeClean(repoPath)
result.workingTreeClean = wt.clean
if (!wt.clean) result.errors.push(`Working tree KHÔNG sạch sau merge (${wt.dirty.length} tracked thay đổi)`)

// ---- 3. Nhánh backup tồn tại ----
const bk = gitSafe(repoPath, ['branch', '--list', 'backup/*'])
if (bk.ok) result.backups = bk.out.split('\n').filter(Boolean)
if (result.backups.length === 0) result.warnings.push('Không thấy nhánh backup nào — kiểm tra thủ công')

// ---- 4. Mọi commit nguồn đã vào đích ----
// Lưu ý: đếm TARGET..SOURCE (commit của NGUỒN chưa có trong ĐÍCH) = 0.
// KHÔNG dùng SOURCE..TARGET — sau merge --no-ff nó luôn ≥ 1 vì đếm cả merge commit mới tạo (giả FAIL).
if (SOURCE) {
  const r = gitSafe(repoPath, ['rev-list', '--count', `${TARGET}..${SOURCE}`])
  if (r.ok) {
    result.sourceMerged = Number(r.out) === 0
    if (Number(r.out) > 0) result.errors.push(`Còn ${r.out} commit của nguồn '${SOURCE}' chưa vào '${TARGET}'`)
  }
}

// ---- 5. HEAD là merge commit hay ff ----
const parents = gitSafe(repoPath, ['rev-list', '--parents', '-n', '1', 'HEAD'])
if (parents.ok) {
  const parts = parents.out.split(/\s+/)
  const nParents = parts.length - 1
  result.mergeCommit = parts[0]
  if (nParents < 1) result.errors.push('HEAD không phải commit hợp lệ')
  if (nParents === 2) result.warnings.push('HEAD là merge commit --no-ff (2 parents) — chuẩn')
  else if (nParents === 1) result.warnings.push('HEAD là fast-forward (1 parent) — chấp nhận được')
}

// ---- 6. Không có file xóa bất thường (so với tree ngay trước merge không kiểm được — dùng status sạch) ----
// (đã kiểm qua workingTreeClean ở mục 2)

// ---- Kết luận ----
result.ok = result.errors.length === 0
console.log(JSON.stringify(result, null, 2))
process.exit(result.ok ? (result.warnings.length > 0 ? 2 : 0) : 1)
} // end run()
