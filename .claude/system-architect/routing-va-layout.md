# Routing & Layout

> File lõi: `routes/routeConfig.tsx` (toàn bộ route trong 1 file), `layout/StorefrontLayout.tsx`, `layout/JGamePortal.tsx`.
> Mount gốc: `src/App.tsx` — `<Route path='/jgame/*' element={<JGamePortal/>}/>` (pattern giống `JpayApp`), toàn bộ path trong `routeConfig.tsx` **không** có prefix `/jgame`.

## Cấu trúc `JGameRoute`

```ts
export interface JGameRoute {
  path: string
  element: ReactElement
  pageId: string
  requireAuth?: boolean        // bọc RequireAuth
  guestOnly?: boolean          // bọc GuestOnly (chỉ Guest được vào)
  requireShopOwner?: boolean   // bọc RequireShopOwner (sau RequireAuth)
  requireAffiliate?: boolean   // bọc RequireAffiliate (sau RequireAuth)
  requireAdmin?: boolean       // bọc RequireAdmin (sau RequireAuth)
}
```

Toàn bộ 47 route khai báo dạng mảng phẳng `routeConfig: JGameRoute[]` — `StorefrontLayout.tsx` (hoặc layout tương ứng) đọc cờ và wrap `element` vào đúng cây guard lồng nhau tại thời điểm render, không lặp lại logic guard ở từng page.

## Bảng route đầy đủ theo nhóm (chính xác theo code, thay thế mục 17 URD khi có mâu thuẫn)

### Public — không cần đăng nhập

| Path | Trang | Ghi chú |
|---|---|---|
| `` (`/jgame`) | HomePage | Trang hub tổng hợp 3 phân hệ |
| `nap-the` | CatalogPage | Trước là trang chủ, đã tách riêng |
| `the/:productId` | CardDetailPage | |
| `xac-nhan-don-hang` | OrderConfirmPage | Xem được không cần đăng nhập, chặn khi bấm Thanh toán |
| `dang-nhap`, `dang-ky`, `quen-mat-khau` | Auth pages | `guestOnly: true` |
| `dat-lai-mat-khau`, `xac-thuc-email` | Auth pages | Public (có token ở query) |
| `gioi-thieu`, `lien-he`, `dieu-khoan-su-dung`, `chinh-sach-bao-mat` | Static/CMS | |
| `phu-kien`, `phu-kien/:productId`, `gio-hang` | Accessories catalog/cart | |
| `cho-ve`, `cho-ve/gian-hang/:shopId` | Playtime marketplace | |
| `kiem-tien`, `kiem-tien/:taskId` | Tasks marketplace | |

### Account/User — cần đăng nhập (`requireAuth: true`)

| Path | Trang |
|---|---|
| `thanh-toan/:orderId`, `ket-qua/:orderId`, `lich-su` | Đơn thẻ game |
| `xac-thuc-so-dien-thoai` | Xác minh SĐT |
| `tai-khoan`, `ho-so`, `bao-mat`, `lich-su-hoat-dong` | Tài khoản |
| `thanh-toan-phu-kien`, `don-hang-phu-kien/:orderId` | Đơn phụ kiện |
| `cho-ve/xac-nhan-dat-ve`, `cho-ve/thanh-toan/:orderId`, `cho-ve/ket-qua/:orderId` | Đơn vé giờ chơi |
| `kiem-tien/nhiem-vu-cua-toi`, `kiem-tien/vi-jcoin` | Nhiệm vụ & ví JCoin |
| `doi-tac/dang-ky` | Đăng ký đối tác (chỉ `requireAuth`, không `requireAffiliate`) |

### Account/Partner — `requireAuth + requireAffiliate`

| Path | Trang |
|---|---|
| `doi-tac` | ReferrerDashboardPage |

### Account/ShopOwner — `requireAuth + requireShopOwner` (trừ trang đăng ký chỉ `requireAuth`)

| Path | Trang |
|---|---|
| `chu-cybergame/dang-ky` | ShopRegisterPage |
| `chu-cybergame` | ShopDashboardPage |
| `chu-cybergame/zone-ve` | ShopZonesTicketsPage |
| `chu-cybergame/dong-bo` | ShopSyncPage |
| `chu-cybergame/don-hang` | ShopOrdersPage |
| `chu-cybergame/cong-no` | ShopPayoutsPage |

### Account/Admin — `requireAuth + requireAdmin`

| Path | Trang |
|---|---|
| `quan-tri` | AdminDashboardPage |
| `quan-tri/danh-muc-the` | AdminCardsPage |
| `quan-tri/phu-kien` | AdminAccessoriesPage |
| `quan-tri/nha-cung-cap` | AdminSuppliersPage |
| `quan-tri/giao-dich` | AdminOrdersPage |
| `quan-tri/doi-tac-referral` | AdminReferralPartnersPage |
| `quan-tri/khuyen-mai` | AdminPromotionsPage |
| `quan-tri/bao-cao` | AdminReportsPage |

## Điều hướng sau đăng nhập theo vai trò (`useLogin.page.ts`)

```
có returnTo (bị chặn giữa luồng)  → quay lại đúng bước đó
role === 'admin'                  → /jgame/quan-tri
có gian hàng (getMyShop())        → /jgame/chu-cybergame
là đối tác (getMyAffiliateStatus) → /jgame/doi-tac
mặc định                          → /jgame/tai-khoan
```

## Tất cả `element` dùng `lazy()`

Toàn bộ ~40 component trang trong `routeConfig.tsx` import qua `lazy(() => import(...))` — bọc trong `<ErrorBoundary><Suspense fallback={<PageLoader/>}>...` ở `App.tsx` cấp portal, giữ bundle nhỏ theo route.

## Header/Navigation — 5 khung điều hướng độc lập, không dùng chung

- `StorefrontHeader.tsx` — header DUY NHẤT cho toàn bộ JGameApp (bọc mọi route qua `StorefrontLayout`, kể cả các khu Account/Admin/ShopOwner/Partner) — nav Trang chủ/Nạp thẻ/Chợ vé/Phụ kiện/Kiếm tiền, icon giỏ hàng, dropdown avatar khi đã đăng nhập. Dropdown avatar theo NGỮ CẢNH TÀI KHOẢN (`AccountRole` trong chính file, ưu tiên đúng như điều hướng sau đăng nhập ở `useLogin.page.ts`: admin > Chủ Cybergame > đối tác > khách hàng) — chỉ 1 mục "trang chủ" (`PRIMARY_ENTRY`) khớp vai trò cao nhất của tài khoản, các mục mua sắm của khách hàng thường (Đơn hàng của tôi/Nhiệm vụ của tôi) CHỈ hiện khi vai trò cao nhất là khách hàng thường; Hồ sơ cá nhân/Bảo mật/Lịch sử hoạt động/Đăng xuất hiện cho mọi vai trò.
- 4 layout sidebar riêng cho Account/{User,Admin,ShopOwner,Partner} — xem [00-tong-quan-kien-truc.md](00-tong-quan-kien-truc.md#nguyên-tắc-độc-lập-không-dùng-chung--chỉ-áp-dụng-cho-layout-navmenu-sidebar).

JGameApp **không** dùng NavMenu/TopMenu chuẩn 9-portal của workspace (đây là site độc lập, không nằm trong sơ đồ chuẩn `PAGE_TO_TOP_MENU`).
