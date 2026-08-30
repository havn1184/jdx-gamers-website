/**
 * AccountApiService — Hồ sơ cá nhân + lịch sử đăng nhập/hoạt động (SC-17, SC-19).
 */
import { apiCall, buildJGameUrl, JGAME_USE_MOCK, mockApiCall, mockApiError, TokenManager, type ApiResponse } from '../../../../../shared/services/api'
import { updateProfile, toAuthUser } from '../../../../../mocks/authUsers.store'
import { getActivityHistory, logActivity } from '../../../../../mocks/loginHistory.store'
import { normalizeAuthUserRole, normalizeLoginHistoryAction } from '../../../../Public/auth/services/AuthApiService'
import type { AuthUser } from '../../../../Public/auth/types/auth.types'
import type { UpdateProfilePayload } from '../types/account.types'
import type { LoginHistoryEntry } from '../types/account.types'

export class AccountApiService {
  private static readonly BASE_PATH = '/api/account'

  static async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<AuthUser>> {
    if (JGAME_USE_MOCK) {
      const userId = TokenManager.getUserId()
      if (!userId) return mockApiError('Chưa đăng nhập')
      const updated = updateProfile(userId, payload)
      if (!updated) return mockApiError('Không tìm thấy tài khoản')
      logActivity(userId, 'UPDATE_PROFILE')
      return mockApiCall(() => toAuthUser(updated))
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/profile`), { method: 'PUT', body: JSON.stringify(payload) })
    const json = await response.json()
    if (json.data) json.data = normalizeAuthUserRole(json.data)
    return json
  }

  static async getLoginHistory(): Promise<ApiResponse<LoginHistoryEntry[]>> {
    if (JGAME_USE_MOCK) {
      const userId = TokenManager.getUserId()
      if (!userId) return mockApiError('Chưa đăng nhập')
      return mockApiCall(() => getActivityHistory(userId))
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/login-history`), { method: 'GET' })
    const json = await response.json()
    if (Array.isArray(json.data)) json.data = json.data.map(normalizeLoginHistoryAction)
    return json
  }
}
