# Hệ thống xác thực & phân quyền

> File lõi: `contexts/AuthContext.tsx`, `shared/services/api/TokenManager.ts`, `mocks/authUsers.store.ts`, `mocks/loginHistory.store.ts`, `layout/Require*.tsx`.
> Nghiệp vụ chi tiết (luồng đăng ký/đăng nhập/2FA...): `Website/.claude/business-rules/auth-tai-khoan.md`. Tài liệu này tập trung vào **kiến trúc kỹ thuật**.

## Độc lập hoàn toàn khỏi SSO chung nền tảng

`TokenManager.ts` trong JGameApp **đã bỏ hết** phần gọi SSO (`SSO_BASE_URL`, refresh-token thật) — đổi toàn bộ key lưu trữ từ `vtn_*` (chuẩn chung workspace) sang `jgame_*`. `refreshAccessToken` chỉ mô phỏng gia hạn token nội bộ, không gọi network thật. Đây là quyết định **chủ động đảo ngược** so với thiết kế GĐ1 ban đầu (vốn định kế thừa SSO) — lý do: JGame cần là website public độc lập, có luồng đăng ký/đăng nhập/quên mật khẩu/2FA riêng, không phù hợp gắn vào hệ tài khoản nội bộ SSO của các portal quản trị khác.

## `AuthContext`

Không chỉ giữ access token đơn thuần — có state `user: AuthUser | null` đầy đủ profile, cung cấp `login/register/logout/refreshUser`. Toàn bộ `RequireAuth`/`PaymentQrPage`/`HistoryPage`/`ReferrerDashboardPage`... chỉ gọi `useAuth()`, không quan tâm nguồn dữ liệu bên dưới — khi đổi cơ chế xác thực (SSO → độc lập) không cần sửa các trang tiêu thụ.

## Lưu trữ mock

| Store | Nơi lưu | Vì sao |
|---|---|---|
| `mocks/authUsers.store.ts` (`jgame_auth_users_db`) | `localStorage` | Tài khoản đăng ký phải tồn tại sau F5 — trải nghiệm demo hợp lý hơn in-memory |
| `mocks/loginHistory.store.ts` | `localStorage`, theo `userId` | Cùng lý do — lịch sử phải persist qua reload để xem lại được |

⚠️ Mật khẩu trong `authUsers.store.ts` chỉ **obfuscate bằng base64** — không phải hash bảo mật thật. Xem chi tiết cảnh báo trong `business-rules/auth-tai-khoan.md`.

## Mô hình role — `AuthUser.role: 'customer' | 'admin'`

```ts
export type UserRole = 'customer' | 'admin'

export interface AuthUser {
  id: string
  email: string
  phone: string
  name: string
  role: UserRole          // chỉ 'admin' là loại trừ, cần gate cứng (RequireAdmin)
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
  // ...
}
```

**Chủ Cybergame và Đối tác tiếp thị KHÔNG phải field role riêng** — xác định qua việc đã có bản ghi đăng ký hay chưa (`CybergameShop.ownerId`, `AffiliatePartner.userId`). Quyết định thiết kế: role chỉ dùng cho vai trò thật sự loại trừ; 2 "hồ sơ" kia không loại trừ (1 tài khoản có thể vừa mua vừa bán vừa làm đối tác), nên không hợp lý nếu ép vào cùng 1 field role.

## 5 route guard trong `layout/`

Tất cả cùng 1 mẫu: đọc state từ hook/context tương ứng, `loading` → `<PageLoader/>`, điều kiện không đạt → `<Navigate replace/>`.

```tsx
// RequireAdmin.tsx — mẫu tham chiếu cho các guard còn lại
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user || user.role !== 'admin') return <Navigate to='/jgame' replace />
  return <>{children}</>
}
```

| Guard | Nguồn state | Điều kiện chặn |
|---|---|---|
| `RequireAuth` | `useAuth()` | Chưa đăng nhập |
| `GuestOnly` | `useAuth()` | Đã đăng nhập (dùng cho trang đăng nhập/đăng ký) |
| `RequireAdmin` | `useAuth()` | `user.role !== 'admin'` |
| `RequireShopOwner` | `useMyShop()` (gọi `ShopOwnerApiService.getMyShop()`) | Chưa có `CybergameShop` |
| `RequireAffiliate` | `useMyAffiliate()` (gọi `ReferrerApiService.getMyAffiliateStatus()`) | Chưa có `AffiliatePartner` |

Guard được áp trong `routeConfig.tsx` qua các cờ `requireAuth`/`guestOnly`/`requireShopOwner`/`requireAffiliate`/`requireAdmin` trên từng route (xem [routing-va-layout.md](routing-va-layout.md)) — nơi wrap route thành cây guard lồng nhau là `StorefrontLayout.tsx`.

## Đây là phân quyền theo ROUTE, không phải theo ACTION

Guard hiện tại chỉ chặn ở tầng route (vào được trang hay không), **không có** mô hình permission chi tiết theo từng hành động (VD: "được sửa nhưng không được xoá") như một số module InvoiceEasy khác. Nếu sau này cần permission-based, đây là điểm cần thiết kế lại khi có backend thật — hiện `user.role !== 'admin'` là toàn bộ logic phân quyền.
