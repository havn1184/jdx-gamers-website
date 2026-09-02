/**
 * Mock in-memory data cho khu Quản trị JGame (chuyển từ AdminApp về JGameApp).
 * Reset khi reload trang — độc lập với mock của storefront/Chủ Cybergame.
 *
 * `cardProducts` KHÔNG còn export (20260902-nc_admin-crud-that-thay-mock.md — CRUD
 * cards/suppliers/promotions/accessories đã chuyển sang gọi BE thật) — chỉ còn giữ lại DÙNG NỘI BỘ
 * file này để sinh dữ liệu tên sản phẩm/NCC hiển thị trong `orders` mock (manualResolveOrder vẫn cố
 * ý dùng mock, xem JGameApiServiceAdmin.ts). `suppliers`/`promotions`/`accessories`/
 * `buildRevenueReport` đã xoá hẳn vì không còn nơi nào dùng.
 */
import type { CardProductAdmin, OrderAdminItem, ReferralPartnerAdmin } from '../types/jgame.types'

const cardProducts: CardProductAdmin[] = [
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

