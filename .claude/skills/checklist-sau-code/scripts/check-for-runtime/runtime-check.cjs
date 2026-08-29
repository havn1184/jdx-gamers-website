// ============================================================
// runtime-check.cjs — Kiểm tra runtime bằng Playwright
// ============================================================
// 📋 Mục tiêu: Mở browser → login → mở từng page/dialog 2 giây
//              → đọc console errors + network errors → báo cáo
// 📤 Output:   PASS nếu không có lỗi | FAIL + danh sách lỗi
// 📊 Usage:    node runtime-check.cjs <portal> [feature]
//              portal: ketoan | invoice | admin | partner | crm | ...
//
// 🚀 Dev server cố định (port 8888 — CHỈ dùng cho agent check runtime):
//   - Tự khởi động `npm run dev -- --host 100.64.0.15 --port 8888 --strictPort`
//   - Nếu port 8888 đang bị chiếm → tự KILL và chạy lại
//     (vì port này chỉ dành riêng cho agent check runtime)
//   - Kết thúc → tự tắt dev server vừa khởi động
//   - Env RUNTIME_SKIP_DEV_SERVER=1 → KHÔNG tự kill/start, dùng server đang chạy
//
// 🔐 Đăng nhập NHANH qua script (không fill form — tiết kiệm thời gian):
//   - Tự chạy `node auth-login.cjs <portal>` khi chưa có .runtime-auth.json
//     hoặc token đã hết hạn → set localStorage trực tiếp, vào thẳng trang
//   - Fallback: nếu script login fail → đăng nhập qua form browser
//
// 🖥️ Browser: LUÔN headless (không mở trình duyệt ngoài VS Code).
//   - Muốn xem trực quan → mở URL bằng browser tích hợp VS Code
//     (open_browser_page) tại http://100.64.0.15:8888
// ============================================================

const { chromium } = require('playwright');
const fs = require('fs');
const p = require('path');
const { spawn, exec, spawnSync } = require('child_process');

const args = process.argv.slice(2);
const portal = (args[0] || 'ketoan').toLowerCase();
const feature = args[1] || '';

// ── Dev server cố định cho agent check runtime ──
// Dùng IP VPN (KHÔNG dùng localhost — SSO chặn localhost: DOMAIN_SUBDOMAIN_NOT_FOUND)
// Port 8888 cố định — Vite --strictPort để không bị đổi port tự động
const RUNTIME_HOST = '100.64.0.1';
const RUNTIME_PORT = 8888;
const BASE_URL = `http://${RUNTIME_HOST}:${RUNTIME_PORT}`;
const LOGIN_URL = BASE_URL + '/#/auth/login';
// LUÔN headless — KHÔNG mở trình duyệt ngoài VS Code (màn hình trắng khi mở Chromium riêng)
const HEADLESS = true;

// ── Load tài khoản chuẩn từ account.json (key = mã portal) ──
const ACCOUNTS_FILE = p.join(__dirname, '..', 'accounts', 'account.json');
const ACCOUNTS = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));

// ── Portal config: hash routes ──
const PORTAL_CONFIG = {
  ketoan: {
    dir: 'KetoanApp',
    prefix: 'ketoan',
    pages: ['#/ketoan/dashboard', '#/ketoan/danh-muc/khach-hang', '#/ketoan/danh-muc/hang-hoa',
      '#/ketoan/danh-muc/kho', '#/ketoan/danh-muc/nhan-vien', '#/ketoan/danh-muc/ngan-hang'],
    subPages: [],
  },
  invoice: {
    dir: 'InvoiceApp',
    prefix: 'business',
    pages: ['#/business/dashboard/overview', '#/business/invoice-management', '#/business/invoice-issuance'],
  },
  admin: {
    dir: 'AdminApp',
    prefix: 'admin',
    pages: ['#/admin/dashboard', '#/admin/dashboard/http-request-log', '#/admin/account-management', '#/admin/system'],
  },
  partner: {
    dir: 'PartnerApp',
    prefix: 'partner',
    pages: ['#/partner/dashboard'],
  },
  crm: {
    dir: 'CrmApp',
    prefix: 'crm',
    pages: ['#/crm/ban-hang/don-hang'],
  },
  kiemthu: {
    dir: 'KiemThuApp',
    // ⚠️ Route thực tế dùng prefix `kiem-thu` (có gạch nối) — xem routeConfig.tsx
    prefix: 'kiem-thu',
    pages: ['#/kiem-thu/dashboard', '#/kiem-thu/bugs', '#/kiem-thu/agent-task-inbox', '#/kiem-thu/mcp-keys'],
  },
  taisan: {
    dir: 'TaiSanApp',
    prefix: 'taisan',
    pages: ['#/taisan/tai-san/tai-san-co-dinh'],
  },
  sso: {
    dir: 'SsoApp',
    prefix: 'sso',
    pages: ['#/sso/profile'],
  },
  baseindex: {
    dir: 'BaseIndexApp',
    prefix: 'base-index',
    pages: ['#/base-index/hang-hoa/san-pham'],
  },
};

const config = PORTAL_CONFIG[portal];
if (!config) {
  console.error('ERROR: Portal not recognized: ' + portal);
  console.error('Valid: ' + Object.keys(PORTAL_CONFIG).join(', '));
  process.exit(1);
}

const account = ACCOUNTS[portal];
if (!account) {
  console.error('ERROR: Không có tài khoản cho portal: ' + portal);
  console.error('Kiểm tra scripts/accounts/account.json — các portal: ' + Object.keys(ACCOUNTS).join(', '));
  process.exit(1);
}

console.log('=== RUNTIME CHECK (Playwright): ' + portal + ' ===');
console.log('URL: ' + BASE_URL + ' | Headless: ' + HEADLESS);
console.log('Account: ' + account.username + ' (' + (account.name || portal) + ')\n');

const errors = [];
const warnings = [];
let pagesPassed = 0;
let pagesChecked = 0;

// ── Giới hạn lỗi để tránh token overflow ──
const MAX_ERRORS = 50;           // Tổng số lỗi tối đa toàn session
const MAX_PER_TYPE = 15;        // Tối đa mỗi loại lỗi
const MAX_PER_PAGE = 10;        // Tối đa lỗi mỗi page
const MAX_CONSOLE_LEN = 150;    // Cắt console error text quá dài

// ═══════════════════════════════════════════════════════════
// QUẢN LÝ DEV SERVER — port 8888 cố định, chỉ dùng cho agent check runtime
// ═══════════════════════════════════════════════════════════
const isWin = process.platform === 'win32';
let devServerChildRef = null; // ref để fallback kill khi process exit
const MAX_SPAWN_ATTEMPTS = 3; // Số lần thử spawn dev server tối đa

// ── Lock file — chống chạy SONG SONG nhiều instance (nhiều browser + nhiều dev server) ──
const LOCK_FILE = p.join(process.cwd(), '.runtime-check.lock');

/** Kiểm tra PID còn sống không */
function isPidAlive(pid) {
  try { process.kill(pid, 0); return true; } catch { return false; }
}

/** Chiếm lock — nếu instance khác đang chạy → báo lỗi và dừng ngay (tránh mở nhiều browser) */
function acquireLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const raw = fs.readFileSync(LOCK_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (data.pid && isPidAlive(data.pid)) {
        console.error(`❌ runtime-check đang chạy bởi PID ${data.pid} (portal: ${data.portal}, bắt đầu: ${data.startedAt}).`);
        console.error(`   Chờ instance đó kết thúc, hoặc xóa file ${LOCK_FILE} nếu process đã chết.`);
        process.exit(1);
      }
      // PID đã chết → xóa lock cũ
      fs.unlinkSync(LOCK_FILE);
    }
    fs.writeFileSync(LOCK_FILE, JSON.stringify({
      pid: process.pid, portal, startedAt: new Date().toISOString(),
    }));
  } catch {
    // Lock lỗi → cho chạy tiếp (không chặn quy trình)
    try { if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE); } catch {}
  }
}

/** Nhả lock khi kết thúc */
function releaseLock() {
  try { if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE); } catch {}
}

/** Tìm TẤT CẢ PID đang LISTENING trên port (parse chính xác cột Local Address) */
function findPidsOnPort(port) {
  return new Promise(resolve => {
    const cmd = isWin ? 'netstat -ano' : `lsof -ti:${port}`;
    exec(cmd, (err, stdout) => {
      if (err || !stdout) return resolve([]);
      const pids = new Set();
      for (const line of stdout.split('\n')) {
        const l = line.trim();
        if (isWin) {
          // Format: TCP  100.64.0.15:8888  0.0.0.0:0  LISTENING  12345
          if (!/LISTENING/i.test(l)) continue;
          const parts = l.split(/\s+/).filter(Boolean);
          if (parts.length < 2) continue;
          const local = parts[1]; // cột Local Address
          const idx = local.lastIndexOf(':');
          if (idx < 0) continue;
          const localPort = local.substring(idx + 1);
          if (localPort !== String(port)) continue; // khớp CHÍNH XÁC port — tránh nhầm :88880
          const pid = parts[parts.length - 1];
          if (pid && /^\d+$/.test(pid)) pids.add(pid);
        } else {
          const pid = l;
          if (pid && /^\d+$/.test(pid)) pids.add(pid);
        }
      }
      resolve([...pids]);
    });
  });
}

/** Kill process theo PID (Windows: taskkill /F /T — kill cả cây process con) */
function killPid(pid) {
  return new Promise(resolve => {
    const cmd = isWin ? `taskkill /F /T /PID ${pid}` : `kill -9 ${pid}`;
    exec(cmd, () => resolve());
  });
}

/** Kill MỌI process đang giữ port — chờ đến khi port được giải phóng hoàn toàn */
async function killProcessOnPort(port) {
  const pids = await findPidsOnPort(port);
  if (pids.length === 0) return true;
  for (const pid of pids) {
    console.log(`    Kill PID ${pid} (đang giữ port ${port})...`);
    await killPid(pid);
  }
  for (let i = 0; i < 33; i++) { // tối đa ~10s
    await new Promise(r => setTimeout(r, 300));
    const still = await findPidsOnPort(port);
    if (still.length === 0) return true;
    // Process có thể respawn (npm → node → vite) → kill tiếp
    for (const pid of still) await killPid(pid);
  }
  return false; // vẫn còn giữ port
}

/** Chờ dev server respond (HTTP < 500) trên URL */
async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.status < 500) return true;
    } catch { /* chưa sẵn sàng */ }
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

/** Spawn 1 lần dev server — trả về child */
function spawnDevServer() {
  console.log(`[0] Khởi động dev server tại ${BASE_URL} (--strictPort)...`);
  const npmCmd = isWin ? 'npm.cmd' : 'npm';
  const child = spawn(npmCmd, ['run', 'dev', '--', '--host', RUNTIME_HOST, '--port', String(RUNTIME_PORT), '--strictPort'], {
    cwd: process.cwd(),
    // Windows: .cmd files (npm.cmd) cần shell:true — nếu không spawn báo EINVAL
    shell: isWin,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  devServerChildRef = child;

  // Log các dòng quan trọng của Vite để debug khi lỗi
  const logFilter = /ready in|Local:|error|EADDRINUSE|already in use|Port|Cannot|failed/i;
  child.stdout.on('data', d => {
    const txt = d.toString();
    if (logFilter.test(txt)) process.stdout.write('[dev] ' + txt.trimEnd() + '\n');
  });
  child.stderr.on('data', d => {
    const txt = d.toString();
    if (logFilter.test(txt)) process.stdout.write('[dev!] ' + txt.trimEnd() + '\n');
  });
  child.on('exit', code => {
    if (code !== 0) process.stdout.write('[dev] exited code=' + code + '\n');
  });
  return child;
}

/**
 * Đảm bảo dev server chạy tại http://{RUNTIME_HOST}:{RUNTIME_PORT}
 * Quy trình khôi phục (tránh nhiều port + nhiều browser):
 *   1. Nếu port 8888 bị chiếm → KILL sạch (taskkill /T cả cây) → chờ giải phóng
 *   2. Spawn đúng 1 lệnh `npm run dev -- --host {host} --port 8888 --strictPort`
 *      (strictPort → Vite KHÔNG bao giờ tự nhảy sang port khác)
 *   3. Chờ ready HOẶC phát hiện Vite exit sớm (EADDRINUSE) → retry tối đa 3 lần
 *   4. Sau 3 lần fail → báo lỗi chi tiết + exit(1)
 */
async function ensureDevServer() {
  if (process.env.RUNTIME_SKIP_DEV_SERVER === '1') {
    const ok = await waitForServer(BASE_URL, 15000);
    if (!ok) {
      console.error(`  ❌ RUNTIME_SKIP_DEV_SERVER=1 nhưng ${BASE_URL} không phản hồi.`);
      process.exit(1);
    }
    console.log(`[0] RUNTIME_SKIP_DEV_SERVER=1 — dùng server đang chạy tại ${BASE_URL}`);
    return null;
  }

  // Bước 0: dọn port 8888 nếu bị chiếm bởi instance cũ (orphan từ lần chạy trước)
  const existing = await findPidsOnPort(RUNTIME_PORT);
  if (existing.length > 0) {
    console.log(`[0] Port ${RUNTIME_PORT} bị chiếm (PID ${existing.join(', ')}) — kill toàn bộ và bật lại...`);
    const cleaned = await killProcessOnPort(RUNTIME_PORT);
    if (!cleaned) {
      console.error(`  ❌ Không thể giải phóng port ${RUNTIME_PORT} — chạy thủ công: taskkill /F /T /PID <pid>`);
      process.exit(1);
    }
    console.log('  ✅ Đã giải phóng port ' + RUNTIME_PORT);
  }

  // Bước 1-3: thử spawn tối đa MAX_SPAWN_ATTEMPTS lần
  for (let attempt = 1; attempt <= MAX_SPAWN_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      console.log(`  🔁 Lần thử ${attempt}/${MAX_SPAWN_ATTEMPTS}: dọn port rồi bật lại...`);
      await killProcessOnPort(RUNTIME_PORT); // dọn sạch trước mỗi lần thử
      await new Promise(r => setTimeout(r, 2000));
    }

    const child = spawnDevServer();

    // Chờ ready HOẶC child exit sớm (Vite --strictPort exit ngay nếu EADDRINUSE)
    const ready = await new Promise(resolve => {
      let settled = false;
      const done = val => {
        if (!settled) { settled = true; child.off('exit', onEarlyExit); resolve(val); }
      };
      const onEarlyExit = (code, sig) => {
        console.log(`  ⚠️ Vite thoát sớm (code=${code} sig=${sig}) — có thể do port ${RUNTIME_PORT} bị chiếm`);
        done(false);
      };
      child.once('exit', onEarlyExit);

      waitForServer(BASE_URL, 90000).then(ok => done(ok));
    });

    if (ready) {
      console.log('  ✅ Dev server sẵn sàng: ' + BASE_URL);
      return child;
    }

    // Fail → dọn sạch process con (npm → node → vite) để không sót process giữ port
    try { child.kill(); } catch {}
    await killProcessOnPort(RUNTIME_PORT);
  }

  console.error(`  ❌ Không thể khởi động dev server tại ${BASE_URL} sau ${MAX_SPAWN_ATTEMPTS} lần thử.`);
  console.error('     Kiểm tra: (1) port 8888 có bị phần mềm khác chiếm không?');
  console.error('     (2) chạy tay `npm run dev -- --host 100.64.0.15 --port 8888 --strictPort` xem lỗi gì.');
  process.exit(1);
}

/** Dừng dev server do script khởi động (kill cả cây process con) */
async function stopDevServer(child) {
  if (!child || child.exitCode !== null || child.killed) return;
  try {
    if (isWin) {
      await killPid(child.pid); // taskkill /F /T
    } else {
      child.kill('SIGTERM');
    }
  } catch { /* bỏ qua */ }
}

// Fallback: nếu script exit giữa chừng → kill CẢ CÂY dev server + nhả lock
// Dùng spawnSync (đồng bộ) vì trong 'exit' không await được
process.on('exit', () => {
  if (devServerChildRef && devServerChildRef.exitCode === null) {
    try {
      if (isWin) {
        spawnSync('taskkill', ['/F', '/T', '/PID', String(devServerChildRef.pid)], { windowsHide: true });
      } else {
        devServerChildRef.kill('SIGKILL');
      }
    } catch {}
  }
  releaseLock();
});

// Bắt SIGINT/SIGTERM (Ctrl+C, kill) → dọn dẹp rồi thoát qua exit handler
process.on('SIGINT', () => { try { process.exit(130); } catch {} });
process.on('SIGTERM', () => { try { process.exit(143); } catch {} });

const errorCounts = { console: 0, pageerror: 0, import: 0, http: 0, other: 0 };
const seenErrors = new Set();   // Dedup lỗi trùng

// ── Lọc: chỉ giữ lỗi liên quan đến source code ──
function isRelevantError(text) {
  // Bỏ qua lỗi từ 3rd-party / browser internal
  const IGNORE_PATTERNS = [
    /chrome-extension:/i,
    /webpack-internal:/i,
    /node_modules\/@react-refresh/i,
    /favicon\.ico/i,
    /WebSocket connection to/i,
    /\[vite\] connecting/i,
    /\[vite\] connected/i,
    /Download the React DevTools/i,
    /__REACT_DEVTOOLS/i,
    /autofill./i,
    /preload.*fonts/i,
    /third-party/i,
  ];
  return !IGNORE_PATTERNS.some(p => p.test(text));
}

// ── Rút gọn lỗi dài ──
function shorten(err) {
  if (err.length <= MAX_CONSOLE_LEN) return err;
  return err.substring(0, MAX_CONSOLE_LEN) + '...';
}

// ── Dedup key ──
function makeKey(type, text) {
  return type + '::' + text.substring(0, 80).replace(/\d+/g, 'N'); // normalize numbers
}

function isDuplicate(type, text) {
  const key = makeKey(type, text);
  if (seenErrors.has(key)) return true;
  seenErrors.add(key);
  return false;
}

// ── Check limits ──
function overLimit() {
  const total = errorCounts.console + errorCounts.pageerror + errorCounts.import + errorCounts.http;
  return total >= MAX_ERRORS;
}

// ═══════════════════════════════════════════════════════════
// ĐĂNG NHẬP NHANH — chạy auth-login.cjs (gọi SSO API) → set localStorage
// ═══════════════════════════════════════════════════════════
const AUTH_SCRIPT = p.join(__dirname, 'auth-login.cjs');
const AUTH_FILE = p.join(process.cwd(), '.runtime-auth.json');

/** Chạy `node auth-login.cjs <portal>` — trả về auth object hoặc null nếu fail */
async function runAuthScript() {
  return new Promise(resolve => {
    const child = spawn('node', [AUTH_SCRIPT, portal], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    let out = '';
    child.stdout.on('data', d => out += d.toString());
    child.stderr.on('data', d => out += d.toString());
    child.on('close', code => {
      if (code !== 0) {
        console.log('  ⚠️ auth-login.cjs failed (code ' + code + '):');
        console.log(out.split('\n').filter(l => l.trim()).slice(-5).map(l => '    ' + l).join('\n'));
        resolve(null);
        return;
      }
      try {
        const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
        resolve(auth);
      } catch {
        resolve(null);
      }
    });
  });
}

/** Token còn hiệu lực? (dựa vtn_token_expires_at trong auth file) */
function isAuthFresh(auth) {
  if (!auth?.accessToken) return false;
  if (!auth?.storageState?.['vtn_token_expires_at']) return true; // không có expiry → mặc định OK
  const exp = Number(auth.storageState['vtn_token_expires_at']);
  return !isNaN(exp) && exp > Date.now() + 30000; // dư 30s an toàn
}

/**
 * Đăng nhập nhanh: dùng auth file có sẵn (còn hạn) → nếu không thì chạy auth-login.cjs.
 * Set toàn bộ localStorage từ auth.storageState (đúng chuẩn useLogin.ts) → vào thẳng trang đầu.
 * Trả về true nếu thành công (không còn ở trang login).
 */
async function tryFastAuth(page) {
  console.log('[2] Fast auth (script login)...');

  // 1. Auth file có sẵn + token còn hạn + đúng portal → dùng luôn
  let auth = null;
  if (fs.existsSync(AUTH_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
      if (existing.portal === portal && isAuthFresh(existing)) {
        auth = existing;
        console.log('  ✅ Dùng auth sẵn có (.runtime-auth.json)');
      }
    } catch { /* file hỏng → login lại */ }
  }

  // 2. Chưa có / hết hạn → chạy auth-login.cjs (gọi SSO API, nhanh hơn fill form)
  if (!auth) {
    console.log('  🔑 Chạy auth-login.cjs (' + portal + ')...');
    auth = await runAuthScript();
    if (!auth) {
      console.log('  ❌ Script login fail → fallback browser login');
      return false;
    }
  }

  // 3. Load app rồi set localStorage — cần origin đúng để localStorage hoạt động
  await page.goto(BASE_URL + '/#/auth/login', { timeout: 15000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  await page.evaluate((storageState) => {
    for (const [key, value] of Object.entries(storageState)) {
      localStorage.setItem(key, value);
    }
  }, auth.storageState || {});

  // 4. Vào thẳng trang đầu portal
  const firstPage = config.pages[0];
  await page.goto(BASE_URL + '/' + firstPage, { timeout: 15000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  if (!page.url().includes('login')) {
    console.log('  ✅ Fast auth OK: ' + page.url().substring(0, 80));
    return true;
  }
  console.log('  ⚠️ Fast auth bị redirect về login → fallback browser login');
  return false;
}

async function main() {
  // ── Bước 0: chống chạy song song (nhiều browser + nhiều dev server) ──
  acquireLock();

  // ── Bước 1: Đảm bảo dev server chạy tại port 8888 (tự kill + bật lại nếu lỗi) ──
  const devServer = await ensureDevServer();

  console.log('[1] Launching browser...');
  const browser = await chromium.launch({ headless: HEADLESS });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // ── Per-page error tracking ──
  let pageErrors = 0;

  // ── Error collectors with limits ──
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    if (overLimit() || errorCounts.console >= MAX_PER_TYPE || pageErrors >= MAX_PER_PAGE) return;

    const text = msg.text();
    if (!isRelevantError(text)) return;
    if (isDuplicate('console', text)) return;

    errorCounts.console++;
    pageErrors++;
    errors.push('[console] ' + shorten(text));
  });

  page.on('pageerror', err => {
    if (overLimit() || errorCounts.pageerror >= MAX_PER_TYPE || pageErrors >= MAX_PER_PAGE) return;

    const text = err.message || '';
    if (!isRelevantError(text)) return;
    if (isDuplicate('page', text)) return;

    errorCounts.pageerror++;
    pageErrors++;
    errors.push('[page] ' + shorten(text));
  });

  page.on('requestfailed', req => {
    if (overLimit() || errorCounts.import >= MAX_PER_TYPE || pageErrors >= MAX_PER_PAGE) return;

    const url = req.url();
    if (!url.includes('.ts') && !url.includes('.tsx')) return;
    if (isDuplicate('import', url)) return;

    errorCounts.import++;
    pageErrors++;
    errors.push('[import] ' + shorten(url));
  });

  page.on('response', res => {
    if (res.status() < 500) return;
    if (overLimit() || errorCounts.http >= MAX_PER_TYPE || pageErrors >= MAX_PER_PAGE) return;
    if (isDuplicate('http', res.url())) return;

    errorCounts.http++;
    pageErrors++;
    errors.push('[HTTP ' + res.status() + '] ' + shorten(res.url()));
  });

  // ── Step 2: Login ──
  // Login NHANH qua script auth-login.cjs (gọi SSO API, set localStorage — không fill form)
  const fastAuth = await tryFastAuth(page);
  if (!fastAuth) {
    // Fallback: đăng nhập qua form browser nếu script login thất bại
    console.log('[2] Logging in (browser fallback)...');
    await page.goto(BASE_URL + '/#/auth/login', { timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.fill('input[type="text"]', account.username);
    await page.fill('input[type="password"]', account.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    if (page.url().includes('login')) {
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    console.log('  URL: ' + page.url() + '\n');
  } else {
    console.log('');
  }

  // ── Collect pages ──
  const hashRoutes = [...config.pages];
  if (feature) {
    hashRoutes.push(...findFeatureHashes(feature));
  }

  // ── Step 3: Open each page 2 seconds ──
  console.log('[3] Opening ' + hashRoutes.length + ' routes (2s each)...\n');

  for (const hash of hashRoutes) {
    pagesChecked++;
    pageErrors = 0; // Reset per-page counter
    const url = BASE_URL + '/' + hash;
    const label = '  [' + pagesChecked + '/' + hashRoutes.length + '] ' + hash;
    const errorsBefore = errors.length;

    try {
      await page.goto(url, { timeout: 10000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const hasOverlay = await page.$('vite-error-overlay');
      const newErrors = errors.length - errorsBefore;

      if (hasOverlay) {
        const text = await page.textContent('vite-error-overlay');
        errors.push(hash + ': Vite error overlay — ' + (text || '').substring(0, 150));
        console.log(label + ' 🔴 VITE OVERLAY');
      } else if (newErrors > 0) {
        const deduped = newErrors + ' (deduped, ' + errorCounts.console + ' console + ' + errorCounts.pageerror + ' page + ' + errorCounts.import + ' import + ' + errorCounts.http + ' http)';
        console.log(label + ' ⚠️ ' + newErrors + ' errors | totals: ' + (errorCounts.console + errorCounts.pageerror + errorCounts.import + errorCounts.http));
      } else {
        pagesPassed++;
        const title = await page.title();
        console.log(label + ' ✅');
      }

      if (overLimit()) {
        console.log('  ⚠️ Đạt giới hạn ' + MAX_ERRORS + ' lỗi — dừng kiểm tra thêm');
        break;
      }

      // 🆕 Quét tab trong page (click từng tab để trigger lazy render)
      await checkPageTabs(page, hash);
    } catch (e) {
      errors.push(hash + ': navigation failed — ' + e.message);
      console.log(label + ' 🔴 FAIL');
    }
  }

  // ── Step 4: Open dialogs ──
  if (feature) {
    console.log('\n[4] Checking dialogs...');
    await checkDialogs(page, feature);
  }

  await browser.close();

  // Dừng dev server do script khởi động (port 8888 chỉ dành cho agent check runtime)
  await stopDevServer(devServer);
  releaseLock();

  // ── Summary ──
  console.log('\n=== RUNTIME CHECK SUMMARY ===');
  console.log('Pages: ' + pagesChecked + ' checked, ' + pagesPassed + ' passed');
  console.log('Errors captured: ' + errors.length + ' (deduped from ' +
    (errorCounts.console + errorCounts.pageerror + errorCounts.import + errorCounts.http) + ' raw)');
  console.log('Limits: max=' + MAX_ERRORS + ' total, ' + MAX_PER_TYPE + '/type, ' + MAX_PER_PAGE + '/page');

  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.slice(0, 20).forEach(e => console.log('  ' + e));
    if (errors.length > 20) console.log('  ... +' + (errors.length - 20) + ' more');
    process.exit(1);
  }

  console.log('✅ ALL CLEAN');
  process.exit(0);
}

// ── 🆕 Quét tab trong page — click từng tab để trigger lazy render ──
async function checkPageTabs(page, hashLabel) {
  try {
    // Tìm tab triggers: data-qa=\"tab_*\" hoặc button trong tab bar (border-b-2 pattern)
    const tabs = await page.$$('[data-qa^=\"tab_\"]');
    if (tabs.length === 0) return; // Không có tab

    const tabCount = tabs.length;
    console.log('    🔍 Found ' + tabCount + ' tabs, clicking each...');

    for (let i = 0; i < tabCount; i++) {
      // Re-query vì DOM có thể đã thay đổi sau click tab trước
      const currentTabs = await page.$$('[data-qa^=\"tab_\"]');
      if (i >= currentTabs.length) break;

      const tab = currentTabs[i];
      const label = await tab.textContent().catch(() => 'tab-' + i);
      const isActive = (await tab.getAttribute('class') || '').includes('border-blue-500');

      if (isActive) {
        console.log('      [' + (i + 1) + '/' + tabCount + '] ' + (label || '').trim() + ' (active, skip)');
        continue;
      }

      console.log('      [' + (i + 1) + '/' + tabCount + '] ' + (label || '').trim() + ' → clicking...');
      await tab.click().catch(() => {});
      await page.waitForTimeout(2000);

      // Kiểm tra Vite error overlay sau khi render tab
      const hasOverlay = await page.$('vite-error-overlay');
      if (hasOverlay) {
        const text = await page.textContent('vite-error-overlay');
        errors.push(hashLabel + ' tab[' + (label || '').trim() + ']: Vite overlay — ' + (text || '').substring(0, 150));
        console.log('        🔴 VITE OVERLAY in tab!');
      }
    }
  } catch (e) {
    // Bỏ qua lỗi khi quét tab (vd: page đã navigate đi)
  }
}

// ── Feature pages từ routeConfig.tsx (đúng route THẬT, không tự suy đoán) ──
function findFeatureHashes(featurePath) {
  const dir = 'src/modules/' + config.dir + '/' + featurePath + '/pages';
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(f => f.endsWith('Page.tsx'));
  if (files.length === 0) return [];

  // Đọc routeConfig.tsx → map component name → route path (đúng route đã đăng ký)
  const routeFile = 'src/modules/' + config.dir + '/routes/routeConfig.tsx';
  const routeMap = new Map();
  try {
    const src = fs.readFileSync(routeFile, 'utf8');
    // pattern: { path: 'xxx', element: <XxxPage />, }
    const re = /path:\s*'([^']+)'[\s\S]*?element:\s*<(\w+)\s*\/\s*>/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      const [, path, comp] = m;
      if (!routeMap.has(comp)) routeMap.set(comp, path);
    }
  } catch { /* không đọc được routeConfig → fallback tự suy đoán */ }

  const base = '/' + (config.prefix || portal.toLowerCase());

  return files.map(f => {
    const comp = f.replace('.tsx', ''); // vd SettingsMembersPage
    const routePath = routeMap.get(comp);
    if (routePath) {
      // Bỏ hậu tố wildcard '/*' để test route gốc
      const clean = routePath.replace(/\/\*+$/, '');
      return base + '/' + clean;
    }
    // Fallback cũ: tự suy đoán từ tên file
    const name = comp.replace('Page', '').replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    return base + '/' + featurePath.replace('features/', '').split('/').join('/') + '/' + name;
  });
}

// ── Dialog discovery ──
async function checkDialogs(page, featurePath) {
  const dir = 'src/modules/' + config.dir + '/' + featurePath + '/dialogs';
  if (!fs.existsSync(dir)) { console.log('  No dialogs folder'); return; }

  const dialogFiles = fs.readdirSync(dir).filter(f => f.endsWith('Dialog.tsx') || f.endsWith('Drawer.tsx'));
  if (dialogFiles.length === 0) { console.log('  No dialog files'); return; }

  console.log('  ' + dialogFiles.length + ' dialog files: ' + dialogFiles.join(', '));

  const addSelectors = [
    'button:has-text("Thêm")', 'button:has-text("Tạo mới")',
    '[data-qa="btn_them"]', '[data-qa="btn_add"]',
    'button:has-text("+")',
  ];

  for (const sel of addSelectors) {
    try {
      const btn = await page.$(sel);
      if (!btn) continue;

      console.log('  Click: ' + sel);
      await btn.click();
      await page.waitForTimeout(2000);

      const dialogs = await page.$$('[role="dialog"], [data-state="open"]');
      console.log('  ✅ ' + (dialogs.length > 0 ? 'Dialog opened' : 'No dialog detected'));

      // Close
      const closeBtn = await page.$('button:has-text("Hủy"), button:has-text("Đóng"), [data-qa="btn_close"]');
      if (closeBtn) { await closeBtn.click(); await page.waitForTimeout(500); }
      else { await page.keyboard.press('Escape'); await page.waitForTimeout(500); }
      break;
    } catch (e) { /* try next */ }
  }
}

main();
