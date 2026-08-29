// ============================================================
// main-merge-lib.cjs — Thư viện dùng chung (main) cho bộ script merge an toàn
// ============================================================
// 🎯 Phục vụ skill: merge-code-from-devs (Bộ script merge an toàn)
// - resolve repo path từ alias portal (PORTAL_MAP cố định)
// - chạy lệnh git AN TOÀN bằng execFileSync với cwd chỉ định
//   (KHÔNG phụ thuộc CWD terminal — tránh lệnh chạy nhầm repo)
// - kiểm tra show-toplevel khớp, working tree sạch, branch tồn tại
// 🛡️ KHÔNG chứa lệnh xóa/reset commit (git reset, branch -D, push --force, clean)
// ============================================================
const { execFileSync } = require('child_process')
const fs = require('fs')
const p = require('path')

/** Thư mục gốc workspace (có thể ghi đè qua env JDX_ROOT) */
const ROOT = process.env.JDX_ROOT || 'D:\\JDX-SOUCRE-MAIN-FE-PORTAL\\Jdx-portal-root'

/**
 * Bản đồ alias portal → thư mục repo (relative so với ROOT)
 * ⚠️ Merge portal app → repo CHỈ nằm trong src/modules/<App>
 */
const PORTAL_MAP = {
  root: '.',
  docker: 'Docker',
  agentskill: '.github',
  invoice: 'src/modules/InvoiceApp',
  invoiceapp: 'src/modules/InvoiceApp',
  admin: 'src/modules/AdminApp',
  adminapp: 'src/modules/AdminApp',
  partner: 'src/modules/PartnerApp',
  partnerapp: 'src/modules/PartnerApp',
  sso: 'src/modules/SsoApp',
  ssoapp: 'src/modules/SsoApp',
  ketoan: 'src/modules/KetoanApp',
  ketoanapp: 'src/modules/KetoanApp',
  accounting: 'src/modules/KetoanApp',
  crm: 'src/modules/CrmApp',
  crmapp: 'src/modules/CrmApp',
  taisan: 'src/modules/TaiSanApp',
  taisanapp: 'src/modules/TaiSanApp',
  kiemthu: 'src/modules/KiemThuApp',
  kiemthuapp: 'src/modules/KiemThuApp',
  baseindex: 'src/modules/BaseIndexApp',
  baseindexapp: 'src/modules/BaseIndexApp',
}

/**
 * 🚫 REPO CẤM MERGE — merge từ dev branch CHỈ được tác động vào repo PORTAL
 * (nằm trong src/modules/<App>). CẤM TUYỆT ĐỐI merge vào:
 *   - root    (D:\JDX-SOUCRE-MAIN-FE-PORTAL\Jdx-portal-root)
 *   - docker  (D:\JDX-SOUCRE-MAIN-FE-PORTAL\Jdx-portal-root\Docker)
 *   - agentskill (.github)
 * Lý do: các repo này quản lý cấu hình/deploy/skill toàn cục — merge sai sẽ
 * lan tác động hoặc xóa file nested repos (sự cố 09/08 + 13/08/2026).
 */
const FORBIDDEN_MERGE_ALIASES = new Set(['root', 'docker', 'agentskill'])

/** Danh sách alias portal app HỢP LỆ để merge (dùng cho prompt --portal) */
const PORTAL_APP_ALIASES = Object.keys(PORTAL_MAP).filter(a => !FORBIDDEN_MERGE_ALIASES.has(a))

/**
 * 🎯 Bản đồ alias → chuỗi remote repo MONG ĐỢI (substring trong origin URL)
 * Lớp bảo vệ chống "clone nhầm repo": nếu thư mục src/modules/<App> bị thay
 * bằng clone của repo KHÁC (vd vô tình clone jdx-portal-root vào KiemThuApp),
 * show-toplevel vẫn khớp nhưng merge sẽ tác động nhầm repo → BLOCK.
 * CHỈ áp dụng cho alias portal app (root/docker/agentskill đã bị chặn trước).
 */
const EXPECTED_REMOTE = {
  invoice: 'jdx-portal-invoice',
  invoiceapp: 'jdx-portal-invoice',
  admin: 'jdx-portal-admin',
  adminapp: 'jdx-portal-admin',
  partner: 'jdx-portal-partner',
  partnerapp: 'jdx-portal-partner',
  sso: 'jdx-portal-sso',
  ssoapp: 'jdx-portal-sso',
  ketoan: 'jdx-portal-accounting',
  ketoanapp: 'jdx-portal-accounting',
  accounting: 'jdx-portal-accounting',
  crm: 'jdx-portal-crm',
  crmapp: 'jdx-portal-crm',
  taisan: 'jdx-portal-taisan',
  taisanapp: 'jdx-portal-taisan',
  kiemthu: 'jdx-portal-kiemthu',
  kiemthuapp: 'jdx-portal-kiemthu',
  baseindex: 'jdx-portal-baseindex',
  baseindexapp: 'jdx-portal-baseindex',
}

/**
 * Resolve repo path từ alias portal KÈM KIỂM TRA PHẠM VI
 * - Chỉ cho phép merge vào repo PORTAL app (src/modules/<App>)
 * - Chặn: root / docker / agentskill (trả error)
 * @param {string} portalAlias
 * @returns {{ repoPath?: string, error?: string }}
 */
function resolveMergeRepoPath(portalAlias) {
  const alias = (portalAlias || '').trim().toLowerCase()
  // 1. Chặn repo cấm merge ngay từ alias
  if (FORBIDDEN_MERGE_ALIASES.has(alias)) {
    return { error: `🚫 CẤM MERGE vào repo '${alias}' (${PORTAL_MAP[alias]}). Chỉ được merge vào repo PORTAL app (src/modules/<App>). Hợp lệ: ${PORTAL_APP_ALIASES.join(', ')}` }
  }
  const resolved = resolveRepoPath(alias)
  if (resolved.error) return resolved
  // 2. Chặn an toàn kép: repo path phải nằm trong src/modules/<App>
  const full = p.resolve(resolved.repoPath)
  const modulesDir = p.resolve(ROOT, 'src', 'modules')
  if (!full.toLowerCase().startsWith(modulesDir.toLowerCase() + p.sep)) {
    return { error: `🚫 CẤM MERGE: repo '${full}' nằm NGOÀI vùng cho phép (${modulesDir}). Chỉ được merge vào repo PORTAL app trong src/modules/` }
  }
  return { repoPath: full }
}

/** Timestamp backup: YYYYMMDD-HHMMSS */
function timestamp() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

/**
 * Resolve repo path từ alias portal
 * @returns {{ repoPath?: string, error?: string }}
 */
function resolveRepoPath(portalAlias) {
  const alias = (portalAlias || '').trim().toLowerCase()
  // 🚫 Chặn repo cấm NGAY tại hàm cơ sở (phòng hờ script khác import resolveRepoPath trực tiếp — defense in depth)
  if (FORBIDDEN_MERGE_ALIASES.has(alias)) {
    return { error: `🚫 CẤM thao tác repo '${alias}' (${PORTAL_MAP[alias]}). Chỉ được phép repo PORTAL app (src/modules/<App>). Hợp lệ: ${PORTAL_APP_ALIASES.join(', ')}` }
  }
  const rel = PORTAL_MAP[alias]
  if (!rel) {
    return { error: `Portal không hợp lệ: '${portalAlias}'. Hợp lệ: ${PORTAL_APP_ALIASES.join(', ')}` }
  }
  const full = p.resolve(ROOT, rel)
  if (!fs.existsSync(full)) return { error: `Thư mục repo không tồn tại: ${full}` }
  if (!fs.existsSync(p.join(full, '.git'))) return { error: `Không phải git repo (thiếu .git): ${full}` }
  return { repoPath: full }
}

/**
 * Chạy lệnh git an toàn — execFileSync KHÔNG qua shell → không lỗi quoting,
 * luôn chạy với cwd = repoPath (không phụ thuộc CWD terminal)
 * @throws nếu git fail
 */
function git(repoPath, args) {
  const out = execFileSync('git', args, {
    cwd: repoPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return (out || '').trim()
}

/** git an toàn — trả về { ok, out } hoặc { ok: false, err } */
function gitSafe(repoPath, args) {
  try {
    return { ok: true, out: git(repoPath, args) }
  } catch (e) {
    const err = String((e.stderr || e.message) || '').trim()
    return { ok: false, err }
  }
}

/** Lấy origin URL của repo (null nếu không đọc được) */
function getOriginUrl(repoPath) {
  const r = gitSafe(repoPath, ['remote', 'get-url', 'origin'])
  return r.ok ? r.out : null
}

/**
 * 🔍 Kiểm tra remote URL KHỚP repo mong đợi của alias portal
 * Chống "clone nhầm repo": merge CHỈ được thực hiện trên đúng repo portal.
 * @param {string} repoPath
 * @param {string} portalAlias Alias đã qua resolveMergeRepoPath (portal app)
 * @returns {{ ok: boolean, match: boolean, actual?: string|null, expected?: string, reason: string }}
 */
function checkRemoteMatch(repoPath, portalAlias) {
  // Chuẩn hóa alias (trim + lowercase) — chống bỏ qua kiểm tra khi user gõ 'KiemThu'/'KIEMTHU'
  const alias = (portalAlias || '').trim().toLowerCase()
  const expected = EXPECTED_REMOTE[alias]
  if (!expected) return { ok: true, match: true, reason: 'Không có remote mong đợi cho alias này — bỏ qua kiểm tra' }
  const url = getOriginUrl(repoPath)
  if (!url) return { ok: false, match: false, actual: null, expected, reason: `Không đọc được origin URL của repo '${repoPath}' — không thể xác nhận đúng repo` }
  const match = url.toLowerCase().includes(expected.toLowerCase())
  return {
    ok: match,
    match,
    actual: url,
    expected,
    reason: match
      ? ''
      : `🚫 SAI REPO (remote): origin = '${url}' KHÔNG chứa '${expected}' — thư mục '${repoPath}' có thể bị clone nhầm repo. DỪNG, không merge.`,
  }
}

/**
 * Kiểm tra git repo tại repoPath có phải là repo "gốc thật" không
 * (show-toplevel phải khớp repoPath — tránh CWD/alias sai)
 * @returns {{ top?: string, expect?: string, match: boolean }}
 */
function checkTopLevel(repoPath) {
  const r = gitSafe(repoPath, ['rev-parse', '--show-toplevel'])
  if (!r.ok) return { match: false, err: r.err }
  const top = p.resolve(r.out)
  const expect = p.resolve(repoPath)
  const match = top.toLowerCase() === expect.toLowerCase()
  return { top, expect, match }
}

/**
 * Working tree có sạch không (bỏ qua untracked ??)
 * @returns {{ clean: boolean, dirty: string[] }}
 */
function checkWorkingTreeClean(repoPath) {
  const r = gitSafe(repoPath, ['status', '--porcelain'])
  if (!r.ok) return { clean: false, dirty: [`Lỗi đọc status: ${r.err}`] }
  const dirty = r.out.split('\n').filter(l => l.trim() && !l.startsWith('??'))
  return { clean: dirty.length === 0, dirty }
}

/** Branch hiện tại */
function currentBranch(repoPath) {
  const r = gitSafe(repoPath, ['rev-parse', '--abbrev-ref', 'HEAD'])
  return r.ok ? r.out : null
}

/**
 * Branch có tồn tại không (local hoặc remote origin/)
 * @returns {{ local: boolean, remote: boolean }}
 */
function branchExists(repoPath, branch) {
  const r = gitSafe(repoPath, ['rev-parse', '--verify', '--quiet', branch])
  const remote = gitSafe(repoPath, ['rev-parse', '--verify', '--quiet', `origin/${branch}`])
  return { local: r.ok, remote: remote.ok }
}

/**
 * ⚠️ ĐỒNG BỘ local branches từ origin — CHỐNG LOCAL STALE (sự cố 18/08/2026)
 * Vấn đề: script fetch origin (cập nhật origin/*) nhưng diff/merge dùng local branch refs
 * (vd development-tuan). Local branch KHÔNG tự cập nhật theo fetch → nếu local stale,
 * pre-check báo SAI "THIẾU commit" / "0 commit mới" (đã xảy ra khi merge KetoanApp).
 * Hàm này chạy `git fetch origin <b>:<b>` — cập nhật ref local branch = origin (fast-forward,
 * KHÔNG đổi working tree, KHÔNG reset commit local).
 * - Branch đang checkout → bỏ qua (git không cho fetch vào branch checked out)
 * - Không có origin/<b> (branch chỉ local) → bỏ qua
 * - Local diverged (có commit riêng) → fetch fail → báo lỗi (script sẽ warning, tiếp tục với local hiện có)
 * @param {string} repoPath
 * @param {string[]} branches
 * @returns {{ ok: boolean, updated: string[], upToDate: string[], skipped: string[], errors: string[] }}
 */
function syncLocalBranches(repoPath, branches) {
  const updated = []
  const upToDate = []
  const skipped = []
  const errors = []
  const cur = currentBranch(repoPath)
  for (const b of branches) {
    if (cur === b) { skipped.push(`${b} (đang checkout)`); continue }
    const before = gitSafe(repoPath, ['rev-parse', '--verify', '--quiet', `${b}^{commit}`])
    const r = gitSafe(repoPath, ['fetch', 'origin', `${b}:${b}`])
    if (r.ok) {
      const after = gitSafe(repoPath, ['rev-parse', '--verify', '--quiet', `${b}^{commit}`])
      if (before.ok && after.ok && before.out !== after.out) updated.push(b)
      else upToDate.push(b)
    } else {
      // Phân biệt: không có origin/<b> (chỉ local) vs diverged (local có commit riêng)
      if (!branchExists(repoPath, b).remote) skipped.push(`${b} (chỉ local, không có origin)`)
      else errors.push(`Không đồng bộ được local '${b}' từ origin (có thể diverged — local có commit riêng): ${r.err}`)
    }
  }
  return { ok: errors.length === 0, updated, upToDate, skipped, errors }
}

/**
 * Đảm bảo có nhánh backup cho branch (IDEMPOTENT — tránh tạo backup lặp)
 *
 * ⚠️ Vấn đề cũ: mỗi lần chạy script tạo backup mới với timestamp → script chạy
 *    nhiều lần (retry/lỗi/merge lại) tạo ra NHIỀU backup trùng, rác.
 *
 * ✅ Cơ chế mới: chỉ tạo backup MỚI nếu CHƯA có backup nào trỏ đúng commit
 *    hiện tại của branch. Nếu đã có (cùng commit) → dùng lại, không tạo mới.
 *    - Merge abort / thất bại → branch không đổi commit → lần chạy sau dùng lại backup cũ.
 *    - Merge thành công rồi merge tiếp branch khác → commit đổi → tạo backup mới (hợp lệ).
 *
 * @param {string} repoPath Thư mục repo
 * @param {string} fromRef  Branch cần backup (vd 'development-tuan' hoặc 'development')
 * @param {string} ts       Timestamp (chỉ dùng khi cần tạo mới)
 * @returns {{ ok: boolean, name: string, reused: boolean, err?: string }}
 */
function ensureBackup(repoPath, fromRef, ts) {
  const base = fromRef.replace(/^origin\//, '')
  // 1. Commit hiện tại của branch (thứ cần backup)
  const cur = gitSafe(repoPath, ['rev-parse', '--verify', '--quiet', `${fromRef}^{commit}`])
  if (!cur.ok) return { ok: false, name: '', reused: false, err: `Không lấy được commit của '${fromRef}'` }

  // 2. Liệt kê mọi backup đã có của branch này
  const list = gitSafe(repoPath, ['branch', '--list', `backup/${base}-*`, '--format', '%(refname:short)'])
  if (list.ok) {
    for (const name of list.out.split('\n').filter(Boolean)) {
      const b = gitSafe(repoPath, ['rev-parse', '--verify', '--quiet', `${name}^{commit}`])
      if (b.ok && b.out === cur.out) {
        // ✅ Đã có backup trỏ đúng commit hiện tại → dùng lại, KHÔNG tạo mới
        return { ok: true, name, reused: true }
      }
    }
  }

  // 3. Chưa có → tạo backup mới
  const name = `backup/${base}-${ts}`
  const exists = gitSafe(repoPath, ['rev-parse', '--verify', '--quiet', name])
  if (exists.ok) return { ok: false, name, reused: false, err: `Nhánh backup '${name}' vừa được tạo — chạy lại sau 1 giây` }
  const r = gitSafe(repoPath, ['branch', name, fromRef])
  if (!r.ok) return { ok: false, name, reused: false, err: r.err }
  return { ok: true, name, reused: false }
}

/**
 * Hỏi user nhập giá trị tham số bắt buộc (tương tác qua stdin)
 * - Nếu stdin là TTY (user gõ trực tiếp) → hiển thị prompt, chờ nhập
 * - Nếu không phải TTY (agent/pipe chạy) → báo lỗi yêu cầu truyền tham số, exit 1
 * @param {string} paramName   Tên tham số dòng lệnh (vd '--portal')
 * @param {string} displayName Tên hiển thị tiếng Việt (vd 'Portal (repo cần merge)')
 * @param {string[]} [choices] Danh sách giá trị hợp lệ (hiển thị để user chọn)
 * @param {string} [defaultVal] Giá trị mặc định (nếu Enter trống)
 * @returns {Promise<string>} Giá trị user nhập
 */
function promptRequired(paramName, displayName, choices, defaultVal) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {
      reject(new Error(
        `Thiếu tham số ${paramName} (${displayName}). ` +
        `Không phải terminal tương tác — hãy truyền đầy đủ tham số khi gọi script.\n` +
        `Danh sách hợp lệ (${paramName}): ${(choices || []).join(', ') || 'xem SKILL.md'}`
      ))
      return
    }
    const readline = require('readline')
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const hint = defaultVal ? ` (mặc định: ${defaultVal})` : ''
    let question = `Nhập ${displayName}${hint}:\n`
    if (choices && choices.length) {
      question += `  Hợp lệ: ${choices.join(', ')}\n`
    }
    question += '> '
    rl.question(question, answer => {
      rl.close()
      const val = (answer || '').trim() || defaultVal || ''
      if (!val) {
        reject(new Error(`Thiếu ${displayName} — bắt buộc nhập.`))
        return
      }
      resolve(val)
    })
  })
}

/**
 * Kiểm tra nhánh ĐÍCH hợp lệ (chống merge vào main/master / branch lạ / merge chính nó)
 * @returns {string[]} Danh sách lỗi (rỗng = hợp lệ)
 */
function validateTargetBranch(TARGET, SOURCE) {
  const errors = []
  if (TARGET === SOURCE) errors.push(`Nhánh đích '${TARGET}' TRÙNG nhánh nguồn — không thể merge chính nó`)
  if (TARGET === 'main' || TARGET === 'master') errors.push(`🚫 CẤM merge vào nhánh '${TARGET}' (main/master) — chỉ merge vào development*`)
  if (!/^development/.test(TARGET)) errors.push(`Nhánh đích '${TARGET}' phải bắt đầu bằng 'development' (chỉ merge vào development*)`)
  return errors
}

/**
 * Kiểm tra nhánh NGUỒN hợp lệ
 * - Chống dùng main/master làm nguồn
 * - Chống dùng 'development' (nhánh chính) làm nguồn — chỉ merge từ nhánh cá nhân
 * - Chống dùng branch lạ (feature/xyz, hotfix/...) — chỉ merge từ development-<tên>
 * @returns {{ errors: string[], warnings: string[] }} errors = chặn cứng; warnings = báo nhưng không chặn
 */
function validateSourceBranch(SOURCE) {
  const errors = []
  const warnings = []
  if (SOURCE === 'main' || SOURCE === 'master') errors.push(`🚫 CẤM dùng nhánh '${SOURCE}' làm nhánh nguồn merge`)
  if (SOURCE === 'development') errors.push(`🚫 CẤM dùng nhánh 'development' làm nhánh nguồn — nguồn phải là nhánh cá nhân development-<tên>`)
  if (!/^development-/.test(SOURCE)) errors.push(`Nhánh nguồn '${SOURCE}' phải bắt đầu bằng 'development-' (vd development-tuan) — chỉ merge từ nhánh dev của repo portal`)
  return { errors, warnings }
}

module.exports = {
  ROOT,
  PORTAL_MAP,
  FORBIDDEN_MERGE_ALIASES,
  PORTAL_APP_ALIASES,
  EXPECTED_REMOTE,
  timestamp,
  resolveRepoPath,
  resolveMergeRepoPath,
  git,
  gitSafe,
  getOriginUrl,
  checkRemoteMatch,
  checkTopLevel,
  checkWorkingTreeClean,
  currentBranch,
  branchExists,
  syncLocalBranches,
  ensureBackup,
  validateTargetBranch,
  validateSourceBranch,
  promptRequired,
}
