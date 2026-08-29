/**
 * Types cho hệ thống tài khoản độc lập JGame (không qua SSO).
 */

export type UserRole = 'customer' | 'admin'

export interface AuthUser {
  id: string
  email: string
  phone: string
  name: string
  avatarUrl?: string
  dob?: string
  /** Vai trò hệ thống — chỉ 'admin' là loại trừ, cần gate cứng (RequireAdmin).
   * Chủ gian hàng/Đối tác tiếp thị liên kết KHÔNG phải role riêng — xác định qua
   * việc đã có hồ sơ đăng ký (CybergameShop/AffiliatePartner) hay chưa. */
  role: UserRole
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
  createdAt: string
}

export interface RegisterPayload {
  email: string
  phone: string
  password: string
  agreedTerms: boolean
}

export interface LoginPayload {
  /** Email hoặc số điện thoại */
  identifier: string
  password: string
  rememberMe?: boolean
}

export interface LoginResult {
  accessToken?: string
  refreshToken?: string
  user?: AuthUser
  /** true khi tài khoản đã bật 2FA — cần gọi verify2FA trước khi coi là đăng nhập xong */
  requires2FA?: boolean
  /** Token tạm dùng để xác nhận 2FA (mock) */
  pendingToken?: string
}

export interface ForgotPasswordPayload {
  identifier: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

export interface Verify2FAPayload {
  pendingToken: string
  code: string
}

export type LoginActivityAction =
  | 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'CHANGE_PASSWORD' | 'RESET_PASSWORD'
  | 'ENABLE_2FA' | 'DISABLE_2FA' | 'VERIFY_EMAIL' | 'VERIFY_PHONE' | 'UPDATE_PROFILE'

export interface LoginHistoryEntry {
  id: string
  userId: string
  action: LoginActivityAction
  deviceInfo: string
  ipMock: string
  createdAt: string
}
