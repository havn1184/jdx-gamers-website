# Nạp thẻ game (Giai đoạn 1)

> Route: `/jgame/nap-the` (danh mục — trước đây là trang chủ `/jgame`, đã chuyển). Code: `features/Public/catalog/`, `features/Account/User/order/`, `mocks/cardProducts.mock.ts`, `mocks/orders.store.ts`.
> Đặc tả gốc: URD mục 4–6, 12, đầy đủ chi tiết nhất trong toàn bộ URD — code bám khá sát, đặc biệt state machine đơn hàng khớp 100% ở tầng type.

## Luồng mua hàng

1. Chọn loại thẻ (NCC/tựa game) tại `/jgame/nap-the` → xem chi tiết mệnh giá tại `/jgame/the/:productId`.
2. Chọn mệnh giá cụ thể → xác nhận đơn hàng (`/jgame/xac-nhan-don-hang`, xem trước được khi chưa đăng nhập, **chỉ chặn khi bấm "Thanh toán"**) — checkbox đồng ý điều khoản bắt buộc.
3. Bấm Thanh toán → nếu Guest, chuyển sang đăng nhập/đăng ký, **giữ nguyên lựa chọn** (thẻ/mệnh giá/referrer code), quay lại đúng bước sau khi xác thực.
4. Tạo đơn `PENDING` → sinh mã QR (mock, không phải QR ngân hàng thật) tại `/jgame/thanh-toan/:orderId`.
5. Trạng thái đơn tự tiến triển qua polling mock (`usePaymentStatus`, poll mỗi 2s) mô phỏng: webhook jPay xác nhận thanh toán → gọi NCC cấp mã → trả kết quả.
6. Kết quả hiển thị tại `/jgame/ket-qua/:orderId` — thành công: mã thẻ (serial/pin, có nút hiện/ẩn + copy); thất bại: lý do + trạng thái hoàn tiền.
7. **Tuỳ chọn dùng JCoin**: có thể trả một phần đơn hàng bằng số dư JCoin (trừ `min(số dư, tổng tiền)`, phần còn lại vẫn qua QR) — xem [kiem-tien-jcoin.md](kiem-tien-jcoin.md).

## Ràng buộc thiết kế dữ liệu

- **1 đơn hàng = 1 mệnh giá, cho phép mua nhiều số lượng cùng mệnh giá** — không hỗ trợ giỏ hàng nhiều loại thẻ khác nhau trong 1 lần thanh toán (khác hẳn phụ kiện — có giỏ hàng đa sản phẩm).
- Mã thẻ (`serial`/`pin`) chỉ hiện đầy đủ lần đầu; xem lại trong lịch sử bị **ẩn một phần** vì lý do bảo mật.

## State machine đơn hàng (khớp URD mục 6.3, `OrderStatus` trong `order.types.ts`)

```
PENDING → EXPIRED           (hết thời gian chờ thanh toán, mặc định 15 phút)
PENDING → PAID              (jPay xác nhận thanh toán — mock)
PAID → SUCCESS               (NCC cấp mã thẻ thành công — mock)
PAID → SUPPLY_FAILED         (NCC lỗi/hết mã/timeout — mock)
SUPPLY_FAILED → REFUND_PROCESSING → REFUNDED
```

Nguyên tắc: **không giữ tiền khách mà không giao mã và không hoàn tiền** — mọi lỗi cấp mã đều dẫn tới hoàn tiền tự động (retry theo policy trước khi coi là thất bại hẳn).

## Referral / hoa hồng

- Ghi nhận `referrerCode` từ `?ref=` vào cookie/session, TTL 30 ngày, mô hình last-click attribution.
- Chỉ tính hoa hồng trên đơn ở trạng thái `SUCCESS`; đơn `EXPIRED`/`REFUNDED` không tính.
- Chi tiết cơ chế referrer/hoa hồng: [doi-tac-tiep-thi.md](doi-tac-tiep-thi.md).

## Trạng thái CHƯA triển khai (khoảng trống lớn nhất so với URD)

- **Đối soát tài chính JGame–NCC–jPay** (UC-13, URD mục 11.1) — chưa có bất kỳ trang/service nào, kể cả mock UI.
- **Xuất hoá đơn điện tử qua J-Invoice** (UC-14) — chưa có 1 dòng code nào liên quan (0 match ngoài tài liệu).
- **Tích hợp NCC thẻ game thật** — hiện chỉ là CRUD "Nhà cung cấp" mock trong Admin (`AdminSuppliersPage`), không có Adapter/API thật nào kết nối tới NCC.

Khi thiết kế backend thật, đây là 2 nghiệp vụ cần đặc tả kỹ nhất vì không có gì để tham chiếu ngoài URD gốc mục 11.4, 18.7.

## Nhận diện thương hiệu trên đơn (từ 02/09/2026)

`OrderSummary` nhận thêm `productImageUrl`/`brandColorFrom`/`brandColorTo`/`brandIcon` (Backend denormalize lúc tạo đơn); `OrderApiService.mapOrder` dựng `art` cùng quy tắc với danh mục để Lịch sử giao dịch hiện `CardArt` đúng logo/màu.
