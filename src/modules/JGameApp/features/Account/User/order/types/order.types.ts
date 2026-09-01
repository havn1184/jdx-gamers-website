/**
 * Types cho đơn hàng / thanh toán / mã thẻ — theo URD mục 6.3 (state machine) + mục 19.
 */
import type { PaymentMethod } from '../../../../Public/wallet/types/wallet.types'

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SUCCESS'
  | 'SUPPLY_FAILED'
  | 'REFUND_PROCESSING'
  | 'REFUNDED'
  | 'EXPIRED'

export interface CreateOrderPayload {
  denominationId: string
  quantity: number
  /** Mã referrer lấy từ cookie/sessionStorage (?ref=...), nếu có */
  referrerCode?: string
  /** Bắt buộc — ví VND hoặc JCoin dùng thanh toán đơn (nc_vi-2-loai-tien-thanh-toan.md).
   * Thanh toán ví là atomic, đơn trả về đã ở trạng thái PAID ngay, không còn chờ QR. */
  paymentMethod: PaymentMethod
}

export interface OrderSummary {
  id: string
  userId: string
  denominationId: string
  productName: string
  supplierName: string
  faceValue: number
  quantity: number
  unitPrice: number
  totalAmount: number
  status: OrderStatus
  referrerCode?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentInfo {
  orderId: string
  /** Chuỗi mock để vẽ QR (không phải QR ngân hàng thật) */
  qrCode: string
  expiredAt: string
  paidAt?: string
}

export interface CardCodeResult {
  orderId: string
  /** Mặc định ẩn 1 phần — chỉ hiện đầy đủ khi gọi revealFull */
  serialMasked: string
  pinMasked: string
  serialFull?: string
  pinFull?: string
  issuedAt: string
}

export interface RefundInfo {
  orderId: string
  reason: string
  status: 'PROCESSING' | 'DONE'
  refundedAt?: string
}

export interface OrderHistoryFilter {
  status?: OrderStatus | 'all'
  fromDate?: string
  toDate?: string
}
