# Kho phụ kiện Gamer (Giai đoạn 3)

> Route: `/jgame/phu-kien` (catalog), `/jgame/gio-hang` (giỏ hàng, public), `/jgame/thanh-toan-phu-kien` (checkout, cần đăng nhập), `/jgame/don-hang-phu-kien/:orderId` (theo dõi đơn).
> Code: `features/Public/accessories/` (catalog, chi tiết, giỏ hàng), `features/Account/User/accessories/` (checkout, tracking — cần đăng nhập), `contexts/CartContext.tsx`, `mocks/accessories.mock.ts`, `mocks/accessoryOrders.store.ts`.
> Nguồn thiết kế: `Docs/Nang-cap/nc-jgame-doc-lap-auth-gd3-2026-08-28.md` mục 4 (✅ APPROVED). URD gốc mục 8 chỉ đặc tả mức khung — tài liệu này là bản chi tiết hoá thật đã code.

## Khác biệt cốt lõi so với Nạp thẻ/Chợ vé: hàng vật lý, giỏ hàng đa sản phẩm

Đây là loại hàng **duy nhất** trong JGame Store có giỏ hàng nhiều sản phẩm cùng lúc và cần địa chỉ giao hàng — khác hẳn "1 đơn = 1 mệnh giá" (thẻ game) hay "đặt ngay 1 vé" (chợ vé).

- Danh mục: chuột, bàn phím, tai nghe, PC gaming, màn hình, ghế (`category: mouse|keyboard|headset|pc|monitor|chair`) — thuộc tính brand/specs/price/stockQuantity/images.
- **Giỏ hàng** (`CartContext`): state `cartItems: {productId, quantity}[]`, persist `localStorage` (`jgame_cart`) — khác các mock order khác (in-memory, mất khi reload). Icon giỏ hàng ở header hiển thị badge số lượng.
- Checkout thu thêm: địa chỉ giao hàng (tên, SĐT, địa chỉ), chọn đơn vị vận chuyển (`getShippingMethods()` — phí cố định theo carrier mock, không có trang quản lý carrier riêng vì URD FR-8.4 chỉ yêu cầu ở mức khung).
- Tuỳ chọn dùng JCoin trả một phần (giống 2 luồng còn lại).

## State machine đơn phụ kiện (`AccessoryOrder.status`) — HOÀN TOÀN KHÁC 2 loại đơn kia

```
PENDING → PAID → PACKING → SHIPPING → DELIVERED
                                     ↘ CANCELLED / RETURNED
```

Đây **không phải** state machine "giao hàng số tức thời" (PENDING→PAID→SUCCESS) như thẻ game/vé giờ chơi — phản ánh đúng bản chất giao hàng vật lý cần thời gian đóng gói/vận chuyển. **Quyết định kỹ thuật:** dùng type riêng `AccessoryOrder` + store mock riêng (`accessoryOrders.store.ts`), không ép chung 1 bảng `Order` với thẻ game, để tránh làm phức tạp luồng thẻ game đang chạy ổn định.

## Theo dõi đơn hàng

`/jgame/don-hang-phu-kien/:orderId` hiển thị timeline trực quan theo state machine trên, kèm mã vận đơn (tracking code) mock.

## Quản trị (Admin)

| Trang | Route | Nội dung |
|---|---|---|
| Sản phẩm phụ kiện | `/jgame/quan-tri/phu-kien` | CRUD: tên, loại, thương hiệu, giá, tồn kho, trạng thái |
| Đơn hàng phụ kiện | (gộp trong quản lý giao dịch Admin) | Cập nhật trạng thái giao hàng, xem địa chỉ |

## Lịch sử giao dịch

Gộp chung `HistoryPage` với thẻ game và vé giờ chơi (3 tab) — xem [cho-ve-cybergame.md](cho-ve-cybergame.md#lịch-sử-giao-dịch-nâng-cấp-liên-đới).

## Chưa triển khai

- Quản lý đơn vị vận chuyển (carrier) — danh sách cố định trong code, chưa có trang CRUD riêng (chấp nhận được ở mức URD FR-8.4 "mức khung").
- Chính sách đổi trả hàng vật lý chi tiết — mới dừng ở trạng thái `RETURNED` trong state machine, chưa có luồng nghiệp vụ đầy đủ (lý do trả, hoàn tiền một phần...).
