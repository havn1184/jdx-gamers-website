/**
 * ReferrerApiService — Đối tác Tiếp thị liên kết (URD mục 18.5, 6.6), hoàn thiện gắn theo
 * đúng `userId` đăng nhập (trước đây dữ liệu tĩnh không đổi theo ai đăng nhập).
 */
import { apiCall, buildJGameUrl, type ApiResponse } from '../../../../shared/services/api'
import type {
  AffiliatePartner, ReferrerSummary, ReferralTransactionItem, RegisterAffiliatePayload,
  ReferralLink, ReferralChannel, CreateReferralLinkPayload,
  ReferralPayoutRequestItem, ReferralPayoutStatus, RequestPayoutPayload,
} from '../types/referrer.types'

/** BE serialize `ReconcileStatus` (Enums/ReferralEnums.cs) về int — map đúng thứ tự khai báo. */
const RECONCILE_STATUS_MAP = ['pending', 'confirmed', 'reversed'] as const

/** BE serialize `ReferralChannel` (Enums/ReferralEnums.cs) về int — Facebook=0/YouTube=1/TikTok=2/Zalo=3/Khac=4. */
const REFERRAL_CHANNEL_MAP: ReferralChannel[] = ['facebook', 'youtube', 'tiktok', 'zalo', 'khac']

/** BE serialize `ReferralPayoutStatus` về int — Pending=0/Approved=1/Rejected=2/Paid=3. */
const REFERRAL_PAYOUT_STATUS_MAP: ReferralPayoutStatus[] = ['pending', 'approved', 'rejected', 'paid']

function toChannelInt(channel: ReferralChannel): number {
  const idx = REFERRAL_CHANNEL_MAP.indexOf(channel)
  return idx === -1 ? 0 : idx
}

function normalizeTransaction(tx: ReferralTransactionItem): ReferralTransactionItem {
  const raw = tx.status as unknown
  if (typeof raw === 'number') {
    return { ...tx, status: (RECONCILE_STATUS_MAP[raw] ?? 'pending') as ReferralTransactionItem['status'] }
  }
  return tx
}

function normalizeLink(link: ReferralLink): ReferralLink {
  const raw = link.channel as unknown
  if (typeof raw === 'number') {
    return { ...link, channel: REFERRAL_CHANNEL_MAP[raw] ?? 'khac' }
  }
  return link
}

function normalizePayout(payout: ReferralPayoutRequestItem): ReferralPayoutRequestItem {
  const raw = payout.status as unknown
  if (typeof raw === 'number') {
    return { ...payout, status: REFERRAL_PAYOUT_STATUS_MAP[raw] ?? 'pending' }
  }
  return payout
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

  // ===== Đa liên kết (nc_doi-tac-tiep-thi-nang-cap.md mục 3.3) =====

  static async getLinks(): Promise<ApiResponse<ReferralLink[]>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/links`), { method: 'GET' })
    const result: ApiResponse<ReferralLink[]> = await response.json()
    if (result.success && result.data) result.data = result.data.map(normalizeLink)
    return result
  }

  static async createLink(payload: CreateReferralLinkPayload): Promise<ApiResponse<ReferralLink>> {
    const body = { ...payload, channel: toChannelInt(payload.channel) }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/links`), { method: 'POST', body: JSON.stringify(body) })
    const result: ApiResponse<ReferralLink> = await response.json()
    if (result.success && result.data) result.data = normalizeLink(result.data)
    return result
  }

  static async deleteLink(linkId: string): Promise<ApiResponse<null>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/links/${linkId}`), { method: 'DELETE' })
    return response.json()
  }

  // ===== Thanh toán hoa hồng (yêu cầu rút) =====

  static async requestPayout(payload: RequestPayoutPayload): Promise<ApiResponse<ReferralPayoutRequestItem>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/payouts`), { method: 'POST', body: JSON.stringify(payload) })
    const result: ApiResponse<ReferralPayoutRequestItem> = await response.json()
    if (result.success && result.data) result.data = normalizePayout(result.data)
    return result
  }

  static async getPayouts(): Promise<ApiResponse<ReferralPayoutRequestItem[]>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/payouts`), { method: 'GET' })
    const result: ApiResponse<ReferralPayoutRequestItem[]> = await response.json()
    if (result.success && result.data) result.data = result.data.map(normalizePayout)
    return result
  }
}
