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
