/**
 * TokenManager — Quản lý token phiên đăng nhập JGame (độc lập, KHÔNG qua SSO).
 *
 * JGame tự phát hành "token" dạng JWT-like (header.payload.signature giả lập)
 * — vì chưa có BE thật nên không có chữ ký thật, chỉ đủ để decode payload
 * {sub, exp} phục vụ UI. Khi có BE thật: BE ký JWT thật, `issueToken`/
 * `refreshAccessToken` bên dưới thay bằng gọi API thật, phần còn lại giữ nguyên.
 */

export interface JGameJwtPayload {
  /** userId */
  sub: string
  exp: number
  iat: number
}

const TOKEN_TTL_SECONDS = 60 * 60 * 2 // 2 giờ

function base64UrlEncode(obj: unknown): string {
  return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'jgame_access_token'
  private static readonly REFRESH_TOKEN_KEY = 'jgame_refresh_token'
  private static readonly TOKEN_EXPIRES_AT_KEY = 'jgame_token_expires_at'

  /** Phát hành token JWT-like mới cho 1 userId (dùng khi đăng ký/đăng nhập/refresh thành công). */
  static issueToken(userId: string): { accessToken: string; refreshToken: string } {
    const now = Math.floor(Date.now() / 1000)
    const payload: JGameJwtPayload = { sub: userId, iat: now, exp: now + TOKEN_TTL_SECONDS }
    const header = base64UrlEncode({ alg: 'none', typ: 'JWT' })
    const body = base64UrlEncode(payload)
    return {
      accessToken: `${header}.${body}.mock-signature`,
      refreshToken: `refresh-${userId}-${now}`,
    }
  }

  /** Lưu token sau khi đăng nhập/đăng ký/refresh thành công. */
  static setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)

    const payload = this.decodeToken(accessToken)
    if (payload?.exp) {
      localStorage.setItem(this.TOKEN_EXPIRES_AT_KEY, String(payload.exp * 1000))
    }
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  /** Xoá toàn bộ token — dùng khi đăng xuất. */
  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.TOKEN_EXPIRES_AT_KEY)
  }

  /** Decode phần payload của token JWT-like (không xác thực chữ ký — chỉ đọc claim). */
  static decodeToken(token: string): JGameJwtPayload | null {
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

  static getUserId(): string | null {
    const token = this.getAccessToken()
    if (!token) return null
    return this.decodeToken(token)?.sub || null
  }

  /** JGame không có khái niệm multi-tenant/DomainId — luôn trả null (bỏ qua header liên quan). */
  static getDomainId(): string | null {
    return null
  }

  static isTokenExpired(token?: string): boolean {
    const stored = localStorage.getItem(this.TOKEN_EXPIRES_AT_KEY)
    if (stored) return Date.now() >= parseInt(stored, 10) - 60_000

    const targetToken = token || this.getAccessToken()
    if (!targetToken) return true
    const payload = this.decodeToken(targetToken)
    if (!payload?.exp) return true
    return Math.floor(Date.now() / 1000) >= payload.exp - 60
  }

  static isAuthenticated(): boolean {
    const token = this.getAccessToken()
    return Boolean(token) && !this.isTokenExpired(token!)
  }

  /** Gia hạn phiên tại chỗ (mock) — BE thật sẽ thay bằng gọi API refresh-token thật. */
  static async refreshAccessToken(): Promise<boolean> {
    const userId = this.getUserId()
    if (!userId) return false
    const { accessToken, refreshToken } = this.issueToken(userId)
    this.setTokens(accessToken, refreshToken)
    return true
  }

  /** Lấy access token, tự gia hạn nếu sắp hết hạn — cách dùng khuyến nghị cho mọi API call. */
  static async getAccessTokenWithRefresh(): Promise<string | null> {
    if (this.isTokenExpired()) {
      const refreshed = await this.refreshAccessToken()
      if (!refreshed) return null
    }
    return this.getAccessToken()
  }
}
