---
name: checklist-sau-code
description: 'Checklist kiểm tra sau khi code trong SASUCO InvoiceEasy. 2 giai đoạn: check-for-skill (tĩnh — 37 scripts) kiểm tra tuân thủ skill → check-for-runtime (Playwright) mở browser login duyệt page tìm lỗi runtime. Dùng khi: review code trước commit, kiểm tra không có logic trong component, kiểm tra shared utils được tái sử dụng, kiểm tra quy tắc UI giao diện, kiểm tra gọi API đúng chuẩn, kiểm tra validate input, kiểm tra phân trang và filter, kiểm tra dialog kích thước (maxWidth), kiểm tra dialog đóng không báo lỗi BE (thiếu check res.success), kiểm tra hiệu năng React & bundle & render speed, kiểm tra bảo mật (XSS, secrets, injection), kiểm tra circular deps, unused npm packages, accessibility, TypeScript strictness.'
argument-hint: 'Tên portal hoặc feature cần check. VD: ketoanapp, invoiceapp/features/invoices'
---

# Checklist Sau Khi Code — SASUCO InvoiceEasy

> **Quy trình 2 giai đoạn:**
> 1. **Giai đoạn 1 — `check-for-skill`:** Chạy script tĩnh kiểm tra tuân thủ các skill lập trình
> 2. **Giai đoạn 2 — `check-for-runtime`:** Playwright mở browser → login → duyệt page → bắt lỗi runtime

---

## 🚀 Quick Run

```bash
# === GIAI ĐOẠN 1: Check tĩnh (code quality) ===
node .claude/skills/checklist-sau-code/scripts/check-for-skill/check-all.cjs src/modules/KetoanApp

# Chạy 1 check đơn lẻ
node .claude/skills/checklist-sau-code/scripts/check-for-skill/check-any.cjs src/modules/KetoanApp

# === GIAI ĐOẠN 2: Check runtime (Playwright browser) ===
node .claude/skills/checklist-sau-code/scripts/check-for-runtime/runtime-check.cjs ketoan
node .claude/skills/checklist-sau-code/scripts/check-for-runtime/runtime-check.cjs ketoan features/danh-muc/khach-hang
```

---

## Giai Đoạn 1 — `check-for-skill/` (37 scripts tĩnh)

### Chạy tổng hợp

```bash
node .claude/skills/checklist-sau-code/scripts/check-for-skill/check-all.cjs <PortalPath> [feature]
```

> **📤 Output tối ưu token:** `check-all.cjs` CHỈ in các check **FAIL** (kèm file:line + mô tả + gợi ý skill cần đọc).
> Các check PASS bị bỏ qua hoàn toàn — agent không phải đọc thông tin thừa.
> Mỗi lỗi hiển thị đầy đủ: **file nào · dòng nào · lỗi gì · nội dung dòng vi phạm · skill cần đọc để sửa**.

### Bảng script chi tiết

| # | Script | Kiểm tra | Skill gốc | Sev |
|:--:|--------|----------|-----------|:--:|
| 1 | `check-barrel.cjs` | Barrel `index.ts` export đủ sibling chưa | `quy-tac-code` § Barrel | ⚠️ |
| 2 | `check-naming.cjs` | Tên file đúng pattern (Page/Dialog/Hook/Service), folder kebab-case | `dat-ten` | ⚠️ |
| 3 | `check-import-order.cjs` | Thứ tự import: React → shared → types → services → hooks → components | `quy-tac-code` § Import | ⚠️ |
| 4 | `check-import-paths.cjs` | Import relative path có resolve đúng file không (sai depth, sai tên) | `quy-tac-code` § Import | 🔴 |
| 5 | `check-any.cjs` | `:any`, `as any`, `<any>` | `quy-tac-code` § TS | 🔴 |
| 5 | `check-console.cjs` | `console.log/console.error` (phải dùng `ApiLogger`) | `quy-tac-code` § Logging | 🟡 |
| 6 | `check-layer.cjs` | API call / business logic trong file `.tsx` | `quy-tac-code` § React | 🔴 |
| 7 | `check-shared.cjs` | `@/shared/` hoặc `@/modules/business` còn sót | `cau-truc-du-an` | 🔴 |
| 8 | `check-api-service.cjs` | `try/catch` trong service, thiếu `BASE_PATH`, deprecated import, thiếu `static` | `tao-apiservice` | 🔴 |
| 9 | `check-dup-keys.cjs` | Duplicate keys trong object literal (gây lỗi esbuild) | Safety | 🔴 |
| 10 | `check-closing-tags.cjs` | `</span>` → `}` hỏng, mixed quotes `"..."'` | Safety | 🔴 |
| 11 | `check-syntax.cjs` | Brace/parentheses/JSX tag mismatch | Safety | 🔴 |
| 12 | `check-encoding.cjs` | UTF-8 corrupt tiếng Việt (PowerShell double-encode) | Safety | 🔴 |
| 13 | `check-api-validation.cjs` | `toast.error` thay vì `ValidationErrorDialog` khi API fail | `tich-hop-api-ui` | 🔴 |
| 14 | `check-validate.cjs` | HTML5 validation, onBlur, gate-keeper, progressive helper | `validate-input` | 🔴 |
| 15 | `check-date-input.cjs` | `<input type="date">`, `format()` thủ công, DatePicker | `date-input` | 🟡 |
| 16 | `check-md-tailwind.cjs` | `md:flex/md:hidden/md:w-*` trong layout (phải dùng `sm:`) | `tao-ui-giao-dien` | 🟡 |
| 17 | `check-performance-react.cjs` | 12 checks: Inline object/array trong JSX, `useState(fn())`, `useEffect` thiếu deps, `.map()` thiếu `key`, `key={index}`, thiếu `React.memo`, 3 infinite loop patterns, Context value inline, unstable nested component, arrow function/.bind() trong JSX props | `eslint-plugin-react` perf rules | 🔴 |
| 18 | `check-performance-bundle.cjs` | 6 checks: Import namespace thư viện nặng (moment/lodash/mui/antd), icon bulk import, `export *`, page không `React.lazy`, CSS-in-JS runtime, CDN import | `quy-tac-code` + bundle analysis | 🟡 |
| 19 | `check-performance-render.cjs` | 5 checks: Tính toán nặng không useMemo (filter/map/reduce chain), useLayoutEffect chặn paint, component >500 dòng, React.lazy thiếu Suspense, JSON.stringify/parse trong render | React rendering perf | 🔴 |
| 20 | `check-security.cjs` | 16 checks: Hardcoded secrets, XSS (dangerouslySetInnerHTML/innerHTML/document.write), insecure storage, eval/Function, tabnabbing, HTTP URL, sensitive logging, Math.random, suppressHydrationWarning, open redirect, javascript: URL, iframe sandbox, leaked render, postMessage origin, JSON.parse try-catch | OWASP + eslint-plugin-react | 🔴 |
| 21 | `check-dead-files.cjs` | File `.ts/.tsx` không được import bởi bất kỳ file nào khác (dead code) | `quy-tac-code` | ⚠️ |
| 22 | `check-circular-deps.cjs` | Import vòng tròn giữa các file (DFS graph cycle detection) — A→B→C→A | `quy-tac-code` + Madge | 🔴 |
| 23 | `check-unused-deps.cjs` | npm packages khai báo trong `package.json` nhưng không import trong code | Knip / depcheck | 🟡 |
| 24 | `check-a11y.cjs` | Accessibility: `<img>` thiếu alt, `<button>` thiếu type, `<input>` thiếu label, `<iframe>` thiếu title, onClick thiếu keyboard, heading skip level, tabIndex>0, autofocus | eslint-plugin-jsx-a11y | 🟡 |
| 25 | `check-dialog.cjs` | **Dialog maxWidth: `DialogContent` có `w-[...]` nhưng thiếu prop `maxWidth` → width KHÔNG hiệu lực (bị giới hạn `sm:max-w-lg` 512px); `maxWidth=` nhét sai trong className; `maxWidth` ≠ `w-[...]`** | `tao-ui-dialog` § maxWidth | 🔴 |
| 26 | `check-ts-strict.cjs` | tsconfig.json `strict:true`, đếm any/type assertion nâng cao, type safety score, tích hợp type-coverage nếu có | type-coverage | 🔴 |
| 27 | `check-undef-symbols.cjs` | **Dùng symbol nhưng thiếu import/khai báo** → bắt `ReferenceError: X is not defined` khi render (VD: dùng `formatDate` quên import). Heuristic regex, có thể false-positive với type annotation params/props → agent đối chiếu thủ công | `quy-tac-code` § Import | 🔴 |
| 28 | `check-dialog-success-check.cjs` | **Dialog đóng không báo lỗi BE**: ① Submit gọi API + `toast.success` nhưng KHÔNG check `res.success` → BE trả `success:false` (kể cả HTTP 400 được `apiCall` normalize) nhưng dialog vẫn toast thành công + đóng → mất dữ liệu, không thấy lỗi; ② `useState<any>` cho serverError; ③ `errorCode={serverError?.name}` (sai prop — đúng là `errorCode`); ④ `toast.error` khi API lỗi ngoài catch block thay vì `ValidationErrorDialog`. Quét toàn bộ `*Dialog.tsx` + file trong thư mục `hooks/` | `tich-hop-api-ui` + `tao-ui-dialog` | 🔴 |

> 🔴 = CRITICAL (sẽ gây lỗi build/runtime) | 🟡 = HIGH (vi phạm convention) | ⚠️ = WARNING (nên sửa)

### Output mẫu

```
=== CHECK-ALL: src/modules/KetoanApp/features/danh-muc/khach-hang ===

 B2. Barrel exports -------------------------------------- PASS
 B2. Naming conventions ---------------------------------- FAIL (3 issues)
 B3. Import order ---------------------------------------- PASS
 B3. any usage ------------------------------------------- FAIL (5 issues)
     features/danh-muc/khach-hang/dialogs/KHFormDialog.tsx:42
     features/danh-muc/khach-hang/hooks/useKH.page.list.ts:15
 B3. console.log ----------------------------------------- PASS
 B3. API call in .tsx ------------------------------------ PASS
 B3. @/shared/ remains ----------------------------------- PASS
 B4. API Service patterns -------------------------------- PASS
 B3. Duplicate keys -------------------------------------- PASS
 B3. Closing tags ---------------------------------------- PASS
 B3. Syntax (braces/tags) -------------------------------- PASS
 B3. Encoding (tiếng Việt) ------------------------------- PASS
 B5. toast.error for API fail ---------------------------- FAIL (1 issue)
     features/danh-muc/khach-hang/hooks/useKH.page.list.ts:89
 B7. Validate input rules -------------------------------- FAIL (2 issues)
 B7. Date input rules ------------------------------------ PASS
 B6. md: Tailwind classes -------------------------------- PASS

=== SUMMARY: 3 checks with issues ===
```

---

## Giai Đoạn 2 — `check-for-runtime/` (Playwright browser)

### `runtime-check.cjs` — Flow hoạt động

```
┌───────────────────────────────────────────────┐
│ 0. Dev server CỐ ĐỊNH http://100.64.0.15:8888 │
│    → Tự kill port 8888 (nếu bị chiếm) → chạy  │
│      npm run dev --host 100.64.0.15 --port    │
│      8888 --strictPort (KHÔNG đổi port)       │
│    → Kết thúc tự tắt server (port CHỈ cho      │
│      agent check runtime)                     │
│ 1. Mở Chromium (LUÔN headless — KHÔNG mở      │
│    trình duyệt ngoài VS Code)                 │
│ 2. Đăng nhập NHANH qua auth-login.cjs:        │
│    → Gọi POST https://sso.vtax.id.vn/api/auth/login│
│    → Set localStorage đúng chuẩn useLogin.ts  │
│    → Vào thẳng trang (KHÔNG fill form)        │
│    → Fallback browser login nếu script fail   │
│ 3. Duyệt từng hash route, mỗi page dừng 2s   │
│ 4. Bắt lỗi:                                   │
│   🔴 console.error / pageerror                │
│   🔴 requestfailed (import sai path)          │
│   🔴 HTTP 500 (server crash)                  │
│   🔴 Vite error overlay                       │
│ 5. Nếu có feature → quét pages/*Page.tsx      │
│    → quét dialogs/*Dialog.tsx                 │
│    → click nút Thêm để test mở dialog         │
│ 6. Báo cáo: PASS/FAIL + danh sách lỗi         │
└───────────────────────────────────────────────┘
```

> ⚠️ **QUAN TRỌNG:**
> - **Không dùng `localhost`** — SSO chặn localhost (`DOMAIN_SUBDOMAIN_NOT_FOUND`). Luôn dùng IP VPN `100.64.0.15`.
> - **Port 8888 cố định** (`--strictPort`) — trước đây port thay đổi 3004→3005→3006 làm check sai.
> - **Browser luôn headless** — nếu cần xem giao diện, mở URL qua browser tích hợp VS Code (`open_browser_page`).
> - **Login nhanh** qua `auth-login.cjs` — tiết kiệm thời gian so với fill form.

### Cách dùng

```bash
# Check toàn bộ portal (tự start/kill dev server port 8888 + login nhanh)
node .claude/skills/checklist-sau-code/scripts/check-for-runtime/runtime-check.cjs ketoan

# Check 1 feature (tự tìm pages + dialogs)
node .claude/skills/checklist-sau-code/scripts/check-for-runtime/runtime-check.cjs invoice features/invoices/quan-ly-hoa-don

# Dùng server đang chạy sẵn (KHÔNG tự kill/start port 8888)
RUNTIME_SKIP_DEV_SERVER=1 node .claude/skills/checklist-sau-code/scripts/check-for-runtime/runtime-check.cjs ketoan

# Đăng nhập nhanh riêng (tạo .runtime-auth.json)
node .claude/skills/checklist-sau-code/scripts/check-for-runtime/auth-login.cjs ketoan
```

### 🔑 Tài khoản chuẩn — `scripts/accounts/account.json`

> Tài khoản login cho từng portal tập trung tại **`.claude/skills/checklist-sau-code/scripts/accounts/account.json`** (không hardcode trong script).

| Portal (key) | Portal App | username | password | appType | portalType | routePrefix |
|--------------|-----------|----------|----------|:-------:|:----------:|-------------|
| `ketoan` | KetoanApp | `0985908750` | `Hoadon@2022!#` | 4 | business | `#/ketoan` |
| `invoice` | InvoiceApp | `0985908750` | `Hoadon@2022!#` | 2 | business | `#/business` |
| `crm` | CrmApp | `0985908750` | `Hoadon@2022!#` | 5 | business | `#/crm` |
| `kiemthu` | KiemThuApp | `0985908750` | `Hoadon@2022!#` | 6 | business | `#/kiem-thu` |
| `taisan` | TaiSanApp | `0985908750` | `Hoadon@2022!#` | 7 | business | `#/taisan` |
| `sso` | SsoApp | `0985908750` | `Hoadon@2022!#` | 8 | business | `#/sso` |
| `baseindex` | BaseIndexApp | `0985908750` | `Hoadon@2022!#` | 9 | business | `#/base-index` |
| `admin` | AdminApp | `0966188166` | `admin@123` | 1 | admin | `#/admin` |
| `partner` | PartnerApp | `0987839490` | `Admin@123` | 3 | partner | `#/partner` |

- Cấu trúc file: map theo **mã portal** (key) → mỗi portal gồm `name`, `username`, `password`, `appType`, `portalType`, `routePrefix`.
- Cả `auth-login.cjs` và `runtime-check.cjs` đều **đọc account.json** theo mã portal đang check → tự dùng đúng tài khoản.
- Thêm/sửa tài khoản → chỉ cần sửa file `account.json`, không cần đụng script.

### Kiểm soát token

Script có 5 cơ chế giới hạn để tránh token overflow khi lỗi lặp vô hạn:

| Cơ chế | Giá trị |
|--------|:------:|
| Tổng lỗi tối đa toàn session | 50 |
| Tối đa mỗi loại lỗi (console/page/import/http) | 15 |
| Tối đa lỗi mỗi page | 10 |
| Dedup lỗi trùng (chuẩn hóa số) | ✅ |
| Lọc bỏ 3rd-party (chrome-extension, Vite internal, React DevTools) | ✅ |

---

## Tham Chiếu Nhanh

| Chủ đề | Skill gốc | Script check |
|--------|-----------|-------------|
| Cấu trúc dự án | `cau-truc-du-an` | `check-shared` |
| Đặt tên file | `dat-ten` | `check-naming` |
| Quy tắc code chung | `quy-tac-code` | `check-any`, `check-console`, `check-layer`, `check-barrel`, `check-import-order` |
| Tạo API Service | `tao-apiservice` | `check-api-service` |
| Tích hợp API→UI | `tich-hop-api-ui` | `check-layer`, `check-api-validation` |
| Validate input | `validate-input` | `check-validate` |
| Date input | `date-input` | `check-date-input` |
| Filter & phân trang | `filter-phan-trang` | `check-pagination` (cross-skill) |
| UI giao diện | `tao-ui-giao-dien` | `check-md-tailwind` |
| Dialog kích thước | `tao-ui-dialog` | `check-dialog` |
| Refactor an toàn | `sua-file-an-toan` | `check-encoding`, `check-syntax`, `check-closing-tags`, `check-dup-keys` |
| Runtime test | `kiem-thu` | `runtime-check` (Playwright) |
