# Tài liệu giải pháp — JGame hoạt động độc lập (tự xây Auth) + Public CMS + Giai đoạn 3 (Kho phụ kiện Gamer)

> Ngày: 2026-08-28 | Portal: **JGameApp** | Tiếp nối tài liệu đã approve trước đó (`nc-jgame-store-gd1-2026-08-28.md`)

---

## 0. Prompt gốc (nguyên văn)

> "tôi có thay đổi thiết kế jgameapp, do website public cần phải có phần đăng ký tài khoản riêng, nên sẽ không dùng ssoapp nữa mà sẽ hoạt động độc lập. cần có các chức năng như đăng ký, đăng nhập, quên mật khẩu, reset mật khẩu, cập nhật profile, xác minh số điện thoại, xác minh email, xác minh 2 yếu tố, lịch sử đăng nhập và các thao tác. Trang public cần thêm các trang về giới thiệu, liên hệ, điều khoản hoạt động,... hãy suy nghĩ và hoàn thiện đầy đủ các chức năng của 1 trang web độc lập. cũng xây luôn tính năng của giai đoạn 3 là kho hàng bán linh liện lĩnh vực công nghệ game, thiết bị game"
> → xác nhận dùng đúng quy trình `ppt-nc-toan-trinh`.

**⚠️ Mâu thuẫn kiến trúc so với tài liệu trước — CHỦ ĐỘNG do user yêu cầu, không phải phát sinh ngoài ý muốn:**
Tài liệu GĐ1 trước quyết định "kế thừa SSO chung toàn nền tảng, không xây login riêng". Tài liệu này **đảo ngược hoàn toàn** quyết định đó theo đúng yêu cầu mới của user — JGame trở thành web độc lập có hệ thống tài khoản riêng, không phụ thuộc SsoApp nữa. Toàn bộ phần "Đăng nhập/Role: kế thừa SSO" ở tài liệu cũ được thay thế bởi mục 2 dưới đây.

**Vẫn giữ nguyên** (không đổi): kiến trúc mock gate (`JGAME_USE_MOCK`), toàn bộ tính năng Giai đoạn 1 (danh mục thẻ, đặt hàng, thanh toán QR, referral) đã code — chỉ thay lớp xác thực bên dưới.

---

## 1. Tổng Quan

- **Mục tiêu:** (1) Xây hệ thống tài khoản độc lập hoàn chỉnh cho JGame (không qua SSO). (2) Thêm nhóm trang public/CMS (giới thiệu, liên hệ, điều khoản, chính sách). (3) Xây đầy đủ Giai đoạn 3 — kho phụ kiện gamer (URD mục 8, mức khung) thành tính năng chạy được: catalog, giỏ hàng, checkout, theo dõi đơn hàng vật lý + backoffice quản lý.
- **BE thật:** vẫn CHƯA CÓ — toàn bộ qua cùng cơ chế mock gate đã có. Auth mock lưu **localStorage** (khác `mocks/orders.store.ts` chỉ lưu in-memory) để tài khoản đăng ký còn tồn tại sau khi tải lại trang — trải nghiệm demo hợp lý hơn.
- **Bảo mật (lưu ý bắt buộc ghi rõ trong code):** đây là mock phía FE — "băm" mật khẩu chỉ là obfuscate đơn giản (base64), **không phải bảo mật thật**. Khi có BE thật, toàn bộ logic xác thực/băm mật khẩu PHẢI chuyển sang server, FE chỉ gọi API.
- **2FA:** mô phỏng TOTP ở mức khung — hiển thị "mã bí mật" dạng text (không dựng QR thật, tránh thêm dependency), ô nhập mã 6 số; mock chấp nhận đúng 1 mã cố định hiển thị sẵn trên màn hình (ghi rõ "Mã demo: 123456") để test được luồng mà không cần thêm thư viện TOTP.
- **shortName mới:** `auth` (nhóm xác thực), `account` (hồ sơ/bảo mật), `accessories` (GĐ3).

## 2. Hệ Thống Tài Khoản Độc Lập (thay thế SSO)

### 2.1. Actor & phạm vi
Guest / Member — giữ nguyên như URD, chỉ đổi **nơi xác thực** (JGame tự quản lý, không phải SSO).

### 2.2. Danh sách màn hình

| Mã | Tên màn hình | Thành phần chính | Trạng thái xử lý |
|---|---|---|---|
| SC-11 | Đăng ký | Email, SĐT, mật khẩu, xác nhận mật khẩu, checkbox đồng ý điều khoản | Trùng email/SĐT, mật khẩu yếu, chưa tick điều khoản |
| SC-12 | Đăng nhập | Email/SĐT, mật khẩu, "Ghi nhớ đăng nhập", link Quên mật khẩu | Sai thông tin, tài khoản chưa xác minh (nhắc xác minh), yêu cầu OTP 2FA nếu đã bật |
| SC-13 | Quên mật khẩu | Nhập email/SĐT → gửi link/OTP đặt lại | Không tìm thấy tài khoản → vẫn báo "đã gửi nếu tồn tại" (chống dò tài khoản) |
| SC-14 | Đặt lại mật khẩu | Nhập mật khẩu mới + xác nhận (kèm token từ URL) | Token hết hạn/không hợp lệ |
| SC-15 | Xác minh Email | Trang xác nhận từ link email (token qua query param) + nút gửi lại | Token hết hạn, đã xác minh rồi |
| SC-16 | Xác minh SĐT | Nhập OTP 6 số gửi qua SMS (mock), đếm ngược gửi lại | OTP sai, hết hạn, quá số lần gửi lại |
| SC-17 | Hồ sơ cá nhân | Họ tên, avatar (URL ảnh), ngày sinh, email, SĐT (2 field sau chỉ xem, có nút "Đổi" mở lại luồng xác minh) | Lưu thành công/thất bại |
| SC-18 | Bảo mật tài khoản | Đổi mật khẩu (mật khẩu cũ + mới); Bật/tắt 2FA (hiện mã bí mật demo + xác nhận mã) | Mật khẩu cũ sai, mã 2FA sai |
| SC-19 | Lịch sử đăng nhập & hoạt động | Bảng: thời gian, thiết bị/trình duyệt (User-Agent), IP (mock), hành động (đăng nhập/đổi mật khẩu/bật 2FA...) | Danh sách rỗng |

### 2.3. API mock (AuthApiService + AccountApiService)

| Method | Input chính | Output chính |
|---|---|---|
| `register` | email, phone, password, agreedTerms | user (chưa verified) + tự đăng nhập luôn (mock, để demo mượt) |
| `login` | identifier (email/phone), password | accessToken hoặc `requires2FA: true` |
| `verify2FA` | code | accessToken |
| `logout` | — | clear token |
| `forgotPassword` | identifier | luôn trả success (chống dò tài khoản), mock log ra "link" trong console |
| `resetPassword` | token, newPassword | success/fail (token invalid/expired) |
| `sendEmailVerification` / `verifyEmail` | token (query param) | success/fail |
| `sendPhoneOtp` / `verifyPhoneOtp` | otp | success/fail, cập nhật `phoneVerified` |
| `getProfile` / `updateProfile` | name, avatarUrl, dob | user cập nhật |
| `changePassword` | oldPassword, newPassword | success/fail |
| `enable2FA` / `confirm2FA` / `disable2FA` | code xác nhận | success/fail |
| `getLoginHistory` | — | danh sách bản ghi (thời gian, thiết bị, IP mock, hành động) |

### 2.4. Lưu trữ mock
- `mocks/authUsers.store.ts` — mảng user lưu **localStorage** (`jgame_auth_users_db`), gồm cả password đã obfuscate; hàm `registerUser/findUser/updatePassword/...`.
- `mocks/loginHistory.store.ts` — log hoạt động, lưu localStorage theo `userId`.
- **`shared/services/api/TokenManager.ts`**: bỏ hoàn toàn phần gọi SSO (`SSO_BASE_URL`/refresh-token thật) — đổi key `vtn_*` → `jgame_*`, hàm `refreshAccessToken` chỉ mô phỏng gia hạn token nội bộ (không gọi network thật).
- **`contexts/AuthContext.tsx`**: viết lại — không còn `TokenManager.getAccessToken()` đơn thuần mà có state `user` đầy đủ (profile), cung cấp `login/register/logout/refreshUser`.

### 2.5. RequireAuth & routes mới (customer)

| Path | Trang | Auth |
|---|---|---|
| `/jgame/dang-ky` | RegisterPage | Chỉ Guest (đã login → redirect trang chủ) |
| `/jgame/dang-nhap` | LoginPage | Chỉ Guest |
| `/jgame/quen-mat-khau` | ForgotPasswordPage | Chỉ Guest |
| `/jgame/dat-lai-mat-khau` | ResetPasswordPage | Public (có token ở query) |
| `/jgame/xac-thuc-email` | VerifyEmailPage | Public (có token ở query) |
| `/jgame/xac-thuc-so-dien-thoai` | VerifyPhonePage | RequireAuth |
| `/jgame/ho-so` | ProfilePage | RequireAuth |
| `/jgame/bao-mat` | SecurityPage | RequireAuth |
| `/jgame/lich-su-hoat-dong` | ActivityHistoryPage | RequireAuth |

> Toàn bộ route cũ dùng `RequireAuth`/`useAuth` **không đổi cách gọi** — chỉ đổi nguồn dữ liệu bên trong `AuthContext`, nên `PaymentQrPage`, `HistoryPage`, `ReferrerDashboardPage`... không cần sửa.
> Header (`StorefrontHeader`) đổi nút "Đăng nhập" → dropdown avatar (Hồ sơ / Bảo mật / Lịch sử hoạt động / Đơn hàng / Đăng xuất) khi đã login.

## 3. Trang Public / CMS

| Mã | Trang | Path | Nội dung |
|---|---|---|---|
| SC-21 | Giới thiệu | `/jgame/gioi-thieu` | Câu chuyện thương hiệu, cam kết (nạp nhanh, minh bạch), số liệu nổi bật (mock) |
| SC-22 | Liên hệ | `/jgame/lien-he` | Form (tên, email, nội dung) — mock submit hiện toast thành công; thông tin liên hệ tĩnh |
| SC-23 | Điều khoản sử dụng | `/jgame/dieu-khoan-su-dung` | Nội dung tĩnh (điều khoản mua thẻ, chính sách đổi trả tổng quát) |
| SC-24 | Chính sách bảo mật | `/jgame/chinh-sach-bao-mat` | Nội dung tĩnh |

Không cần API riêng (trừ Liên hệ — 1 method mock `ContactApiService.sendMessage`). Footer link tới cả 4 trang.

## 4. Giai Đoạn 3 — Kho Phụ Kiện Gamer (URD mục 8, chi tiết hóa)

### 4.1. Danh sách màn hình (khách hàng)

| Mã | Trang | Path | Thành phần |
|---|---|---|---|
| SC-26 | Danh mục phụ kiện | `/jgame/phu-kien` (thay thế trang "Sắp ra mắt" cũ) | Lưới sản phẩm, filter theo loại (chuột/bàn phím/tai nghe/PC/màn hình/ghế), sắp xếp giá |
| SC-27 | Chi tiết sản phẩm | `/jgame/phu-kien/:productId` | Ảnh, thông số kỹ thuật, tồn kho, chọn số lượng, nút "Thêm vào giỏ" + "Mua ngay" |
| SC-28 | Giỏ hàng | `/jgame/gio-hang` | Danh sách sản phẩm (sửa số lượng/xóa), tạm tính, nút Thanh toán |
| SC-29 | Checkout phụ kiện | `/jgame/thanh-toan-phu-kien` | Địa chỉ giao hàng (tên, SĐT, địa chỉ), chọn đơn vị vận chuyển (phí cố định theo NCC mock), tổng tiền = hàng + ship, nút Thanh toán → tạo đơn → QR (dùng lại `PaymentQrPage` hiện có, tổng quát hóa) |
| SC-30 | Theo dõi đơn hàng phụ kiện | `/jgame/don-hang-phu-kien/:orderId` | Trạng thái: `PENDING→PAID→PACKING→SHIPPING→DELIVERED` hoặc `CANCELLED/RETURNED`, timeline trực quan, thông tin vận đơn (mã tracking mock) |

> Lịch sử đơn hàng phụ kiện gộp chung `HistoryPage` hiện có, thêm tab "Thẻ game" / "Phụ kiện" (2 loại đơn khác cấu trúc).

### 4.2. Giỏ hàng (Cart) — thiết kế mới
- `contexts/CartContext.tsx`: state giỏ hàng, persist `localStorage` (`jgame_cart`), API: `addItem/updateQuantity/removeItem/clear/totalAmount`.
- Icon giỏ hàng ở Header hiển thị badge số lượng.

### 4.3. Dữ liệu & API mock (AccessoryApiService)

| Method | Mô tả |
|---|---|
| `getAccessoryProducts(params)` | danh sách + filter loại/giá |
| `getAccessoryProductDetail(id)` | chi tiết 1 sản phẩm |
| `createAccessoryOrder(payload)` | tạo đơn từ giỏ hàng + địa chỉ + shipping method → trạng thái `PENDING`, dùng lại `OrderApiService`/`orders.store` **mở rộng** để hỗ trợ đơn nhiều sản phẩm (khác đơn thẻ game 1-mệnh-giá) |
| `getShippingMethods()` | danh sách đơn vị vận chuyển mock (phí cố định) |
| `getAccessoryOrderTracking(orderId)` | trạng thái + timeline giao hàng |

**Quyết định kỹ thuật:** đơn phụ kiện dùng **type riêng** `AccessoryOrder` (khác `OrderSummary` của thẻ game vì có nhiều dòng sản phẩm + địa chỉ giao hàng) và **store mock riêng** `mocks/accessoryOrders.store.ts` — không ép chung 1 bảng `Order` để tránh làm phức tạp luồng thẻ game đang chạy ổn định (đúng nguyên tắc "tránh ảnh hưởng module khác").

### 4.4. Backoffice Admin (AdminApp/features/jgame/, bổ sung — mục 17.2 URD mở rộng)

| Trang | Path | Nội dung |
|---|---|---|
| Sản phẩm phụ kiện | `/admin/jgame/accessories` | CRUD: tên, loại, thương hiệu, giá, tồn kho, trạng thái |
| Đơn hàng phụ kiện | `/admin/jgame/accessory-orders` | Danh sách, cập nhật trạng thái giao hàng, xem địa chỉ |

> Không làm riêng trang "Quản lý đơn vị vận chuyển" — danh sách carrier mock cố định trong code (đủ cho demo), theo đúng "ưu tiên đơn giản" (FR-8.4 chỉ yêu cầu ở mức khung).

## 5. File Xử Lý (tổng hợp)

```
JGameApp/
  contexts/
    AuthContext.tsx          # VIẾT LẠI hoàn toàn
    CartContext.tsx          # MỚI
  mocks/
    authUsers.store.ts       # MỚI — localStorage user DB
    loginHistory.store.ts    # MỚI
    accessories.mock.ts      # MỚI
    accessoryOrders.store.ts # MỚI
  shared/services/api/
    TokenManager.ts          # SỬA — bỏ SSO, đổi key vtn_* → jgame_*
  features/
    auth/
      types/auth.types.ts
      services/AuthApiService.ts
      hooks/ (useRegister, useLogin, useForgotPassword, useResetPassword,
              useVerifyEmail, useVerifyPhone)
      pages/ (RegisterPage, LoginPage, ForgotPasswordPage, ResetPasswordPage,
              VerifyEmailPage, VerifyPhonePage)
      index.ts
    account/
      types/account.types.ts
      services/AccountApiService.ts
      hooks/ (useProfile.page, useSecurity.page, useActivityHistory.page.fetchData)
      pages/ (ProfilePage, SecurityPage, ActivityHistoryPage)
      index.ts
    static-pages/
      pages/ (AboutPage, ContactPage, TermsPage, PrivacyPolicyPage)
      hooks/useContactForm.page.ts
      services/ContactApiService.ts
      index.ts
    accessories/
      types/accessory.types.ts
      services/AccessoryApiService.ts
      hooks/ (useAccessoryCatalog, useAccessoryDetail, useCart.page,
              useAccessoryCheckout.page, useAccessoryTracking.page)
      pages/ (AccessoriesCatalogPage, AccessoryDetailPage, CartPage,
              AccessoryCheckoutPage, AccessoryOrderTrackingPage)
      index.ts
    coming-soon/
      pages/AccessoriesComingSoonPage.tsx   # XÓA (thay bằng accessories thật)
  layout/
    StorefrontHeader.tsx      # SỬA — avatar dropdown, icon giỏ hàng
    RequireAuth.tsx           # Không đổi logic, chỉ đổi nguồn useAuth()
  routes/routeConfig.tsx      # SỬA — thêm ~15 route mới, xóa route "phu-kien" cũ trỏ ComingSoon
```

Backoffice AdminApp: `features/jgame/accessories/` + `features/jgame/accessory-orders/` (pattern giống `cards/`, `orders/` đã có) + đăng ký route/menu (`jgame-accessories`, `jgame-accessory-orders`) trong `routeConfig.tsx`/`NavMenuAdmin.tsx`/`NavigationContextAdmin.tsx`.

## 6. Ánh Xạ Fields FE (mock, camelCase)

| Field | Ý nghĩa |
|---|---|
| `id, email, phone, passwordObfuscated, emailVerified, phoneVerified, twoFactorEnabled, twoFactorSecret, name, avatarUrl, dob, createdAt` | User |
| `token, expiresAt` | reset-password / verify-email token |
| `deviceInfo, ipMock, action, createdAt` | LoginHistoryEntry |
| `id, name, category, brand, specs, price, stockQuantity, images, status` | AccessoryProduct (category: `mouse\|keyboard\|headset\|pc\|monitor\|chair`) |
| `cartItems: {productId, quantity}[]` | Cart |
| `id, items, shippingAddress, shippingMethodId, shippingFee, totalAmount, status, trackingCode, createdAt` | AccessoryOrder (status: `PENDING\|PAID\|PACKING\|SHIPPING\|DELIVERED\|CANCELLED\|RETURNED`) |

## 7. Routes (tổng hợp mới thêm)

Customer: `dang-ky, dang-nhap, quen-mat-khau, dat-lai-mat-khau, xac-thuc-email, xac-thuc-so-dien-thoai, ho-so, bao-mat, lich-su-hoat-dong, gioi-thieu, lien-he, dieu-khoan-su-dung, chinh-sach-bao-mat, gio-hang, thanh-toan-phu-kien, don-hang-phu-kien/:orderId` + đổi `phu-kien` từ ComingSoon → `AccessoriesCatalogPage`, thêm `phu-kien/:productId`.
Admin: `jgame/accessories`, `jgame/accessory-orders`.

## 8. Menu

- **Header storefront:** thêm dropdown avatar (thay nút Đăng nhập khi đã login) + icon giỏ hàng (badge số lượng) + link "Giới thiệu" vào nav chính; Footer thêm cột "Giới thiệu/Liên hệ/Điều khoản/Chính sách".
- **AdminApp NavMenu `jgame`:** thêm 2 mục "Sản phẩm phụ kiện", "Đơn hàng phụ kiện".

## 9. Thiết Kế UI
- Auth pages (đăng ký/đăng nhập/quên-đặt lại mật khẩu): card trung tâm màn hình trên nền gradient tối đồng bộ theme hiện có, form đơn giản, link chuyển qua lại giữa Login/Register.
- Profile/Security/Activity: layout 2 cột (menu phụ trái: Hồ sơ/Bảo mật/Lịch sử — giống trang tài khoản thương mại điện tử phổ biến) + nội dung phải.
- Accessories catalog/detail/cart/checkout: tái sử dụng pattern `CardArt`/grid đã có cho catalog thẻ game, thêm ảnh sản phẩm dạng gradient tương tự (không dùng ảnh thật có bản quyền).
- Static pages (Giới thiệu/Liên hệ/Điều khoản): layout đơn giản, tập trung nội dung, nhất quán màu nền tối.

## 10. Checklist
- [ ] Auth hoạt động độc lập, không còn import gì từ SsoApp/TokenManager cũ (`vtn_*` keys)
- [ ] Đăng ký xong tự đăng nhập, dữ liệu tồn tại sau F5 (localStorage)
- [ ] RequireAuth/PaymentQrPage/HistoryPage/ReferrerDashboardPage vẫn chạy đúng sau khi đổi AuthContext (không phá luồng GĐ1 cũ)
- [ ] Giỏ hàng persist qua localStorage, cập nhật badge đúng
- [ ] Đơn phụ kiện có state machine riêng, không đụng vào `orders.store.ts` của thẻ game
- [ ] Toàn bộ API mới qua đúng gate `JGAME_USE_MOCK`
- [ ] `npm run type-check` sạch lỗi mới (baseline cũ ghi nhận riêng)
- [ ] Runtime Playwright: đăng ký → đăng nhập → mua phụ kiện → checkout → tracking chạy hết không lỗi console

---

✅ APPROVED — User xác nhận "approve", bắt đầu GĐ2.
