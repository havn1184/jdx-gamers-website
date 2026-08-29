# Tài liệu giải pháp — Khởi tạo portal JGame Store (Giai đoạn 1 + khung GD2/GD3)

> Ngày: 2026-08-28 | Portal mới: **JGame** | Repo: `jdx-portal-jgame` (đã clone `src/modules/JGameApp`, nhánh `development`)

---

## 0. Prompt gốc (nguyên văn)

> "áp dụng phương pháp xây dựng tài liệu này. Đọc tài liệu đặc tả lại: src\modules\JGame\Docs\Tai-lieu-goc\URD-xGame-tai-lieu-yeu-cau-nguoi-dung.md. Tôi cần bạn tư duy và lập 1 trang web hoàn chỉnh theo tài liệu. Về tài khoản đăng nhập, profile, role quyền thì không cần thực hiện, sẽ áp dụng kế thừa ssoapp chung toàn nền tảng. Riêng với hệ thống api BE thì chưa có, hãy vẫn áp dụng, tuy nhiện tạo giả lập khi call api tới BE, thì làm 1 điểm gate giả lập, tự mockdata trả về cho api theo đúng quy định. Sau này chỉ cần ngắt mockdata gọi lên BE thật là xong. Tự tư duy thiết kế, vì trang này có cả nội dung public (không cần đăng ký), về hình ảnh gói game, tự sưu tầm trên mạng và mock hình ảnh cho vừa và đẹp. Tự lên quy trình loop để code, thao tác, kiểm tra và sửa lại cho đến khi hoàn thiện"
>
> **Quyết định đã chốt với user (AskUserQuestion):**
> 1. Phạm vi: **GD1 đầy đủ + khung UI placeholder cho GD2 (vé giờ chơi) / GD3 (phụ kiện)**.
> 2. Layout khách hàng: **Storefront riêng** (header/footer thương mại điện tử tự thiết kế) — KHÔNG dùng khung Sidebar/TopMenu nội bộ như các portal khác, vì Guest phải xem được không cần đăng nhập.
> 3. Backoffice (SC-A*): build **trong AdminApp hiện có** (`src/modules/AdminApp/features/jgame/**`), giống cách JPay đã làm — kế thừa auth/layout Admin có sẵn.

---

## 1. Tổng Quan

- **Mục tiêu:** Dựng portal thương mại điện tử bán thẻ game (JGame Store) theo URD GD1, có mock BE để chạy được toàn bộ luồng ngay khi chưa có API thật.
- **Portal khách hàng:** `JGame` — thư mục `src/modules/JGameApp/`, repo riêng `jdx-portal-jgame`, mount route `/jgame/*` ở `src/App.tsx` (pattern giống JPay).
- **Portal quản trị:** dùng `AdminApp` hiện có — thêm `src/modules/AdminApp/features/jgame/**`.
- **shortName:** `jgame` (dùng làm tiền tố tên file/class: `JGameApiService`, `CardProductPage`...).
- **Đăng nhập/Role:** KHÔNG xây mới — dùng chung `TokenManager`/SSO đã có trong nền tảng (copy pattern từ `JpayApp/contexts/AuthContext.tsx` + `TokenManager`). JGame chỉ cần bảo vệ (`RequireAuth`) ở các route: xác nhận đơn hàng (bước bấm Thanh toán), thanh toán QR, kết quả, lịch sử, dashboard đối tác. Các route còn lại (trang chủ, chi tiết thẻ) luôn public.
- **BE thật:** CHƯA CÓ. Toàn bộ API đi qua **1 điểm gate mock** (`JGAME_USE_MOCK`), sinh dữ liệu giả theo đúng contract ở mục 18 URD. Khi có BE thật: đặt `VITE_JGAME_USE_MOCK=false` + set `VITE_JGAME_API_URL` — không sửa code gọi ở page/hook.
- **Hình ảnh:** không cào logo thương hiệu thật (rủi ro bản quyền/hotlink) → tự thiết kế ảnh mock bằng gradient CSS + icon (`lucide-react`) + tên game, đẹp và nhất quán hơn ảnh sưu tầm ngẫu nhiên; banner dùng ảnh từ `https://picsum.photos/seed/<key>/<w>/<h>` (dịch vụ ảnh placeholder công khai, không vấn đề bản quyền).

## 2. Thay Đổi BE

Không có BE thật. Định nghĩa **hợp đồng mock** (mock contract) mô phỏng đúng response mà BE tương lai phải trả, theo mục 18 URD:

| Nhóm | Method (JGameApiService — customer) | Mock behavior |
|---|---|---|
| Danh mục | `getCardProducts(params)`, `getCardProductDetail(id)` | Trả từ `mocks/cardProducts.mock.ts`, lọc theo từ khóa/category |
| Đơn hàng | `createOrder(payload)` | Tạo order in-memory, status `PENDING`, sinh `qrCode` giả, `expiresAt = now+15p` |
| Thanh toán | `getOrderStatus(orderId)` | Trạng thái tự tiến triển theo thời gian (mô phỏng webhook jPay + cấp mã NCC), xem mục 3 luồng mock |
| Kết quả | `getCardCode(orderId)` | Trả serial/pin giả khi status = `SUCCESS` |
| Lịch sử | `getMyOrders(filter)` | Lọc trong store mock theo `userId` giả (lấy từ token hiện có hoặc id cố định demo) |
| Referrer | `getReferrerSummary()`, `getReferrerTransactions(filter)` | Dữ liệu giả cố định + số liệu random nhẹ |

Admin (`JGameApiServiceAdmin`) — cùng cơ chế gate, quản lý CRUD trên mảng mock in-memory (thay đổi mất khi reload — chấp nhận được vì mục tiêu là demo UI/luồng, không phải BE thật):
`getCards/createCard/updateCard/deleteCard`, `getSuppliers/createSupplier/updateSupplier/deleteSupplier`, `getOrders/getOrderDetail/manualRefund/manualReissue`, `getReferralPartners/createReferralPartner/...`, `getPromotions/createPromotion/...`, `getRevenueReport(filter)`.

## 3. File Xử Lý

### 3.1. Portal khách hàng — `src/modules/JGameApp/`

```
JGameApp/
  routes/routeConfig.tsx
  layout/
    JGamePortal.tsx            # shell: AuthProvider (optional), render StorefrontLayout + <Routes>
    StorefrontLayout.tsx       # header + <Outlet/> + footer
    StorefrontHeader.tsx       # logo, nav (Trang chủ/Thẻ game/Vé giờ chơi/Phụ kiện/Đối tác), nút Đăng nhập hoặc avatar, "Lịch sử"
    StorefrontFooter.tsx
    RequireAuth.tsx            # guard: chưa đăng nhập → lưu state (thẻ/mệnh giá đã chọn) vào sessionStorage, chuyển '#/auth/login?redirect=...'
  contexts/AuthContext.tsx     # copy rút gọn từ JpayApp (TokenManager.isAuthenticated())
  shared/
    services/api/
      TokenManager.ts          # copy từ JpayApp
      ApiConfig.ts             # buildJGameUrl/buildJGameUrlWithParams (đọc VITE_JGAME_API_URL) — dùng khi tắt mock
      mockGate.ts              # JGAME_USE_MOCK + mockApiCall<T>()
    components/ui/              # copy tối thiểu: button, card, badge, input, dialog, tabs, select, separator (từ JpayApp)
    utils/FormatUtils.ts        # formatCurrency, formatDate (copy)
    hooks/useDebounce.ts
  mocks/
    cardProducts.mock.ts        # danh sách NCC/thẻ + mệnh giá + ảnh gradient key
    orders.store.ts             # in-memory order store + state machine giả lập
    referral.mock.ts
  features/
    catalog/
      types/card.types.ts
      services/CardApiService.ts
      hooks/useCatalog.page.fetchData.ts
      hooks/useCardDetail.page.fetchData.ts
      pages/CatalogPage.tsx           # SC-01
      pages/CardDetailPage.tsx        # SC-02
      index.ts
    order/
      types/order.types.ts
      services/OrderApiService.ts
      hooks/useOrderConfirm.page.ts
      hooks/usePaymentStatus.page.ts  # poll mock mỗi 2s
      pages/OrderConfirmPage.tsx      # SC-03
      pages/PaymentQrPage.tsx         # SC-05
      pages/OrderResultSuccessPage.tsx# SC-06
      pages/OrderResultFailedPage.tsx # SC-07
      index.ts
    history/
      hooks/useHistory.page.fetchData.ts
      pages/HistoryPage.tsx           # SC-08
      index.ts
    referrer/
      hooks/useReferrerDashboard.page.fetchData.ts
      pages/ReferrerDashboardPage.tsx # SC-10
      index.ts
    coming-soon/
      pages/PlaytimeComingSoonPage.tsx   # GD2 khung
      pages/AccessoriesComingSoonPage.tsx# GD3 khung
      index.ts
```

> Không làm SC-04 (đăng ký/đăng nhập OTP — dùng SSO có sẵn) và SC-09 (trang cá nhân — dùng trang profile SSO có sẵn, chỉ link ra).

### 3.2. Mount vào root — `src/App.tsx` (sửa)

Thêm theo đúng pattern JPay (dòng ~41-43 và ~244-253):
```tsx
const JGamePortal = lazy(() =>
  import('./modules/JGameApp/layout/JGamePortal').then(m => ({ default: m.JGamePortal }))
)
...
<Route path='/jgame/*' element={
  <ErrorBoundary><Suspense fallback={<PageLoader />}><JGamePortal /></Suspense></ErrorBoundary>
} />
```

### 3.3. `.env.devlocal` (sửa) — thêm

```
# JGame API — bán thẻ game (BE chưa có, đang dùng mock — xem VITE_JGAME_USE_MOCK)
VITE_JGAME_API_URL=http://100.64.0.15:5013
VITE_JGAME_USE_MOCK=true
```

### 3.4. Backoffice — `src/modules/AdminApp/features/jgame/`

```
jgame/
  types/jgame.types.ts
  services/JGameApiServiceAdmin.ts   # cùng cơ chế mockGate (copy sang shared/services/api của AdminApp hoặc tái dùng nếu đã có)
  cards/       pages/CardsPageAdmin.tsx, dialogs/CardDialogAdmin.tsx, hooks/useCards.page.fetchData.ts, hooks/useCard.dlg.form.ts
  suppliers/   pages/SuppliersPageAdmin.tsx, dialogs/SupplierDialogAdmin.tsx, hooks/...
  orders/      pages/OrdersPageAdmin.tsx, dialogs/OrderDetailDialogAdmin.tsx, hooks/...
  referral/    pages/ReferralPartnersPageAdmin.tsx, dialogs/ReferralPartnerDialogAdmin.tsx, hooks/...
  promotions/  pages/PromotionsPageAdmin.tsx, dialogs/PromotionDialogAdmin.tsx, hooks/...
  reports/     pages/JGameReportsPageAdmin.tsx, hooks/...
```
Đăng ký route `jgame/cards`, `jgame/suppliers`, `jgame/orders`, `jgame/referral`, `jgame/promotions`, `jgame/reports` trong `AdminApp/routes/routeConfig.tsx` (pattern giống jpay). Thêm mục menu **"JGame"** mới vào NavMenu/TopMenu AdminApp (dùng skill `tao-layout-navmenu-topmenu`).

> Không làm SC-A1 (login backoffice — AdminApp đã có sẵn) và SC-A8 (phân quyền nội bộ — theo yêu cầu, kế thừa hệ thống role chung, không xây riêng cho JGame).

## 4. Ánh Xạ Fields FE (mock, chuẩn camelCase) — theo mục 19 URD

| Field FE | Ý nghĩa (theo URD, gợi ý snake_case) |
|---|---|
| `id` | id |
| `productId` / `name` / `category` / `status` | CardProduct.id/name/category/status |
| `denominationId` / `faceValue` / `sellPrice` / `supplierSku` | CardDenomination |
| `orderId` / `userId` / `denominationId` / `quantity` / `unitPrice` / `totalAmount` / `status` / `referrerCode` / `createdAt` | Order |
| `qrCode` / `expiredAt` / `paidAt` | Payment |
| `serialMasked` / `pinMasked` / `serialFull` / `pinFull` (chỉ trả khi xác thực lại) | CardCode (ẩn 1 phần theo FR-6.5.1) |
| `referralCode` / `commissionRateDefault` / `totalOrders` / `totalCommission` | ReferralPartner (dashboard) |
| `commissionAmount` / `reconcileStatus` | ReferralTransaction |

> Không đổi tên/viết tắt so với ý nghĩa nghiệp vụ trong URD — vì chưa có BE thật, FE tự định nghĩa contract này làm chuẩn cho BE thật sau này.

## 5. Routes (customer, prefix `/jgame`)

| Path | Trang | Auth |
|---|---|---|
| `/jgame` | CatalogPage (SC-01) | Public |
| `/jgame/the/:productId` | CardDetailPage (SC-02) | Public |
| `/jgame/xac-nhan-don-hang` | OrderConfirmPage (SC-03) | Public xem, **RequireAuth khi bấm Thanh toán** |
| `/jgame/thanh-toan/:orderId` | PaymentQrPage (SC-05) | RequireAuth |
| `/jgame/ket-qua/:orderId` | OrderResultSuccessPage / OrderResultFailedPage (SC-06/07, chọn theo status) | RequireAuth |
| `/jgame/lich-su` | HistoryPage (SC-08) | RequireAuth |
| `/jgame/doi-tac` | ReferrerDashboardPage (SC-10) | RequireAuth |
| `/jgame/ve-gio-choi` | PlaytimeComingSoonPage (GD2 khung) | Public |
| `/jgame/phu-kien` | AccessoriesComingSoonPage (GD3 khung) | Public |

Admin (prefix `/admin/jgame`): `/cards`, `/suppliers`, `/orders`, `/referral`, `/promotions`, `/reports`.

## 6. Menu

- **Khách hàng:** Menu = header nav của storefront riêng (không phải NavMenu/TopMenu chuẩn nội bộ) → **[Tự thiết kế]**: Trang chủ · Thẻ game · Vé giờ chơi (badge "Sắp ra mắt") · Phụ kiện (badge "Sắp ra mắt") · Đối tác · (phải: tìm kiếm, Lịch sử/Đăng nhập).
- **Admin:** **[A] TopMenu + NavMenu mới** "JGame" trong AdminApp (tính năng hoàn toàn mới) — nhóm con: Danh mục thẻ, NCC, Giao dịch, Đối tác Referral, Khuyến mãi, Báo cáo.

## 7. Thiết Kế UI

- **Phong cách:** thương mại điện tử hiện đại, tông màu chủ đạo tím-hồng-xanh neon (gợi cảm giác gaming) trên nền sáng, bo góc lớn, card có shadow nhẹ + hover scale — khác hẳn phong cách "văn phòng" của các portal kế toán/hóa đơn.
- **Trang chủ (SC-01):** Hero banner (ảnh picsum + gradient overlay + CTA), lưới card sản phẩm thẻ (ảnh gradient theo NCC + logo text + mệnh giá thấp nhất "Từ 50.000đ"), thanh tìm kiếm + filter chip theo NCC, section "Sắp ra mắt" cho GD2/GD3.
- **Chi tiết thẻ (SC-02):** trái = ảnh lớn, phải = chọn mệnh giá dạng chip (giống chọn size), điều khoản dạng accordion, sticky nút "Mua ngay".
- **Xác nhận đơn hàng (SC-03):** tóm tắt dạng receipt card, checkbox điều khoản bắt buộc (nút Thanh toán disable khi chưa tick).
- **Thanh toán QR (SC-05):** QR giả (dùng thư viện QR nhẹ hoặc ảnh SVG pattern giả lập vì không cần quét thật), đồng hồ đếm ngược 15 phút, trạng thái realtime bằng polling mock 2s.
- **Kết quả (SC-06/07):** thành công = card mã thẻ có nút hiện/ẩn + copy; thất bại = màu cảnh báo + trạng thái hoàn tiền.
- **Lịch sử (SC-08):** danh sách dạng timeline/card, badge màu theo status.
- **Dashboard đối tác (SC-10):** stat tiles (tổng đơn/hoa hồng) + bảng giao dịch + link chia sẻ + nút copy.
- **Admin:** tái dùng 100% pattern `tao-ui-master-page` + `tao-ui-dialog` + `tao-ui-giao-dien` đã có trong AdminApp (đồng bộ với các trang jpay admin vừa làm).

## 8. Checklist

- [ ] Field FE khớp ý nghĩa nghiệp vụ URD mục 19 (không đổi tên/viết tắt)
- [ ] Toàn bộ API qua đúng 1 điểm gate `JGAME_USE_MOCK` — không có nơi nào gọi mock trực tiếp bỏ qua gate
- [ ] Route public không bị AuthProvider chặn nhầm; route cần auth có `RequireAuth` đúng
- [ ] Giữ lựa chọn (thẻ/mệnh giá/referrer code) khi Guest bị chuyển sang đăng nhập (FR-6.1.2)
- [ ] Referrer code từ `?ref=` lưu cookie/sessionStorage TTL 30 ngày (mock, FR-6.6.1)
- [ ] Trạng thái đơn hàng mock đúng state machine mục 6.3 (PENDING→PAID→SUCCESS/SUPPLY_FAILED→REFUND_PROCESSING→REFUNDED, EXPIRED)
- [ ] Không tạo file `.md` ngoài phạm vi; không thêm dependency mới chưa duyệt
- [ ] `npm run type-check` sạch lỗi trước khi coi là hoàn thiện GĐ2

---

✅ APPROVED — User yêu cầu chuẩn hóa thư mục `src/modules/JGame` → `src/modules/JGameApp` (đã áp dụng vào toàn bộ đường dẫn trong tài liệu) và xác nhận bắt đầu GĐ2 (code), yêu cầu UI/UX đẹp — mượt — chuẩn.
