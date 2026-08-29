/**
 * Mock công nợ & lịch sử thanh toán cho gian hàng (Kênh Người Bán — URD mục 7).
 * JGame giữ tiền khách trả, đối soát định kỳ trả lại gian hàng (trừ hoa hồng).
 * Chỉ đọc (read-only) — kỳ hiện tại tính từ đơn USED thật trong `playtimeOrders.store`,
 * các kỳ cũ là dữ liệu minh hoạ (deterministic theo shopId, không đổi giữa các lần gọi).
 */
import { listMockPlaytimeOrdersByShop } from './playtimeOrders.store'
import type { ShopPayoutPeriod } from '../features/Public/playtime/types/playtime.types'

export const COMMISSION_RATE = 0.12

function hashSeed(text: string): number {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h
}

function periodLabel(monthsAgo: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - monthsAgo)
  return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`
}

function buildPeriod(shopId: string, monthsAgo: number, status: 'PENDING' | 'PAID'): ShopPayoutPeriod {
  const seed = hashSeed(`${shopId}-${monthsAgo}`)
  const grossRevenue = status === 'PENDING'
    ? listMockPlaytimeOrdersByShop(shopId, 'USED').reduce((sum, o) => sum + o.totalAmount, 0)
    : 2000000 + (seed % 15) * 800000
  const commissionAmount = Math.round(grossRevenue * COMMISSION_RATE)
  return {
    id: `payout-${shopId}-${monthsAgo}`, shopId, periodLabel: periodLabel(monthsAgo), grossRevenue,
    commissionRate: COMMISSION_RATE, commissionAmount, payableAmount: grossRevenue - commissionAmount,
    status, paidAt: status === 'PAID' ? new Date(Date.now() - monthsAgo * 30 * 86400000 + 5 * 86400000).toISOString() : undefined,
  }
}

export function getCurrentPayoutPeriod(shopId: string): ShopPayoutPeriod {
  return buildPeriod(shopId, 0, 'PENDING')
}

export function getPayoutHistory(shopId: string): ShopPayoutPeriod[] {
  return [buildPeriod(shopId, 1, 'PAID'), buildPeriod(shopId, 2, 'PAID'), buildPeriod(shopId, 3, 'PAID')]
}
