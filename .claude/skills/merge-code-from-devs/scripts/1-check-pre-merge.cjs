// ============================================================
// 1-check-pre-merge.cjs — Kiểm tra TRƯỚC khi merge (bước 1/3)
// ============================================================
// 🎯 Phục vụ skill: merge-code-from-devs (Bộ script merge an toàn)
// Kiểm tra mọi điều kiện an toàn trước khi cho phép merge:
//   1. Portal hợp lệ + repo tồn tại + có .git
//   2. git rev-parse --show-toplevel KHỚP repo mong muốn (chống chạy nhầm repo)
//   3. Working tree sạch (không tracked M/D)
//   4. Branch nguồn tồn tại (local hoặc origin/)
//   5. Branch đích (target) tồn tại
//   6. Diff nguồn..đích KHÔNG có file xóa (D) — chống mất code
//   7. Điều kiện BẮT BUỘC: nguồn phải chứa MỌI commit của đích (BLOCK nếu thiếu)
//   8. Kiểm tra trạng thái backup hiện có (idempotent — chỉ cảnh báo, không chặn)
// 📤 Output: JSON chuẩn { ok, repoPath, ..., errors[], warnings[] } + exit code
// 💡 Cách dùng: node check-pre-merge.cjs --portal kiemthu --branch development-tuan [--target development]
// ============================================================
const { resolveMergeRepoPath, checkTopLevel, checkWorkingTreeClean, branchExists, syncLocalBranches, gitSafe, timestamp, promptRequired, PORTAL_APP_ALIASES, validateTargetBranch, validateSourceBranch, checkRemoteMatch } = require('./main-merge-lib.cjs')

// ---- Parse args ----
const args = process.argv.slice(2)
function getArg(name) {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const PORTAL = getArg('--portal')
const SOURCE = getArg('--branch')
const TARGET = getArg('--target') || 'development'

// ---- Nếu thiếu tham số bắt buộc → HỎI NHẬP đầy đủ (interactive) ----
;(async () => {
  let portal = PORTAL
  let source = SOURCE
  let target = TARGET

  if (!portal || !source) {
    console.log('⚠️  Thiếu tham số bắt buộc — hãy nhập đầy đủ:')
    if (!portal) {
      portal = await promptRequired('--portal', 'Portal app (repo cần merge — CHỈ portal app, cấm root/docker/agentskill)', PORTAL_APP_ALIASES)
    }
    if (!source) {
      source = await promptRequired('--branch', 'Nhánh nguồn (development-<tên>)')
    }
    if (!target || getArg('--target') === undefined) {
      target = await promptRequired('--target', 'Nhánh đích (nhận merge)', ['development'], 'development')
    }
  }

  await run(portal, source, target)
})().catch(e => {
  console.error(`\n❌ ${e.message}`)
  process.exit(1)
})

async function run(PORTAL, SOURCE, TARGET) {
// ---- 1. Resolve repo (kèm kiểm tra phạm vi — chặn root/docker/agentskill) ----
const resolved = resolveMergeRepoPath(PORTAL)
if (resolved.error) {
  console.log(JSON.stringify({ ok: false, errors: [resolved.error], warnings: [], portal: PORTAL }, null, 2))
  process.exit(1)
}
const repoPath = resolved.repoPath

// ---- 1b. Validate nhánh (chặn main/master, target lạ, source===target) ----
const srcV = validateSourceBranch(SOURCE)
const validateErrors = [
  ...validateTargetBranch(TARGET, SOURCE),
  ...srcV.errors,
]

const ts = timestamp()
const result = {
  ok: false,
  portal: PORTAL,
  repoPath,
  sourceBranch: SOURCE,
  targetBranch: TARGET,
  backupNames: [`backup/${SOURCE}-${ts}`, `backup/${TARGET}-${ts}`],
  topLevelMatch: null,
  remoteMatch: null,
  workingTreeClean: null,
  sourceExists: null,
  targetExists: null,
  deletedFiles: [],
  commitsNew: null,
  commitsBehind: null,
  errors: [],
  warnings: [],
}
// Chuyển lỗi validate vào result.errors + cảnh báo vào result.warnings
for (const err of validateErrors) result.errors.push(err)
for (const w of srcV.warnings) result.warnings.push(w)

// ---- 1c. Fetch origin (cập nhật refs trước khi kiểm tra — không đổi working tree) ----
const fetchR = gitSafe(repoPath, ['fetch', 'origin'])
if (!fetchR.ok) result.warnings.push(`git fetch origin lỗi: ${fetchR.err} — kiểm tra với dữ liệu local hiện có`)

// ---- 2. show-toplevel khớp ----
const top = checkTopLevel(repoPath)
result.topLevelMatch = top.match
if (!top.match) {
  result.errors.push(`SAI REPO: git show-toplevel = '${top.top || top.err}' ≠ repo mong muốn '${top.expect}'. DỪNG, không merge.`)
}

// ---- 2b. Remote URL khớp repo portal mong đợi (chống clone nhầm repo) ----
const rm = checkRemoteMatch(repoPath, PORTAL)
result.remoteMatch = rm.match
if (!rm.match) {
  result.errors.push(rm.reason)
}

// ---- 3. Working tree sạch ----
const wt = checkWorkingTreeClean(repoPath)
result.workingTreeClean = wt.clean
if (!wt.clean) {
  result.errors.push(`Working tree KHÔNG sạch (${wt.dirty.length} tracked thay đổi). Ví dụ: ${wt.dirty.slice(0, 3).join('; ')}`)
}

// ---- 4. Branch nguồn ----
const src = branchExists(repoPath, SOURCE)
result.sourceExists = { local: src.local, remote: src.remote }
if (!src.local && !src.remote) result.errors.push(`Branch nguồn '${SOURCE}' không tồn tại (local lẫn origin/)`)

// ---- 5. Branch đích ----
const dst = branchExists(repoPath, TARGET)
result.targetExists = { local: dst.local, remote: dst.remote }
if (!dst.local) result.errors.push(`Branch đích '${TARGET}' không tồn tại local (cần tồn tại trước khi merge)`)
// ⚠️ ĐỒNG BỘ local branch từ origin — chống local stale (sự cố 18/08/2026: script báo THIẾU commit/0 commit mới do local branch cũ)
const sync = syncLocalBranches(repoPath, [SOURCE, TARGET])
if (sync.updated.length) result.warnings.push(`Đã đồng bộ local branch từ origin (mới nhất): ${sync.updated.join(', ')}`)
for (const e of sync.errors) result.warnings.push(`⚠️ ${e}`)
// ---- 6. Diff có file xóa (D) không — chống mất code ----
if (src.local || src.remote) {
  const d = gitSafe(repoPath, ['diff', `${TARGET}..${SOURCE}`, '--name-status'])
  if (d.ok) {
    const deleted = d.out.split('\n').filter(l => l.startsWith('D\t'))
    result.deletedFiles = deleted
    if (deleted.length > 0) {
      result.errors.push(`BLOCK: nhánh nguồn XÓA ${deleted.length} file đang có ở đích (merge sẽ mất code). File đầu: ${deleted.slice(0, 3).join('; ')}`)
    }
  }
  // 7. Số commit mới + điều kiện BẮT BUỘC: nguồn phải chứa MỌI commit của đích
  const nNew = gitSafe(repoPath, ['rev-list', '--count', `${TARGET}..${SOURCE}`])
  if (nNew.ok) result.commitsNew = Number(nNew.out) || 0
  if (result.commitsNew !== null && result.commitsNew === 0) {
    result.warnings.push(`Nhánh nguồn '${SOURCE}' KHÔNG có commit mới so với '${TARGET}' — merge sẽ tạo commit rỗng. Kiểm tra lại nhánh trước khi merge.`)
  }
  const nBehind = gitSafe(repoPath, ['rev-list', '--count', `${SOURCE}..${TARGET}`])
  if (nBehind.ok) result.commitsBehind = Number(nBehind.out) || 0
  if (result.commitsBehind > 0) {
    result.errors.push(`BLOCK: nhánh nguồn '${SOURCE}' THIẾU ${result.commitsBehind} commit của nhánh đích '${TARGET}'. BẮT BUỘC cập nhật nhánh nguồn trước (merge '${TARGET}' vào '${SOURCE}' rồi push) — nếu merge bây giờ sẽ mất code của '${TARGET}'.`)
  }
}

// ---- 8. Kiểm tra trạng thái backup hiện có (idempotent — không còn là lỗi chặn) ----
// Cơ chế mới: ensureBackup sẽ DÙNG LẠI backup trùng commit thay vì tạo mới.
// Ở đây chỉ báo tồn tại backup để user biết (không chặn merge).
const existingBackups = gitSafe(repoPath, ['branch', '--list', 'backup/*', '--format', '%(refname:short)'])
if (existingBackups.ok) {
  const all = existingBackups.out.split('\n').filter(Boolean)
  if (all.length > 0) {
    result.warnings.push(`Đã có ${all.length} nhánh backup: ${all.slice(0, 5).join(', ')}${all.length > 5 ? '...' : ''} — script sẽ dùng lại backup cùng commit (không tạo trùng).`)
  }
}

// ---- Kết luận ----
result.ok = result.errors.length === 0
console.log(JSON.stringify(result, null, 2))
process.exit(result.ok ? (result.warnings.length > 0 ? 2 : 0) : 1)
} // end run()
