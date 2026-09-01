/**
 * ReferrerApiService — Đối tác Tiếp thị liên kết (URD mục 18.5, 6.6), hoàn thiện gắn theo
 * đúng `userId` đăng nhập (trước đây dữ liệu tĩnh không đổi theo ai đăng nhập).
 */
import { apiCall, buildJGameUrl, type ApiResponse } from '../../../../shared/services/api'
import type { AffiliatePartner, ReferrerSummary, ReferralTransactionItem, RegisterAffiliatePayload } from '../types/referrer.types'

/** BE serialize `ReconcileStatus` (Enums/ReferralEnums.cs) về int — map đúng thứ tự khai báo. */
const RECONCILE_STATUS_MAP = ['pending', 'confirmed', 'reversed'] as const

function normalizeTransaction(tx: ReferralTransactionItem): ReferralTransactionItem {
  const raw = tx.status as unknown
  if (typeof raw === 'number') {
    return { ...tx, status: (RECONCILE_STATUS_MAP[raw] ?? 'pending') as ReferralTransactionItem['status'] }
  }
  return tx
}

export class ReferrerApiService {
  private static readonly BASE_PATH = '/api/referral'

  /** BE trả object `AffiliatePartner` hoặc `null` — KHÔNG phải boolean (rủi ro cao nhất trong audit
   * tích hợp API thật, xem `quyet-dinh-hop-nhat-api.md` #7). Nơi gọi phải check `data !== null`,
   * không được check `data === true`. */
  static async getMyAffiliateStatus(): Promise<ApiResponse<AffiliatePartner | null>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/my-status`), { method: 'GET' })
    return response.json()
  }

  static async register(payload: RegisterAffiliatePayload): Promise<ApiResponse<AffiliatePartner>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/register`), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async getSummary(): Promise<ApiResponse<ReferrerSummary | null>> {
    const url = buildJGameUrl(`${this.BASE_PATH}/summary`)
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }

  static async getTransactions(): Promise<ApiResponse<ReferralTransactionItem[]>> {
    const url = buildJGameUrl(`${this.BASE_PATH}/transactions`)
    const response = await apiCall(url, { method: 'GET' })
    const result: ApiResponse<ReferralTransactionItem[]> = await response.json()
    if (result.success && result.data) {
      result.data = result.data.map(normalizeTransaction)
    }
    return result
  }
}
