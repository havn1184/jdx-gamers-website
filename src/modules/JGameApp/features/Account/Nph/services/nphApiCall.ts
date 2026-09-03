/**
 * nphApiCall — Wrapper gọi API RIÊNG cho cổng NPH, KHÔNG dùng chung `apiCall()` (shared/services/api)
 * vì hàm đó tự gắn token Customer/Admin qua `TokenManager` — NPH là 1 principal JWT khác hoàn toàn
 * (20260903-nc_quan-tri-nha-phat-hanh-game.md mục 2.1). Không có refresh token cho NPH → 401 nghĩa là
 * phiên đã hết hạn, xoá session + điều hướng về trang đăng nhập NPH.
 */
import { NphTokenManager } from './NphTokenManager'
import { ApiLogger, type ApiResponse } from '../../../../shared/services/api'

export interface NphApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  /** Bỏ qua gắn Authorization header — dùng cho đăng nhập. */
  skipAuth?: boolean
}

export async function nphApiCall<T>(url: string, options: NphApiCallOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', body, skipAuth = false } = options
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  if (!skipAuth) {
    const token = NphTokenManager.getAccessToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (response.status === 401 && !skipAuth) {
      ApiLogger.warn(`[nphApiCall] 401 — phiên NPH hết hạn, đăng xuất tại chỗ: ${url}`)
      NphTokenManager.clearSession()
      window.location.hash = '#/jgame/nph/dang-nhap'
    }

    const data = await response.json().catch(() => null)
    if (!data) {
      return { success: false, data: null, message: `Lỗi HTTP ${response.status}: ${response.statusText}` }
    }
    return data as ApiResponse<T>
  } catch (error) {
    ApiLogger.error('[nphApiCall] Lỗi kết nối', error)
    return { success: false, data: null, message: 'Không kết nối được máy chủ, vui lòng thử lại.' }
  }
}
