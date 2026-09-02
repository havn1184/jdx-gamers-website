# Tài khoản & Xác thực

> Code: `features/Public/auth/`, `features/Account/User/account/` (hồ sơ/bảo mật/lịch sử), `contexts/AuthContext.tsx`, `mocks/authUsers.store.ts`, `mocks/loginHistory.store.ts`.
> Xem thêm: [00-tong-quan.md](00-tong-quan.md), `Website/.claude/system-architect/auth-va-phan-quyen.md`.

## Khác biệt quan trọng so với URD gốc

URD gốc đặc tả đăng ký/đăng nhập **chỉ bằng OTP qua Zalo ZNS** (không mật khẩu), dùng chung SSO nền tảng. Thực tế đã đổi hướng: JGame **tự xây hệ thống tài khoản độc lập**, có mật khẩu, không phụ thuộc SsoApp/`TokenManager` chung.

## Đăng ký

- Thu thập: email + số điện thoại + mật khẩu + xác nhận mật khẩu + checkbox đồng ý điều khoản (bắt buộc).
- Đăng ký xong **tự đăng nhập luôn** (quyết định mock để demo mượt — khi có BE thật cần xác nhận lại có giữ hành vi này không).
- Trùng email/SĐT đã đăng ký → báo lỗi rõ.

## Đăng nhập

- **Chỉ nhận số điện thoại làm định danh đăng nhập** (đã chuẩn hoá — bỏ lựa chọn "email hoặc SĐT" trước đó). Validate theo regex `0\d{9,10}`.
- Có tuỳ chọn "Ghi nhớ đăng nhập".
- Nếu tài khoản đã bật 2FA → trả `requires2FA: true` + `pendingToken`, phải gọi `verify2FA` với mã 6 số trước khi coi là đăng nhập xong.
- **Điều hướng sau đăng nhập theo vai trò thực tế của tài khoản** (không phải điều hướng cố định về trang chủ):
  1. Có `returnTo` (bị chặn ở 1 bước nào đó, VD xác nhận đơn hàng) → quay lại đúng bước đó, giữ nguyên lựa chọn đã chọn trước khi bị chặn.
  2. `role === 'admin'` → `/jgame/quan-tri`.
  3. Có gian hàng (`ShopOwnerApiService.getMyShop()` trả về shop) → `/jgame/chu-cybergame`.
  4. Là đối tác tiếp thị (`ReferrerApiService.getMyAffiliateStatus()`) → `/jgame/doi-tac`.
  5. Mặc định → `/jgame/tai-khoan` (Account Dashboard).

## Quên mật khẩu / Đặt lại mật khẩu

- Quên mật khẩu: nhập SĐT → **luôn trả về "đã gửi thành công" bất kể tài khoản có tồn tại hay không** (chống dò tài khoản) — mock log "link" ra console.
- Đặt lại mật khẩu: cần token hợp lệ (từ URL) + mật khẩu mới; token hết hạn/không hợp lệ → báo lỗi rõ.

## Xác minh Email / SĐT

- Email: link xác nhận qua token trong query param + nút gửi lại.
- SĐT: OTP 6 số (mock — hiện chỉ sinh số ngẫu nhiên và log ra console, **không gọi Zalo ZNS/SMS gateway thật**), đếm ngược gửi lại, giới hạn số lần gửi lại.
- Yêu cầu xác minh SĐT bắt buộc đăng nhập trước (`requireAuth`).

## 2FA (mô phỏng TOTP)

- Bật 2FA: hiển thị "mã bí mật" dạng text (không dựng QR thật, tránh thêm dependency) + xác nhận bằng đúng **1 mã demo cố định `123456`** hiển thị sẵn trên màn hình.
- Tắt 2FA: cần xác nhận lại mã.
- **Đây chỉ là mô phỏng luồng UI, không phải TOTP thật** — khi có BE thật phải thay bằng thư viện TOTP chuẩn (RFC 6238) + QR thật.

## Hồ sơ & Bảo mật

- Hồ sơ (`ProfilePage`): họ tên, avatar (URL ảnh), ngày sinh; email/SĐT chỉ xem, có nút "Đổi" mở lại luồng xác minh tương ứng (không cho sửa trực tiếp — tránh mất trạng thái đã xác minh mà không qua lại quy trình).
- Đổi mật khẩu: yêu cầu đúng mật khẩu cũ.
- Lịch sử đăng nhập & hoạt động (`ActivityHistoryPage`): thời gian, thiết bị/trình duyệt (User-Agent), IP (mock), hành động (đăng nhập/đăng xuất/đăng ký/đổi mật khẩu/đặt lại mật khẩu/bật-tắt 2FA/xác minh email/xác minh SĐT/cập nhật hồ sơ).

## ⚠️ Cảnh báo bảo mật đã ghi nhận trong code (bắt buộc xử lý trước khi lên production thật)

- Mật khẩu hiện chỉ được **"obfuscate" bằng base64** khi lưu vào `localStorage` (`jgame_auth_users_db`) — **không phải hash bảo mật thật** (không phải bcrypt/argon2). Đây là mock phía FE để demo được toàn luồng khi chưa có BE.
- Toàn bộ logic xác thực/băm mật khẩu **PHẢI chuyển hẳn sang server** khi có backend thật — FE chỉ được gọi API, không tự xử lý mật khẩu ở client.
- Dữ liệu tài khoản mock lưu ở `localStorage` (khác các mock store khác lưu in-memory) để tài khoản đăng ký còn tồn tại sau khi tải lại trang — chỉ để demo, không phải cơ chế lưu trữ đích thực.

## Bảo vệ route (guard) theo vai trò

Xem chi tiết cơ chế trong `Website/.claude/system-architect/auth-va-phan-quyen.md`. Tóm tắt 5 loại guard trong `layout/`:

| Guard | Điều kiện chặn | Điều hướng khi bị chặn |
|---|---|---|
| `RequireAuth` | Chưa đăng nhập | `/jgame/dang-nhap?redirect=...` (giữ lại lựa chọn hiện tại) |
| `GuestOnly` | Đã đăng nhập (áp cho trang đăng nhập/đăng ký) | Về trang chủ |
| `RequireAdmin` | `user.role !== 'admin'` | `/jgame` |
| `RequireShopOwner` | Chưa có `CybergameShop` | `/jgame/chu-cybergame/dang-ky` |
| `RequireAffiliate` | Chưa có `AffiliatePartner` | `/jgame/doi-tac/dang-ky` |

Phân quyền hiện tại chỉ so sánh chuỗi role đơn giản ở tầng route — chưa có mô hình permission theo từng hành động (permission-based) như các module khác trong InvoiceEasy.
