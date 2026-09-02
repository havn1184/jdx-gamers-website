/**
 * API Configuration — JGameApp (độc lập, không còn phụ thuộc SSO)
 *
 * BE thật CHƯA CÓ cho portal này — xem `mockGate.ts` cho cơ chế mock.
 * Chỉ giữ JGAME_API_URL (dùng khi tắt mock, gọi BE thật).
 */

function getJGameApiUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_JGAME_API_URL) {
    return import.meta.env.VITE_JGAME_API_URL as string
  }
  return 'http://localhost:5013'
}

export const API_CONFIG = {
  /** BE JGame thật */
  get JGAME_API_URL(): string {
    return getJGameApiUrl()
  },

  /** Timeout mặc định (ms) */
  get TIMEOUT(): number {
    return Number(import.meta.env?.VITE_API_TIMEOUT) || 30000
  },

  get DEBUG(): boolean {
    return import.meta.env?.VITE_DEBUG === 'true'
  },
}

/** Build URL gọi BE JGame thật (dùng khi tắt mock) */
export function buildJGameUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${API_CONFIG.JGAME_API_URL}${cleanEndpoint}`
}

/** Build URL gọi BE JGame thật kèm query params */
export function buildJGameUrlWithParams(
  endpoint: string,
  params?: Record<string, unknown>
): string {
  const baseUrl = buildJGameUrl(endpoint)
  if (!params || Object.keys(params).length === 0) return baseUrl

  const queryParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value))
    }
  })
  const qs = queryParams.toString()
  return qs ? `${baseUrl}?${qs}` : baseUrl
}
