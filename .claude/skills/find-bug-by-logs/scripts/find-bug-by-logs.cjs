// ============================================================
// find-bug-by-logs.cjs — Tìm nguyên nhân lỗi bằng console + network logs
// ============================================================
// 📋 Mục tiêu: Auto login → navigate đến màn hình lỗi → thao tác
//              → capture console errors + network errors + response
//              → xuất báo cáo chi tiết → sau khi fix → test lại
//              → xóa logs tạm khi fix xong
// 📊 Usage:    node find-bug-by-logs.cjs <portal> <route> [--steps <file>] [--retest]
//              portal: ketoan | invoice | admin | partner | crm | kiemthu | taisan | sso | baseindex
//              route:  hash route (vd: #/ketoan/danh-muc/khach-hang)
//              --steps: file JSON mô tả các bước thao tác để tái hiện lỗi
//              --retest: chạy lại test sau khi đã sửa code
// ============================================================

const { chromium } = require('playwright');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ── Parse args ──
const args = process.argv.slice(2);
const portal = (args[0] || 'ketoan').toLowerCase();
const route = args[1] || '';
const isRetest = args.includes('--retest');
const stepsIdx = args.indexOf('--steps');
const stepsFile = stepsIdx >= 0 ? args[stepsIdx + 1] : null;

// ── Config ──
const BASE_URL = 'http://100.64.0.15:3004';
const API_URL = 'http://100.64.0.15:5301';
const HEADLESS = true;
const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'bug-logs-' + portal + '-' + Date.now() + '.json');
const PREV_LOG_FILE = path.join(LOG_DIR, 'bug-logs-' + portal + '-prev.json');

// ── Accounts ──
const ACCOUNTS = {
  ketoan:     { username: '0985908756', password: 'Admin@123' },
  invoice:    { username: '0985908756', password: 'Admin@123' },
  crm:        { username: '0985908756', password: 'Admin@123' },
  kiemthu:    { username: '0985908756', password: 'Admin@123' },
  taisan:     { username: '0985908756', password: 'Admin@123' },
  sso:        { username: '0985908756', password: 'Admin@123' },
  baseindex:  { username: '0985908756', password: 'Admin@123' },
  admin:      { username: '0966188166', password: 'admin@123' },
  partner:    { username: '0987839490', password: 'Admin@123' },
};

const account = ACCOUNTS[portal];
if (!account) {
  console.error('ERROR: Portal không hợp lệ: ' + portal);
  console.error('Hợp lệ: ' + Object.keys(ACCOUNTS).join(', '));
  process.exit(1);
}

if (!route) {
  console.error('ERROR: Thiếu route. VD: node find-bug-by-logs.cjs ketoan "#/ketoan/danh-muc/khach-hang"');
  process.exit(1);
}

// ── Log collector ──
const bugReport = {
  timestamp: new Date().toISOString(),
  portal,
  route,
  baseUrl: BASE_URL,
  account: account.username,
  isRetest,
  login: { success: false, method: '', error: null },
  navigation: { success: false, url: '', title: '', error: null },
  consoleErrors: [],
  networkErrors: [],
  apiResponses: [],
  pageErrors: [],
  viteOverlay: null,
  summary: { totalErrors: 0, critical: 0, warnings: 0 },
};

// ── Filters ──
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
  /google-analytics/i,
  /gtag/i,
];

function isRelevant(text) {
  return !IGNORE_PATTERNS.some(p => p.test(text));
}

function shorten(text, maxLen = 300) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '...';
}

// ── API login helper ──
function apiCall(method, apiPath, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(apiPath, API_URL);
    const client = url.protocol === 'https:' ? https : http;
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const options = {
      hostname: url.hostname, port: url.port,
      path: url.pathname + url.search, method,
      headers, rejectUnauthorized: false,
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ── Main ──
async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  🔍 FIND BUG BY LOGS — ' + (isRetest ? 'RETEST' : 'INITIAL') + '                    ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  Portal: ' + portal.padEnd(36) + '║');
  console.log('║  Route:  ' + route.padEnd(36) + '║');
  console.log('║  User:   ' + account.username.padEnd(36) + '║');
  console.log('╚══════════════════════════════════════════════╝\n');

  // ── Step 1: API Login ──
  console.log('[1/5] Đăng nhập qua API...');
  let fullToken = '';
  let loginUser = null;
  let loginRefreshToken = '';

  try {
    const loginRes = await apiCall('POST', '/api/auth/login', {
      username: account.username,
      password: account.password,
    });

    if (loginRes.data?.success) {
      fullToken = loginRes.data.data?.accessToken || loginRes.data.accessToken || '';
      loginUser = loginRes.data.data?.user || loginRes.data.user || null;
      loginRefreshToken = loginRes.data.data?.refreshToken || loginRes.data.refreshToken || '';

      if (fullToken) {
        bugReport.login = { success: true, method: 'api', token: fullToken.substring(0, 20) + '...' };
        console.log('  ✅ Login API OK — Token: ' + fullToken.substring(0, 20) + '...');
      } else {
        bugReport.login = { success: false, method: 'api', error: 'No token in response' };
        console.log('  ❌ Không lấy được token từ API response');
      }
    } else {
      bugReport.login = { success: false, method: 'api', error: loginRes.data?.message || 'Unknown' };
      console.log('  ❌ Login API thất bại: ' + (loginRes.data?.message || 'Unknown'));
    }
  } catch (e) {
    bugReport.login = { success: false, method: 'api', error: e.message };
    console.log('  ❌ Lỗi mạng khi gọi API login: ' + e.message);
  }

  // Early exit nếu login thất bại
  if (!bugReport.login.success) {
    console.log('\n⛔ DỪNG: Không thể đăng nhập. Kiểm tra lại tài khoản hoặc kết nối đến ' + API_URL);
    console.log('   Account: ' + account.username + ' | Portal: ' + portal);
    process.exit(1);
  }

  // ── Step 2: Launch browser + set auth ──
  console.log('\n[2/5] Khởi động browser...');
  const browser = await chromium.launch({ headless: HEADLESS });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();

  // ── Collectors ──
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (!isRelevant(text)) return;
    bugReport.consoleErrors.push({
      type: 'console',
      text: shorten(text, 300),
      location: msg.location() || {},
      timestamp: new Date().toISOString(),
    });
  });

  page.on('pageerror', err => {
    const text = err.message || '';
    if (!isRelevant(text)) return;
    bugReport.pageErrors.push({
      type: 'pageerror',
      text: shorten(text, 300),
      stack: shorten(err.stack, 500),
      timestamp: new Date().toISOString(),
    });
  });

  page.on('requestfailed', req => {
    const url = req.url();
    // Chỉ quan tâm lỗi load source code
    if (!url.includes('.ts') && !url.includes('.tsx') && !url.includes('.js') && !url.includes('.css')) return;
    if (!isRelevant(url)) return;
    bugReport.networkErrors.push({
      type: 'requestfailed',
      url: shorten(url, 300),
      failure: req.failure()?.errorText || 'unknown',
      timestamp: new Date().toISOString(),
    });
  });

  page.on('response', res => {
    const status = res.status();
    const url = res.url();
    // Bắt lỗi 4xx/5xx từ mọi nguồn
    if (status >= 400) {
      if (url.includes('/api/')) {
        bugReport.apiResponses.push({
          type: 'api_error',
          status,
          url: shorten(url, 300),
          method: res.request().method(),
          timestamp: new Date().toISOString(),
        });
      } else if (status >= 500) {
        bugReport.networkErrors.push({
          type: 'server_error',
          status,
          url: shorten(url, 300),
          timestamp: new Date().toISOString(),
        });
      } else {
        // 4xx non-API: redirect loops, auth errors...
        bugReport.networkErrors.push({
          type: 'http_' + status,
          status,
          url: shorten(url, 300),
          timestamp: new Date().toISOString(),
        });
      }
    }
  });

  // ── Step 3: Set auth storage ──
  console.log('[3/5] Set auth storage...');
  await page.goto(BASE_URL + '/#/auth/login', { timeout: 10000, waitUntil: 'domcontentloaded' });
  await page.evaluate((data) => {
    localStorage.setItem('vtn_access_token', data.token);
    localStorage.setItem('vtn_user', JSON.stringify(data.user));
    localStorage.setItem('vtn_selected_portal', JSON.stringify({ id: data.appType, name: data.portal }));
    localStorage.setItem('vtn_permissions', JSON.stringify({ isOwner: true, menus: [], pages: [] }));
    localStorage.setItem('vtn_refresh_token', data.refreshToken || '');
  }, {
    token: fullToken,
    user: loginUser || { userName: account.username },
    portal,
    appType: getAppType(portal),
    refreshToken: loginRefreshToken,
  });
  console.log('  ✅ Đã set localStorage auth');

  // ── Step 4: Navigate to buggy page ──
  console.log('\n[4/5] Điều hướng đến màn hình lỗi: ' + route);
  try {
    const targetUrl = BASE_URL + '/' + route;
    await page.goto(targetUrl, { timeout: 15000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Kiểm tra có bị redirect về login không
    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
      bugReport.navigation = {
        success: false,
        url: currentUrl,
        title: await page.title(),
        error: 'Bị redirect về trang login — token có thể đã hết hạn hoặc sai portal',
      };
      console.log('  ❌ Redirect về login! Token sai hoặc hết hạn.');
    } else {
      const title = await page.title();
      bugReport.navigation = { success: true, url: currentUrl, title };

      // Check Vite error overlay
      const overlay = await page.$('vite-error-overlay');
      if (overlay) {
        const overlayText = await page.textContent('vite-error-overlay');
        bugReport.viteOverlay = shorten(overlayText, 1000);
        console.log('  🔴 VITE ERROR OVERLAY phát hiện!');
        console.log('  ' + shorten(overlayText, 200));
      } else {
        console.log('  ✅ Trang load OK — Title: ' + title);
      }
    }
  } catch (e) {
    bugReport.navigation = {
      success: false,
      url: BASE_URL + '/' + route,
      title: '',
      error: e.message,
    };
    console.log('  ❌ Navigation failed: ' + e.message);
  }

  // ── Step 5: Execute reproduction steps ──
  console.log('\n[5/5] Thực thi các bước tái hiện lỗi...');
  if (stepsFile && fs.existsSync(stepsFile)) {
    await executeSteps(page, stepsFile);
  } else {
    await autoDiscoverAndInteract(page);
  }

  // ── Wait for any pending requests ──
  await page.waitForTimeout(2000);

  // ── Final snapshot ──
  console.log('\n--- 📸 Trạng thái cuối cùng ---');
  try {
    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 500) || '');
    console.log('  Body preview: ' + bodyText.substring(0, 200));
  } catch (e) { /* ignore */ }

  await browser.close();

  // ── Summarize ──
  const totalErrors = bugReport.consoleErrors.length + bugReport.pageErrors.length
    + bugReport.networkErrors.length + bugReport.apiResponses.length
    + (bugReport.viteOverlay ? 1 : 0) + (bugReport.navigation.error ? 1 : 0);

  bugReport.summary = {
    totalErrors,
    consoleErrors: bugReport.consoleErrors.length,
    pageErrors: bugReport.pageErrors.length,
    networkErrors: bugReport.networkErrors.length,
    apiErrors: bugReport.apiResponses.length,
    viteOverlay: !!bugReport.viteOverlay,
    navigationFailed: !bugReport.navigation.success,
  };

  // ── Save report ──
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.writeFileSync(LOG_FILE, JSON.stringify(bugReport, null, 2), 'utf8');

  // ── Nếu là retest, so sánh với lần trước ──
  if (isRetest && fs.existsSync(PREV_LOG_FILE)) {
    const prev = JSON.parse(fs.readFileSync(PREV_LOG_FILE, 'utf8'));
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║  📊 SO SÁNH RETEST                         ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log('║  Trước: ' + String(prev.summary.totalErrors).padEnd(6) + ' lỗi                      ║');
    console.log('║  Sau:   ' + String(totalErrors).padEnd(6) + ' lỗi                      ║');

    if (totalErrors === 0) {
      console.log('║                                            ║');
      console.log('║  ✅ ALL CLEAN — Có thể xóa logs tạm       ║');
      console.log('╚══════════════════════════════════════════════╝');
      // Tự động dọn dẹp khi fix xong
      cleanupLogs();
    } else if (totalErrors < prev.summary.totalErrors) {
      console.log('║  🔶 Còn ' + String(totalErrors).padEnd(4) + ' lỗi — đã giảm ' + String(prev.summary.totalErrors - totalErrors) + ' lỗi          ║');
      console.log('╚══════════════════════════════════════════════╝');
      // Giữ lại để debug tiếp
      fs.copyFileSync(LOG_FILE, PREV_LOG_FILE);
    } else {
      console.log('║  🔴 Số lỗi không giảm — kiểm tra lại      ║');
      console.log('╚══════════════════════════════════════════════╝');
      fs.copyFileSync(LOG_FILE, PREV_LOG_FILE);
    }
  } else {
    // Lưu làm previous cho lần retest sau
    fs.copyFileSync(LOG_FILE, PREV_LOG_FILE);
  }

  // ── Final output ──
  console.log('\n--- 📋 BÁO CÁO CHI TIẾT ---');
  console.log('Saved: ' + LOG_FILE);

  if (bugReport.viteOverlay) {
    console.log('\n🔴 VITE ERROR OVERLAY:');
    console.log('  ' + bugReport.viteOverlay.substring(0, 500));
  }

  if (bugReport.consoleErrors.length > 0) {
    console.log('\n🟡 CONSOLE ERRORS (' + bugReport.consoleErrors.length + '):');
    bugReport.consoleErrors.slice(0, 15).forEach((e, i) => {
      console.log('  [' + (i + 1) + '] ' + e.text.substring(0, 200));
    });
    if (bugReport.consoleErrors.length > 15) console.log('  ... +' + (bugReport.consoleErrors.length - 15) + ' more');
  }

  if (bugReport.apiResponses.length > 0) {
    console.log('\n🔴 API ERRORS (' + bugReport.apiResponses.length + '):');
    bugReport.apiResponses.forEach((e, i) => {
      console.log('  [' + (i + 1) + '] ' + e.method + ' ' + e.status + ' — ' + e.url.substring(0, 150));
    });
  }

  if (bugReport.networkErrors.length > 0) {
    console.log('\n🔴 NETWORK ERRORS (' + bugReport.networkErrors.length + '):');
    bugReport.networkErrors.slice(0, 10).forEach((e, i) => {
      console.log('  [' + (i + 1) + '] ' + (e.status ? e.status + ' ' : '') + e.url.substring(0, 150));
    });
  }

  if (bugReport.pageErrors.length > 0) {
    console.log('\n🔴 PAGE ERRORS (' + bugReport.pageErrors.length + '):');
    bugReport.pageErrors.slice(0, 10).forEach((e, i) => {
      console.log('  [' + (i + 1) + '] ' + e.text.substring(0, 200));
    });
    if (bugReport.pageErrors.length > 10) console.log('  ... +' + (bugReport.pageErrors.length - 10) + ' more');
  }

  // ── Exit code ──
  if (isRetest && totalErrors === 0) {
    console.log('\n✅ FIX VERIFIED — Lỗi đã được sửa hoàn toàn.');
    process.exit(0);
  } else if (totalErrors > 0) {
    console.log('\n❌ Còn ' + totalErrors + ' lỗi cần xử lý. Xem chi tiết: ' + LOG_FILE);
    process.exit(1);
  } else {
    console.log('\n✅ Không phát hiện lỗi.');
    process.exit(0);
  }
}

// ── Auto-discover & interact ──
async function autoDiscoverAndInteract(page) {
  console.log('  🔍 Tự động quét các nút thao tác...');

  // Quét tất cả button trên trang
  const buttons = await page.$$('button');
  const clickableButtons = [];

  for (const btn of buttons) {
    const text = (await btn.textContent())?.trim() || '';
    const isVisible = await btn.isVisible();
    const isEnabled = await btn.isEnabled();
    const dataQa = await btn.getAttribute('data-qa');

    if (isVisible && isEnabled && text) {
      clickableButtons.push({ text, dataQa, element: btn });
    }
  }

  console.log('  Tìm thấy ' + clickableButtons.length + ' nút có thể click');
  const interestingTexts = ['thêm', 'tạo mới', 'sửa', 'xem', 'lưu', 'hủy', 'xóa', 'tìm kiếm', 'làm mới'];

  // Click nút "Thêm" hoặc nút đầu tiên để mở dialog
  const addBtn = clickableButtons.find(b =>
    interestingTexts.some(t => b.text.toLowerCase().includes(t))
  );

  if (addBtn) {
    console.log('  👆 Click: "' + addBtn.text + '"');
    try {
      await addBtn.element.click();
      await page.waitForTimeout(2000);

      // Kiểm tra dialog có mở không
      const dialog = await page.$('[role="dialog"], [data-state="open"], .dm-dialog');
      if (dialog) {
        console.log('  ✅ Dialog đã mở — quét fields...');
        await scanDialogFields(page);

        // Đóng dialog
        const closeBtn = await page.$('button:has-text("Hủy"), button:has-text("Đóng"), [data-qa="btn_huy"]');
        if (closeBtn) { await closeBtn.click(); await page.waitForTimeout(500); }
        else { await page.keyboard.press('Escape'); await page.waitForTimeout(500); }
      }
    } catch (e) {
      console.log('  ⚠️ Lỗi khi click nút: ' + e.message);
    }
  }

  // Thử mở dropdown menu actions trên dòng đầu tiên
  const actionBtns = await page.$$('[data-qa*="action"], [data-qa*="btn_"], .icon-primary, .icon-warning, .icon-success, .icon-danger');
  if (actionBtns.length > 0) {
    console.log('  Tìm thấy ' + actionBtns.length + ' action buttons/icons');
  }
}

// ── Scan dialog fields ──
async function scanDialogFields(page) {
  const inputs = await page.$$('input:not([type="hidden"]), textarea, select, [role="combobox"]');
  console.log('  Fields: ' + inputs.length);

  // Fill lần lượt từng field với dữ liệu test
  for (const input of inputs.slice(0, 5)) { // Giới hạn 5 field đầu
    try {
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const dataQa = await input.getAttribute('data-qa');
      const isVisible = await input.isVisible();
      if (!isVisible) continue;

      const tagName = await input.evaluate(el => el.tagName.toLowerCase());

      if (tagName === 'input') {
        if (type === 'text' || !type) {
          await input.fill('Test_' + Date.now());
        } else if (type === 'number' || type === 'tel') {
          await input.fill('123');
        }
      }
      await page.waitForTimeout(200);
    } catch (e) { /* skip */ }
  }
}

// ── Execute custom steps from JSON file ──
async function executeSteps(page, filePath) {
  try {
    const steps = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log('  📋 Load ' + steps.length + ' bước từ ' + filePath);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log('  [' + (i + 1) + '/' + steps.length + '] ' + step.description);

      switch (step.action) {
        case 'click':
          await page.click(step.selector);
          break;
        case 'fill':
          await page.fill(step.selector, step.value);
          break;
        case 'select':
          await page.selectOption(step.selector, step.value);
          break;
        case 'wait':
          await page.waitForTimeout(step.ms || 1000);
          break;
        case 'navigate':
          await page.goto(step.url, { timeout: 10000, waitUntil: 'domcontentloaded' });
          break;
        case 'press':
          await page.keyboard.press(step.key);
          break;
        default:
          console.log('    ⚠️ Unknown action: ' + step.action);
      }

      if (step.waitAfter) await page.waitForTimeout(step.waitAfter);
    }
  } catch (e) {
    console.log('  ❌ Lỗi khi thực thi steps: ' + e.message);
  }
}

// ── Cleanup temp logs ──
function cleanupLogs() {
  console.log('\n🧹 Dọn dẹp logs tạm...');
  try {
    if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);
    if (fs.existsSync(PREV_LOG_FILE)) fs.unlinkSync(PREV_LOG_FILE);
    // Xóa thư mục logs nếu trống
    const files = fs.readdirSync(LOG_DIR);
    if (files.length === 0) fs.rmdirSync(LOG_DIR);
    console.log('  ✅ Đã xóa logs tạm.');
  } catch (e) {
    console.log('  ⚠️ Không thể xóa: ' + e.message);
  }
}

// ── Helper ──
function getAppType(portal) {
  const map = { ketoan: 4, invoice: 2, admin: 1, partner: 3, crm: 5, kiemthu: 6, taisan: 7, sso: 8, baseindex: 9 };
  return map[portal] || 4;
}

main();
