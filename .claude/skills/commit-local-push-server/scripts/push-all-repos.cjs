/**
 * Script: Commit & Push tự động cho kiến trúc NESTED REPOS (SASUCO InvoiceEasy).
 *
 * Phạm vi quét (tự phát hiện):
 *   - Repo ROOT      : <root>/
 *   - Repo .github   : <root>/.github      (branch development)
 *   - Repo Docker    : <root>/Docker       (branch master — NGOẠI LỆ)
 *   - Repo portal    : <root>/src/modules/<portal>  (mỗi module có .git riêng)
 *
 * Cách dùng (agent chỉ chạy script + kiểm tra kết quả):
 *   node push-all-repos.cjs                        # KHÔ — phát hiện thay đổi + đếm, KHÔNG thay đổi gì
 *   node push-all-repos.cjs --commit               # commit repo có thay đổi chưa commit (message mặc định)
 *   node push-all-repos.cjs --commit -m "msg"      # commit với message tùy chỉnh (<type>(<scope>): <mô tả>)
 *   node push-all-repos.cjs --push                 # pull --rebase + push các repo ĐỦ ngưỡng
 *   node push-all-repos.cjs --push --force         # push LUÔN không cần đủ ngưỡng (alias: -f / -F / push luôn)
 *   node push-all-repos.cjs --target <tên>         # chỉ xử lý repo khớp tên (all | jpayapp | invoiceapp,ketoanapp)
 *   node push-all-repos.cjs --root <path>          # chỉ định ROOT (mặc định: tự suy từ vị trí script)
 *
 * TARGET (--target / -t / positional):
 *   all (mặc định) -> toàn bộ 14 repo
 *   jpayapp        -> chỉ portal JpayApp
 *   invoiceapp,ketoanapp -> nhiều portal
 *   .github / Docker / root cũng lọc được theo tên
 *
 * Luồng khuyến nghị (skill commit-local-push-server):
 *   B1 — Chạy KHÔ  -> phát hiện thay đổi chưa commit + đếm commit
 *   B2 — Agent chạy `get_errors` trên các file script liệt kê để kiểm tra lỗi nhanh
 *   B3 — Không lỗi -> chạy `--commit` để commit
 *   B4 — Chạy `--push` (đủ ngưỡng) hoặc `--push --force` (push luôn, không cần ngưỡng)
 *
 * Cờ force (bỏ qua ngưỡng): -f | -F | --force | --push-luon | --push-ngay | --push-now
 *
 * Ngưỡng push (khi KHÔNG có cờ force):
 *   ROOT  | >= 5
 *   Còn lại (portal/.github/Docker) | >= 3
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ROOT mặc định = 4 cấp lên từ scripts/ (scripts -> commit-local-push-server -> skills -> .github -> root)
const DEFAULT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

// Đọc tham số dòng lệnh
const args = process.argv.slice(2);

// Parse --root <path> (nếu không chỉ định -> undefined -> dùng DEFAULT_ROOT)
let CLI_ROOT;
const rootIdx = args.indexOf('--root');
if (rootIdx !== -1 && rootIdx + 1 < args.length) {
  CLI_ROOT = args[rootIdx + 1];
}
const ROOT = CLI_ROOT ? path.resolve(CLI_ROOT) : DEFAULT_ROOT;

const DO_PUSH = args.includes('--push');
const DO_COMMIT = args.includes('--commit');

// Cờ FORCE (bỏ qua ngưỡng push) — hỗ trợ nhiều alias, kể cả "push luôn"/"push ngay"
const FORCE_FLAGS = new Set(['-f', '-F', '--force', '--push-luon', '--push-ngay', '--push-now']);
const DO_FORCE = args.some(a => FORCE_FLAGS.has(a));

// ===== TARGET: lọc repo cần xử lý =====
//   - all (mặc định)           -> toàn bộ 14 repo
//   - tên portal (jpayapp, invoiceapp, ...) -> chỉ repo đó
//   - ghép nhiều tên (a,b,c)   -> các repo đó, hoặc positional `jpayapp invoiceapp`
//   VD: --target jpayapp | --target invoiceapp,ketoanapp | node script jpayapp
let CLI_TARGETS = null;
const targetIdx = args.indexOf('--target');
if (targetIdx !== -1 && targetIdx + 1 < args.length) {
  CLI_TARGETS = args[targetIdx + 1];
} else if (args.indexOf('-t') !== -1 && args.indexOf('-t') + 1 < args.length) {
  CLI_TARGETS = args[args.indexOf('-t') + 1];
}
// Positional: các token không bắt đầu bằng '--'/'-' và không phải giá trị của flag nào
const KNOWN_FLAGS = new Set(['-m', '--message', '--root', '--target', '-t', '--commit', '--push', '-f', '-F', '--force', '--push-luon', '--push-ngay', '--push-now']);
const VALUE_FLAGS = new Set(['-m', '--message', '--root', '--target', '-t']); // flag có giá trị theo sau
const positional = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a.startsWith('-') || KNOWN_FLAGS.has(a)) continue;
  // Bỏ qua nếu token này là giá trị của 1 flag phía trước (vd: "feat(...)" sau -m)
  if (VALUE_FLAGS.has(args[i - 1])) continue;
  positional.push(a);
}
if (!CLI_TARGETS && positional.length > 0) CLI_TARGETS = positional.join(',');

// Chuẩn hóa danh sách target (không phân biệt hoa thường)
let TARGETS = ['all'];
if (CLI_TARGETS && CLI_TARGETS.toLowerCase() !== 'all') {
  TARGETS = CLI_TARGETS.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
}

// Message commit (nếu đã cung cấp)
let COMMIT_MESSAGE;
const msgIdx = args.indexOf('-m');
if (msgIdx === -1) {
  const mIdx = args.indexOf('--message');
  COMMIT_MESSAGE = mIdx !== -1 ? args[mIdx + 1] : undefined;
} else {
  COMMIT_MESSAGE = args[msgIdx + 1];
}

const MODULES_DIR = path.join(ROOT, 'src', 'modules');
const EXPECTED_BRANCH = 'development';
const DOCKER_DIR_NAME = 'Docker';
const DOCKER_BRANCH = 'master';

/** Chạy lệnh git trong 1 cwd, trả về stdout đã trim, hoặc null nếu lỗi. */
function git(cwd, ...args) {
  try {
    // execFileSync: truyền mảng args -> KHÔNG qua shell, tránh lỗi giải mã ký tự đặc biệt (&, (, )...)
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (e) {
    return null;
  }
}

/** Working tree có thay đổi chưa commit không. */
function hasChanges(cwd) {
  const out = git(cwd, 'status', '--porcelain');
  return out !== null && out.length > 0;
}

/** Nhánh hiện tại của repo. */
function currentBranch(repo) {
  return git(repo.path, 'rev-parse', '--abbrev-ref', 'HEAD') || '??';
}

/**
 * Lọc danh sách repo theo TARGETS.
 *   - ['all']                -> giữ toàn bộ
 *   - ['jpayapp']            -> chỉ repo có name chứa 'jpayapp'
 *   - ['jpayapp','crmapp']   -> các repo khớp
 * Tổng hợp 'name' + 'path' + 'isDocker' để đối chiếu (vd repo '.github', 'Docker').
 */
function filterByTarget(repos) {
  if (TARGETS.length === 1 && TARGETS[0] === 'all') return repos;
  return repos.filter(repo => {
    const haystack = `${repo.name} ${repo.path} ${repo.isDocker ? 'docker' : ''}`.toLowerCase();
    return TARGETS.some(t => haystack.includes(t));
  });
}

/** Kiểm tra branch có được phép hay không (dùng cho 1 branch cụ thể). */
function isBranchAllowedValue(branch, isDocker) {
  if (isDocker) return branch === DOCKER_BRANCH;
  return branch === EXPECTED_BRANCH || branch.startsWith(EXPECTED_BRANCH + '-');
}

/**
 * Kiểm tra repo có đang ở đúng nhánh so với nhánh chuẩn không.
 *   - Docker: chỉ cho phép 'master'
 *   - Tất cả khác: chỉ cho phép 'development' hoặc 'development-*'
 */
function isBranchAllowed(repo) {
  return isBranchAllowedValue(repo.branch, repo.isDocker);
}

/** Mô tả vấn đề branch (dùng trong cảnh báo). */
function describeBranchIssue(repo) {
  const b = repo.branch;
  const expected = expectedBranch(repo);
  if (b === 'main') return `đang ở 'main' — KHÔNG commit/push trực tiếp, cần checkout '${expected}'`;
  if (b === '??') return `không xác định được branch`;
  return `branch '${b}' khác '${expected}' — KHÔNG commit/push, cần checkout '${expected}'`;
}

/** Lấy danh sách file đã sửa (path) — dùng để agent chạy get_errors kiểm tra lỗi nhanh. */
function getChangedFiles(cwd) {
  const out = git(cwd, 'status', '--porcelain');
  if (out === null) return [];
  const files = [];
  for (const line of out.split(/\r?\n/)) {
    if (!line) continue;
    // Bỏ 3 ký tự trạng thái "?? ", " M ", "A  "... lấy phần path (có thể có "->" rename)
    let file = line.slice(3).trim();
    // File đổi tên dạng "old -> new" -> lấy phần new
    const arrow = file.indexOf('->');
    if (arrow !== -1) file = file.slice(arrow + 2).trim();
    if (file && !file.startsWith('"')) files.push(file);
  }
  return files;
}

/**
 * Commit toàn bộ thay đổi đang staged/untracked trong 1 repo.
 * CHỈ commit khi repo đang ở đúng nhánh (development / Docker master).
 * Nếu không có COMMIT_MESSAGE -> dùng mặc định. Trả về true nếu commit OK.
 */
function commitRepo(repo) {
  const cwd = repo.path;
  // ⛔ CHẶN: không commit trên nhánh sai (main / branch lạ) — tránh làm hỏng repo
  if (!isBranchAllowed(repo)) {
    console.log(`     ⛔ KHÔNG commit — repo đang ở branch '${repo.branch}', cần '${expectedBranch(repo)}'`);
    return 'blocked';
  }
  if (!hasChanges(cwd)) {
    console.log(`     (không có thay đổi — bỏ qua commit)`);
    return null; // không có gì để commit
  }

  // Stage toàn bộ (bao gồm untracked). KHÔNG dùng -A ở module có .git khác.
  if (git(cwd, 'add', '-A') === null) {
    console.log(`     ✖ git add -A FAILED`);
    return false;
  }

  // Nếu object-level không có gì thay đổi sau add -> bỏ qua
  const staged = git(cwd, 'diff', '--cached', '--name-only');
  if (!staged) {
    console.log(`     (không có thay đổi staged — bỏ qua commit)`);
    return null;
  }

  const msg = COMMIT_MESSAGE || `chore: cập nhật tự động qua script ` + new Date().toISOString().slice(0, 10);
  const res = git(cwd, 'commit', '-m', msg);
  if (res === null) {
    console.log(`     ✖ git commit FAILED (kiểm tra user.name / user.email)`);
    return false;
  }
  console.log(`     ✅ Đã commit: ${msg}`);
  return true;
}

/**
 * Khám phá danh sách repo.
 * Trả về mảng { path, name, isDocker, branch } .
 */
function discoverRepos() {
  const repos = [];

  const pushRepo = (p, name) => {
    if (fs.existsSync(path.join(p, '.git'))) {
      const isDocker = name === DOCKER_DIR_NAME;
      const branch = git(p, 'rev-parse', '--abbrev-ref', 'HEAD') || '??';
      repos.push({ path: p, name, isDocker, branch });
    }
  };

  // 1) Repo ROOT
  pushRepo(ROOT, path.basename(ROOT) + ' (root)');

  // 2) .github (repo độc lập)
  pushRepo(path.join(ROOT, '.github'), '.github');

  // 3) Docker (repo độc lập — branch master)
  pushRepo(path.join(ROOT, DOCKER_DIR_NAME), DOCKER_DIR_NAME);

  // 4) Các module portal trong src/modules
  if (fs.existsSync(MODULES_DIR)) {
    for (const name of fs.readdirSync(MODULES_DIR)) {
      const p = path.join(MODULES_DIR, name);
      if (fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, '.git'))) {
        pushRepo(p, name);
      }
    }
  }

  return repos;
}

/** Trả về nhánh chuẩn của 1 repo (development, riêng Docker là master). */
function expectedBranch(repo) {
  return repo.isDocker ? DOCKER_BRANCH : EXPECTED_BRANCH;
}

/** Đếm số commit chưa push (origin/<branch>..HEAD). */
function countUnpushed(repo, branch) {
  const out = git(repo.path, 'log', `origin/${branch}..HEAD`, '--oneline');
  if (out === null) return null;
  return out ? out.split(/\r?\n/).length : 0;
}

/**
 * Quyết định ngưỡng push:
 *   - ROOT (name chứa 'root')  -> 5
 *   - Còn lại                   -> 3
 */
function pushThreshold(repo) {
  return /root/i.test(repo.name) ? 5 : 3;
}

/** So sánh số commit chưa push với ngưỡng. */
function meetsThreshold(repo, unpushed) {
  return unpushed !== null && unpushed >= pushThreshold(repo);
}

/** Pull --rebase để đồng bộ code mới nhất từ origin/<branch>. */
function pullRebase(repo, branch) {
  return git(repo.path, 'pull', '--rebase', 'origin', branch) !== null;
}

/** Push lên origin/<branch>. */
function pushBranch(repo, branch) {
  return git(repo.path, 'push', 'origin', branch) !== null;
}

function main() {
  const repos = filterByTarget(discoverRepos());

  // Xác định chế độ hiển thị
  let modeLabel = 'KHÔ (phát hiện thay đổi + đếm)';
  if (DO_COMMIT) modeLabel = 'COMMIT (commit repo có thay đổi chưa commit)';
  if (DO_PUSH) modeLabel = 'PUSH (pull --rebase + push)';
  if (DO_PUSH && DO_FORCE) modeLabel = 'PUSH FORCE (không cần đủ ngưỡng)';

  // Target hiển thị
  const targetLabel = TARGETS.join(', ');

  console.log('================================================================');
  console.log('  COMMIT & PUSH ALL REPOS — SASUCO InvoiceEasy');
  console.log(`  Root    : ${ROOT}`);
  console.log(`  Target  : ${targetLabel}  |  Số repo khớp: ${repos.length}`);
  console.log(`  Branch  : '${EXPECTED_BRANCH}' (Docker: '${DOCKER_BRANCH}')`);
  console.log(`  Chế độ  : ${modeLabel}`);
  console.log('================================================================');
  console.log('');

  if (!fs.existsSync(path.join(ROOT, '.git'))) {
    console.log(`⚠️  Không tìm thấy root repo tại: ${ROOT}`);
    console.log('    Kiểm tra lại --root hoặc chạy từ đúng workspace.');
    process.exit(1);
  }

  const warnings = [];
  const toPush = [];
  const toCommit = [];

  for (const repo of repos) {
    const branch = repo.branch;
    const expected = expectedBranch(repo);
    const unpushed = countUnpushed(repo, expected);
    const dirty = hasChanges(repo.path);
    const changedFiles = getChangedFiles(repo.path);

    // B2 — kiểm tra branch
    const issues = [];
    const branchOk = isBranchAllowed(repo);
    if (!branchOk) {
      issues.push(describeBranchIssue(repo));
    }
    if (dirty) {
      issues.push(`thay đổi chưa commit (${changedFiles.length} file)`);
    }
    if (unpushed === null) {
      issues.push(`không đếm được commit (chưa fetch hoặc nhánh chưa track origin/${expected})`);
    }

    // B3 — đánh giá ngưỡng (bỏ qua ngưỡng nếu có cờ FORCE)
    const meets = meetsThreshold(repo, unpushed);
    const thresholdN = pushThreshold(repo);
    const canPush = DO_FORCE ? unpushed !== null && unpushed > 0 : meets;

    const state = issues.length > 0 ? '⚠️ ' : '✅ ';

    console.log(`${state}${repo.name}`);
    console.log(`     path    : ${repo.path}`);
    console.log(`     branch  : ${branch} (chuẩn: '${expected}')`);
    console.log(`     unpush  : ${unpushed === null ? '??' : unpushed} / ngưỡng ${thresholdN}${DO_FORCE ? ' (BỎ QUA NGƯỠNG)' : ''}`);
    if (changedFiles.length > 0) {
      console.log(`     changed : ${changedFiles.length} file chưa commit`);
      for (const f of changedFiles.slice(0, 10)) console.log(`               - ${f}`);
      if (changedFiles.length > 10) console.log(`               - ... và ${changedFiles.length - 10} file khác`);
    }
    if (issues.length > 0) {
      console.log(`     vấn đề  : ${issues.join(' | ')}`);
    } else if (canPush) {
      console.log(`     push    : ${DO_FORCE ? 'FORCE' : 'ĐỦ ngưỡng'}${DO_PUSH ? ' → sẽ pull --rebase + push' : ' (chạy --push để thực hiện)'}`);
    } else {
      console.log(`     push    : chưa đủ ngưỡng (${
        unpushed ?? 0
      }/${thresholdN})${DO_PUSH ? ' — bỏ qua' : ''}`);
    }
    console.log('');

    // Chỉ đưa vào danh sách commit nếu repo đúng branch + có thay đổi
    if (dirty && branchOk) toCommit.push(repo);
    // KHÔNG push repo đang có thay đổi chưa commit (kể cả FORCE) hoặc sai branch
    if (!branchOk || dirty || unpushed === null) {
      warnings.push({ repo: repo.name, issues });
    } else if (canPush) {
      toPush.push(repo);
    }
  }

  console.log('================================================================');
  console.log('  KẾT QUẢ');
  console.log('================================================================');

  // ===== CHẾ ĐỘ COMMIT =====
  if (DO_COMMIT) {
    console.log(`  [COMMIT] ${toCommit.length} repo có thay đổi chưa commit:`);
    if (toCommit.length === 0) {
      console.log('     (không có repo nào có thay đổi chưa commit)');
    } else {
      let committed = 0;
      let failed = 0;
      let blocked = 0;
      for (const repo of toCommit) {
        console.log(`▶  Commit ${repo.name}...`);
        const res = commitRepo(repo);
        if (res === true) committed++;
        else if (res === false) failed++;
        else if (res === 'blocked') blocked++;
      }
      console.log('');
      console.log(`  Tổng kết commit: ${committed} thành công, ${failed} thất bại, ${blocked} bị chặn (sai branch).`);
    }
    if (!DO_PUSH) process.exit(0);
  }

  // ===== CHẾ ĐỘ KHÔ (chỉ đếm, không làm gì) =====
  if (!DO_PUSH && !DO_COMMIT) {
    console.log('  [CHẾ ĐỘ KHÔ] Chạy `--commit` để commit, hoặc `--push` / `--push --force` để push.');
    console.log('');
    console.log('  → Cần xử lý trước khi push:');
    if (warnings.length === 0) {
      console.log('     Không có vấn đề chặn. Các repo đủ ngưỡng sẽ được push khi chạy --push.');
    } else {
      for (const w of warnings) {
        console.log(`     ⚠️  ${w.repo}: ${w.issues.join(' | ')}`);
      }
    }
    console.log('');
    console.log(`  → Sẽ push khi chạy --push (${toPush.length} repo):`);
    if (toPush.length === 0) {
      console.log('     (không có repo nào đủ ngưỡng — dùng --push --force để push luôn)');
    } else {
      for (const r of toPush) {
        console.log(`     + ${r.name} (đủ ${pushThreshold(r)})`);
      }
    }
    console.log('');
    console.log('  → Repo có thay đổi chưa commit (chạy --commit hoặc tự commit):');
    if (toCommit.length === 0) {
      console.log('     (không có)');
    } else {
      for (const r of toCommit) {
        console.log(`     + ${r.name} (${getChangedFiles(r.path).length} file)`);
      }
    }
    process.exit(0);
  }

  // ===== CHẾ ĐỘ PUSH =====
  let pushed = 0;
  let failed = 0;

  for (const repo of toPush) {
    // ⛔ An toàn thứ hai: xác nhận lại branch ngay trước khi pull/push (có thể đã đổi giữa chừng)
    const liveBranch = currentBranch(repo);
    if (!isBranchAllowedValue(liveBranch, repo.isDocker)) {
      console.log(`▶  Push ${repo.name}...`);
      console.log(`    ⛔ BỎ QUA — repo đang ở '${liveBranch}', cần '${expectedBranch(repo)}'`);
      failed++;
      continue;
    }

    const expected = expectedBranch(repo);
    console.log(`▶  Push ${repo.name} (${expected})...`);

    // B4 — pull --rebase trước để đồng bộ code mới nhất, tránh non-fast-forward
    if (!pullRebase(repo, expected)) {
      console.log(`    ✖ pull --rebase FAILED — bỏ qua push (kiểm tra conflict / chưa commit)`);
      failed++;
      continue;
    }

    const afterPull = countUnpushed(repo, expected);
    // FORCE: bỏ qua ngưỡng, push luôn nếu còn commit. Ngược lại: cần đủ ngưỡng mới push.
    if (afterPull === null || (!DO_FORCE && afterPull < pushThreshold(repo))) {
      console.log(`    ⏭  sau pull còn ${afterPull ?? '??'} commit (< ngưỡng ${pushThreshold(repo)})${DO_FORCE ? ' — FORCE vẫn bỏ qua' : ' — bỏ qua'}`);
      continue;
    }

    if (pushBranch(repo, expected)) {
      console.log(`    ✅ Đã push ${afterPull} commit lên origin/${expected}${DO_FORCE ? ' (FORCE)' : ''}`);
      pushed++;
    } else {
      console.log(`    ✖ push FAILED — kiểm tra remote / quyền`);
      failed++;
    }
    console.log('');
  }

  console.log('================================================================');
  console.log('  TỔNG KẾT PUSH');
  console.log('================================================================');
  console.log(`  ✅ Push thành công : ${pushed}`);
  console.log(`  ✖ Thất bại / bỏ qua: ${failed}`);
  console.log('');

  if (warnings.length > 0) {
    console.log('  ⚠️  Các repo cần xử lý thủ công:');
    for (const w of warnings) {
      console.log(`     ⚠️  ${w.repo}: ${w.issues.join(' | ')}`);
    }
  }
}

main();
