/**
 * WalletApiService — Ví 2 loại tiền (VND + JCoin), thay thế phần ví trong TaskApiService
 * (nc_vi-2-loai-tien-thanh-toan.md). Gọi `JGameApi`:
 * - GET  /api/wallet                    -> { vndBalance, jcoinBalance }
 * - GET  /api/wallet/transactions       -> WalletTransactionResponse[] (currency/type là enum int)
 * - POST /api/wallet/topup              -> { id, amount, qrCode, expiredAt, status }
 * - POST /api/wallet/topup/{id}/confirm -> cùng shape, status Paid
 */
import { apiCall, buildJGameUrl, buildJGameUrlWithParams, type ApiResponse } from '../../../../shared/services/api'
import { PaymentMethod, type WalletBalance, type WalletTopup, type WalletTransaction, type WalletTxType } from '../types/wallet.types'

/** BE `WalletTransactionType`: Topup=0/EarnTask=1/SpendCard=2/SpendTicket=3/SpendAccessory=4. */
const TX_TYPE_BY_INT: WalletTxType[] = ['TOPUP', 'EARN_TASK', 'SPEND_CARD', 'SPEND_TICKET', 'SPEND_ACCESSORY']

function normalizeTransaction(raw: any): WalletTransaction {
  return {
    id: raw.id,
    userId: raw.userId,
    currency: typeof raw.currency === 'number' ? raw.currency : PaymentMethod.Vnd,
    type: typeof raw.type === 'number' ? (TX_TYPE_BY_INT[raw.type] ?? 'TOPUP') : raw.type,
    amount: raw.amount,
    reason: raw.reason,
    referenceId: raw.referenceId ?? null,
    createdAt: raw.createdAt,
  }
}

export class WalletApiService {
  private static readonly BASE_PATH = '/api/wallet'

  static async getWallet(): Promise<ApiResponse<WalletBalance>> {
    const response = await apiCall(buildJGameUrl(this.BASE_PATH), { method: 'GET' })
    return response.json()
  }

  static async getTransactions(currency?: PaymentMethod): Promise<ApiResponse<WalletTransaction[]>> {
    const url = buildJGameUrlWithParams(`${this.BASE_PATH}/transactions`, currency === undefined ? {} : { currency })
    const response = await apiCall(url, { method: 'GET' })
    const result: ApiResponse<any[]> = await response.json()
    return { ...result, data: result.data ? result.data.map(normalizeTransaction) : result.data }
  }

  /** Tạo yêu cầu nạp tiền VND — trả QR mock, tự động xác nhận sau ~6 giây phía BE. */
  static async topup(amount: number): Promise<ApiResponse<WalletTopup>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/topup`), { method: 'POST', body: JSON.stringify({ amount }) })
    return response.json()
  }

  /** Xác nhận nạp tiền ngay (mock, không chờ webhook tự động ~6s). */
  static async confirmTopup(topupId: string): Promise<ApiResponse<WalletTopup>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/topup/${topupId}/confirm`), { method: 'POST' })
    return response.json()
  }
}
