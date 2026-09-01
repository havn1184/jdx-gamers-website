/**
 * Tài khoản demo JGame — khớp đúng 4 user đã seed sẵn trong `JGameApi` (Backend), dùng cho UI
 * "Tài khoản demo" ở trang đăng nhập. Không phải mock data (không giả lập gì) — chỉ là hằng số
 * UI trỏ đến tài khoản thật đã tồn tại trên backend.
 */
export const DEMO_ACCOUNT_PASSWORD = (import.meta.env?.VITE_JGAME_DEMO_PASSWORD as string | undefined) ?? ''

export const DEMO_ACCOUNTS = {
  customer: { id: 'demo-customer-1', email: 'khachhang@jgame.vn', phone: '0900000001', name: 'Khách hàng Demo' },
  shopOwner: { id: 'demo-shop-owner-1', email: 'chugianhang@jgame.vn', phone: '0900000002', name: 'Chủ gian hàng Demo' },
  affiliate: { id: 'demo-affiliate-1', email: 'doitac@jgame.vn', phone: '0900000003', name: 'Đối tác Demo' },
  admin: { id: 'demo-admin-1', email: 'admin@jgame.vn', phone: '0900000004', name: 'Quản trị viên Demo' },
} as const
