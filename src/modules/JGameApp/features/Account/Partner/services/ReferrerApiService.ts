/**
 * ReferrerApiService — Đối tác Tiếp thị liên kết (URD mục 18.5, 6.6), hoàn thiện gắn theo
 * đúng `userId` đăng nhập (trước đây dữ liệu tĩnh không đổi theo ai đăng nhập).
 */
import { apiCall, buildJGameUrl, JGAME_USE_MOCK, mockApiCall, mockApiError, TokenManager, type ApiResponse } from '../../../../shared/services/api'
import { getAffiliateByUserId, registerAffiliate, buildSummaryForUser, listTransactionsByUserId } from '../../../../mocks/affiliatePartners.store'
import type { ReferrerSummary, ReferralTransactionItem, RegisterAffiliatePayload } from '../types/referrer.types'

function getMockUserId(): string {
  return TokenManager.getUserId() || 'demo-user'
}

export class ReferrerApiService {
  private static readonly BASE_PATH = '/api/referral'

  static async getMyAffiliateStatus(): Promise<ApiResponse<boolean>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => Boolean(getAffiliateByUserId(getMockUserId())), 200)
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/me/status`), { method: 'GET' })
    return response.json()
  }

  static async register(payload: RegisterAffiliatePayload): Promise<ApiResponse<ReferrerSummary>> {
    if (JGAME_USE_MOCK) {
      try {
        registerAffiliate(getMockUserId(), payload)
        const summary = buildSummaryForUser(getMockUserId())
        return mockApiCall(() => summary as ReferrerSummary, 400)
      } catch (e) {
        return mockApiError((e as Error).message)
      }
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/me/register`), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async getSummary(): Promise<ApiResponse<ReferrerSummary | null>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => buildSummaryForUser(getMockUserId()), 300)
    const url = buildJGameUrl(`${this.BASE_PATH}/me/summary`)
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }

  static async getTransactions(): Promise<ApiResponse<ReferralTransactionItem[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => listTransactionsByUserId(getMockUserId()), 300)
    const url = buildJGameUrl(`${this.BASE_PATH}/me/transactions`)
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }
}
