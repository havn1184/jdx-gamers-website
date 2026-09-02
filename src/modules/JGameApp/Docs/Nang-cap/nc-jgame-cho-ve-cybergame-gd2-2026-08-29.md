# Tài liệu giải pháp — Chợ vé giờ chơi Cybergame (Giai đoạn 2) + Kênh Người Bán

> Ngày: 2026-08-29 | Portal: **JGameApp** | Tiếp nối 2 tài liệu đã approve trước đó (GĐ1 bán thẻ + Auth độc lập/GĐ3 phụ kiện)

---

## 0. Prompt gốc (nguyên văn)

> "giờ tiếp tục dùng ppt-nc-toan-trinh để hoàn thiện giai đoạn 2 là xây dựng chợ vé giờ chơi cho các cyber game. mỗi cyber game là 1 gian hàng, họ có các loại loại vé nạp chơi theo số lượng giờ tại các zone khác nhau như zone thường, vip, máy cấu hình cao,.. đặc biệt mỗi gybergame có số lượng chỗ trống liên tục đc cập nhật, người dùng có thể nhanh tay đặt được giờ chơi giá 0 đồng hoặc discount rất tốt tới 70,80,90%. như vậy trang tổng quan của chợ vé phải rất sôi động, chia làm nhiều vùng hiển thị. có thể học hỏi cách thể hiện gian hàng của shopee. các quy trình đặt giỏ hàng và thanh toán thì kế thừa jgameapp đã có. tác features ngay trong jgameapp vùng giao diện của chủ Cybergame. họ có thể nhập dữ liệu bán giờ chơi thủ công hoặc đồng bộ trực tiếp từ nền tảng netbarbox, dodonew. gian hàng cần có các chức năng theo dõi đơn hàng đã mua và công nợ mà jgame phải trả, lịch sử thành toán."

## 1. Tổng Quan

- **Mục tiêu:** Triển khai URD Giai đoạn 2 (mục 7 — hiện chỉ có đặc tả khung) thành marketplace chạy được: chợ vé giờ chơi kiểu Shopee (nhiều gian hàng = nhiều phòng cybergame), vé theo zone, slot trống realtime (mock), flash-sale vé 0đ/giảm sâu, **và** khu vực Kênh Người Bán (Shop Owner Dashboard) ngay trong JGameApp để chủ phòng game tự quản lý.
- **shortName mới:** `playtime` (marketplace khách hàng), `shop-owner` (kênh người bán).
- **Actor mới:** **Chủ Cybergame (Cybergame Owner)** — là 1 Member JGame đăng ký thêm vai trò gian hàng (giống mô hình Shopee: 1 tài khoản có thể vừa mua vừa bán), không tạo hệ xác thực riêng.
- **Vẫn giữ nguyên:** toàn bộ GĐ1 (thẻ game) và Kho phụ kiện GĐ3 không đổi.

### 1.1. Quyết định thiết kế quan trọng (tự tư duy — nêu rõ lý do)

| Quyết định | Lý do |
|---|---|
| **Đặt vé = luồng "Đặt ngay" (giống mua thẻ game GĐ1: xác nhận→QR→kết quả), KHÔNG dùng chung giỏ hàng phụ kiện** | User yêu cầu "nhanh tay đặt được giờ chơi giá 0 đồng" — bản chất flash-sale cần chốt SLOT ngay lập tức; nếu cho vào giỏ hàng rồi thanh toán sau sẽ mất slot vào tay người khác. Đây vẫn là "kế thừa quy trình đặt hàng và thanh toán đã có" (đúng yêu cầu) — chỉ kế thừa pattern luồng, không dùng chung state giỏ hàng vật lý (vốn có shipping address không áp dụng cho vé số/digital). |
| **Vé giờ chơi là hàng số (giống mã thẻ), có mã đổi vé (redeem code), không cần địa chỉ giao hàng** | Nhất quán với "Nhận mã thẻ" ở GĐ1. |
| **Slot trống "liên tục cập nhật"** = mock timer nền giảm ngẫu nhiên 1 slot mỗi ~5s cho vài vé đang hiển thị + polling ở FE mỗi 3s | Mô phỏng đúng URD FR-7.2.2 (đẩy sự kiện realtime) mà không cần WebSocket thật (ngoài phạm vi mock). |
| **Giới hạn 1 vé 0đ/người dùng/tuần (FR-7.2.5)** | Lưu localStorage theo tuần ISO, chặn claim vé 0đ thứ 2 trong tuần. |
| **Reservation lock khi đặt vé (FR-7.2.4)** | Giảm `availableSlots` ngay khi tạo đơn `PENDING`; nếu hết hạn QR (không thanh toán) → hoàn slot lại. |
| **Chủ Cybergame: đăng ký ngay trong JGameApp, không qua AdminApp** | Đúng yêu cầu "tạo features ngay trong jgameapp". Không làm khâu duyệt/kiểm duyệt của Admin ở lần này (ngoài phạm vi yêu cầu) — gian hàng đăng ký xong `active` luôn (mock). |
| **Đồng bộ NetBarBox/DoDoNew** | Theo đúng nguyên tắc Adapter (URD mục 3.1/7.2.6) nhưng ở mức mock: mỗi gian hàng chọn `syncMode`, nút "Đồng bộ ngay" mô phỏng cập nhật `availableSlots` ngẫu nhiên (không gọi API thật vì các nền tảng này không tồn tại). |
| **Công nợ (Payout):** JGame giữ tiền khách trả → định kỳ đối soát trả lại gian hàng (trừ hoa hồng) | Mock: mỗi đơn `USED` được cộng vào kỳ công nợ hiện tại (`PENDING`); có nút "admin xác nhận đã trả" ở phía... **thực ra JGame tự thanh toán, không cần thao tác thủ công phía Admin ở bản này** — trang Công nợ của Shop Owner chỉ ở dạng xem (read-only), mock tự chuyển 1 kỳ cũ sang `PAID` để có dữ liệu lịch sử minh hoạ. |
| **Sửa 1 tồn đọng từ trước:** `HistoryPage` (Lịch sử giao dịch) hiện chỉ hiển thị đơn thẻ game, chưa có tab cho đơn phụ kiện (thiếu sót từ GĐ3). Nhân dịp thêm loại đơn thứ 3 (vé giờ chơi), sẽ nâng cấp `HistoryPage` thành 3 tab: Thẻ game / Phụ kiện / Vé giờ chơi. | Đây là phần mở rộng tự nhiên của "lịch sử giao dịch", không phải mở rộng phạm vi ngoài yêu cầu. |

## 2. Danh Sách Màn Hình

### 2.1. Marketplace khách hàng

| Mã | Trang | Mô tả |
|---|---|---|
| SC-P2-01 | **Trang tổng quan Chợ vé** | Nhiều vùng kiểu Shopee: (1) Hero Flash Sale có đếm ngược + vé 0đ/giảm sâu đang "nóng" hiển thị số chỗ còn lại giảm dần trực tiếp; (2) Chip lọc nhanh theo Zone (Thường/VIP/Cấu hình cao); (3) Gian hàng nổi bật (carousel ngang: logo, rating, "đã bán X vé"); (4) Lưới toàn bộ vé đang bán, lọc theo khu vực/thành phố + mức giảm giá |
| SC-P2-02 | **Trang Gian hàng** | Banner + thông tin gian hàng (địa chỉ, rating, tổng đã bán), danh sách Zone kèm vé đang bán theo từng zone |
| SC-P2-03 | **Xác nhận đặt vé** | Tóm tắt vé + zone + số giờ, cảnh báo "chỉ giữ chỗ trong 5 phút", checkbox điều khoản |
| SC-P2-04 | **Thanh toán QR vé** | Giống `PaymentQrPage` GĐ1, đếm ngược 5 phút (ngắn hơn QR thẻ vì giữ chỗ) |
| SC-P2-05 | **Kết quả đặt vé** | Thành công: hiện mã đổi vé (redeem code) + QR code hiển thị tại quầy; Thất bại: hết chỗ do đến chậm → tự hoàn tiền |
| SC-P2-06 | **Lịch sử giao dịch (nâng cấp)** | Thêm tab "Vé giờ chơi" bên cạnh "Thẻ game"/"Phụ kiện" |

### 2.2. Kênh Người Bán (Shop Owner — trong JGameApp)

| Mã | Trang | Mô tả |
|---|---|---|
| SC-P2-S1 | **Đăng ký gian hàng** | Member chưa có gian hàng → điền tên/địa chỉ/mô tả → tạo gian hàng `active` ngay |
| SC-P2-S2 | **Tổng quan gian hàng** | Doanh thu hôm nay/tuần, số đơn mới, top vé bán chạy, cảnh báo vé sắp hết chỗ |
| SC-P2-S3 | **Quản lý Zone & Vé** | CRUD Zone (tên, loại, cấu hình máy, tổng chỗ); CRUD Vé (chọn zone, số giờ, giá gốc, giá bán/giảm giá, số chỗ) — **nhập thủ công** |
| SC-P2-S4 | **Đồng bộ nền tảng** | Chọn chế độ: Thủ công / NetBarBox / DoDoNew; nếu chọn nền tảng → nút "Đồng bộ ngay" (mock cập nhật slot) |
| SC-P2-S5 | **Đơn hàng đã bán** | Danh sách đơn của gian hàng, lọc trạng thái, nút "Xác nhận khách đã dùng vé" (chuyển `CONFIRMED`→`USED`) |
| SC-P2-S6 | **Công nợ & Lịch sử thanh toán** | Kỳ hiện tại (số tiền JGame sẽ trả) + bảng lịch sử các kỳ đã thanh toán |

## 3. Dữ Liệu & API Mock

### 3.1. Types chính (camelCase, field tự định nghĩa vì BE chưa có — theo đúng URD mục 19 mở rộng)

`CybergameShop` (id, ownerId, name, city, address, description, logoUrl, coverUrl, status, syncMode, rating, totalSold) · `PlaytimeZone` (id, shopId, name, zoneType: standard|vip|highend, specs, totalSeats) · `PlaytimeTicket` (id, shopId, zoneId, hours, originalPrice, sellPrice, discountPercent, availableSlots, totalSlots, isFlashSale, flashSaleEndsAt, status) · `PlaytimeOrder` (id, userId, shopId, ticketId, quantity, unitPrice, totalAmount, status, redeemCode, createdAt, updatedAt) — status: `PENDING→PAID→CONFIRMED→USED` hoặc `SUPPLY_FAILED→REFUND_PROCESSING→REFUNDED`/`EXPIRED` · `ShopPayout` (id, shopId, periodLabel, grossRevenue, commissionRate, commissionAmount, payableAmount, status: PENDING|PAID, paidAt)

### 3.2. API mock (qua đúng `JGAME_USE_MOCK` gate như các module trước)

**PlaytimeApiService** (khách hàng): `getMarketplaceSections()` (trả về đủ 4 vùng cho trang chủ 1 lần gọi), `getShops(params)`, `getShopDetail(shopId)`, `getTicket(ticketId)`, `createOrder(ticketId, quantity)`, `getOrderStatus`, `getPayment`, `getOrderTracking`, `getMyOrders`.
**ShopOwnerApiService**: `getMyShop()`, `registerShop(payload)`, `updateShop`, `getZones/createZone/updateZone/deleteZone`, `getTickets/createTicket/updateTicket/deleteTicket`, `setSyncMode`, `syncNow()` (mock cập nhật ngẫu nhiên), `getShopOrders(params)`, `confirmTicketUsed(orderId)`, `getPayoutSummary()`, `getPayoutHistory()`.

### 3.3. Mock "sôi động" (slot realtime)

`mocks/playtimeShops.store.ts`: mảng shop/zone/ticket in-memory; 1 `setInterval` (khởi động khi module load) mỗi 4-6 giây chọn ngẫu nhiên 1-2 vé đang active, giảm `availableSlots` 1 đơn vị (không âm) — mô phỏng người khác đang mua. Trang chủ + trang gian hàng poll lại dữ liệu mỗi 3 giây (giống pattern `usePaymentStatus` đã có) để thấy số chỗ giảm dần trực tiếp.

## 4. File Xử Lý

```
JGameApp/
  mocks/
    playtimeShops.store.ts       # MỚI — shop/zone/ticket + timer mô phỏng slot realtime
    playtimeOrders.store.ts      # MỚI — state machine đơn vé (giống orders.store.ts)
    shopPayouts.mock.ts          # MỚI
    freeTicketClaims.store.ts    # MỚI — giới hạn 1 vé 0đ/tuần (localStorage)
  features/
    playtime/                              # Marketplace khách hàng
      types/playtime.types.ts
      services/PlaytimeApiService.ts
      hooks/ (useMarketplaceHome, useShopDetail, useTicketReserve.page,
              usePlaytimePaymentStatus.page, usePlaytimeOrderResult.page)
      pages/ (PlaytimeMarketplacePage, CybergameShopPage, TicketConfirmPage,
              PlaytimePaymentQrPage, PlaytimeOrderResultPage)
      index.ts
    shop-owner/                            # Kênh Người Bán
      types/shop-owner.types.ts (re-export payout)
      services/ShopOwnerApiService.ts
      hooks/ (useMyShop, useShopRegister.page, useShopDashboard.page.fetchData,
              useShopZonesTickets.page, useShopSync.page, useShopOrders.page.fetchData,
              useShopPayouts.page.fetchData)
      components/ShopOwnerLayout.tsx        # sidebar riêng cho kênh người bán
      layout/RequireShopOwner.tsx           # guard: có gian hàng chưa, chưa có → điều hướng đăng ký
      pages/ (ShopRegisterPage, ShopDashboardPage, ShopZonesTicketsPage,
              ShopSyncPage, ShopOrdersPage, ShopPayoutsPage)
      index.ts
    history/
      hooks/useHistory.page.fetchData.ts    # SỬA — gộp 3 nguồn đơn hàng theo tab
      pages/HistoryPage.tsx                 # SỬA — thêm tab loại đơn
  layout/
    StorefrontHeader.tsx     # SỬA — nav "Chợ vé" (bỏ badge SỚM), dropdown avatar thêm "Kênh người bán"
  routes/routeConfig.tsx     # SỬA — thêm route marketplace + shop-owner, xoá route ve-gio-choi (ComingSoon)
  features/coming-soon/pages/PlaytimeComingSoonPage.tsx   # XOÁ (thay bằng marketplace thật)
```

## 5. Routes

Khách hàng (public xem, đặt vé cần đăng nhập): `cho-ve` · `cho-ve/gian-hang/:shopId` · `cho-ve/xac-nhan-dat-ve` · `cho-ve/thanh-toan/:orderId` (auth) · `cho-ve/ket-qua/:orderId` (auth)

Kênh Người Bán (đều cần đăng nhập; các trang trừ đăng ký cần `RequireShopOwner`): `kenh-nguoi-ban/dang-ky` · `kenh-nguoi-ban` (dashboard) · `kenh-nguoi-ban/zone-ve` · `kenh-nguoi-ban/dong-bo` · `kenh-nguoi-ban/don-hang` · `kenh-nguoi-ban/cong-no`

## 6. Menu

- Header: đổi link "Vé giờ chơi (badge SỚM)" → "Chợ vé" trỏ `/jgame/cho-ve` (bỏ badge). Dropdown avatar thêm mục "Kênh người bán" (điều hướng theo `RequireShopOwner`: có gian hàng → dashboard, chưa có → trang đăng ký).
- Footer: không đổi.

## 7. Thiết Kế UI

- **Trang chủ Chợ vé:** phong cách Shopee hoá theo theme JGame (nền tối, gradient tím-hồng thay cam-đỏ Shopee) — băng rôn Flash Sale nổi bật + đồng hồ đếm ngược, thanh tiến trình "đã bán X/Y" trên mỗi vé (giống progress bar Flash Sale Shopee), carousel gian hàng dạng card tròn logo + tên, badge phần trăm giảm giá to màu đỏ/cam nổi bật trên góc ảnh vé.
- **Trang gian hàng:** giống trang Shop Shopee — cover ảnh lớn, avatar logo tròn đè lên, hàng thông tin (rating/đã bán/địa chỉ), tab theo Zone.
- **Kênh Người Bán:** đổi hẳn sang layout dashboard (sidebar trái cố định, nền tối hơn, không dùng header storefront công khai) — tương tự phong cách "Kênh Người Bán Shopee", tách bạch rõ với trải nghiệm mua hàng.
- Vé sắp hết chỗ (`availableSlots <= 3`): viền đỏ nhấp nháy nhẹ (animate-pulse) tăng cảm giác khẩn cấp.

## 8. Checklist
- [ ] Slot giảm dần thấy được trên UI khi để trang mở (polling 3s)
- [ ] Giới hạn 1 vé 0đ/tuần hoạt động đúng (thử claim lần 2 bị chặn)
- [ ] Hết hạn QR (không thanh toán) → hoàn lại slot cho vé
- [ ] RequireShopOwner chặn đúng người chưa có gian hàng
- [ ] Đồng bộ NetBarBox/DoDoNew (mock) cập nhật đúng slot hiển thị
- [ ] HistoryPage 3 tab hoạt động đúng, không phá dữ liệu 2 loại đơn cũ
- [ ] Không ảnh hưởng luồng GĐ1 (thẻ game) và GĐ3 (phụ kiện) đã chạy ổn định
- [ ] Toàn bộ API qua đúng gate `JGAME_USE_MOCK`
- [ ] `npm run type-check` sạch lỗi mới + runtime Playwright toàn luồng

---
