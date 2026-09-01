/**
 * Types cho phân hệ Ví (VND + JCoin) — nc_vi-2-loai-tien-thanh-toan.md.
 * BE dùng enum int cho `currency`/`type` (WalletCurrency: Vnd=0/Jcoin=1; WalletTransactionType:
 * Topup=0/EarnTask=1/SpendCard=2/SpendTicket=3/SpendAccessory=4) — WalletApiService chịu trách
 * nhiệm map int -> chuỗi khi đọc response thật, giữ UI dùng chuỗi dễ đọc.
 */

/** Phương thức thanh toán dùng chung ở 3 luồng mua (thẻ/vé/phụ kiện) — khớp enum
 * WalletCurrency của BE khi gửi lên (0=Vnd, 1=Jcoin). JCoin không quy đổi được sang VND.
 * Dùng const object thay `enum` TypeScript (dự án bật `erasableSyntaxOnly`, không cho phép
 * cú pháp enum sinh JS thật — xem OrderStatus/TaskRequirementType cũng dùng union/const). */
export const PaymentMethod = {
  Vnd: 0,
  Jcoin: 1,
} as const
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export type WalletTxType = 'TOPUP' | 'EARN_TASK' | 'SPEND_CARD' | 'SPEND_TICKET' | 'SPEND_ACCESSORY'

export interface WalletBalance {
  vndBalance: number
  jcoinBalance: number
}

export interface WalletTransaction {
  id: string
  userId: string
  currency: PaymentMethod
  type: WalletTxType
  amount: number
  reason: string
  referenceId?: string | null
  createdAt: string
}

export interface WalletTopup {
  id: string
  amount: number
  qrCode: string
  expiredAt: string
  status: 'Pending' | 'Paid'
}
