/**
 * ReferrerApiService — Đối tác Tiếp thị liên kết (URD mục 18.5, 6.6), hoàn thiện gắn theo
 * đúng `userId` đăng nhập (trước đây dữ liệu tĩnh không đổi theo ai đăng nhập).
 */
import { apiCall, buildJGameUrl, JGAME_USE_MOCK, mockApiCall, mockApiError, TokenManager, type ApiResponse } from '../../../../shared/services/api'
import { getAffiliateByUserId, registerAffiliate, buildSummaryForUser, listTransactionsByUserId } from '../../../../mocks/affiliatePartners.store'
import type { AffiliatePartner, ReferrerSummary, ReferralTransactionItem, RegisterAffiliatePayload } from '../types/referrer.types'

function getMockUserId(): string {
  return TokenManager.getUserId() || 'demo-user'
}

/** Ghép record mock (localStorage) + summary tính toán thành shape `AffiliatePartner` — khớp
 * `AffiliatePartnerResponse` thật của BE để 2 nhánh mock/real cùng 1 kiểu dữ liệu. */
function toMockAffiliatePartner(userId: string): AffiliatePartner | null {
  const record = getAffiliateByUserId(userId)
  if (!record) return null
  const summary = buildSummaryForUser(userId)
  return {
    id: record.userId,
    userId: record.userId,
    referralCode: record.referralCode,
    shareUrl: summary?.shareUrl ?? `https://jgame.vn/?ref=${record.referralCode}`,
    displayName: record.displayName,
    channel: record.channel,
    commissionRateDefault: record.commissionRateDefault,
    totalOrders: summary?.totalOrders ?? 0,
    totalCommission: summary?.totalCommission ?? 0,
    pendingCommission: summary?.pendingCommission ?? 0,
    createdAt: record.createdAt,
  }
}

export class ReferrerApiService {
  private static readonly BASE_PATH = '/api/referral'

  /** BE trả object `AffiliatePartner` hoặc `null` — KHÔNG phải boolean (rủi ro cao nhất trong audit
   * tích hợp API thật, xem `quyet-dinh-hop-nhat-api.md` #7). Nơi gọi phải check `data !== null`,
   * không được check `data === true`. */
  static async getMyAffiliateStatus(): Promise<ApiResponse<AffiliatePartner | null>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => toMockAffiliatePartner(getMockUserId()), 200)
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/my-status`), { method: 'GET' })
    return response.json()
  }

  static async register(payload: RegisterAffiliatePayload): Promise<ApiResponse<AffiliatePartner>> {
    if (JGAME_USE_MOCK) {
      try {
        registerAffiliate(getMockUserId(), payload)
        const partner = toMockAffiliatePartner(getMockUserId())
        return mockApiCall(() => partner as AffiliatePartner, 400)
      } catch (e) {
        return mockApiError((e as Error).message)
      }
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/register`), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async getSummary(): Promise<ApiResponse<ReferrerSummary | null>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => buildSummaryForUser(getMockUserId()), 300)
    const url = buildJGameUrl(`${this.BASE_PATH}/summary`)
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }

  static async getTransactions(): Promise<ApiResponse<ReferralTransactionItem[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => listTransactionsByUserId(getMockUserId()), 300)
    const url = buildJGameUrl(`${this.BASE_PATH}/transactions`)
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }
}
