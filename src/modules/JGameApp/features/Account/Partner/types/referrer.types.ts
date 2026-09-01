/**
 * Types cho dashboard Đối tác Referrer — theo URD mục 6.6, 6.5.2, 19.
 */

export interface ReferrerSummary {
  referralCode: string
  shareUrl: string
  commissionRateDefault: number
  totalOrders: number
  totalCommission: number
  pendingCommission: number
}

/**
 * Hồ sơ đối tác tiếp thị liên kết — shape trả về từ BE `AffiliatePartnerResponse`
 * (GET /api/referral/my-status trả object này hoặc `null`, KHÔNG phải boolean).
 */
export interface AffiliatePartner {
  id: string
  userId: string
  referralCode: string
  shareUrl: string
  displayName: string
  channel: string
  commissionRateDefault: number
  totalOrders: number
  totalCommission: number
  pendingCommission: number
  createdAt: string
}

export type ReferralReconcileStatus = 'pending' | 'confirmed' | 'reversed'

export interface ReferralTransactionItem {
  id: string
  orderId: string
  /** Đơn giản hoá — không hiển thị định danh khách hàng đầy đủ (chính sách bảo mật FR-6.5.2) */
  orderIdMasked: string
  amount: number
  commissionAmount: number
  status: ReferralReconcileStatus
  createdAt: string
}

export interface RegisterAffiliatePayload {
  displayName: string
  channel: string
}

/**
 * Đa liên kết (20260901-nc_doi-tac-tiep-thi-nang-cap.md) — 1 đối tác có N liên kết, mỗi liên kết
 * gắn 1 kênh quảng bá. Khớp `ReferralChannel` BE (Enums/ReferralEnums.cs):
 * Facebook=0/YouTube=1/TikTok=2/Zalo=3/Khac=4.
 */
export type ReferralChannel = 'facebook' | 'youtube' | 'tiktok' | 'zalo' | 'khac'

export const REFERRAL_CHANNEL_LABELS: Record<ReferralChannel, string> = {
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  zalo: 'Zalo',
  khac: 'Khác',
}

/** Shape trả về từ BE `ReferralLinkResponse` — GET/POST /api/referral/links. */
export interface ReferralLink {
  id: string
  code: string
  shareUrl: string
  channel: ReferralChannel
  label: string
  isDefault: boolean
  clickCount: number
  orderCount: number
  /** Tỷ lệ chuyển đổi dạng thập phân (0..1) = orderCount / clickCount — BE tính động, không lưu sẵn. Nhân 100 khi hiển thị %. */
  conversionRate: number
  createdAt: string
}

export interface CreateReferralLinkPayload {
  channel: ReferralChannel
  label: string
}

/** Khớp `ReferralPayoutStatus` BE: Pending=0/Approved=1/Rejected=2/Paid=3. */
export type ReferralPayoutStatus = 'pending' | 'approved' | 'rejected' | 'paid'

export const REFERRAL_PAYOUT_STATUS_LABELS: Record<ReferralPayoutStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  paid: 'Đã thanh toán',
}

/** Shape trả về từ BE `ReferralPayoutResponse` — GET/POST /api/referral/payouts. */
export interface ReferralPayoutRequestItem {
  id: string
  amount: number
  status: ReferralPayoutStatus
  requestedAt: string
  processedAt?: string | null
  rejectReason?: string | null
}

export interface RequestPayoutPayload {
  amount: number
}
