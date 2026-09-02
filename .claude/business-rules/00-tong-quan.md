# JGame Store — Tổng quan nghiệp vụ

> Portal: `src/modules/JGameApp/` (mount `/jgame/*` trong `src/App.tsx`). Website thương mại điện tử bán hàng hoá số/vật lý cho cộng đồng gamer, hoạt động **độc lập** (tự có tài khoản, không dùng SSO chung nền tảng InvoiceEasy).
>
> **Nguồn tham chiếu:** URD gốc `src/modules/JGameApp/Docs/Tai-lieu-goc/URD-xGame-tai-lieu-yeu-cau-nguoi-dung.md` (đọc mục 0.2 trước — ghi đè phần lỗi thời) + các tài liệu giải pháp đã APPROVED trong `Docs/Nang-cap/`.
>
> **Trạng thái triển khai:** toàn bộ nghiệp vụ dưới đây hiện chạy trên **frontend + mock 100%** — chưa có backend thật, chưa có tích hợp thật với bất kỳ đối tác nào (jPay, J-Invoice, Zalo ZNS, NCC thẻ game, NetBarBox/DoDoNew). Xem `Website/.claude/system-architect/mock-gate-va-api.md` để hiểu cơ chế mock và cách chuyển sang BE thật.

## 4 phân hệ nghiệp vụ chính

| Phân hệ | Route gốc | Tài liệu chi tiết |
|---|---|---|
| Nạp thẻ game (thẻ NCC: Garena/VNG/Zing...) | `/jgame/nap-the` | [nap-the-game.md](nap-the-game.md) |
| Chợ vé giờ chơi Cybergame (marketplace kiểu Shopee + Chủ Cybergame) | `/jgame/cho-ve`, `/jgame/chu-cybergame` | [cho-ve-cybergame.md](cho-ve-cybergame.md) |
| Kho phụ kiện Gamer (chuột/bàn phím/PC/màn hình/ghế...) | `/jgame/phu-kien` | [phu-kien-gamer.md](phu-kien-gamer.md) |
| Kiếm tiền — nhiệm vụ trải nghiệm game + ví JCoin | `/jgame/kiem-tien` | [kiem-tien-jcoin.md](kiem-tien-jcoin.md) |

Cộng thêm 2 phân hệ nền tảng dùng chung:

| Phân hệ nền tảng | Tài liệu chi tiết |
|---|---|
| Tài khoản & xác thực (độc lập, không SSO) | [auth-tai-khoan.md](auth-tai-khoan.md) |
| Đối tác tiếp thị liên kết (Referrer/CTV) | [doi-tac-tiep-thi.md](doi-tac-tiep-thi.md) |
| Quản trị hệ thống (Admin, trong chính JGameApp) | [quan-tri-admin.md](quan-tri-admin.md) |

## Mô hình vai trò (actor)

1 tài khoản (`AuthUser`) có `role: 'customer' | 'admin'` — **chỉ `admin` là vai trò loại trừ** (gate cứng qua `RequireAdmin`, 1 tài khoản chỉ mang 1 role). Hai "hồ sơ" còn lại **không loại trừ** — xác định bằng việc đã có bản ghi đăng ký hay chưa, không phải field role:

- **Chủ Cybergame (Cybergame Owner)** — có bản ghi `CybergameShop.ownerId = userId` (đăng ký qua Chủ Cybergame). 1 khách hàng vừa mua vừa mở gian hàng được (mô hình giống Shopee).
- **Đối tác tiếp thị liên kết (Referrer/CTV)** — có bản ghi `AffiliatePartner.userId = userId` (đăng ký qua "Trở thành đối tác"). 1 khách hàng có thể vừa mua vừa làm đối tác.

Guest (chưa đăng nhập) xem được toàn bộ nội dung public (catalog, chợ vé, phụ kiện, nhiệm vụ, trang tĩnh) — chỉ bị chặn ở bước xác nhận đơn hàng/thanh toán, lúc đó mới bắt đăng nhập (giữ nguyên lựa chọn đã chọn, không mất context).

4 tài khoản demo (seed tự động khi app load lần đầu, xem `mocks/authUsers.store.ts`) — dùng để test nhanh từng vai trò, tất cả mật khẩu `Demo@123`:

| Vai trò | Định danh đăng nhập (SĐT) |
|---|---|
| Khách hàng | tài khoản `khachhang@jgame.vn` |
| Chủ Cybergame (gắn sẵn gian hàng "Alpha Cyber Center") | `chugianhang@jgame.vn` |
| Đối tác tiếp thị | `doitac@jgame.vn` |
| Quản trị viên | `admin@jgame.vn` |

## Nguyên tắc nghiệp vụ xuyên suốt (áp dụng cho mọi phân hệ có đơn hàng)

1. **Idempotency theo `orderId`** cho mọi thao tác cấp phát tài nguyên số (mã thẻ, mã đổi vé) — tránh cấp trùng khi retry.
2. **Không giữ tiền khách mà không giao hàng và không hoàn tiền** — mọi lỗi cấp phát phải dẫn tới hoàn tiền tự động (trừ trường hợp không rõ kết quả cần Admin xử lý thủ công).
3. **Ghi nhận referrer theo mô hình last-click**, TTL cookie/session mặc định 30 ngày, chỉ tính hoa hồng trên đơn ở trạng thái thành công cuối cùng (không tính trên đơn hết hạn/đã hoàn tiền).
4. **JCoin có thể trả một phần đơn hàng** ở cả 3 luồng thanh toán (thẻ/vé/phụ kiện) — trừ tối đa `min(số dư, tổng tiền)`, phần còn lại vẫn qua QR.
5. **Mỗi loại đơn hàng có state machine riêng** (thẻ game / vé giờ chơi / phụ kiện vật lý khác nhau về bản chất giao hàng) — không dùng chung 1 bảng `Order`/1 mock store. Xem chi tiết từng state machine trong tài liệu phân hệ tương ứng.
