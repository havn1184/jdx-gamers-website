// ============================================================
// 2-merge-safe.cjs — Thực hiện merge AN TOÀN (bước 2/3)
// ============================================================
// 🎯 Phục vụ skill: merge-code-from-devs (Bộ script merge an toàn)
// Quy trình:
//   1. Resolve repo từ --portal → verify .git + show-toplevel khớp
//   2. Chạy lại toàn bộ pre-check (lỗi chặn → ABORT ngay, không merge)
//   3. git fetch origin (lỗi mạng → WARN, không chặn)
//   4. Đảm bảo branch nguồn local (nếu chỉ có origin/<nguồn> → git branch)
//   5. TẠO BACKUP 2 BÊN: backup/<nguồn>-<ts> + backup/<đích>-<ts>
//      (git branch — thuần tạo, KHÔNG đổi working tree)
//   6. git switch <đích> (working tree đã sạch ở bước 2)
//   7. git merge <nguồn> --no-ff --no-edit
//      - FAIL/CONFLICT → git merge --abort → báo FAIL (KHÔNG resolve thủ công)
//   8. [--push] git push origin <đích> (mặc định KHÔNG push)
// 🛡️ TUYỆT ĐỐI KHÔNG chứa: git reset / branch -D / push --force / clean / rm
// 💡 Cách dùng: node merge-safe.cjs --portal kiemthu --branch development-tuan [--target development] [--yes] [--push]
// ============================================================
const { resolveMergeRepoPath, checkTopLevel, checkWorkingTreeClean, branchExists, syncLocalBranches, git, gitSafe, timestamp, ensureBackup, promptRequired, PORTAL_APP_ALIASES, validateTargetBranch, validateSourceBranch, currentBranch, checkRemoteMatch } = require('./main-merge-lib.cjs')

// ---- Parse args ----
const args = process.argv.slice(2)
function getArg(name) {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const PORTAL_ARG = getArg('--portal')
const SOURCE_ARG = getArg('--branch')
const TARGET_ARG = getArg('--target')
const YES = args.includes('--yes')
const PUSH = args.includes('--push')

// ---- Nếu thiếu tham số bắt buộc → HỎI NHẬP đầy đủ (interactive) ----
;(async () => {
  const PORTAL = PORTAL_ARG || (await promptRequired('--portal', 'Portal app (repo cần merge — CHỈ portal app, cấm root/docker/agentskill)', PORTAL_APP_ALIASES))
  const SOURCE = SOURCE_ARG || (await promptRequired('--branch', 'Nhánh nguồn (development-<tên>)'))
  const TARGET = TARGET_ARG || (await promptRequired('--target', 'Nhánh đích (nhận merge)', ['development'], 'development'))

  await run(PORTAL, SOURCE, TARGET, YES, PUSH)
})().catch(e => {
  console.error(`\n❌ ${e.message}`)
  process.exit(1)
})

async function run(PORTAL, SOURCE, TARGET, YES, PUSH) {
const result = {
  ok: false,
  portal: PORTAL,
  repoPath: null,
  sourceBranch: SOURCE,
  targetBranch: TARGET,
  backupsCreated: [],
  mergeCommit: null,
  pushed: false,
  phase: 'init',
  topLevelMatch: null,
  remoteMatch: null,
  errors: [],
  warnings: [],
}

let origBranch = null // Branch hiện tại trước khi chạy — để khôi phục khi fail
function fail(msg) {
  result.errors.push(msg)
  // Quay về branch gốc nếu đã lưu (tránh repo mắc kẹt ở branch khác)
  if (origBranch && result.repoPath) gitSafe(result.repoPath, ['switch', origBranch])
  console.log(JSON.stringify(result, null, 2))
  process.exit(1)
}

// ---- 1. Resolve repo + verify (kèm kiểm tra phạm vi — chặn root/docker/agentskill) ----
const resolved = resolveMergeRepoPath(PORTAL)
if (resolved.error) fail(resolved.error)
const repoPath = resolved.repoPath
result.repoPath = repoPath
origBranch = currentBranch(repoPath) // Lưu branch gốc để khôi phục khi fail

// ---- 1b. Validate nhánh (chặn main/master, target lạ, source===target) ----
const srcV = validateSourceBranch(SOURCE)
const vErr = [
  ...validateTargetBranch(TARGET, SOURCE),
  ...srcV.errors,
]
for (const w of srcV.warnings) result.warnings.push(w)
if (vErr.length) fail(vErr.join(' | '))

const top = checkTopLevel(repoPath)
result.topLevelMatch = top.match
if (!top.match) fail(`SAI REPO: show-toplevel = '${top.top || top.err}' ≠ '${top.expect}'. DỪNG, không merge.`)

// Kiểm tra remote URL khớp repo portal mong đợi (chống clone nhầm repo)
const rm = checkRemoteMatch(repoPath, PORTAL)
result.remoteMatch = rm.match
if (!rm.match) fail(rm.reason)

// ---- 2a. Fetch TRƯỚC (không đổi working tree — an toàn) để diff dựa trên refs mới nhất ----
const fetch = gitSafe(repoPath, ['fetch', 'origin'])
if (!fetch.ok) result.warnings.push(`git fetch origin lỗi: ${fetch.err} — tiếp tục với dữ liệu local hiện có`)

// ---- 2. Pre-check (giống check-pre-merge) ----
const wt = checkWorkingTreeClean(repoPath)
if (!wt.clean) fail(`Working tree KHÔNG sạch (${wt.dirty.length} tracked thay đổi). Ví dụ: ${wt.dirty.slice(0, 3).join('; ')}`)

const src = branchExists(repoPath, SOURCE)
if (!src.local && !src.remote) fail(`Branch nguồn '${SOURCE}' không tồn tại (local lẫn origin/)`)
if (!branchExists(repoPath, TARGET).local) fail(`Branch đích '${TARGET}' không tồn tại local`)

// ⚠️ ĐỒNG BỘ local branch từ origin — chống local stale (sự cố 18/08/2026: script báo THIẾU commit/0 commit mới do local branch cũ)
const sync = syncLocalBranches(repoPath, [SOURCE, TARGET])
if (sync.updated.length) result.warnings.push(`Đã đồng bộ local branch từ origin (mới nhất): ${sync.updated.join(', ')}`)
for (const e of sync.errors) result.warnings.push(`⚠️ ${e}`)

// Cảnh báo: nguồn không có commit mới → merge rỗng
const nNew = gitSafe(repoPath, ['rev-list', '--count', `${TARGET}..${SOURCE}`])
if (nNew.ok && Number(nNew.out) === 0) {
  result.warnings.push(`Nhánh nguồn '${SOURCE}' KHÔNG có commit mới so với '${TARGET}' — merge sẽ tạo commit rỗng. Kiểm tra lại nhánh trước khi merge.`)
}
// Chống mất code: nguồn không được XÓA file đang có ở đích
const d = gitSafe(repoPath, ['diff', `${TARGET}..${SOURCE}`, '--name-status'])
if (d.ok) {
  const deleted = d.out.split('\n').filter(l => l.startsWith('D\t'))
  if (deleted.length > 0) fail(`BLOCK: nhánh nguồn XÓA ${deleted.length} file đang có ở đích. File đầu: ${deleted.slice(0, 3).join('; ')}`)
}
// Điều kiện BẮT BUỘC: nguồn phải chứa MỌI commit của đích (chống mất code của đích)
const nBehind = gitSafe(repoPath, ['rev-list', '--count', `${SOURCE}..${TARGET}`])
if (nBehind.ok && Number(nBehind.out) > 0) {
  fail(`BLOCK: nhánh nguồn '${SOURCE}' THIẾU ${nBehind.out} commit của nhánh đích '${TARGET}'. BẮT BUỘC cập nhật nhánh nguồn trước (merge '${TARGET}' vào '${SOURCE}' rồi push) — nếu merge bây giờ sẽ mất code của '${TARGET}'.`)
}

// ---- 🛑 GATE XÁC NHẬN: không --yes → chỉ pre-check rồi DỪNG (chờ user duyệt) ----
if (!YES) {
  result.phase = 'waiting-confirm'
  result.ok = true
  console.log('\n[CẦN DUYỆT] Pre-check PASS. Chạy lại với --yes để thực hiện merge (sau khi user xác nhận).')
  console.log(JSON.stringify(result, null, 2))
  process.exit(2)
}

// ---- 3. Đảm bảo branch nguồn local ----
if (!src.local && src.remote) {
  const mk = gitSafe(repoPath, ['branch', SOURCE, `origin/${SOURCE}`])
  if (!mk.ok) fail(`Không tạo được branch local '${SOURCE}' từ origin: ${mk.err}`)
}

// ---- 5. TẠO BACKUP 2 BÊN (thuần git branch — không đổi working tree) ----
const ts = timestamp()
const bSrc = ensureBackup(repoPath, SOURCE, ts)
if (!bSrc.ok) fail(`Không đảm bảo được backup nguồn: ${bSrc.err}`)
result.backupsCreated.push(bSrc.name)
if (bSrc.reused) result.warnings.push(`Backup nguồn đã có sẵn (cùng commit) — dùng lại '${bSrc.name}', không tạo mới`)
const bDst = ensureBackup(repoPath, TARGET, ts)
if (!bDst.ok) fail(`Không đảm bảo được backup đích: ${bDst.err}`)
result.backupsCreated.push(bDst.name)
if (bDst.reused) result.warnings.push(`Backup đích đã có sẵn (cùng commit) — dùng lại '${bDst.name}', không tạo mới`)

// ---- 6. Switch sang đích ----
const sw = gitSafe(repoPath, ['switch', TARGET])
if (!sw.ok) fail(`Không switch được sang '${TARGET}': ${sw.err}`)

// ---- 7. Merge --no-ff (conflict → abort, KHÔNG resolve) ----
const mg = gitSafe(repoPath, ['merge', SOURCE, '--no-ff', '--no-edit'])
if (!mg.ok) {
  // ABORT — chỉ hủy merge đang dở, KHÔNG reset commit nhánh
  gitSafe(repoPath, ['merge', '--abort'])
  fail(`Merge conflict/lỗi: ${mg.err}. Đã git merge --abort — working tree nguyên trạng. Backup: ${result.backupsCreated.join(', ')}`)
}

// ---- 8. Push (tùy chọn) ----
if (PUSH) {
  const ps = gitSafe(repoPath, ['push', 'origin', TARGET])
  if (!ps.ok) {
    result.warnings.push(`Push lỗi: ${ps.err} — merge local đã thành công, chạy thủ công: git push origin ${TARGET}`)
  } else {
    result.pushed = true
  }
}

// ---- Kết luận ----
const head = gitSafe(repoPath, ['rev-parse', '--short', 'HEAD'])
result.mergeCommit = head.ok ? head.out : null

// ---- POST-CHECK cơ bản sau merge (bổ sung an toàn — không rollback, chỉ báo lỗi) ----
const postErrors = []
const srcMerged = gitSafe(repoPath, ['rev-list', '--count', `${SOURCE}..${TARGET}`])
if (srcMerged.ok && Number(srcMerged.out) !== 0) {
  postErrors.push(`Còn ${srcMerged.out} commit của nguồn '${SOURCE}' chưa vào '${TARGET}' — kiểm tra lại`)
}
const wt2 = checkWorkingTreeClean(repoPath)
if (!wt2.clean) {
  postErrors.push(`Working tree KHÔNG sạch sau merge (${wt2.dirty.length} tracked thay đổi)`)
}
if (postErrors.length) {
  result.errors.push(...postErrors)
  console.log(JSON.stringify(result, null, 2))
  process.exit(1)
}

// Quay về branch gốc nếu khác TARGET (tránh repo mắc kẹt ở branch merge)
if (origBranch && origBranch !== TARGET) {
  const back = gitSafe(repoPath, ['switch', origBranch])
  if (back.ok) result.warnings.push(`Đã quay về branch gốc '${origBranch}'`)
  else result.warnings.push(`Không quay về được branch gốc '${origBranch}' (đang ở '${TARGET}') — chạy thủ công: git switch ${origBranch}`)
}
result.ok = true
console.log(JSON.stringify(result, null, 2))
process.exit(0)
} // end run()
