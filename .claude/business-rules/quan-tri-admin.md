# Quản trị hệ thống (Admin)

> Route: `/jgame/quan-tri/*`, guard `RequireAuth` + `RequireAdmin` (`user.role === 'admin'`).
> Code: `features/Account/Admin/`, `services/JGameApiServiceAdmin.ts` (~23 method).
> Nguồn thiết kế: `Docs/Nang-cap/nc-jgame-chuyen-admin-ve-jgameapp-va-role-2026-08-29.md` (✅ APPROVED).

## Vị trí — đã chuyển hẳn từ AdminApp về JGameApp

URD gốc mục 17.2/18.6 giả định backoffice dùng chung hạ tầng Admin nội bộ tách biệt (giống các portal InvoiceEasy khác). Vì JGame là **website độc lập** (tự có tài khoản, không SSO — xem [auth-tai-khoan.md](auth-tai-khoan.md)), khu quản trị JGame **không thể** tiếp tục nằm trong `AdminApp` (dùng tài khoản SSO khác hẳn) — đã chuyển toàn bộ 23 file từ `AdminApp/features/jgame/` vào `JGameApp/features/Account/Admin/`, xoá sạch route/menu liên quan trong `AdminApp`.

## Danh sách trang quản trị

| Trang | Route | Chức năng |
|---|---|---|
| Tổng quan | `/jgame/quan-tri` | Dashboard admin |
| Tài khoản hệ thống | `/jgame/quan-tri/tai-khoan` | Danh sách phân trang toàn bộ tài khoản (4 nhóm nghiệp vụ), khóa/mở khóa đăng nhập, reset mật khẩu, xem số dư ví (20260902-nc_quan-tri-tai-khoan-he-thong.md) |
| Danh mục thẻ & mệnh giá | `/jgame/quan-tri/danh-muc-the` | CRUD loại thẻ, mệnh giá, giá bán, NCC gắn kèm, bật/tắt bán |
| Phụ kiện | `/jgame/quan-tri/phu-kien` | CRUD sản phẩm phụ kiện (GĐ3) |
| Nhà cung cấp | `/jgame/quan-tri/nha-cung-cap` | CRUD NCC + cấu hình routing khi nhiều NCC cùng loại thẻ |
| Giao dịch | `/jgame/quan-tri/giao-dich` | Tra soát giao dịch, xử lý thủ công (`manualResolveOrder`: hoàn tiền/cấp lại mã) |
| Đối tác Referral | `/jgame/quan-tri/doi-tac-referral` | Quản trị TOÀN BỘ đối tác (khác dashboard 1 đối tác ở `/jgame/doi-tac`) |
| Khuyến mãi | `/jgame/quan-tri/khuyen-mai` | CRUD voucher/chương trình giảm giá |
| Báo cáo | `/jgame/quan-tri/bao-cao` | `getRevenueReport()` — báo cáo doanh thu đơn giản |
| Đánh giá phòng game | `/jgame/quan-tri/danh-gia` | Bảng trung bình 4 tiêu chí (Vệ sinh/Đồ ăn/Thái độ/Cấu hình) theo TỪNG shop, sắp xếp tăng dần theo điểm tổng thể (shop điểm thấp nhất lên đầu) + drill-down xem chi tiết đánh giá 1 shop (20260902-nc_danh-gia-phong-game-da-tieu-chi.md) |

## Quy ước UI riêng của khu Admin trong JGameApp

- **Không dùng Dialog modal** — toàn bộ form CRUD (thẻ/NCC/đối tác/khuyến mãi) dùng **inline-form-panel**, vì JGameApp không có component `Dialog` dùng chung (đã xoá vì không dùng ở portal này) và đã có sẵn pattern inline-form từ trang Quản lý Zone/Vé (Chợ vé GĐ2) — tái dùng thay vì dựng lại 1 Dialog primitive mới.
- **Không dùng `ConfirmDialog` khi xoá** — xoá trực tiếp qua nút xoá, nhất quán với pattern đã dùng ở `ShopZonesTicketsPage`.
- Theme tối đồng bộ với toàn JGameApp (khác nền trắng kiểu AdminApp cũ).

## Mô hình role

Chỉ có 1 field `role: 'customer' | 'admin'` trên `AuthUser` — admin là vai trò **loại trừ** (1 tài khoản chỉ mang 1 role, khác Chủ Cybergame/Đối tác không loại trừ). Chưa có phân quyền chi tiết theo Role như URD mục 20 mô tả (Admin/Finance/Support riêng biệt) — hiện chỉ có 1 mức "admin" duy nhất, so sánh chuỗi đơn giản ở tầng route guard, chưa có permission theo từng hành động.

## Chưa triển khai

- Phân quyền nội bộ nhiều cấp (Admin/Finance/Support — URD mục 3, 20, SC-A8) — hiện chỉ có 1 role `admin` duy nhất.
- Đối soát tài chính JGame–NCC–jPay (UC-13) — chưa có trang nào trong Admin, kể cả mock UI.
- Dashboard giám sát tỷ lệ lỗi cấp mã theo từng NCC theo thời gian thực (NFR "Khả năng theo dõi & vận hành" URD mục 9) — chưa có.
- Cảnh báo gian lận referral (tỷ lệ hoàn tiền bất thường theo mã referral) — chưa có trong trang Đối tác Referral hiện tại.
