# Tài liệu giải pháp — Chuyển Admin JGame về JGameApp + Hệ thống Role + Hoàn thiện Đối tác Tiếp thị liên kết

> Ngày: 2026-08-29 | Portal: **JGameApp** (+ dọn dẹp **AdminApp**) | Tiếp nối các tài liệu GĐ1/GĐ2/GĐ3 đã approve

---

## 0. Prompt gốc (nguyên văn)

> "do jgameapp là một website độc lập, do vậy move nhóm chức năng đã làm trong adminapp về lại jgameapp cho đúng. cập nhật lại style cho đúng của jgameapp. tại màn hình đăng nhập của jgameapp, mockdata user cho của khách hàng, chủ store game, quản trị admin, và đối tác tiếp thị liên kết. nếu chưa có nhóm chức năng màn hình cho tiếp thị liên kết thì cũng phải bổ sung cho hoàn thiện"

## 1. Bối cảnh & Lý do

Từ khi JGameApp chuyển sang **auth độc lập** (không qua SSO), việc quản trị JGame Store vẫn còn nằm ở `AdminApp/features/jgame/` (23 file: Danh mục thẻ, NCC, Giao dịch, Đối tác Referral, Khuyến mãi, Báo cáo) — đây là tồn đọng kiến trúc từ trước khi JGame tách độc lập. Vì JGameApp giờ là **website độc lập hoàn toàn** (đăng ký/đăng nhập riêng), khu quản trị của nó cũng phải nằm trong chính JGameApp, không lệ thuộc AdminApp (vốn dùng tài khoản SSO khác hẳn).

Đồng thời, JGameApp hiện có 4 loại người dùng cần phân biệt rõ để test/demo:
| Vai trò | Cách xác định hiện tại | Tình trạng |
|---|---|---|
| Khách hàng | Mặc định mọi tài khoản đăng ký | ✅ Đã có |
| Chủ Cybergame (GĐ2) | Có `CybergameShop.ownerId` gắn với userId | ✅ Đã có (đăng ký qua Chủ Cybergame) |
| Đối tác tiếp thị liên kết (Referrer) | — | ⚠️ **CHƯA HOÀN THIỆN** — chỉ có 1 trang dashboard tĩnh, dữ liệu KHÔNG gắn với user đang đăng nhập, KHÔNG có luồng đăng ký |
| Quản trị (Admin) | — | ❌ **CHƯA CÓ** — chưa có khái niệm role trong `AuthUser`, chưa có khu quản trị trong JGameApp |

## 2. Quyết định thiết kế

| Quyết định | Lý do |
|---|---|
| **Thêm `role: 'customer' \| 'admin'` vào `AuthUser`** (mặc định `customer`) | Admin là role thật sự loại trừ (exclusive) — cần gate cứng. Chủ Cybergame/Đối tác tiếp thị KHÔNG phải role loại trừ (1 khách hàng có thể vừa mua vừa mở gian hàng vừa làm đối tác — giống Shopee) nên xác định bằng "có hồ sơ đăng ký hay chưa" (đã đúng pattern GĐ2), không thêm vào role. |
| **Hoàn thiện Đối tác Tiếp thị liên kết theo đúng pattern Chủ Cybergame (GĐ2)** | Thêm trang **Đăng ký làm Đối tác** (`doi-tac/dang-ky`), gắn `AffiliatePartner` với `userId` thật (thay vì mock tĩnh `MOCK_REFERRER_SUMMARY` không đổi theo ai đăng nhập), thêm `RequireAffiliate` guard — nhất quán với `RequireShopOwner` đã làm ở GĐ2. |
| **Khu quản trị mới `features/admin/` trong JGameApp, route `/quan-tri/*`, guard `RequireAdmin`** | Tách bạch hoàn toàn khỏi trải nghiệm mua hàng/Chủ Cybergame, giống cách `ShopOwnerLayout` đã tách khỏi storefront — dùng chung mô hình sidebar layout, không dựng lại từ đầu. |
| **Giữ nguyên tên file/class đã có (`CardsPageAdmin`, `JGameApiServiceAdmin`...), chỉ đổi vị trí + import path + giao diện** | Đổi tên toàn bộ 23 file sẽ tăng rủi ro sai sót mà không có yêu cầu rõ ràng nào đòi đổi tên (nguyên tắc "không đổi tên file cũ khi không có yêu cầu"). "Admin" ở đây vẫn mang đúng nghĩa "quản trị JGame", chỉ khác portal chứa nó. |
| **Bỏ Dialog modal, chuyển toàn bộ form CRUD (thẻ/NCC/đối tác/khuyến mãi) sang inline-form-panel** | JGameApp không có component `Dialog` trong `shared/components/ui` (đã xoá vì không dùng — theo dọn dẹp GĐ3). Dựng lại 1 Dialog primitive tốn công không cần thiết khi đã có sẵn pattern inline-form (giống `ShopZonesTicketsPage` GĐ2 vừa được duyệt) — tái dùng pattern đã có, giữ code nhất quán trong cùng portal. |
| **Bỏ `ConfirmDialog` khi xoá — xoá trực tiếp qua nút xoá** | Đúng pattern đã dùng ở `ShopZonesTicketsPage` (xoá zone/vé không có bước xác nhận) — nhất quán trong JGameApp, không cần dựng lại `ConfirmDialog`. |
| **4 tài khoản demo cố định, seed sẵn khi tải trang lần đầu (giống cơ chế seed gian hàng mock GĐ2)** | Test/demo cần đăng nhập ngay không phải tự đăng ký + tự đăng ký gian hàng/đối tác từng bước. Hiển thị ngay trên màn hình Đăng nhập dạng "Tài khoản demo" để bấm dùng nhanh. |
| **Seed tài khoản "Chủ Cybergame" trùng `userId` với `ownerId='demo-shop-owner-1'` đã có sẵn (Alpha Cyber Center)** | Tận dụng dữ liệu gian hàng mock GĐ2 đã có sẵn, không cần tạo thêm dữ liệu song song. |
| **Xoá hoàn toàn `AdminApp/features/jgame/`** + dọn `TopMenuAdmin`, `NavMenuAdmin`, `NavigationContextAdmin`, `routeConfig.tsx` của AdminApp | Đúng yêu cầu "move" — không để lại code chết / menu trỏ vào route không tồn tại. |

## 3. Danh sách màn hình mới/thay đổi

### 3.1. Khu Quản trị JGame (`features/admin/`, route `/quan-tri/*`, cần `role=admin`)

| Mã | Trang | Nguồn (từ AdminApp) |
|---|---|---|
| SC-ADM-01 | Danh mục thẻ & mệnh giá | `cards/pages/CardsPageAdmin.tsx` |
| SC-ADM-02 | Nhà cung cấp | `suppliers/pages/SuppliersPageAdmin.tsx` |
| SC-ADM-03 | Giao dịch (xử lý thủ công hoàn tiền/cấp lại mã) | `orders/pages/OrdersPageAdmin.tsx` |
| SC-ADM-04 | Đối tác Referral (quản trị TOÀN BỘ đối tác — khác với dashboard của 1 đối tác) | `referral/pages/ReferralPartnersPageAdmin.tsx` |
| SC-ADM-05 | Khuyến mãi/voucher | `promotions/pages/PromotionsPageAdmin.tsx` |
| SC-ADM-06 | Báo cáo doanh thu & đối soát | `reports/pages/JGameReportsPageAdmin.tsx` |

Layout: `AdminLayout` (sidebar riêng, cùng phong cách dashboard tối như `ShopOwnerLayout`, có nhãn "Quản trị JGame" ở đầu sidebar để phân biệt).

### 3.2. Hoàn thiện Đối tác Tiếp thị liên kết (`features/referrer/`)

| Mã | Trang | Mô tả |
|---|---|---|
| SC-REF-01 (mới) | Đăng ký làm Đối tác (`doi-tac/dang-ky`) | Form đăng ký (tên hiển thị, kênh quảng bá) → tạo `AffiliatePartner` gắn `userId`, sinh `referralCode` + `shareUrl` |
| SC-REF-02 (nâng cấp) | Dashboard Đối tác (`doi-tac`) | Như cũ nhưng dữ liệu lấy đúng theo `userId` đăng nhập (không còn mock tĩnh); chưa đăng ký → `RequireAffiliate` chuyển sang SC-REF-01 |

### 3.3. Màn hình Đăng nhập — Tài khoản demo

Thêm khối "Tài khoản demo" bên dưới form đăng nhập (hoặc panel bên cạnh trên desktop), liệt kê 4 tài khoản + nút "Dùng tài khoản này" tự điền form:

| Vai trò | Định danh | Mật khẩu |
|---|---|---|
| Khách hàng | `khachhang@jgame.vn` | `Demo@123` |
| Chủ Cybergame (Alpha Cyber Center) | `chugianhang@jgame.vn` | `Demo@123` |
| Đối tác tiếp thị liên kết | `doitac@jgame.vn` | `Demo@123` |
| Quản trị viên | `admin@jgame.vn` | `Demo@123` |

## 4. Dữ liệu & API

- `features/admin/types/admin.types.ts`, `services/JGameApiServiceAdmin.ts`, `services/jgame.mockdata.ts`, `services/mockGate.ts` (hoặc dùng chung `shared/services/api/mockGate.ts` của JGameApp — hợp nhất, bỏ file mockGate riêng trùng lặp) — **chuyển nguyên vẹn logic**, chỉ đổi import `apiCall` từ `shared/services/api` của JGameApp.
- `mocks/affiliatePartners.store.ts` (MỚI): `registerAffiliate(userId, payload)`, `getAffiliateByUserId(userId)`, `listTransactionsByUserId(userId)` — thay thế `mocks/referral.mock.ts` tĩnh.
- `mocks/authUsers.store.ts` (SỬA): thêm field `role` vào `StoredUser`/`AuthUser`; thêm `seedDemoAccountsIfNeeded()` chạy 1 lần lúc module load (giống cơ chế mock GĐ2), tạo đúng 4 tài khoản demo cố định `id` để liên kết sẵn với `shop-alpha` (chủ Cybergame) và 1 `AffiliatePartner` mẫu (đối tác).
- `layout/RequireAdmin.tsx` (MỚI), `layout/RequireAffiliate.tsx` (MỚI) — cùng mẫu `RequireShopOwner`.

## 5. File xử lý chính

```
JGameApp/
  mocks/
    authUsers.store.ts          # SỬA — thêm role + seedDemoAccounts
    affiliatePartners.store.ts  # MỚI
  features/
    auth/types/auth.types.ts    # SỬA — AuthUser thêm role
    auth/pages/LoginPage.tsx    # SỬA — thêm khối Tài khoản demo
    referrer/
      types/referrer.types.ts       # SỬA — thêm AffiliatePartner, RegisterAffiliatePayload
      services/ReferrerApiService.ts # SỬA — gắn theo userId, thêm registerAffiliate
      hooks/ (useMyAffiliate MỚI, useAffiliateRegister.page MỚI, useReferrerDashboard SỬA)
      pages/ (AffiliateRegisterPage MỚI, ReferrerDashboardPage SỬA)
    admin/                        # MỚI — toàn bộ chuyển từ AdminApp/features/jgame, restyle dark theme
      types/jgame.types.ts
      services/JGameApiServiceAdmin.ts, jgame.mockdata.ts
      components/AdminLayout.tsx
      cards/ suppliers/ orders/ referral/ promotions/ reports/   (giữ cấu trúc con y hệt, restyle JSX)
  layout/
    RequireAdmin.tsx             # MỚI
    RequireAffiliate.tsx         # MỚI
    StorefrontHeader.tsx         # SỬA — thêm mục "Quản trị hệ thống" (chỉ hiện nếu role=admin), "Trở thành đối tác"/"Kênh đối tác"
  routes/routeConfig.tsx         # SỬA — thêm route /quan-tri/*, /doi-tac/dang-ky; requireAdmin/requireAffiliate flags
  StorefrontLayout.tsx            # SỬA — wrapRoute thêm nhánh requireAdmin/requireAffiliate

AdminApp/
  features/jgame/                # XOÁ toàn bộ (23 file)
  layout/TopMenuAdmin.tsx         # SỬA — xoá entry 'jgame'
  layout/NavMenuAdmin.tsx         # SỬA — xoá nhóm 'jgame'
  contexts/NavigationContextAdmin.tsx  # SỬA — xoá pageIdToPath/defaultPages/topMenuNavMenus/getMainMenuFromPath nhánh jgame
  routes/routeConfig.tsx          # SỬA — xoá 6 lazy import + 6 route jgame/*
```

## 6. Routes mới trong JGameApp

- `quan-tri` (Danh mục thẻ, mặc định) · `quan-tri/nha-cung-cap` · `quan-tri/giao-dich` · `quan-tri/doi-tac-referral` · `quan-tri/khuyen-mai` · `quan-tri/bao-cao` — tất cả `requireAuth + requireAdmin`
- `doi-tac/dang-ky` — `requireAuth`
- `doi-tac` (đã có, thêm `requireAffiliate`)

## 7. Checklist
- [ ] Đăng nhập bằng cả 4 tài khoản demo → vào đúng khu vực tương ứng, dữ liệu hiển thị đúng người
- [ ] Khách hàng thường KHÔNG vào được `/quan-tri` (redirect) và thấy CTA "Trở thành đối tác" ở `/doi-tac`
- [ ] Toàn bộ trang quản trị hiển thị đúng theme tối JGame (không còn nền trắng/Card kiểu AdminApp)
- [ ] CRUD Thẻ/NCC/Đối tác/Khuyến mãi hoạt động đúng qua inline-form-panel (thêm/sửa/xoá)
- [ ] AdminApp: mục "JGame" đã biến mất khỏi TopMenu, không còn route `/admin/jgame/*` nào truy cập được
- [ ] `npm run type-check` sạch lỗi mới, Playwright toàn luồng 4 vai trò không lỗi console/page

---
