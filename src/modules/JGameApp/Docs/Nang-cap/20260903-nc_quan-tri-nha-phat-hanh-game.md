# Nâng cấp: Cổng tự phục vụ Nhà phát hành game (NPH) + Admin quản lý/giữ tiền

**Ngày tạo:** 03/09/2026 (thay thế hoàn toàn bản trước — phạm vi mở rộng từ "1 màn Admin quản lý NPH"
thành "cổng tự phục vụ đầy đủ cho NPH", theo yêu cầu mở rộng của user)
**Project:** Website (React). Phụ thuộc Backend đã thiết kế ở
`Backend/JGameApi/Docs/Nang-cap/20260903-nc_nph-doi-tac-tu-phuc-vu.md` — ĐỌC TRƯỚC tài liệu đó để
biết chính xác API/DTO. App có tài liệu song song `App/Docs/Nang-cap/20260903-nc_nph-tu-phuc-vu.md`.
**Trạng thái:** Chờ duyệt (GATE 1) — CHƯA CODE, phụ thuộc Backend code xong trước.

---

## 1. Phạm vi tác động

### 1.1 Tóm tắt bối cảnh (đã khảo sát kỹ)

NPH không phải Customer/Admin — là đối tác B2B mới có: đăng nhập riêng (`TaskPublisherDocument` +
email/password mới thêm ở Backend), ví quỹ JCoin riêng để trả thưởng người chơi, tự cấu hình nhiệm
vụ của game mình, xem lịch sử các lượt đã trả JCoin. Khi người chơi hoàn thành nhiệm vụ do NPH tài
trợ, JCoin cộng ngay nhưng ở trạng thái "Chờ xác nhận" 7 ngày (chống gian lận webhook bên ngoài) —
Admin cần 1 màn giám sát/gắn cờ/xử lý các giao dịch này.

⇒ Cần 2 nhóm màn hình MỚI trên Website:
1. **Cổng NPH** (`/jgame/nph/...`, layout độc lập, không dùng chung `AdminLayout`/`PartnerLayout`).
2. **Admin quản lý NPH + giám sát giữ tiền** (mở rộng `AdminLayout` hiện có).

### 1.2 Danh sách file/module tác động

**Cổng NPH (mới, độc lập với Account/{Admin,Partner,ShopOwner} hiện có):**

| File | Loại |
|---|---|
| `features/Account/Nph/types/nph.types.ts` (mới) | Mới |
| `features/Account/Nph/services/NphApiService.ts` (mới) | Mới |
| `features/Account/Nph/services/NphAuthService.ts` (mới — login/token riêng, KHÔNG dùng chung `AuthContext` của Customer/Admin) | Mới |
| `features/Account/Nph/components/NphLayout.tsx` (mới, sidebar riêng) | Mới |
| `features/Account/Nph/pages/NphLoginPage.tsx` (mới, route `/jgame/nph/dang-nhap`, KHÔNG dùng chung form đăng nhập Customer) | Mới |
| `features/Account/Nph/dashboard/pages/NphDashboardPage.tsx` + hook | Mới |
| `features/Account/Nph/tasks/pages/NphTasksPage.tsx` + hook (CRUD nhiệm vụ của mình) | Mới |
| `features/Account/Nph/transactions/pages/NphTransactionsPage.tsx` + hook (lịch sử trả JCoin, hiện trạng thái Chờ xác nhận/Khả dụng/Bị từ chối) | Mới |
| `features/Account/Nph/wallet/pages/NphWalletPage.tsx` + hook (số dư quỹ + nạp tiền + lịch sử nạp) | Mới |
| `features/Account/Nph/settings/pages/NphSettingsPage.tsx` + hook (đổi mật khẩu, xoay khoá webhook) | Mới |
| `routes/routeConfig.tsx` (+6 route `nph/*`, cờ `requireAuth` KHÔNG áp dụng — dùng guard riêng `requireNphAuth` vì token khác hệ) | Sửa |

**Admin (mở rộng `AdminLayout` hiện có):**

| File | Loại |
|---|---|
| `features/Account/Admin/types/jgame.types.ts` (+`TaskPublisherAdmin`, `WalletHoldAdmin`) | Sửa |
| `features/Account/Admin/services/JGameApiServiceAdmin.ts` (+CRUD NPH, +API `wallet-holds`) | Sửa |
| `features/Account/Admin/task-publishers/pages/AdminTaskPublishersPage.tsx` + hook (mới) | Mới |
| `features/Account/Admin/wallet-holds/pages/AdminWalletHoldsPage.tsx` + hook (mới) | Mới |
| `features/Account/Admin/components/AdminLayout.tsx` (+2 menu: "Nhà phát hành game", "Giao dịch chờ xác nhận") | Sửa |
| `routes/routeConfig.tsx` (+2 route `quan-tri/nha-phat-hanh`, `quan-tri/giao-dich-cho-xac-nhan`) | Sửa |

## 2. Cổng NPH — thiết kế UI

### 2.1 Đăng nhập (`/jgame/nph/dang-nhap`)

Form độc lập (email + mật khẩu) → `POST /api/auth/publisher/login` → lưu token NPH ở
`sessionStorage`/context RIÊNG (khoá khác với token Customer/Admin, ví dụ `nph_access_token`) — tránh
2 phiên đăng nhập (Customer đang mua hàng + NPH quản trị) ghi đè token của nhau nếu mở cùng trình
duyệt. Không có nút "Đăng ký" (chỉ Admin tạo tài khoản NPH).

### 2.2 `NphLayout` — sidebar riêng (theo đúng pattern `PartnerLayout`/`AdminLayout`)

Menu: Tổng quan · Nhiệm vụ của tôi · Giao dịch · Ví & Nạp tiền · Cài đặt. Header hiện tên NPH +
trạng thái tài khoản (Active/Suspended — nếu Suspended, chặn hầu hết thao tác, chỉ xem được).

### 2.3 `NphDashboardPage`

Số dư quỹ JCoin hiện tại (nổi bật, có nút "Nạp thêm"), tổng nhiệm vụ đang cấu hình, tổng JCoin đã trả
(Khả dụng + Chờ xác nhận tách riêng 2 số), số lượt hoàn thành 7 ngày gần nhất (mini list).

### 2.4 `NphTasksPage` — CRUD nhiệm vụ của mình

Bảng: Tên nhiệm vụ, Yêu cầu (mô tả ngắn), Thưởng JCoin, Trạng thái quỹ (tính động — "Đủ quỹ"/"Thiếu
quỹ" theo `PublisherFundStatus` trả về, KHÔNG NPH tự set), Bật/Tắt, Thao tác Sửa. Form tạo/sửa: tên,
mô tả, yêu cầu đạt (`requirementSummary`/`targetValue` theo đúng field `GameTask` đã có ở Admin hiện
tại — tái dùng lại form Admin tạo Task nếu đã có, chỉ giới hạn field publisher được sửa, ẩn field chỉ
Admin mới có quyền như duyệt/kiểm duyệt nội dung nếu có).

### 2.5 `NphTransactionsPage`

Bảng lịch sử: Tên người chơi (ẩn 1 phần SĐT/tên như thông lệ bảo mật đã áp dụng ở Referral), Nhiệm vụ,
Số JCoin, Trạng thái (badge: Chờ xác nhận (vàng) / Khả dụng (xanh) / Đã từ chối (đỏ)), Ngày hoàn thành,
Ngày dự kiến khả dụng (`availableAt`, chỉ hiện khi đang Chờ xác nhận).

### 2.6 `NphWalletPage`

Số dư quỹ hiện tại + nút "Nạp tiền" (mở form nhập số tiền VND → `POST /api/publisher/wallet/topup` →
chuyển hướng cổng thanh toán, y hệt luồng `WalletTopupPage` của Customer đã có, tái dùng UI component
nếu hợp lý) + bảng lịch sử nạp (Số tiền, Trạng thái Pending/Paid/Expired, Ngày).

### 2.7 `NphSettingsPage`

Đổi mật khẩu (form 3 field: mật khẩu cũ/mới/xác nhận). Xoay khoá webhook (nút + dialog hiện secret
plaintext ĐÚNG 1 LẦN + cảnh báo sao chép ngay — copy nguyên UX đã thiết kế cho Admin ở bản trước).

## 3. Admin — 2 màn mới

### 3.1 `AdminTaskPublishersPage` (route `/jgame/quan-tri/nha-phat-hanh`)

Giữ nguyên thiết kế đã duyệt sơ bộ ở bản trước (bảng NPH + form thêm mới + dialog secret 1 lần +
xoay khoá/tạm ngưng/kích hoạt), bổ sung thêm:
- Field `Email` bắt buộc khi tạo (để NPH đăng nhập được) — dialog sau khi tạo hiện CẢ password khởi
  tạo LẪN webhook secret, đều plaintext 1 lần, đều có nút Copy riêng.
- Nút "Đặt lại mật khẩu" (mirror "Xoay khoá") — dialog hiện mật khẩu mới plaintext 1 lần.
- Cột "Quỹ JCoin hiện tại" (đọc từ `TaskPublisherWalletDocument`, không sửa được ở đây — quỹ chỉ tăng
  qua NPH tự nạp).

### 3.2 `AdminWalletHoldsPage` (route `/jgame/quan-tri/giao-dich-cho-xac-nhan`) — MỚI, chống gian lận

Bảng giao dịch JCoin đang "Chờ xác nhận"/"Bị gắn cờ": lọc theo NPH, theo người chơi, theo khoảng ngày.
Mỗi dòng: Người chơi, NPH, Nhiệm vụ, Số JCoin, Ngày hoàn thành, Ngày tự động khả dụng, cột Thao tác:
- "Gắn cờ nghi ngờ" (chỉ hiện khi đang Chờ xác nhận) — chặn tự động release, chuyển badge sang "Bị
  gắn cờ" (đỏ).
- "Xác nhận sớm" — chuyển Khả dụng ngay, bỏ qua thời gian chờ còn lại.
- "Từ chối" (chỉ hiện khi Chờ xác nhận/Bị gắn cờ) — có dialog xác nhận rõ ràng "Sẽ trừ lại JCoin của
  người chơi và hoàn quỹ cho NPH — không thể hoàn tác", vì đây là thao tác nặng.

## 4. Trình tự thực hiện (SAU KHI Backend xong — phụ thuộc cứng)

1. Types + `NphAuthService`/`NphApiService` (login, dashboard, tasks, transactions, wallet).
2. `NphLayout` + `NphLoginPage` + guard `requireNphAuth` trong `routeConfig.tsx`.
3. 5 trang cổng NPH (Dashboard → Tasks → Transactions → Wallet → Settings, theo đúng thứ tự phụ thuộc
   dữ liệu).
4. Admin: `AdminTaskPublishersPage` (nâng cấp từ thiết kế cũ) + `AdminWalletHoldsPage` (mới).
5. Cập nhật `.claude/business-rules/kiem-tien-jcoin.md` + `system-architect/routing-va-layout.md`.

## 5. Checklist

- [ ] NPH đăng nhập được bằng email/password Admin cấp, đổi mật khẩu thành công
- [ ] Tạo/sửa/bật-tắt nhiệm vụ của mình — không thấy/sửa được nhiệm vụ NPH khác
- [ ] Nạp tiền → quỹ tăng đúng, tạo nhiệm vụ đủ quỹ mới hoàn thành được (test phối hợp Backend)
- [ ] Giao dịch Chờ xác nhận hiện đúng ngày tự động khả dụng
- [ ] Admin gắn cờ/xác nhận sớm/từ chối hoạt động đúng, số dư 2 phía (người chơi + NPH) đúng sau Từ chối
- [ ] Commit + push

## 6. Tham chiếu

- **Backend (đọc trước, nguồn hợp đồng API/DTO)**: `Backend/JGameApi/Docs/Nang-cap/20260903-nc_nph-doi-tac-tu-phuc-vu.md`.
- **App (song song)**: `App/Docs/Nang-cap/20260903-nc_nph-tu-phuc-vu.md`.
- Pattern layout độc lập tham chiếu: `features/Account/Partner/components/PartnerLayout.tsx`.
- Pattern bảng CRUD đơn giản: `features/Account/Admin/suppliers/pages/AdminSuppliersPage.tsx`.
- Pattern dialog secret 1 lần + copy: đã thiết kế ở bản trước của tài liệu này (giữ nguyên).
