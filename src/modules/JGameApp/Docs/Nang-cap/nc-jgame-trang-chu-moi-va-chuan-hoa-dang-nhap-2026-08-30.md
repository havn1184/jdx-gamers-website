# Tài liệu giải pháp — Trang chủ tổng hợp 3 phân hệ + Chuẩn hoá đăng nhập bằng SĐT

> Ngày: 2026-08-30 | Portal: **JGameApp**

## 0. Prompt gốc

> "Trang chủ hiện tại đổi tên thành Nạp thẻ game. còn thêm mới lại trang chủ để thể hiện chức năng của cả 3 phân hệ: nạp thẻ, chợ vé, phụ kiện. thiết kế sao cho ui, ux tốt. lôi kéo người chơi tương tác. sắp xếp khoa học, thuận tiện cho các thao tác. ngoài ra chức năng tài khoản, chuẩn hoá tên đăng nhập là số điện thoại."

## 1. Phạm vi

1. **Trang "Nạp thẻ game"**: chính là `CatalogPage` hiện tại — chuyển từ route gốc `/jgame` sang route riêng `/jgame/nap-the`. Nội dung/logic giữ nguyên.
2. **Trang chủ mới `/jgame`**: dựng mới, tổng hợp điểm nhấn của cả 3 phân hệ (Nạp thẻ, Chợ vé giờ chơi, Phụ kiện Gamer) với UI sôi động, có dữ liệu thật lấy trực tiếp từ 3 API đã có (không tạo mock riêng) để luôn đồng bộ.
3. **Chuẩn hoá đăng nhập**: Đăng nhập & Quên mật khẩu chỉ dùng **số điện thoại** làm định danh (bỏ lựa chọn "email hoặc SĐT"). Đăng ký vẫn thu thập cả email (dùng cho liên lạc/khôi phục phụ) + số điện thoại (dùng để đăng nhập) — không đổi schema tài khoản, chỉ đổi UI/validate ở màn hình Đăng nhập/Quên mật khẩu.

## 2. Quyết định thiết kế

| Quyết định | Lý do |
|---|---|
| Trang chủ mới lấy dữ liệu thật qua `CardApiService`, `PlaytimeApiService.getMarketplaceSections()`, `AccessoryApiService.getProducts()` — không tạo mock riêng | Tránh trùng lặp dữ liệu, tự động đồng bộ khi 3 phân hệ đổi dữ liệu sau này |
| Bố cục trang chủ theo mô hình "hub" thương mại điện tử: Hero tổng quan → 3 thẻ lối vào phân hệ (nổi bật, có số liệu) → Section xem trước Chợ vé (vé flash-sale) → Section xem trước Nạp thẻ (nhà cung cấp) → Section xem trước Phụ kiện | Đúng yêu cầu "khoa học, thuận tiện" — người dùng thấy ngay 3 lối đi chính trước khi cuộn xuống xem chi tiết từng phân hệ, giống Shopee/Tiki hub |
| Vùng Chợ vé đặt ngay sau Hero (trước Nạp thẻ) | Đây là nội dung "sôi động" nhất (đếm ngược, giảm giá) — đúng tinh thần "lôi kéo tương tác" nêu trong yêu cầu |
| Đăng nhập/Quên mật khẩu đổi nhãn + validate sang chỉ nhận SĐT (regex `0\d{9,10}`) | Đúng yêu cầu chuẩn hoá; tái dùng `findUserByIdentifier` sẵn có (đã hỗ trợ tra theo phone) — không đổi backend/mock |
| Đăng ký giữ nguyên (thu cả email + SĐT) | Yêu cầu chỉ nói chuẩn hoá **đăng nhập**, không nói bỏ email khỏi hồ sơ; giữ email để liên lạc/khôi phục, tránh phá vỡ ProfilePage/xác thực email đang có |
| `CardDetailPage` "Quay lại danh mục" trỏ sang `/jgame/nap-the` (không phải `/jgame`) | Ngữ nghĩa đúng — quay lại đúng danh sách thẻ, không phải trang chủ tổng hợp |

## 3. Danh sách thay đổi

| Khu vực | Thay đổi |
|---|---|
| `routes/routeConfig.tsx` | Thêm `HomePage` tại `path: ''`; đổi `CatalogPage` sang `path: 'nap-the'` |
| `features/home/` (MỚI) | `pages/HomePage.tsx`, `hooks/useHome.page.fetchData.ts` |
| `layout/StorefrontHeader.tsx` | Thêm nav "Nạp thẻ" (`/jgame/nap-the`); "Trang chủ" giữ nguyên trỏ `/jgame` |
| `features/catalog/pages/CardDetailPage.tsx` | "Quay lại danh mục" → `/jgame/nap-the` |
| `features/auth/pages/LoginPage.tsx` + `hooks/useLogin.page.ts` | Nhãn/placeholder/validate: chỉ SĐT |
| `features/auth/pages/ForgotPasswordPage.tsx` + `hooks/useForgotPassword.page.ts` | Nhãn/placeholder/validate: chỉ SĐT |

## 4. Checklist
- [ ] `/jgame` hiển thị trang chủ mới với dữ liệu thật từ 3 phân hệ, không lỗi console
- [ ] `/jgame/nap-the` hiển thị đúng nội dung Nạp thẻ game như cũ
- [ ] Đăng nhập/Quên mật khẩu chỉ chấp nhận SĐT, báo lỗi rõ khi nhập sai định dạng
- [ ] Tài khoản demo (đều có SĐT hợp lệ) vẫn đăng nhập được bình thường
- [ ] `npm run type-check` sạch, Playwright không lỗi console/page

---
