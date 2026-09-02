---
name: clone-web-playwright
description: 'Dùng Playwright mở trình duyệt, truy cập trang web (có authentication), chụp ảnh và trích xuất toàn bộ thông tin UI/UX: bố cục, form fields, bảng dữ liệu, buttons, menu, filter, phân trang, tabs, dialogs... để làm tài liệu thiết kế front-end. Dùng khi: user cung cấp URL cần clone, cần phân tích giao diện web có sẵn, muốn tái tạo UI từ web tham khảo, cần snapshot toàn bộ màn hình nghiệp vụ. Kế thừa skill ve-theo-template cho phần ánh xạ UI → SASUCO conventions.'
argument-hint: 'URL trang web cần clone. VD: https://actasp.misa.vn/app/BA/BADepositWithdraw/BADepositWithdrawList/Deposit'
---

# Clone Web Bằng Playwright — SASUCO InvoiceEasy

> **Mục tiêu:** Dùng Playwright mở trình duyệt thật, truy cập trang web đích (kể cả có authentication), tự động chụp ảnh & trích xuất cấu trúc UI → tạo tài liệu phân tích đầy đủ để làm front-end.

---

## ⚠️ Hạn Chế Model

| Model | Hỗ trợ view_image? | Cách làm việc |
|-------|-------------------|---------------|
| **Claude Sonnet** | ✅ CÓ | Phân tích ảnh chụp trực tiếp từ `view_image` |
| **DeepSeek V4 Pro** | ❌ KHÔNG | Chỉ phân tích dữ liệu text từ `page-snapshot.json` |

> Khi dùng DeepSeek: **bỏ qua bước xem ảnh**, tập trung vào dữ liệu text trong `raw/page-snapshot.json` và `analysis/api-requests.json`. Ảnh chụp vẫn được lưu để user tự xem.

---

## 🔑 Quản Lý Session (Tự Động)

Script tự động lưu/tái sử dụng session để tránh đăng nhập lại:

```
Lần 1: Đăng nhập thủ công → lưu auth.json
Lần 2+: Kiểm tra auth.json → nếu còn hạn → dùng luôn
        Nếu hết hạn → xóa auth.json → yêu cầu đăng nhập lại
```

| File | Vị trí | Mục đích |
|------|--------|----------|
| `auth.json` | `exports/clone-results/<ten-trang>/auth.json` | Lưu cookies + localStorage + sessionStorage |

> **Bảo mật:** `auth.json` chứa token, không commit vào git. Thêm vào `.gitignore`.

---

## 🎯 Phát Hiện Framework Grid

Nhiều web không dùng `<table>` HTML mà dùng grid component:

| Framework | CSS Selector | Cách trích xuất |
|-----------|-------------|-----------------|
| **DevExtreme** | `.dx-datagrid` | Headers: `.dx-header-row td[role="columnheader"]`; Rows: `tr.dx-data-row`; Cells: `td` |
| **AG Grid** | `.ag-root` | Headers: `.ag-header-cell-text`; Rows: `.ag-row` |
| **MUI DataGrid** | `.MuiDataGrid-root` | Headers: `.MuiDataGrid-columnHeader`; Rows: `.MuiDataGrid-row` |
| **Ant Table** | `.ant-table` | Dùng `<table>` chuẩn |
| **Custom div-table** | `[role="grid"]` | Headers: `[role="columnheader"]`; Rows: `[role="row"]` |

> **Script luôn thử `<table>` trước, nếu null → thử các selector grid framework.**

---

## Tổng Quan Quy Trình

```
[Pha 0] Chuẩn bị môi trường  →  [Pha 1] Mở browser & xác thực  →  [Pha 2] Quét & chụp UI  →  [Pha 3] Phân tích & tạo báo cáo
```

---

## Pha 0 — Chuẩn Bị Môi Trường

### 0.1 — Xác định thông tin đầu vào

Trước khi bắt đầu, thu thập từ user:

| Thông tin | Bắt buộc? | Mô tả |
|-----------|-----------|-------|
| **URL đích** | ✅ CÓ | URL đầy đủ của trang cần clone |
| **Credentials** | ⚠️ Nếu có auth | Username + password để đăng nhập |
| **Hướng dẫn đăng nhập** | ⚠️ Nếu có auth | Mô tả cách đăng nhập: chọn tenant, nhập mã xác thực... |
| **Tên dự án/danh mục** | Không bắt buộc | Để đặt tên file báo cáo |

### 0.2 — Tạo script Playwright

Script được tạo trong thư mục `e2e/` với tên `clone-<ten-trang>.spec.ts`. Script sẽ tự động:

1. Mở browser (headless: false để user thấy và can thiệp nếu cần)
2. Điều hướng đến URL đích
3. Đợi user đăng nhập thủ công (nếu cần)
4. Chụp ảnh toàn trang + từng vùng
5. Trích xuất cấu trúc DOM
6. Lưu kết quả ra thư mục `exports/clone-results/`

Cấu trúc thư mục đầu ra:
```
exports/clone-results/
  <ten-trang>/
    screenshots/
      fullpage.png               ← Ảnh toàn trang
      header.png                 ← Vùng header
      filter.png                 ← Vùng filter (nếu có)
      table.png                  ← Vùng bảng (nếu có)
      form.png                   ← Vùng form (nếu có)
      footer.png                 ← Vùng footer
      dialog-<ten>.png           ← Từng dialog
    analysis/
      page-structure.md          ← Báo cáo phân tích tổng thể
      fields-inventory.md        ← Kiểm kê tất cả fields
      table-columns.md           ← Cột bảng
      buttons-actions.md         ← Nút & hành động
      api-requests.json          ← Các API call bắt được
    raw/
      page-snapshot.json         ← Dữ liệu thô từ DOM
```

---

## Pha 1 — Mở Browser & Xác Thực

### Bước 1.1: Tạo script clone

Script Playwright có cấu trúc:

```typescript
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const TARGET_URL = '<URL từ user>';
const OUTPUT_DIR = 'exports/clone-results/<ten-trang>';

(async () => {
  // Tạo thư mục output
  mkdirSync(join(OUTPUT_DIR, 'screenshots'), { recursive: true });
  mkdirSync(join(OUTPUT_DIR, 'analysis'), { recursive: true });
  mkdirSync(join(OUTPUT_DIR, 'raw'), { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();

  // === XỬ LÝ AUTHENTICATION ===
  // Bước 1: Điều hướng đến trang login hoặc trực tiếp
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

  // Nếu bị redirect về trang login → đợi user đăng nhập thủ công
  // Script sẽ đợi đến khi URL chứa pattern của trang đích
  const targetPattern = new URL(TARGET_URL).pathname.split('/').slice(0, 4).join('/');
  
  console.log('⏳ Đợi đăng nhập... (nếu cần, hãy đăng nhập thủ công trên browser)');
  
  // Đợi tối đa 5 phút để user đăng nhập
  await page.waitForURL(`**${targetPattern}**`, { timeout: 300000 });
  
  console.log('✅ Đã vào trang đích!');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // === GHI NHẬN API CALLS ===
  const apiRequests: any[] = [];
  page.on('request', (req) => {
    if (req.url().includes('/api/') || req.url().includes('/app/')) {
      apiRequests.push({
        url: req.url(),
        method: req.method(),
        headers: req.headers(),
        postData: req.postData(),
        timestamp: new Date().toISOString(),
      });
    }
  });

  // ... tiếp tục Pha 2
})();
```

### Bước 1.2: Xử lý authentication

Có 3 chiến lược:

| Chiến lược | Khi dùng | Cách làm |
|-----------|----------|----------|
| **A. Đăng nhập thủ công** | Web có 2FA, captcha, tenant selection | Mở browser → user tự login → script đợi URL đổi |
| **B. Tự động fill credentials** | Login form đơn giản (user/pass) | Dùng `page.fill()` + `page.click()` |
| **C. Tái sử dụng session** | Đã login trước đó | Dùng `storageState` từ file `auth.json` |

**Mặc định dùng chiến lược A** (an toàn nhất, phù hợp mọi loại auth).

### Bước 1.3: Chạy script

```powershell
# Chạy script clone trong thư mục dự án
npx tsx e2e/clone-<ten-trang>.spec.ts
```

> **Lưu ý:** Script chạy độc lập, không dùng `playwright test`. Dùng `tsx` để chạy trực tiếp file TypeScript.

---

## Pha 2 — Quét & Chụp UI

### Bước 2.1: Chụp ảnh toàn trang

```typescript
// Chụp full page
await page.screenshot({ 
  path: join(OUTPUT_DIR, 'screenshots', 'fullpage.png'), 
  fullPage: true 
});
```

### Bước 2.2: Phân vùng & chụp từng khu vực

Dùng `page.evaluate()` để tìm các vùng chính trong DOM và chụp riêng:

```typescript
// Tìm các vùng chính bằng CSS selector phổ biến
const regions = await page.evaluate(() => {
  const findRegion = (selectors: string[]) => {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return { selector: sel, rect: el.getBoundingClientRect() };
    }
    return null;
  };

  return {
    // Header / toolbar
    header: findRegion([
      '.toolbar', '.page-header', '.header', '[class*="header"]',
      '[class*="toolbar"]', '.ant-page-header', '.top-bar'
    ]),
    // Filter area
    filter: findRegion([
      '.filter', '.search-area', '.filter-bar', '[class*="filter"]',
      '[class*="search"]', '.ant-form'
    ]),
    // Main table
    table: findRegion([
      'table', '.table', '.grid', '.data-grid', '[class*="table"]',
      '[class*="grid"]', '.ant-table', '.dx-datagrid'
    ]),
    // Form / dialog (nếu đang mở)
    form: findRegion([
      '.modal', '.dialog', '.drawer', '[role="dialog"]',
      '[class*="modal"]', '[class*="dialog"]', '.ant-modal'
    ]),
    // Footer / pagination
    footer: findRegion([
      '.pagination', '.pager', '.footer', '[class*="pagination"]',
      '[class*="pager"]', '.ant-pagination'
    ]),
    // Sidebar / menu
    sidebar: findRegion([
      '.sidebar', '.menu', '.nav', '[class*="sidebar"]',
      '[class*="menu"]', '[class*="nav"]', '.ant-menu'
    ]),
  };
});

// Chụp từng vùng
for (const [name, region] of Object.entries(regions)) {
  if (region) {
    const el = page.locator(region.selector).first();
    if (await el.isVisible()) {
      await el.screenshot({ path: join(OUTPUT_DIR, 'screenshots', `${name}.png`) });
    }
  }
}
```

### Bước 2.3: Trích xuất cấu trúc DOM

#### 2.3.1 — Trích xuất Form Fields

```typescript
const fields = await page.evaluate(() => {
  const results: any[] = [];
  
  // Tìm tất cả input, select, textarea trong form hoặc dialog
  const formElements = document.querySelectorAll(
    'form input, form select, form textarea, ' +
    '[role="dialog"] input, [role="dialog"] select, [role="dialog"] textarea, ' +
    '.modal input, .modal select, .modal textarea, ' +
    'input:not([type="hidden"]), select, textarea'
  );

  formElements.forEach((el) => {
    const input = el as HTMLInputElement;
    // Tìm label gần nhất
    let label = '';
    const id = input.id;
    if (id) {
      const labelEl = document.querySelector(`label[for="${id}"]`);
      if (labelEl) label = labelEl.textContent?.trim() || '';
    }
    if (!label) {
      // Tìm label trong parent
      const parent = input.closest('td, .field, .form-group, .form-item, .ant-form-item');
      if (parent) {
        const labelEl = parent.querySelector('label, .label, .field-label');
        if (labelEl) label = labelEl.textContent?.trim() || '';
      }
    }

    results.push({
      tag: input.tagName.toLowerCase(),
      type: input.getAttribute('type') || 'text',
      name: input.getAttribute('name') || '',
      id: input.id || '',
      placeholder: input.getAttribute('placeholder') || '',
      label: label,
      required: input.hasAttribute('required') || input.getAttribute('aria-required') === 'true',
      readonly: input.hasAttribute('readonly') || input.getAttribute('aria-readonly') === 'true',
      disabled: input.hasAttribute('disabled'),
      maxLength: input.getAttribute('maxlength') || '',
      className: input.className || '',
      dataQa: input.getAttribute('data-qa') || '',
      options: [], // Sẽ điền nếu là select
    });

    // Nếu là select, lấy options
    if (input.tagName === 'SELECT') {
      const select = input as HTMLSelectElement;
      const last = results[results.length - 1];
      last.options = Array.from(select.options).map(o => ({
        value: o.value,
        text: o.text,
      }));
    }
  });

  return results;
});
```

#### 2.3.2 — Trích xuất Table Columns

```typescript
const tableInfo = await page.evaluate(() => {
  // Tìm table đầu tiên có dữ liệu
  const tables = document.querySelectorAll('table, [role="grid"], .table, .grid');
  for (const table of tables) {
    // Lấy headers
    const headers: string[] = [];
    const headerRow = table.querySelector('thead tr, .header-row, [class*="header"]');
    if (headerRow) {
      headerRow.querySelectorAll('th, .column-header').forEach(th => {
        headers.push(th.textContent?.trim() || '');
      });
    }
    if (headers.length === 0) continue;

    // Lấy dữ liệu mẫu (3 dòng đầu)
    const sampleRows: string[][] = [];
    const tbody = table.querySelector('tbody');
    if (tbody) {
      const rows = tbody.querySelectorAll('tr');
      for (let i = 0; i < Math.min(3, rows.length); i++) {
        const cells: string[] = [];
        rows[i].querySelectorAll('td').forEach(td => {
          cells.push(td.textContent?.trim() || '');
        });
        sampleRows.push(cells);
      }
    }

    return { headers, sampleRows, rowCount: tbody?.querySelectorAll('tr').length || 0 };
  }
  return null;
});
```

#### 2.3.3 — Trích xuất Buttons & Actions

```typescript
const buttons = await page.evaluate(() => {
  const results: any[] = [];
  const buttonElements = document.querySelectorAll(
    'button, a.btn, [role="button"], ' +
    '.toolbar button, .header button, .action-bar button, ' +
    '[class*="btn"]:not([class*="btn-"])'
  );

  buttonElements.forEach((el) => {
    const btn = el as HTMLElement;
    const text = btn.textContent?.trim() || btn.getAttribute('aria-label') || '';
    if (!text || text.length > 50) return; // Bỏ qua text quá dài

    const style = window.getComputedStyle(btn);
    results.push({
      text: text,
      tag: btn.tagName.toLowerCase(),
      type: btn.getAttribute('type') || '',
      className: btn.className || '',
      title: btn.getAttribute('title') || '',
      icon: btn.querySelector('svg, i, [class*="icon"]') ? 'CÓ' : 'KHÔNG',
      backgroundColor: style.backgroundColor,
      color: style.color,
      position: btn.getBoundingClientRect(),
    });
  });

  return results;
});
```

#### 2.3.4 — Trích xuất Menu / Navigation

```typescript
const navigation = await page.evaluate(() => {
  const nav: any = {};

  // Sidebar menu
  const sidebarItems: string[] = [];
  document.querySelectorAll(
    '.sidebar a, .menu a, '.nav a, ' +
    '[class*="sidebar"] a, [class*="menu-item"], ' +
    '.ant-menu-item'
  ).forEach(el => {
    const text = el.textContent?.trim();
    if (text) sidebarItems.push(text);
  });
  if (sidebarItems.length > 0) nav.sidebar = sidebarItems;

  // Breadcrumb
  const breadcrumb: string[] = [];
  document.querySelectorAll(
    '.breadcrumb *, [class*="breadcrumb"] *'
  ).forEach(el => {
    const text = el.textContent?.trim();
    if (text && text.length < 50) breadcrumb.push(text);
  });
  if (breadcrumb.length > 0) nav.breadcrumb = breadcrumb;

  // Tabs
  const tabs: string[] = [];
  document.querySelectorAll(
    '.tab, [role="tab"], .nav-tabs li, ' +
    '[class*="tab-"]:not([class*="table"])'
  ).forEach(el => {
    const text = el.textContent?.trim();
    if (text) tabs.push(text);
  });
  if (tabs.length > 0) nav.tabs = tabs;

  return nav;
});
```

### Bước 2.4: Lưu dữ liệu thô

```typescript
const snapshot = {
  url: page.url(),
  title: await page.title(),
  timestamp: new Date().toISOString(),
  fields: fields,
  table: tableInfo,
  buttons: buttons,
  navigation: navigation,
  apiRequests: apiRequests,
};

writeFileSync(
  join(OUTPUT_DIR, 'raw', 'page-snapshot.json'),
  JSON.stringify(snapshot, null, 2)
);

// Lưu API requests riêng
writeFileSync(
  join(OUTPUT_DIR, 'analysis', 'api-requests.json'),
  JSON.stringify(apiRequests, null, 2)
);
```

---

## Pha 3 — Phân Tích & Tạo Báo Cáo

### Bước 3.1: Phân tích tổng thể

Dựa trên dữ liệu đã thu thập, agent phân tích:

1. **Loại trang:** Master Page / Form Page / Dashboard / Detail Page / Sub Page?
2. **Bố cục:** Mấy vùng chính? Bố trí ra sao?
3. **Công nghệ:** Nhận diện framework (React, Angular, ASP.NET, DevExtreme, Ant Design...)?

### Bước 3.2: Tạo báo cáo `page-structure.md`

```markdown
# Phân Tích Trang: <Tên trang>

**URL:** `<url>`
**Ngày clone:** <ngày>
**Tiêu đề trang:** <title>

## 1. Tổng Quan

- **Loại UI:** Master Page (bảng danh sách + filter)
- **Framework nhận diện:** DevExtreme / Ant Design / Custom
- **Bố cục:** Header → Filter → Toolbar → Table → Pagination

## 2. Cấu Trúc Trang

| Vùng | Vị trí | Mô tả |
|------|--------|-------|
| Header | Trên cùng | Tiêu đề + breadcrumb + user menu |
| Filter | Dưới header | Ô search + dropdown filter + nút Lọc |
| Toolbar | Trên bảng | Nút Thêm mới, Xuất Excel, Làm mới |
| Table | Giữa | Bảng danh sách dữ liệu chính |
| Pagination | Dưới bảng | Phân trang + chọn page size |

## 3. Fields (form/dialog)

| # | Label | Kiểu | Bắt buộc | Ghi chú |
|---|-------|------|----------|---------|
| 1 | Mã | text | ✅ | Tự sinh hoặc nhập |
| 2 | Tên | text | ✅ | |
| ... | ... | ... | ... | ... |

## 4. Bảng (table columns)

| # | Tên cột | Kiểu dữ liệu | Căn lề | Format |
|---|---------|-------------|--------|--------|
| 1 | Mã | text | left | - |
| 2 | Số tiền | number | right | Currency |
| ... | ... | ... | ... | ... |

## 5. Buttons & Actions

| Nút | Vị trí | Màu sắc | Hành động |
|-----|--------|---------|-----------|
| Thêm mới | Toolbar | Primary/Xanh | Mở dialog tạo mới |
| Sửa | Table row | Warning/Vàng | Mở dialog chỉnh sửa |
| ... | ... | ... | ... |

## 6. Navigation

- **Breadcrumb:** `<path>`
- **Tabs:** (nếu có)
- **Sidebar:** (nếu có)

## 7. API Endpoints Phát Hiện

| Method | URL | Mục đích |
|--------|-----|----------|
| GET | /api/... | Lấy danh sách |
| POST | /api/... | Tạo mới |
| ... | ... | ... |
```

### Bước 3.3: Tạo báo cáo fields, columns, buttons riêng

- `fields-inventory.md`: Danh sách chi tiết từng field kèm validation
- `table-columns.md`: Cấu trúc cột kèm format
- `buttons-actions.md`: Tất cả nút kèm hành vi

### Bước 3.4: Gợi ý ánh xạ sang SASUCO

Sau khi có báo cáo, agent ánh xạ sang SASUCO conventions (kế thừa skill `ve-theo-template` Pha 2 & 3):

| Phát hiện từ web clone | Ánh xạ SASUCO |
|------------------------|---------------|
| Input text | `<Input>` |
| Input số | `type='text' inputMode='numeric' text-right` |
| Select/Dropdown danh mục | `<SearchCombobox>` |
| Select/Dropdown enum | `<Select>` |
| Date picker | `<DatePicker>` |
| Table | PagingUtils + formatCurrency/formatDate |
| Nút xanh | `btn-primary` |
| Nút đỏ | `btn-danger` |

---

## Script Mẫu Hoàn Chỉnh

```typescript
// e2e/clone-<ten-trang>.ts
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG = {
  targetUrl: '<URL_DO_USER_CUNG_CAP>',
  outputDir: 'exports/clone-results/<ten-trang>',
  waitForAuth: true,       // true = đợi user login thủ công
  authTimeout: 300_000,    // 5 phút
  viewport: { width: 1440, height: 900 },
};

async function main() {
  // Tạo thư mục
  for (const sub of ['screenshots', 'analysis', 'raw']) {
    mkdirSync(join(CONFIG.outputDir, sub), { recursive: true });
  }

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: CONFIG.viewport });

  // Bắt API calls
  const apiRequests: any[] = [];
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/api/') || url.includes('/odata/') || url.includes('/Services/')) {
      apiRequests.push({
        method: req.method(),
        url,
        postData: req.postData(),
        timestamp: Date.now(),
      });
    }
  });

  // Điều hướng
  console.log(`🌐 Đang mở: ${CONFIG.targetUrl}`);
  await page.goto(CONFIG.targetUrl, { waitUntil: 'domcontentloaded' });

  // Đợi auth nếu cần
  if (CONFIG.waitForAuth) {
    const targetPath = new URL(CONFIG.targetUrl).pathname;
    console.log('⏳ Vui lòng đăng nhập trên browser...');
    try {
      await page.waitForURL(`**${targetPath}**`, { timeout: CONFIG.authTimeout });
    } catch {
      console.log('⚠️ Không detect được URL đích. Tiếp tục với URL hiện tại...');
    }
  }

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  console.log('✅ Trang đã sẵn sàng!');

  // === CHỤP ẢNH ===
  await page.screenshot({ path: join(CONFIG.outputDir, 'screenshots', 'fullpage.png'), fullPage: true });
  console.log('📸 Đã chụp fullpage');

  // === TRÍCH XUẤT ===
  const snapshot = await page.evaluate(() => {
    // --- Fields ---
    const fields: any[] = [];
    document.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach((el: any) => {
      const id = el.id;
      let label = '';
      if (id) {
        const lbl = document.querySelector(`label[for="${id}"]`);
        if (lbl) label = lbl.textContent?.trim() || '';
      }
      fields.push({
        tag: el.tagName, type: el.type || 'text', name: el.name || '',
        id, placeholder: el.placeholder || '', label,
        required: el.required || false, readonly: el.readOnly || false,
        disabled: el.disabled || false,
      });
    });

    // --- Table ---
    let tableInfo: any = null;
    const tables = document.querySelectorAll('table');
    for (const t of tables) {
      const headers: string[] = [];
      t.querySelectorAll('thead th').forEach(th => headers.push(th.textContent?.trim() || ''));
      if (headers.length === 0) continue;
      const rows: string[][] = [];
      t.querySelectorAll('tbody tr').forEach((tr, i) => {
        if (i >= 3) return;
        const cells: string[] = [];
        tr.querySelectorAll('td').forEach(td => cells.push(td.textContent?.trim() || ''));
        rows.push(cells);
      });
      tableInfo = { headers, sampleRows: rows, totalRows: t.querySelectorAll('tbody tr').length };
      break;
    }

    // --- Buttons ---
    const buttons: any[] = [];
    document.querySelectorAll('button, [role="button"]').forEach((el: any) => {
      const text = el.textContent?.trim();
      if (text && text.length < 50) {
        buttons.push({ text, className: el.className, title: el.title || '' });
      }
    });

    // --- Navigation ---
    const nav: any = {};
    const breadcrumb: string[] = [];
    document.querySelectorAll('[class*="breadcrumb"] *').forEach((el: any) => {
      const t = el.textContent?.trim();
      if (t && t.length < 50) breadcrumb.push(t);
    });
    if (breadcrumb.length) nav.breadcrumb = breadcrumb;

    const tabs: string[] = [];
    document.querySelectorAll('[role="tab"]').forEach((el: any) => {
      const t = el.textContent?.trim();
      if (t) tabs.push(t);
    });
    if (tabs.length) nav.tabs = tabs;

    return { title: document.title, fields, table: tableInfo, buttons, navigation: nav };
  });

  // Lưu
  writeFileSync(join(CONFIG.outputDir, 'raw', 'page-snapshot.json'), JSON.stringify({ ...snapshot, url: page.url(), timestamp: new Date().toISOString() }, null, 2));
  writeFileSync(join(CONFIG.outputDir, 'analysis', 'api-requests.json'), JSON.stringify(apiRequests, null, 2));
  
  console.log('✅ Hoàn thành! Dữ liệu đã lưu vào:', CONFIG.outputDir);
  console.log(`   - ${snapshot.fields.length} fields`);
  console.log(`   - ${snapshot.table?.headers?.length || 0} table columns`);
  console.log(`   - ${snapshot.buttons.length} buttons`);
  console.log(`   - ${apiRequests.length} API requests`);

  await browser.close();
}

main().catch(console.error);
```

---

## Hướng Dẫn Sử Dụng Cho Agent

### Khi user yêu cầu clone web:

1. **Hỏi user:**
   - URL đầy đủ của trang cần clone?
   - Có cần đăng nhập không? Nếu có, có credentials không?
   - Tên viết tắt cho trang (để đặt tên thư mục output)?

2. **Tạo script** dựa trên template trên, điền URL và tên thư mục.

3. **Chạy script:**
   ```powershell
   npx tsx e2e/clone-<ten-trang>.spec.ts
   ```

4. **Nếu cần auth:** Browser sẽ mở ra → user tự đăng nhập → script tự động tiếp tục.

5. **Sau khi script chạy xong:**
   - Đọc file `raw/page-snapshot.json`
   - Đọc file `analysis/api-requests.json`
   - Đọc ảnh trong `screenshots/` bằng `view_image`
   - Tạo các file báo cáo markdown trong `analysis/`

6. **Trình bày kết quả cho user:**
   - Tổng quan bố cục trang
   - Danh sách fields, table columns, buttons
   - API endpoints phát hiện được
   - Gợi ý ánh xạ sang SASUCO conventions

---

## Cấu Trúc File Output

```
exports/clone-results/<ten-trang>/
├── screenshots/
│   ├── fullpage.png
│   ├── header.png
│   ├── filter.png
│   ├── table.png
│   └── dialog-<ten>.png
├── analysis/
│   ├── page-structure.md       ← Báo cáo tổng hợp chính
│   ├── fields-inventory.md     ← Kiểm kê fields
│   ├── table-columns.md        ← Cấu trúc cột bảng
│   ├── buttons-actions.md      ← Nút & hành động
│   └── api-requests.json       ← API calls đã bắt
└── raw/
    └── page-snapshot.json      ← Dữ liệu thô đầy đủ
```

---

## Xử Lý Các Tình Huống Đặc Biệt

| Tình huống | Cách xử lý |
|-----------|-----------|
| Web dùng iframe | Dùng `page.frameLocator()` để truy cập iframe |
| Web lazy-load | Scroll toàn trang trước khi chụp |
| Dialog/Bật popup | Click nút để mở dialog → chụp → đóng |
| Web có nhiều tab | Click từng tab → chụp từng tab |
| Table ảo hóa (virtual scroll) | Scroll từ từ để load hết dữ liệu |
| Xác thực 2 lớp (2FA) | Luôn dùng chiến lược A (đăng nhập thủ công) |
| DevExtreme dx-datagrid (MISA) | Dùng selector `.dx-header-row td` cho headers, `tr.dx-data-row` cho rows |
| AG Grid | Dùng selector `.ag-header-cell-text` cho headers, `.ag-row .ag-cell` cho cells |
| MUI DataGrid | Dùng selector `.MuiDataGrid-columnHeader`, `.MuiDataGrid-cell` |
| Session hết hạn | Script tự phát hiện redirect → xóa `auth.json` → yêu cầu đăng nhập lại |
| `page.evaluate` lỗi `__name` (esbuild) | Dùng `page.evaluate(string)` thay vì arrow function; polyfill `__name`, `__defProp`, `__esm` |
