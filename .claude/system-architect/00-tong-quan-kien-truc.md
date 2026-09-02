# JGameApp — Tổng quan kiến trúc

> Portal: `src/modules/JGameApp/`, mount tại `/jgame/*` trong `src/App.tsx`. Đây là module duy nhất của Website — hiện `src/modules/` không còn portal nào khác, 1 repo duy nhất (không phải kiến trúc đa-repo).
>
> **Đây là module frontend thuần tuý.** Chưa có backend thật (`Backend/` chưa có commit nào liên quan JGame). Toàn bộ business logic hiện chạy qua lớp mock — xem [mock-gate-va-api.md](mock-gate-va-api.md).

## Đặc điểm kiến trúc

JGameApp **không** dùng SSO chung nền tảng, **không** dùng NavMenu/TopMenu kiểu nhiều-portal, và **không** theo cấu trúc thư mục phẳng `pages/dialogs/components/hooks/services`. Đây là 1 website thương mại điện tử độc lập, có tầng public (không cần đăng nhập) và tầng account riêng cho 4 nhóm người dùng khác nhau.

## Cấu trúc thư mục

```
JGameApp/
├── Docs/
│   ├── Tai-lieu-goc/URD-xGame-tai-lieu-yeu-cau-nguoi-dung.md   # URD — đọc mục 0.2 để biết phần lỗi thời
│   └── Nang-cap/                                                # nhật ký từng đợt thiết kế+triển khai (nguồn xác nhận chính)
├── assets/                        # card-logos, banner mock, ảnh nhiệm vụ...
├── contexts/
│   ├── AuthContext.tsx            # phiên đăng nhập ĐỘC LẬP (không qua SSO) — login/register/logout/refreshUser
│   └── CartContext.tsx            # giỏ hàng phụ kiện, persist localStorage (jgame_cart)
├── layout/
│   ├── JGamePortal.tsx             # shell gốc: AuthProvider + StorefrontLayout + <Routes>
│   ├── StorefrontLayout.tsx        # header + <Outlet/> + footer (trang Public)
│   ├── StorefrontHeader.tsx / StorefrontFooter.tsx
│   ├── RequireAuth.tsx / GuestOnly.tsx
│   ├── RequireAdmin.tsx / RequireShopOwner.tsx / RequireAffiliate.tsx
├── mocks/                          # 13 file *.store.ts / *.mock.ts — toàn bộ dữ liệu giả của app, xem mock-gate-va-api.md
├── routes/routeConfig.tsx          # TOÀN BỘ route khai báo trong 1 file duy nhất (không rải rác)
├── shared/
│   ├── services/api/               # ApiClient/ApiHelpers/ApiConfig/TokenManager/mockGate/types
│   ├── components/ui/              # tối thiểu: button, card, badge, input, tabs, select, separator (copy rút gọn từ JpayApp — KHÔNG có Dialog)
│   ├── hooks/, utils/
└── features/
    ├── Public/          # xem được KHÔNG cần đăng nhập
    │   ├── home/ catalog/ auth/ static-pages/
    │   └── playtime/ accessories/ tasks/    # domain bị "tách theo trang" — xem mục dưới
    └── Account/
        ├── User/         # hành trình giao dịch/quản lý tài khoản của khách hàng thường
        ├── Admin/         # quản trị JGame (role=admin)
        ├── ShopOwner/     # Kênh Người Bán (Chủ Cybergame — Chợ vé GĐ2)
        └── Partner/       # Đối tác tiếp thị liên kết (Referrer/CTV)
```

## Nguyên tắc phân vùng `features/Public` vs `features/Account`

> Nguồn: `Docs/Nang-cap/nc-jgame-tai-khoan-navmenu-2026-08-29.md` (✅ APPROVED) — tái cấu trúc lớn nhất từng làm trên module này (~110-130 file di chuyển).

- **Public**: trang xem được khi chưa đăng nhập — duyệt sản phẩm/gian hàng/nhiệm vụ, trang tĩnh, xác thực tài khoản.
- **Account/User**: trang thuộc "hành trình giao dịch/quản lý tài khoản" của khách hàng thường — xác nhận đơn/thanh toán/kết quả, giỏ hàng checkout, hồ sơ, bảo mật, lịch sử, nhiệm vụ đã đăng ký, ví JCoin. **Phân loại theo mục đích**, không thuần theo cờ `requireAuth` — 1 số trang xác nhận cho xem trước, chỉ chặn khi bấm submit, vẫn xếp vào Account/User vì bản chất là bước hoàn tất giao dịch cá nhân.
- **Account/Admin, Account/ShopOwner, Account/Partner**: toàn bộ nội dung riêng của từng nhóm tài khoản.

### 4 domain bị "tách theo trang" giữa Public và Account/User

`playtime`, `accessories`, `order`, `tasks` có cả trang public (duyệt/xem trước) lẫn trang cần đăng nhập (xác nhận/thanh toán/theo dõi) — các trang được đặt đúng vùng theo mục đích, nhưng **được phép import chéo** `types`/`services` cùng domain giữa 2 vùng (không nhân bản business logic, tránh sai lệch dữ liệu 2 nơi). VD: `Account/User/order/pages/OrderConfirmPage.tsx` import type `CardProduct` từ `Public/catalog/types/`.

## Nguyên tắc "độc lập, không dùng chung" — CHỈ áp dụng cho Layout (NavMenu sidebar)

Mỗi 1 trong 4 nhóm tài khoản (User/Admin/ShopOwner/Partner) có **1 file layout NavMenu sidebar riêng, độc lập hoàn toàn về code UI** — không có 1 component layout dùng chung cho nhiều nhóm, chấp nhận trùng lặp JSX/style:

| File | Nhóm | Đặc điểm |
|---|---|---|
| `Account/User/account/components/CustomerLayout.tsx` | Khách hàng | Tổng quan · Hồ sơ · Bảo mật · Lịch sử hoạt động · Đơn hàng của tôi · Nhiệm vụ · Ví JCoin · CTA đăng ký ShopOwner/Partner nếu chưa có |
| `Account/Admin/components/AdminLayout.tsx` | Admin | Nhãn "Quản trị JGame" đầu sidebar |
| `Account/ShopOwner/components/ShopOwnerLayout.tsx` | Chủ Cybergame | Sidebar dashboard tối, tách hẳn header storefront công khai |
| `Account/Partner/components/PartnerLayout.tsx` | Đối tác tiếp thị | Icon Megaphone, hiện mã giới thiệu |

**Lý do:** sửa 1 nhóm không được phép ảnh hưởng 3 nhóm còn lại — ưu tiên dễ maintain độc lập hơn là tránh trùng lặp code UI. Nguyên tắc này **không** áp dụng cho `mocks/` (tầng data mock dùng chung toàn app, giữ nguyên vị trí `src/modules/JGameApp/mocks/`, không tách theo Public/Account) và **không** áp dụng cho types/services/hooks nghiệp vụ bị cross-import giữa Public/Account của cùng 1 domain (mục trên).

## Tài liệu liên quan

- [routing-va-layout.md](routing-va-layout.md) — toàn bộ route thực tế + cơ chế guard.
- [mock-gate-va-api.md](mock-gate-va-api.md) — cơ chế mock, cách chuyển sang backend thật.
- [auth-va-phan-quyen.md](auth-va-phan-quyen.md) — hệ thống tài khoản độc lập + mô hình role.
- [du-lieu-mock-va-state.md](du-lieu-mock-va-state.md) — pattern các mock store, in-memory vs localStorage.
- Nghiệp vụ chi tiết từng phân hệ: `Website/.claude/business-rules/`.
