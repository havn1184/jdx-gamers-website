/**
 * Types cho đơn hàng / thanh toán / mã thẻ — theo URD mục 6.3 (state machine) + mục 19.
 */

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
  /** true khi đã trừ đủ JCoin cho đơn này — bỏ qua bước chờ QR (xem phân hệ Kiếm tiền) */
  payWithJcoin?: boolean
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
