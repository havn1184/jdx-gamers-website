/**
 * Mock in-memory data cho khu Quản trị JGame (chuyển từ AdminApp về JGameApp).
 * Reset khi reload trang — độc lập với mock của storefront/kênh người bán.
 */
import type {
  CardProductAdmin, SupplierAdmin, OrderAdminItem, ReferralPartnerAdmin, PromotionAdmin, RevenueReportRow, AccessoryAdmin,
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

/** Danh mục phụ kiện Gamer quản trị — độc lập với mock storefront (`mocks/accessories.mock.ts`),
 * cùng quy ước với `cardProducts` ở trên (reset khi reload, sửa ở đây không ảnh hưởng storefront). */
export const accessories: AccessoryAdmin[] = [
  { id: 'mouse-logitech-g502', sku: 'PK-MOUSE-LOGI-G502', name: 'Chuột Logitech G502 HERO', category: 'mouse', brand: 'Logitech', specs: '25600 DPI · 11 nút · Hero Sensor · Có dây', price: 990000, stockQuantity: 24, status: 'active', imageUrl: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=600', galleryImages: ['https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/1486294/pexels-photo-1486294.jpeg?auto=compress&cs=tinysrgb&w=600'] },
  { id: 'mouse-razer-deathadder', sku: 'PK-MOUSE-RAZER-DA3', name: 'Chuột Razer DeathAdder V3', category: 'mouse', brand: 'Razer', specs: '30000 DPI · Siêu nhẹ 59g · Wireless', price: 1490000, stockQuantity: 40, status: 'active', imageUrl: 'https://images.pexels.com/photos/1486294/pexels-photo-1486294.jpeg?auto=compress&cs=tinysrgb&w=600', galleryImages: ['https://images.pexels.com/photos/1486294/pexels-photo-1486294.jpeg?auto=compress&cs=tinysrgb&w=600'] },
  { id: 'keyboard-corsair-k70', sku: 'PK-KEYB-CORS-K70', name: 'Bàn phím cơ Corsair K70 RGB', category: 'keyboard', brand: 'Corsair', specs: 'Switch Cherry MX Red · Hotswap · RGB Per-key · Full size', price: 2590000, stockQuantity: 15, status: 'active', imageUrl: 'https://images.pexels.com/photos/841228/pexels-photo-841228.jpeg?auto=compress&cs=tinysrgb&w=600', galleryImages: ['https://images.pexels.com/photos/841228/pexels-photo-841228.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/920631/pexels-photo-920631.jpeg?auto=compress&cs=tinysrgb&w=600'] },
  { id: 'keyboard-razer-huntsman-mini', sku: 'PK-KEYB-RAZER-HM', name: 'Bàn phím cơ Razer Huntsman Mini', category: 'keyboard', brand: 'Razer', specs: 'Switch Optical · 60% · Nhỏ gọn · RGB', price: 2190000, stockQuantity: 20, status: 'active', imageUrl: 'https://images.pexels.com/photos/920631/pexels-photo-920631.jpeg?auto=compress&cs=tinysrgb&w=600', galleryImages: ['https://images.pexels.com/photos/920631/pexels-photo-920631.jpeg?auto=compress&cs=tinysrgb&w=600'] },
  { id: 'headset-steelseries-arctis7', sku: 'PK-HEAD-STSR-A7', name: 'Tai nghe SteelSeries Arctis 7', category: 'headset', brand: 'SteelSeries', specs: 'Không dây 2.4GHz · Pin 24h · Mic khử ồn ClearCast', price: 3290000, stockQuantity: 30, status: 'active', imageUrl: 'https://images.pexels.com/photos/18441496/pexels-photo-18441496.jpeg?auto=compress&cs=tinysrgb&w=600', galleryImages: ['https://images.pexels.com/photos/18441496/pexels-photo-18441496.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/28993111/pexels-photo-28993111.jpeg?auto=compress&cs=tinysrgb&w=600'] },
  { id: 'headset-hyperx-cloud2', sku: 'PK-HEAD-HYPX-C2', name: 'Tai nghe HyperX Cloud II', category: 'headset', brand: 'HyperX', specs: '7.1 Surround ảo · Đệm memory foam · Có dây', price: 1690000, stockQuantity: 12, status: 'active', imageUrl: 'https://images.pexels.com/photos/28993111/pexels-photo-28993111.jpeg?auto=compress&cs=tinysrgb&w=600', galleryImages: ['https://images.pexels.com/photos/28993111/pexels-photo-28993111.jpeg?auto=compress&cs=tinysrgb&w=600'] },
  { id: 'gpu-nvidia-rtx4070', sku: 'PK-GPU-NVDA-4070', name: 'Card đồ họa NVIDIA GeForce RTX 4070', category: 'gpu', brand: 'NVIDIA', specs: '12GB GDDR6X · Ray Tracing · DLSS 3', price: 14990000, stockQuantity: 6, status: 'active', imageUrl: 'https://images.pexels.com/photos/18338417/pexels-photo-18338417.jpeg?auto=compress&cs=tinysrgb&w=600', galleryImages: ['https://images.pexels.com/photos/18338417/pexels-photo-18338417.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/8622911/pexels-photo-8622911.jpeg?auto=compress&cs=tinysrgb&w=600'] },
  { id: 'gpu-amd-rx7800xt', sku: 'PK-GPU-AMD-7800XT', name: 'Card đồ họa AMD Radeon RX 7800 XT', category: 'gpu', brand: 'AMD', specs: '16GB GDDR6 · RDNA 3 · FSR 3', price: 12990000, stockQuantity: 4, status: 'active', imageUrl: 'https://images.pexels.com/photos/8622911/pexels-photo-8622911.jpeg?auto=compress&cs=tinysrgb&w=600', galleryImages: ['https://images.pexels.com/photos/8622911/pexels-photo-8622911.jpeg?auto=compress&cs=tinysrgb&w=600'] },
  { id: 'pc-asus-rog-strix', sku: 'PK-PC-ASUS-ROGSTRIX', name: 'PC Gaming ASUS ROG Strix', category: 'pc', brand: 'ASUS ROG', specs: 'RTX 4070 · Core i7 · 32GB RAM · 1TB SSD', price: 32900000, stockQuantity: 5, status: 'active', imageUrl: 'https://images.pexels.com/photos/13071304/pexels-photo-13071304.jpeg?auto=compress&cs=tinysrgb&w=600', galleryImages: ['https://images.pexels.com/photos/13071304/pexels-photo-13071304.jpeg?auto=compress&cs=tinysrgb&w=600'] },
  { id: 'monitor-samsung-odyssey', sku: 'PK-MON-SSNG-G7', name: 'Màn hình Samsung Odyssey G7 27"', category: 'monitor', brand: 'Samsung', specs: '27 inch · QHD · 240Hz · 1ms · Cong 1000R', price: 9990000, stockQuantity: 10, status: 'active', imageUrl: 'https://images.pexels.com/photos/1383833/pexels-photo-1383833.jpeg?auto=compress&cs=tinysrgb&w=600', galleryImages: ['https://images.pexels.com/photos/1383833/pexels-photo-1383833.jpeg?auto=compress&cs=tinysrgb&w=600'] },
  { id: 'chair-secretlab-titan', sku: 'PK-CHAIR-SCLB-TITAN', name: 'Ghế Gaming Secretlab Titan Evo', category: 'chair', brand: 'Secretlab', specs: 'Da PU cao cấp · Tựa lưng ngả 165° · Kê tay 4D', price: 8990000, stockQuantity: 8, status: 'active', imageUrl: 'https://images.pexels.com/photos/7862508/pexels-photo-7862508.jpeg?auto=compress&cs=tinysrgb&w=600', galleryImages: ['https://images.pexels.com/photos/7862508/pexels-photo-7862508.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/4317157/pexels-photo-4317157.jpeg?auto=compress&cs=tinysrgb&w=600'] },
  { id: 'chair-dxracer-formula', sku: 'PK-CHAIR-DXR-FORMULA', name: 'Ghế Gaming DXRacer Formula', category: 'chair', brand: 'DXRacer', specs: 'Vải lưới thoáng khí · Điều chỉnh độ cao · Ngả 135°', price: 4290000, stockQuantity: 0, status: 'active', imageUrl: 'https://images.pexels.com/photos/4317157/pexels-photo-4317157.jpeg?auto=compress&cs=tinysrgb&w=600', galleryImages: ['https://images.pexels.com/photos/4317157/pexels-photo-4317157.jpeg?auto=compress&cs=tinysrgb&w=600'] },
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
