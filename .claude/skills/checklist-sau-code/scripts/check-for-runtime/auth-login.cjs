// ============================================================
// auth-login.cjs — Đăng nhập NHANH cho runtime-check (không fill form)
// ============================================================
// Gọi SSO API login → lưu .runtime-auth.json (storageState cho Playwright)
// Usage: node auth-login.cjs <portal>
// Output: .runtime-auth.json { portal, accessToken, storageState: {...} }
//
// Storage keys khớp TokenManager.ts + useLogin.ts:
//   vtn_access_token / vtn_refresh_token / vtn_token_expires_at
//   vtn_user_permissions (QUAN TRỌNG — PermissionContext đọc để phân quyền)
//   vtn_selected_portal / vtn_sso_pages
//
// ⚠️ Dùng https module (KHÔNG dùng global fetch — undici của Node 24 trên
// Windows crash libuv `UV_HANDLE_CLOSING` khi gọi process.exit sau fetch).
// ============================================================

const fs = require('fs');
const p = require('path');
const https = require('https');

const args = process.argv.slice(2);
const portal = (args[0] || 'ketoan').toLowerCase();

const ACCOUNTS_FILE = p.join(__dirname, '..', 'accounts', 'account.json');
const AUTH_FILE = p.join(process.cwd(), '.runtime-auth.json');
// SSO base URL — giống .env.devlocal (VITE_SSO_BASE_URL)
const SSO_BASE_URL = process.env.SSO_BASE_URL || 'https://sso.vtax.id.vn';

// Key lưu trong localStorage (khớp TokenManager.ts + PermissionContext)
const ACCESS_TOKEN_KEY = 'vtn_access_token';
const REFRESH_TOKEN_KEY = 'vtn_refresh_token';
const TOKEN_EXPIRES_AT_KEY = 'vtn_token_expires_at';
const PERMISSIONS_KEY = 'vtn_user_permissions';
const SELECTED_PORTAL_KEY = 'vtn_selected_portal';
const SSO_PAGES_KEY = 'vtn_sso_pages';

if (!fs.existsSync(ACCOUNTS_FILE)) {
  console.error('❌ Không tìm thấy ' + ACCOUNTS_FILE);
  process.exit(1);
}

const accounts = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
const account = accounts[portal];
if (!account) {
  console.error('❌ Không có tài khoản cho portal: ' + portal);
  process.exit(1);
}

/** Gọi POST HTTPS thuần (tránh undici fetch gây crash khi process.exit) */
function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    let u;
    try { u = new URL(url); } catch (e) { reject(e); return; }
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, res => {
      let raw = '';
      res.on('data', c => { raw += c; });
      res.on('end', () => {
        let json = {};
        try { json = JSON.parse(raw); } catch {}
        resolve({ status: res.statusCode, json });
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/** Gọi 1 lần thử login với body cụ thể */
async function tryLogin(body) {
  try {
    return await httpsPost(SSO_BASE_URL + '/api/auth/login', body);
  } catch (e) {
    return { status: 0, json: {} };
  }
}

/**
 * Map portal enum → portalType cho vtn_selected_portal (giống useLogin.ts)
 * 'Business' → 'business' | 'Admin' → 'admin' | 'Partner' → 'partner' | 'Sso' → 'sso'
 */
function mapPortalType(portalValue) {
  const v = String(portalValue || '').toLowerCase();
  if (v === 'admin') return 'admin';
  if (v === 'partner') return 'partner';
  if (v === 'sso' || v === 'ssoapp') return 'sso';
  return 'business'; // mặc định Business
}

async function main() {
  // SSO nhận nhiều loại tên đăng nhập (MST/ĐT/email) — thử các field name phổ biến
  const loginAttempts = [
    { userName: account.username, password: account.password },
    { username: account.username, password: account.password },
    { email: account.username, password: account.password },
  ];

  let result = null;
  for (const body of loginAttempts) {
    const r = await tryLogin(body);
    if (r.status === 200 && r.json && r.json.success) {
      result = r.json;
      break;
    }
  }

  if (!result) {
    console.error('❌ Login thất bại qua ' + SSO_BASE_URL + '/api/auth/login (đã thử userName/username/email).');
    process.exit(1);
  }

  const data = result.data || {};
  const accessToken = data.token || data.accessToken || '';
  const refreshToken = data.refreshToken || '';
  const expiresIn = data.expiresIn || 3600;

  if (!accessToken) {
    console.error('❌ Response login không chứa token: ' + JSON.stringify(result).slice(0, 300));
    process.exit(1);
  }

  // ===== Replicate useLogin.ts — lưu ĐẦY ĐỦ storageState =====
  const storageState = {
    [ACCESS_TOKEN_KEY]: accessToken,
    [TOKEN_EXPIRES_AT_KEY]: String(Date.now() + expiresIn * 1000),
  };
  if (refreshToken) storageState[REFRESH_TOKEN_KEY] = refreshToken;

  // user + pages/menus từ login response (useLogin.ts đọc các field này)
  const user = data.user || {};
  const rawPages = Array.isArray(data.pages) ? data.pages : [];
  const rawMenus = Array.isArray(data.menus) ? data.menus : [];
  // effectiveIsOwner = user.isOwner || hasOwnerPermission === true (v3.1 — sub-user có owner quyền)
  const effectiveIsOwner = user.isOwner === true || user.hasOwnerPermission === true;
  // permissionSource ưu tiên pages (SSO format mới) → fallback menus (legacy)
  const permissionSource = rawPages.length ? rawPages : rawMenus;

  // vtn_selected_portal — AppSwitcher cần biết portal hiện tại
  if (user.portal) {
    storageState[SELECTED_PORTAL_KEY] = mapPortalType(user.portal);
  }
  // vtn_sso_pages — pages raw từ SSO (nếu có)
  if (rawPages.length) {
    storageState[SSO_PAGES_KEY] = JSON.stringify(rawPages);
  }
  // vtn_user_permissions — BẮT BUỘC, PermissionContext đọc để phân quyền
  // Format khớp StoredPermissionData { isOwner, menus, savedAt }.
  // PermissionContext tự re-normalize khi menus thiếu navMenuCode (format SSO).
  storageState[PERMISSIONS_KEY] = JSON.stringify({
    isOwner: effectiveIsOwner,
    menus: permissionSource,
    savedAt: new Date().toISOString(),
  });

  console.log('🔐 [auth-login] permissions:', {
    portal,
    effectiveIsOwner,
    pagesCount: rawPages.length,
    menusCount: rawMenus.length,
    permissionSource: rawPages.length ? 'pages (SSO)' : 'menus (legacy)',
  });

  fs.writeFileSync(AUTH_FILE, JSON.stringify({ portal, accessToken, storageState }, null, 2));
  console.log('✅ Auth OK: ' + portal + ' → ' + AUTH_FILE);
  process.exit(0);
}

main();
