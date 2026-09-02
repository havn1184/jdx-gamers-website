// ============================================================
// main-merge.cjs — SCRIPT ĐIỀU PHỐI (entry point) — 1 lệnh hoàn thành toàn bộ merge
// ============================================================
// 🎯 Phục vụ skill: merge-code-from-devs (Bộ script merge an toàn)
// Gọi 1 lệnh này để tự động chạy ĐỦ quy trình:
//   [B1] pre-check   → kiểm tra trước (lỗi chặn → dừng ngay)
//   [B2] confirm     → in kết quả; cần --yes (hoặc agent hỏi user) để tiếp tục
//   [B3] merge-safe  → fetch + backup 2 bên + switch + merge --no-ff
//   [B4] post-check  → xác nhận merge thành công, không mất code
// 🛡️ TUYỆT ĐỐI KHÔNG chứa: git reset / branch -D / push --force / clean / rm
// 💡 Cách dùng:
//   node main-merge.cjs --portal <alias> --branch <nguồn> [--target development] [--yes] [--push]
//   - Không --yes: chỉ chạy pre-check rồi DỪNG (exit 2) để agent báo cáo + chờ user duyệt
//   - --yes: chạy trọn 4 bước (dùng khi user đã duyệt từ kết quả pre-check trước đó)
// ============================================================
const { resolveMergeRepoPath, checkTopLevel, checkWorkingTreeClean, branchExists, syncLocalBranches, gitSafe, timestamp, ensureBackup, promptRequired, PORTAL_APP_ALIASES, validateTargetBranch, validateSourceBranch, currentBranch, checkRemoteMatch } = require('./main-merge-lib.cjs')

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

  await main(PORTAL, SOURCE, TARGET, YES, PUSH)
})().catch(e => {
  console.error(`\n❌ ${e.message}`)
  process.exit(1)
})

async function main(PORTAL, SOURCE, TARGET, YES, PUSH) {
const result = {
  ok: false,
  portal: PORTAL,
  repoPath: null,
  sourceBranch: SOURCE,
  targetBranch: TARGET,
  phase: 'init',
  topLevelMatch: null,
  remoteMatch: null,
  workingTreeClean: null,
  backupsCreated: [],
  mergeCommit: null,
  pushed: false,
  errors: [],
  warnings: [],
}

let origBranch = null // Branch hiện tại trước khi chạy — để khôi phục khi fail
function fail(msg, exitCode = 1) {
  result.errors.push(msg)
  // Quay về branch gốc nếu đã lưu (tránh repo mắc kẹt ở branch khác)
  if (origBranch && result.repoPath) gitSafe(result.repoPath, ['switch', origBranch])
  console.log(JSON.stringify(result, null, 2))
  process.exit(exitCode)
}

// ============================================================
// [B1] PRE-CHECK — mọi lỗi chặn → DỪNG ngay, không merge
// ============================================================
result.phase = 'pre-check'
// Resolve repo KÈM kiểm tra phạm vi (chặn root/docker/agentskill)
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

// Fetch TRƯỚC để diff dựa refs mới nhất (fetch không đổi working tree — an toàn)
const fetch = gitSafe(repoPath, ['fetch', 'origin'])
if (!fetch.ok) result.warnings.push(`git fetch origin lỗi: ${fetch.err} — tiếp tục với dữ liệu local hiện có`)

const wt = checkWorkingTreeClean(repoPath)
result.workingTreeClean = wt.clean
if (!wt.clean) fail(`Working tree KHÔNG sạch (${wt.dirty.length} tracked thay đổi). Ví dụ: ${wt.dirty.slice(0, 3).join('; ')}`)

const src = branchExists(repoPath, SOURCE)
if (!src.local && !src.remote) fail(`Branch nguồn '${SOURCE}' không tồn tại (local lẫn origin/)`)
if (!branchExists(repoPath, TARGET).local) fail(`Branch đích '${TARGET}' không tồn tại local`)

// ⚠️ ĐỒNG BỘ local branch từ origin — chống local stale (sự cố 18/08/2026: script báo THIẾU commit/0 commit mới do local branch cũ)
const sync = syncLocalBranches(repoPath, [SOURCE, TARGET])
if (sync.updated.length) result.warnings.push(`Đã đồng bộ local branch từ origin (mới nhất): ${sync.updated.join(', ')}`)
for (const e of sync.errors) result.warnings.push(`⚠️ ${e}`)

// Chống mất code: nguồn không được XÓA file đang có ở đích
const d = gitSafe(repoPath, ['diff', `${TARGET}..${SOURCE}`, '--name-status'])
if (d.ok) {
  const deleted = d.out.split('\n').filter(l => l.startsWith('D\t'))
  if (deleted.length > 0) fail(`BLOCK: nhánh nguồn XÓA ${deleted.length} file đang có ở đích. File đầu: ${deleted.slice(0, 3).join('; ')}`)
}
const nNew = gitSafe(repoPath, ['rev-list', '--count', `${TARGET}..${SOURCE}`])
if (nNew.ok) result.commitsNew = Number(nNew.out) || 0
if (result.commitsNew === 0) {
  result.warnings.push(`Nhánh nguồn '${SOURCE}' KHÔNG có commit mới so với '${TARGET}' — merge sẽ tạo commit rỗng. Kiểm tra lại nhánh trước khi merge.`)
}
const nBehind = gitSafe(repoPath, ['rev-list', '--count', `${SOURCE}..${TARGET}`])
if (nBehind.ok && Number(nBehind.out) > 0) {
  fail(`BLOCK: nhánh nguồn '${SOURCE}' THIẾU ${nBehind.out} commit của nhánh đích '${TARGET}'. BẮT BUỘC cập nhật nhánh nguồn trước (merge '${TARGET}' vào '${SOURCE}' rồi push) — nếu merge bây giờ sẽ mất code của '${TARGET}'.`)
}

console.log(`\n[PRE-CHECK] ${result.errors.length ? 'FAIL' : 'PASS'} — repo: ${repoPath}`)
console.log(`  - show-toplevel khớp: ${result.topLevelMatch}`)
console.log(`  - working tree sạch: ${result.workingTreeClean}`)
console.log(`  - commits mới sẽ merge: ${result.commitsNew ?? 0}`)
if (result.warnings.length) console.log(`  ⚠️ WARN: ${result.warnings.join(' | ')}`)

// Không --yes → DỪNG sau pre-check (exit 2) — agent báo cáo, chờ user duyệt
if (!YES) {
  result.phase = 'waiting-confirm'
  result.ok = true
  console.log('\n[CẦN DUYỆT] Chạy lại với --yes để thực hiện merge (sau khi user xác nhận).')
  console.log(JSON.stringify(result, null, 2))
  process.exit(2)
}

// ============================================================
// [B3] MERGE-SAFE — backup 2 bên + merge --no-ff
// ============================================================
result.phase = 'merge'
// Đảm bảo branch nguồn local
if (!src.local && src.remote) {
  const mk = gitSafe(repoPath, ['branch', SOURCE, `origin/${SOURCE}`])
  if (!mk.ok) fail(`Không tạo được branch local '${SOURCE}' từ origin: ${mk.err}`)
}

// ĐẢM BẢO BACKUP 2 BÊN (idempotent — chỉ tạo mới nếu chưa có backup cùng commit)
const ts = timestamp()
const bSrc = ensureBackup(repoPath, SOURCE, ts)
if (!bSrc.ok) fail(`Không đảm bảo được backup nguồn: ${bSrc.err}`)
result.backupsCreated.push(bSrc.name)
if (bSrc.reused) result.warnings.push(`Backup nguồn đã có sẵn (cùng commit) — dùng lại '${bSrc.name}', không tạo mới`)
const bDst = ensureBackup(repoPath, TARGET, ts)
if (!bDst.ok) fail(`Không đảm bảo được backup đích: ${bDst.err}`)
result.backupsCreated.push(bDst.name)
if (bDst.reused) result.warnings.push(`Backup đích đã có sẵn (cùng commit) — dùng lại '${bDst.name}', không tạo mới`)
console.log(`\n[BACKUP] ${result.backupsCreated.join(', ')}`)

// Switch sang đích
const sw = gitSafe(repoPath, ['switch', TARGET])
if (!sw.ok) fail(`Không switch được sang '${TARGET}': ${sw.err}`)

// Merge --no-ff (conflict → abort, KHÔNG resolve)
const mg = gitSafe(repoPath, ['merge', SOURCE, '--no-ff', '--no-edit'])
if (!mg.ok) {
  gitSafe(repoPath, ['merge', '--abort'])
  fail(`Merge conflict/lỗi: ${mg.err}. Đã git merge --abort — working tree nguyên trạng. Backup: ${result.backupsCreated.join(', ')}`)
}
const head = gitSafe(repoPath, ['rev-parse', '--short', 'HEAD'])
result.mergeCommit = head.ok ? head.out : null
console.log(`\n[MERGE] ✅ commit ${result.mergeCommit}`)

// Push (tùy chọn)
if (PUSH) {
  const ps = gitSafe(repoPath, ['push', 'origin', TARGET])
  if (!ps.ok) {
    result.warnings.push(`Push lỗi: ${ps.err} — merge local đã thành công, chạy thủ công: git push origin ${TARGET}`)
  } else {
    result.pushed = true
    console.log(`[PUSH] ✅ origin/${TARGET}`)
  }
}

// ============================================================
// [B4] POST-CHECK — xác nhận thành công, không mất code
// ============================================================
result.phase = 'post-check'
const cb = gitSafe(repoPath, ['rev-parse', '--abbrev-ref', 'HEAD'])
if (cb.ok && cb.out !== TARGET) result.errors.push(`Đang ở branch '${cb.out}' — phải ở '${TARGET}' sau merge`)
const wt2 = checkWorkingTreeClean(repoPath)
if (!wt2.clean) result.errors.push(`Working tree KHÔNG sạch sau merge (${wt2.dirty.length} tracked thay đổi)`)
const bk = gitSafe(repoPath, ['branch', '--list', 'backup/*'])
if (bk.ok) result.backups = bk.out.split('\n').filter(Boolean)
const srcMerged = gitSafe(repoPath, ['rev-list', '--count', `${TARGET}..${SOURCE}`])
// Lưu ý: phải đếm TARGET..SOURCE (commit của NGUỒN chưa có trong ĐÍCH) = 0.
// KHÔNG dùng SOURCE..TARGET — sau merge --no-ff nó luôn ≥ 1 vì đếm cả merge commit mới tạo (giả FAIL).
if (srcMerged.ok && Number(srcMerged.out) !== 0) result.errors.push(`Còn ${srcMerged.out} commit của nguồn '${SOURCE}' chưa vào đích '${TARGET}'`)

result.ok = result.errors.length === 0
console.log(`\n[POST-CHECK] ${result.ok ? 'PASS' : 'FAIL'}`)
if (result.warnings.length) console.log(`  ⚠️ WARN: ${result.warnings.join(' | ')}`)
// Quay về branch gốc nếu khác TARGET (tránh repo mắc kẹt ở branch merge)
if (origBranch && origBranch !== TARGET) {
  const back = gitSafe(repoPath, ['switch', origBranch])
  if (back.ok) result.warnings.push(`Đã quay về branch gốc '${origBranch}'`)
  else result.warnings.push(`Không quay về được branch gốc '${origBranch}' (đang ở '${TARGET}') — chạy thủ công: git switch ${origBranch}`)
}
console.log(JSON.stringify(result, null, 2))
process.exit(result.ok ? 0 : 1)
} // end main()
