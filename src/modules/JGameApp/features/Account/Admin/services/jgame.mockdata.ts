/**
 * Mock in-memory data cho khu Quản trị JGame (chuyển từ AdminApp về JGameApp).
 * Reset khi reload trang — độc lập với mock của storefront/kênh người bán.
 */
import type {
  CardProductAdmin, SupplierAdmin, OrderAdminItem, ReferralPartnerAdmin, PromotionAdmin, RevenueReportRow,
} from '../types/jgame.types'

export const suppliers: SupplierAdmin[] = [
  { id: 'sup-garena', name: 'Garena', apiProtocol: 'REST', authMethod: 'API_KEY', priorityDefault: 1, timeoutOverrideMs: 8000, status: 'active' },
  { id: 'sup-vng', name: 'VNG', apiProtocol: 'REST', authMethod: 'OAUTH2', priorityDefault: 1, status: 'active' },
  { id: 'sup-viettel', name: 'Viettel', apiProtocol: 'SOAP', authMethod: 'HMAC', priorityDefault: 2, status: 'active' },
  { id: 'sup-google', name: 'Google Play', apiProtocol: 'REST', authMethod: 'API_KEY', priorityDefault: 1, status: 'active' },
  { id: 'sup-steam', name: 'Steam', apiProtocol: 'XML', authMethod: 'OTHER', priorityDefault: 3, status: 'inactive' },
]

export const cardProducts: CardProductAdmin[] = [
  {
    id: 'garena', name: 'Thẻ Garena', category: 'game', supplierId: 'sup-garena', supplierName: 'Garena', status: 'active',
    denominations: [
      { id: 'garena-50', faceValue: 50000, sellPrice: 49000, supplierSku: 'GRN-050', status: 'active' },
      { id: 'garena-100', faceValue: 100000, sellPrice: 97000, supplierSku: 'GRN-100', status: 'active' },
      { id: 'garena-500', faceValue: 500000, sellPrice: 475000, supplierSku: 'GRN-500', status: 'active' },
    ],
  },
  {
    id: 'zing-vng', name: 'Thẻ Zing (VNG)', category: 'game', supplierId: 'sup-vng', supplierName: 'VNG', status: 'active',
    denominations: [
      { id: 'zing-100', faceValue: 100000, sellPrice: 98000, supplierSku: 'ZNG-100', status: 'active' },
      { id: 'zing-200', faceValue: 200000, sellPrice: 194000, supplierSku: 'ZNG-200', status: 'active' },
    ],
  },
  {
    id: 'viettel', name: 'Thẻ nạp Viettel', category: 'mobile', supplierId: 'sup-viettel', supplierName: 'Viettel', status: 'active',
    denominations: [
      { id: 'viettel-50', faceValue: 50000, sellPrice: 49500, supplierSku: 'VTT-050', status: 'active' },
      { id: 'viettel-100', faceValue: 100000, sellPrice: 99000, supplierSku: 'VTT-100', status: 'active' },
    ],
  },
  {
    id: 'google-play', name: 'Thẻ Google Play', category: 'international', supplierId: 'sup-google', supplierName: 'Google Play', status: 'active',
    denominations: [
      { id: 'ggp-200', faceValue: 200000, sellPrice: 190000, supplierSku: 'GGP-200', status: 'active' },
    ],
  },
  {
    id: 'steam-wallet', name: 'Thẻ Steam Wallet', category: 'international', supplierId: 'sup-steam', supplierName: 'Steam', status: 'inactive',
    denominations: [
      { id: 'stm-200', faceValue: 200000, sellPrice: 192000, supplierSku: 'STM-200', status: 'inactive' },
    ],
  },
]

/** Danh sách giao dịch mock — trộn nhiều trạng thái để test đủ nhánh xử lý thủ công. */
const ORDER_STATUSES: OrderAdminItem['status'][] = ['SUCCESS', 'SUCCESS', 'PENDING', 'PAID', 'SUPPLY_FAILED', 'REFUNDED', 'SUCCESS']
export const orders: OrderAdminItem[] = Array.from({ length: 24 }).map((_, i) => {
  const product = cardProducts[i % cardProducts.length]
  const denom = product.denominations[i % product.denominations.length]
  return {
    id: `ORD-${3000 + i}`,
    productName: product.name,
    supplierName: product.supplierName,
    totalAmount: denom.sellPrice,
    status: ORDER_STATUSES[i % ORDER_STATUSES.length],
    referrerCode: i % 3 === 0 ? 'CTV001' : undefined,
    createdAt: new Date(Date.now() - i * 5 * 60 * 60 * 1000).toISOString(),
  }
})

/** Danh sách đối tác Referral mock — quản trị TOÀN BỘ đối tác (khác dashboard 1 đối tác ở features/referrer). */
export const referralPartners: ReferralPartnerAdmin[] = [
  { id: 'ref-1', referralCode: 'CTV001', name: 'Nguyễn Văn A', commissionRateDefault: 0.05, totalOrders: 34, refundRatePercent: 2.1, status: 'active' },
  { id: 'ref-2', referralCode: 'CTV002', name: 'Trần Thị B', commissionRateDefault: 0.04, totalOrders: 12, refundRatePercent: 0.8, status: 'active' },
  { id: 'ref-3', referralCode: 'CTV003', name: 'Lê Văn C', commissionRateDefault: 0.06, totalOrders: 3, refundRatePercent: 33.3, status: 'inactive' },
]

/** Danh sách khuyến mãi/voucher mock. */
export const promotions: PromotionAdmin[] = [
  { id: 'promo-1', code: 'JGAME50K', discountType: 'fixed', discountValue: 5000, startAt: '2026-08-01T00:00:00Z', endAt: '2026-09-01T00:00:00Z', status: 'active' },
  { id: 'promo-2', code: 'GAMER10', discountType: 'percent', discountValue: 10, startAt: '2026-08-15T00:00:00Z', endAt: '2026-08-31T00:00:00Z', status: 'active' },
  { id: 'promo-3', code: 'SUMMER2026', discountType: 'percent', discountValue: 15, startAt: '2026-06-01T00:00:00Z', endAt: '2026-07-01T00:00:00Z', status: 'inactive' },
]

/** Tổng hợp báo cáo doanh thu & tỷ lệ lỗi cấp mã theo từng NCC (SC-A6). */
export function buildRevenueReport(): RevenueReportRow[] {
  return suppliers.map(s => {
    const supOrders = orders.filter(o => o.supplierName === s.name)
    const success = supOrders.filter(o => o.status === 'SUCCESS')
    const failed = supOrders.filter(o => o.status === 'SUPPLY_FAILED')
    return {
      supplierName: s.name,
      totalOrders: supOrders.length,
      successOrders: success.length,
      failedOrders: failed.length,
      gmv: success.reduce((sum, o) => sum + o.totalAmount, 0),
      failRatePercent: supOrders.length ? Math.round((failed.length / supOrders.length) * 1000) / 10 : 0,
    }
  })
}
