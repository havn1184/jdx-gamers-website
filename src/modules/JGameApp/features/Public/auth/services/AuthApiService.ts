/**
 * AuthApiService — Đăng ký/đăng nhập/quên-đặt lại mật khẩu/xác minh (URD mục 2 — tài liệu độc lập hoá).
 */
import { apiCall, buildJGameUrl, type ApiResponse } from '../../../../shared/services/api'
import type {
  AuthUser, RegisterPayload, LoginPayload, LoginResult, ForgotPasswordPayload,
  ResetPasswordPayload, ChangePasswordPayload, Verify2FAPayload,
} from '../types/auth.types'

/** Mã xác nhận demo dùng ở FE cho luồng xác nhận 2FA cục bộ (useSecurity.page.ts) — không liên quan mockdata API. */
export const MOCK_2FA_DEMO_CODE = '123456'

/**
 * BE serialize enum `Role` dạng số nguyên (Customer=0, Admin=1) — Program.cs cố tình KHÔNG thêm
 * JsonStringEnumConverter. Website lại định nghĩa `AuthUser.role: 'customer' | 'admin'` (string) vì
 * trước đây chỉ có mock cục bộ. Chuẩn hoá ngay tại tầng service (nhánh gọi API thật) để phần còn lại
 * của Website (so sánh `role === 'admin'`) không phải đổi gì.
 */
export function normalizeAuthUserRole<T extends { role: unknown } | undefined | null>(user: T): T {
  if (!user) return user
  const raw = (user as { role: unknown }).role
  if (typeof raw === 'number') {
    return { ...user, role: raw === 1 ? 'admin' : 'customer' }
  }
  return user
}

/**
 * Cùng lý do trên: BE serialize `LoginActivityAction` dạng số nguyên (thứ tự trùng khớp union string
 * của Website theo đúng index 0-9 — xem `AuthEnums.cs`). Chuẩn hoá tại tầng service.
 */
const LOGIN_ACTIVITY_ACTIONS = [
  'LOGIN', 'LOGOUT', 'REGISTER', 'CHANGE_PASSWORD', 'RESET_PASSWORD',
  'ENABLE_2FA', 'DISABLE_2FA', 'VERIFY_EMAIL', 'VERIFY_PHONE', 'UPDATE_PROFILE',
] as const

export function normalizeLoginHistoryAction<T extends { action: unknown }>(entry: T): T {
  const raw = (entry as { action: unknown }).action
  if (typeof raw === 'number' && LOGIN_ACTIVITY_ACTIONS[raw]) {
    return { ...entry, action: LOGIN_ACTIVITY_ACTIONS[raw] }
  }
  return entry
}

export class AuthApiService {
  private static readonly BASE_PATH = '/api/auth'

  static async register(payload: RegisterPayload): Promise<ApiResponse<LoginResult>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/register`), { method: 'POST', body: JSON.stringify(payload) })
    const json = await response.json()
    if (json.data) json.data.user = normalizeAuthUserRole(json.data.user)
    return json
  }

  static async login(payload: LoginPayload): Promise<ApiResponse<LoginResult>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/login`), { method: 'POST', body: JSON.stringify(payload) })
    const json = await response.json()
    if (json.data) json.data.user = normalizeAuthUserRole(json.data.user)
    return json
  }

  static async verify2FA(payload: Verify2FAPayload): Promise<ApiResponse<LoginResult>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/verify-2fa`), { method: 'POST', body: JSON.stringify(payload) })
    const json = await response.json()
    if (json.data) json.data.user = normalizeAuthUserRole(json.data.user)
    return json
  }

  static async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse<boolean>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/forgot-password`), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<boolean>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/reset-password`), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async sendEmailVerification(): Promise<ApiResponse<boolean>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/send-email-verification`), { method: 'POST' })
    return response.json()
  }

  static async verifyEmail(token: string): Promise<ApiResponse<boolean>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/verify-email`), { method: 'POST', body: JSON.stringify({ token }) })
    return response.json()
  }

  static async sendPhoneOtp(): Promise<ApiResponse<boolean>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/send-phone-otp`), { method: 'POST' })
    return response.json()
  }

  static async verifyPhoneOtp(otp: string): Promise<ApiResponse<boolean>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/verify-phone-otp`), { method: 'POST', body: JSON.stringify({ otp }) })
    return response.json()
  }

  static async changePassword(payload: ChangePasswordPayload): Promise<ApiResponse<boolean>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/change-password`), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async enable2FA(): Promise<ApiResponse<{ secret: string }>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/enable-2fa`), { method: 'POST' })
    return response.json()
  }

  static async disable2FA(): Promise<ApiResponse<boolean>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/disable-2fa`), { method: 'POST' })
    return response.json()
  }

  static async getCurrentUser(): Promise<ApiResponse<AuthUser>> {
    // BE chỉ có 1 path duy nhất lấy current user: /api/account/profile (không có /api/auth/me).
    const response = await apiCall(buildJGameUrl('/api/account/profile'), { method: 'GET' })
    const json = await response.json()
    if (json.data) json.data = normalizeAuthUserRole(json.data)
    return json
  }
}
