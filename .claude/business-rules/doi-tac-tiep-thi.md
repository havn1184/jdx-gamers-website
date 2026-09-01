# Đối tác tiếp thị liên kết (Referrer / CTV)

> Route: `/jgame/doi-tac/dang-ky` (đăng ký), `/jgame/doi-tac` (dashboard, cần đăng nhập + đã đăng ký).
> Code: `features/Account/Partner/`, `mocks/affiliatePartners.store.ts`.
> Nguồn thiết kế: `Docs/Nang-cap/nc-jgame-chuyen-admin-ve-jgameapp-va-role-2026-08-29.md` mục 3.2 (✅ APPROVED). URD gốc mục 6.6 đặc tả mô hình referral nhưng KHÔNG có luồng tự đăng ký gắn với tài khoản — đây là phần hoàn thiện thêm.

## Mô hình vai trò

**Không phải role loại trừ** — là 1 "hồ sơ" gắn thêm vào tài khoản Member đã có, xác định bằng bản ghi `AffiliatePartner.userId = userId`. 1 khách hàng có thể vừa mua hàng vừa là đối tác (giống mô hình Chủ gian hàng ở Chợ vé GĐ2). Đây cũng chính là câu trả lời cho câu hỏi mở ở URD mục 20 ("1 User có thể vừa là ReferralPartner không?") — **có**.

## Đăng ký làm đối tác

Form: tên hiển thị, kênh quảng bá → tạo `AffiliatePartner` gắn `userId` hiện tại, tự sinh `referralCode` + `shareUrl`. Guard `RequireAffiliate` chặn dashboard khi chưa đăng ký, tự điều hướng sang trang đăng ký.

## Ghi nhận nguồn referer & tính hoa hồng (theo URD mục 6.6, đã triển khai đúng nguyên tắc)

1. Gắn mã referer vào URL truy cập (VD `jgame.vn/nap-the?ref=CTV001`), lưu cookie/session TTL 30 ngày (mặc định, có thể cấu hình) — mô hình **last-click attribution**.
2. Người dùng dùng nhiều mã referer khác nhau trong 1 phiên → mã **gần nhất trước khi hoàn tất thanh toán** được ghi nhận.
3. Hoàn tất đăng ký/thanh toán trong thời gian hiệu lực của mã → giao dịch gắn với đối tác tương ứng, không phụ thuộc việc đăng ký tài khoản ngay lúc click hay sau đó.
4. Chỉ tính hoa hồng trên giao dịch ở trạng thái **thành công cuối cùng** (`SUCCESS`/`USED`/`DELIVERED` tuỳ loại đơn) — không tính trên đơn hết hạn/đã hoàn tiền.
5. Giao dịch thành công sau đó bị khiếu nại/hoàn tiền thủ công → hoa hồng đã ghi nhận PHẢI được đảo (reverse) tương ứng.

## Dashboard đối tác

Dữ liệu lấy đúng theo `userId` đang đăng nhập (đã sửa từ dữ liệu tĩnh `MOCK_REFERRER_SUMMARY` ban đầu không gắn với ai) — hiển thị: mã referral + link chia sẻ, tổng số đơn/hoa hồng, bảng giao dịch theo mã, trạng thái đối soát.

## Chưa triển khai

- Hoa hồng đa cấp (đại lý cấp 1/cấp 2, CTV giới thiệu CTV) — URD mục 6.6.5 xếp mức "Could have", chưa code.
- Cơ chế phát hiện gian lận (đối tác tự mua qua link của mình) — URD mục 12 đề cập cần Admin theo dõi tỷ lệ hoàn tiền bất thường theo mã referral, chưa có trang/cảnh báo tương ứng trong Admin.
