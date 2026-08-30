/**
 * AuthApiService — Đăng ký/đăng nhập/quên-đặt lại mật khẩu/xác minh (URD mục 2 — tài liệu độc lập hoá).
 * Qua gate mock (JGAME_USE_MOCK). Khi có BE thật: xoá nhánh mock, giữ nhánh apiCall.
 */
import { apiCall, buildJGameUrl, JGAME_USE_MOCK, mockApiCall, mockApiError, TokenManager, type ApiResponse } from '../../../../shared/services/api'
import {
  findUserByIdentifier, findUserById, isIdentifierTaken, createUser, verifyPassword,
  createResetToken, consumeResetToken, updatePassword, createEmailToken, consumeEmailToken,
  setEmailVerified, setPhoneOtp, verifyPhoneOtp as verifyPhoneOtpStore,
  enableTwoFactor, disableTwoFactor, toAuthUser,
} from '../../../../mocks/authUsers.store'
import { logActivity } from '../../../../mocks/loginHistory.store'
import type {
  AuthUser, RegisterPayload, LoginPayload, LoginResult, ForgotPasswordPayload,
  ResetPasswordPayload, ChangePasswordPayload, Verify2FAPayload,
} from '../types/auth.types'

/** Mock 2FA — mã xác nhận cố định để test không cần thư viện TOTP thật. */
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
    if (JGAME_USE_MOCK) {
      if (isIdentifierTaken(payload.email, payload.phone)) {
        return mockApiError('Email hoặc số điện thoại đã được đăng ký')
      }
      const stored = createUser(payload.email, payload.phone, payload.password)
      const { accessToken, refreshToken } = TokenManager.issueToken(stored.id)
      logActivity(stored.id, 'REGISTER')
      return mockApiCall(() => ({ accessToken, refreshToken, user: toAuthUser(stored) }))
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/register`), { method: 'POST', body: JSON.stringify(payload) })
    const json = await response.json()
    if (json.data) json.data.user = normalizeAuthUserRole(json.data.user)
    return json
  }

  static async login(payload: LoginPayload): Promise<ApiResponse<LoginResult>> {
    if (JGAME_USE_MOCK) {
      const stored = findUserByIdentifier(payload.identifier)
      if (!stored || !verifyPassword(stored, payload.password)) {
        return mockApiError('Email/số điện thoại hoặc mật khẩu không đúng')
      }
      if (stored.twoFactorEnabled) {
        const pendingToken = `pending-${stored.id}-${Date.now()}`
        return mockApiCall(() => ({ requires2FA: true, pendingToken }))
      }
      const { accessToken, refreshToken } = TokenManager.issueToken(stored.id)
      logActivity(stored.id, 'LOGIN')
      return mockApiCall(() => ({ accessToken, refreshToken, user: toAuthUser(stored) }))
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/login`), { method: 'POST', body: JSON.stringify(payload) })
    const json = await response.json()
    if (json.data) json.data.user = normalizeAuthUserRole(json.data.user)
    return json
  }

  static async verify2FA(payload: Verify2FAPayload): Promise<ApiResponse<LoginResult>> {
    if (JGAME_USE_MOCK) {
      if (payload.code !== MOCK_2FA_DEMO_CODE) return mockApiError('Mã xác thực không đúng')
      // pendingToken = `pending-${userId}-${timestamp}` — userId có thể chứa dấu '-' nên
      // KHÔNG dùng split('-')[1]; cắt phần giữa tiền tố cố định và dấu '-' cuối (timestamp).
      const userId = payload.pendingToken.slice('pending-'.length, payload.pendingToken.lastIndexOf('-'))
      const stored = findUserById(userId)
      if (!stored) return mockApiError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại')
      const { accessToken, refreshToken } = TokenManager.issueToken(stored.id)
      logActivity(stored.id, 'LOGIN')
      return mockApiCall(() => ({ accessToken, refreshToken, user: toAuthUser(stored) }))
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/verify-2fa`), { method: 'POST', body: JSON.stringify(payload) })
    const json = await response.json()
    if (json.data) json.data.user = normalizeAuthUserRole(json.data.user)
    return json
  }

  static async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse<boolean>> {
    if (JGAME_USE_MOCK) {
      const stored = findUserByIdentifier(payload.identifier)
      // Luôn trả success để chống dò tài khoản (kể cả khi không tìm thấy)
      if (stored) {
        const token = createResetToken(stored.id)
        // eslint-disable-next-line no-console
        console.info('[MOCK] Link đặt lại mật khẩu:', `#/jgame/dat-lai-mat-khau?token=${token}`)
      }
      return mockApiCall(() => true)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/forgot-password`), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<boolean>> {
    if (JGAME_USE_MOCK) {
      const userId = consumeResetToken(payload.token)
      if (!userId) return mockApiError('Đường dẫn đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')
      updatePassword(userId, payload.newPassword)
      logActivity(userId, 'RESET_PASSWORD')
      return mockApiCall(() => true)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/reset-password`), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async sendEmailVerification(): Promise<ApiResponse<boolean>> {
    if (JGAME_USE_MOCK) {
      const userId = TokenManager.getUserId()
      if (!userId) return mockApiError('Chưa đăng nhập')
      const token = createEmailToken(userId)
      // eslint-disable-next-line no-console
      console.info('[MOCK] Link xác thực email:', `#/jgame/xac-thuc-email?token=${token}`)
      return mockApiCall(() => true)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/send-email-verification`), { method: 'POST' })
    return response.json()
  }

  static async verifyEmail(token: string): Promise<ApiResponse<boolean>> {
    if (JGAME_USE_MOCK) {
      const userId = consumeEmailToken(token)
      if (!userId) return mockApiError('Đường dẫn xác thực email không hợp lệ hoặc đã hết hạn')
      setEmailVerified(userId)
      logActivity(userId, 'VERIFY_EMAIL')
      return mockApiCall(() => true)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/verify-email`), { method: 'POST', body: JSON.stringify({ token }) })
    return response.json()
  }

  static async sendPhoneOtp(): Promise<ApiResponse<boolean>> {
    if (JGAME_USE_MOCK) {
      const userId = TokenManager.getUserId()
      if (!userId) return mockApiError('Chưa đăng nhập')
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      setPhoneOtp(userId, otp)
      // eslint-disable-next-line no-console
      console.info('[MOCK] Mã OTP xác thực SĐT:', otp)
      return mockApiCall(() => true)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/send-phone-otp`), { method: 'POST' })
    return response.json()
  }

  static async verifyPhoneOtp(otp: string): Promise<ApiResponse<boolean>> {
    if (JGAME_USE_MOCK) {
      const userId = TokenManager.getUserId()
      if (!userId) return mockApiError('Chưa đăng nhập')
      const ok = verifyPhoneOtpStore(userId, otp)
      if (!ok) return mockApiError('Mã OTP không đúng hoặc đã hết hạn')
      logActivity(userId, 'VERIFY_PHONE')
      return mockApiCall(() => true)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/verify-phone-otp`), { method: 'POST', body: JSON.stringify({ otp }) })
    return response.json()
  }

  static async changePassword(payload: ChangePasswordPayload): Promise<ApiResponse<boolean>> {
    if (JGAME_USE_MOCK) {
      const userId = TokenManager.getUserId()
      const stored = userId ? findUserById(userId) : undefined
      if (!stored) return mockApiError('Chưa đăng nhập')
      if (!verifyPassword(stored, payload.oldPassword)) return mockApiError('Mật khẩu hiện tại không đúng')
      updatePassword(stored.id, payload.newPassword)
      logActivity(stored.id, 'CHANGE_PASSWORD')
      return mockApiCall(() => true)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/change-password`), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async enable2FA(): Promise<ApiResponse<{ secret: string }>> {
    if (JGAME_USE_MOCK) {
      const userId = TokenManager.getUserId()
      if (!userId) return mockApiError('Chưa đăng nhập')
      const secret = enableTwoFactor(userId)
      logActivity(userId, 'ENABLE_2FA')
      return mockApiCall(() => ({ secret }))
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/enable-2fa`), { method: 'POST' })
    return response.json()
  }

  static async disable2FA(): Promise<ApiResponse<boolean>> {
    if (JGAME_USE_MOCK) {
      const userId = TokenManager.getUserId()
      if (!userId) return mockApiError('Chưa đăng nhập')
      disableTwoFactor(userId)
      logActivity(userId, 'DISABLE_2FA')
      return mockApiCall(() => true)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/disable-2fa`), { method: 'POST' })
    return response.json()
  }

  static async getCurrentUser(): Promise<ApiResponse<AuthUser>> {
    if (JGAME_USE_MOCK) {
      const userId = TokenManager.getUserId()
      const stored = userId ? findUserById(userId) : undefined
      if (!stored) return mockApiError('Chưa đăng nhập')
      return mockApiCall(() => toAuthUser(stored), 100)
    }
    // BE chỉ có 1 path duy nhất lấy current user: /api/account/profile (không có /api/auth/me).
    const response = await apiCall(buildJGameUrl('/api/account/profile'), { method: 'GET' })
    const json = await response.json()
    if (json.data) json.data = normalizeAuthUserRole(json.data)
    return json
  }
}
