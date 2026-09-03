/**
 * NphTokenManager — Quản lý phiên đăng nhập NPH, ĐỘC LẬP HOÀN TOÀN với TokenManager của Customer/Admin
 * (khoá lưu trữ khác nhau — `nph_access_token` vs `jgame_access_token`) để 2 phiên không ghi đè nhau
 * nếu mở cùng trình duyệt (20260903-nc_quan-tri-nha-phat-hanh-game.md mục 2.1).
 *
 * Khác TokenManager (Customer/Admin — token JWT-like tự phát hành phía FE vì chưa có BE thật):
 * NPH gọi BE THẬT (`POST /api/auth/publisher/login`) nên token ở đây là JWT thật do Backend ký.
 * FE chỉ decode phần payload (không xác thực chữ ký) để đọc `exp` phục vụ tự động đăng xuất khi hết hạn.
 * BE chưa có endpoint refresh token cho NPH (`PublisherAuthController` chỉ có `login`) — hết hạn thì bắt
 * đăng nhập lại, không tự gia hạn như Customer/Admin.
 */
import type { NphProfile } from '../types'

interface NphJwtPayload {
  exp?: number
  [key: string]: unknown
}

function decodeJwtPayload(token: string): NphJwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

export class NphTokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'nph_access_token'
  private static readonly PROFILE_KEY = 'nph_profile'

  /** Lưu token + hồ sơ sau khi đăng nhập thành công. */
  static setSession(accessToken: string, profile: NphProfile): void {
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    sessionStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile))
  }

  static getAccessToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  static getProfile(): NphProfile | null {
    const raw = sessionStorage.getItem(this.PROFILE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as NphProfile
    } catch {
      return null
    }
  }

  /** Xoá toàn bộ phiên NPH — dùng khi đăng xuất hoặc token hết hạn/401. */
  static clearSession(): void {
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(this.PROFILE_KEY)
  }

  static isTokenExpired(): boolean {
    const token = this.getAccessToken()
    if (!token) return true
    const payload = decodeJwtPayload(token)
    if (!payload?.exp) return true
    return Math.floor(Date.now() / 1000) >= payload.exp - 30
  }

  static isAuthenticated(): boolean {
    return Boolean(this.getAccessToken()) && !this.isTokenExpired()
  }
}
