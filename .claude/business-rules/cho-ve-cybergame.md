# Chợ vé giờ chơi Cybergame (Giai đoạn 2)

> Route khách hàng: `/jgame/cho-ve`. Route Kênh Người Bán: `/jgame/kenh-nguoi-ban`.
> Code: `features/Public/playtime/` (marketplace, public), `features/Account/User/playtime/` (đặt vé — cần đăng nhập), `features/Account/ShopOwner/` (kênh người bán), `mocks/playtimeShops.store.ts`, `mocks/playtimeOrders.store.ts`, `mocks/shopPayouts.mock.ts`, `mocks/freeTicketClaims.store.ts`.
> Nguồn thiết kế: `Docs/Nang-cap/nc-jgame-cho-ve-cybergame-gd2-2026-08-29.md` (✅ APPROVED). URD gốc mục 7 chỉ đặc tả mức khung — mục này đã vượt xa mức khung đó, đọc tài liệu này thay vì URD mục 7 khi có mâu thuẫn.

## Mô hình nghiệp vụ: marketplace nhiều gian hàng kiểu Shopee

- Mỗi phòng cybergame là **1 gian hàng** (`CybergameShop`), thuộc sở hữu 1 Member (`ownerId`) đã đăng ký qua Kênh Người Bán.
- Mỗi gian hàng có nhiều **Zone** (`PlaytimeZone`: thường/VIP/cấu hình cao — `zoneType: standard|vip|highend`), mỗi Zone có nhiều **loại vé** (`PlaytimeTicket`) theo số giờ chơi, có giá gốc/giá bán/% giảm, số chỗ trống (`availableSlots`/`totalSlots`).
- **Flash-sale**: vé 0đ hoặc giảm sâu 70-90% (`isFlashSale`, `flashSaleEndsAt`), hiển thị nổi bật ở trang chủ chợ vé.
- **Slot trống "liên tục cập nhật"**: mock timer nền (mỗi 4-6 giây) giảm ngẫu nhiên 1 slot ở vài vé đang active, FE poll lại mỗi 3 giây — mô phỏng URD FR-7.2.2 (đẩy sự kiện realtime) mà không cần WebSocket thật.

## Đặt vé — luồng riêng, KHÔNG dùng chung giỏ hàng phụ kiện

**Quyết định thiết kế quan trọng:** đặt vé đi theo luồng "Đặt ngay" (giống mua thẻ game GĐ1: xác nhận → QR → kết quả), không cho vào giỏ hàng rồi thanh toán sau — vì bản chất flash-sale cần chốt slot ngay lập tức, nếu trì hoãn sẽ mất slot vào tay người khác.

1. Xác nhận đặt vé (`/jgame/cho-ve/xac-nhan-dat-ve`) — cảnh báo "chỉ giữ chỗ trong 5 phút" (ngắn hơn QR thẻ 15 phút vì đang giữ chỗ người khác).
2. **Reservation lock (FR-7.2.4)**: giảm `availableSlots` ngay khi tạo đơn `PENDING`; nếu hết hạn QR không thanh toán → hoàn slot lại cho vé.
3. Thanh toán QR (`/jgame/cho-ve/thanh-toan/:orderId`), đếm ngược 5 phút.
4. Kết quả (`/jgame/cho-ve/ket-qua/:orderId`): thành công → mã đổi vé (redeem code) + QR hiển thị tại quầy; thất bại (hết chỗ do đến chậm) → tự hoàn tiền.
5. Tuỳ chọn dùng JCoin trả một phần (giống luồng thẻ game).

### State machine đơn vé (`PlaytimeOrder.status`)

```
PENDING → PAID → CONFIRMED → USED           (luồng thành công, có thêm bước CONFIRMED/USED so với đơn thẻ game)
PENDING → EXPIRED                            (hết hạn giữ chỗ 5 phút, hoàn slot)
PAID → SUPPLY_FAILED → REFUND_PROCESSING → REFUNDED
```

`CONFIRMED → USED` được Chủ gian hàng xác nhận thủ công tại trang "Đơn hàng đã bán" khi khách đã dùng vé tại quầy.

## Giới hạn 1 vé 0đ/người dùng/tuần (FR-7.2.5)

Chống lạm dụng bot/tài khoản ảo — lưu `localStorage` theo tuần ISO (`mocks/freeTicketClaims.store.ts`), chặn claim vé 0đ thứ 2 trong cùng 1 tuần của cùng 1 người dùng.

## Kênh Người Bán (Shop Owner Channel)

Layout riêng, tách hẳn khỏi trải nghiệm mua hàng (sidebar dashboard tối, không dùng header storefront công khai).

| Trang | Route | Chức năng |
|---|---|---|
| Đăng ký gian hàng | `/jgame/kenh-nguoi-ban/dang-ky` | Member chưa có gian hàng → điền tên/địa chỉ/mô tả → `active` ngay (không có khâu Admin duyệt ở bản hiện tại) |
| Tổng quan | `/jgame/kenh-nguoi-ban` | Doanh thu hôm nay/tuần, đơn mới, top vé bán chạy, cảnh báo vé sắp hết chỗ |
| Quản lý Zone & Vé | `/jgame/kenh-nguoi-ban/zone-ve` | CRUD Zone + CRUD Vé — **nhập thủ công** |
| Đồng bộ nền tảng | `/jgame/kenh-nguoi-ban/dong-bo` | Chọn chế độ Thủ công / NetBarBox / DoDoNew; nút "Đồng bộ ngay" — **mock, chưa gọi API thật tới nền tảng nào** |
| Đơn hàng đã bán | `/jgame/kenh-nguoi-ban/don-hang` | Danh sách đơn, nút "Xác nhận khách đã dùng vé" (`CONFIRMED` → `USED`) |
| Công nợ & Lịch sử thanh toán | `/jgame/kenh-nguoi-ban/cong-no` | Kỳ hiện tại (JGame sẽ trả) + lịch sử các kỳ đã trả — **chỉ dạng xem (read-only)**, không có thao tác Admin xác nhận trả tiền ở bản hiện tại |

Guard: mọi trang trừ đăng ký đều yêu cầu `RequireAuth` + `RequireShopOwner` (chưa có gian hàng → tự điều hướng sang trang đăng ký).

### Công nợ (Payout)

JGame giữ tiền khách trả trước, định kỳ đối soát trả lại gian hàng (trừ hoa hồng). Mỗi đơn `USED` cộng vào kỳ công nợ hiện tại (`ShopPayout.status: PENDING`); mock tự chuyển 1 kỳ cũ sang `PAID` để có dữ liệu lịch sử minh hoạ.

## Lịch sử giao dịch (nâng cấp liên đới)

`HistoryPage` được nâng từ 1 tab (chỉ thẻ game) thành **3 tab**: Thẻ game / Phụ kiện / Vé giờ chơi — vì đây là loại đơn thứ 3 phát sinh.

## Chưa triển khai / còn mock hoàn toàn

- Đồng bộ NetBarBox/DoDoNew chỉ random số liệu — chưa có Adapter/API thật (đúng nguyên tắc kiến trúc Adapter ở URD mục 3.1/7.2.6, nhưng phần triển khai thật chưa có).
- Khâu Admin duyệt gian hàng mới trước khi kích hoạt — hiện gian hàng `active` ngay khi đăng ký, chưa có kiểm duyệt.
