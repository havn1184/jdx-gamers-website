/**
 * Types cho Chợ vé giờ chơi Cybergame (Giai đoạn 2 — URD mục 7).
 */

export type ZoneType = 'standard' | 'vip' | 'highend'
export type ShopSyncMode = 'manual' | 'netbarbox' | 'dodonew'
export type ShopStatus = 'active' | 'inactive'

export interface MockShopArt {
  gradient: [string, string]
  icon: string
}

export interface CybergameShop {
  id: string
  ownerId: string
  name: string
  city: string
  address: string
  description: string
  imageUrl: string
  /** Ảnh thực tế phòng máy (nếu có) — hiển thị dạng gallery ở trang chi tiết gian hàng */
  galleryImages?: string[]
  /** UI-only, chỉ nhánh mock Website có sẵn — BE thật không trả field này. */
  art?: MockShopArt
  status: ShopStatus
  syncMode: ShopSyncMode
  rating: number
  totalSold: number
  createdAt: string
}

export interface PlaytimeZone {
  id: string
  shopId: string
  name: string
  zoneType: ZoneType
  specs: string
  totalSeats: number
}

export type TicketStatus = 'active' | 'inactive'

export interface PlaytimeTicket {
  id: string
  shopId: string
  zoneId: string
  hours: number
  originalPrice: number
  sellPrice: number
  discountPercent: number
  availableSlots: number
  totalSlots: number
  isFlashSale: boolean
  flashSaleEndsAt?: string
  status: TicketStatus
}

/** View đã join thêm thông tin gian hàng/zone — dùng cho hiển thị marketplace. */
export interface PlaytimeTicketView extends PlaytimeTicket {
  shopName: string
  shopCity: string
  shopImageUrl: string
  shopArt: MockShopArt
  shopRating: number
  zoneName: string
  zoneType: ZoneType
}

export type PlaytimeOrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'CONFIRMED'
  | 'USED'
  | 'SUPPLY_FAILED'
  | 'REFUND_PROCESSING'
  | 'REFUNDED'
  | 'EXPIRED'

export interface PlaytimeOrder {
  id: string
  userId: string
  shopId: string
  shopName: string
  ticketId: string
  zoneName: string
  zoneType: ZoneType
  hours: number
  quantity: number
  unitPrice: number
  totalAmount: number
  status: PlaytimeOrderStatus
  redeemCode?: string
  qrCode: string
  createdAt: string
  updatedAt: string
}

export interface ShopPayoutPeriod {
  id: string
  shopId: string
  periodLabel: string
  grossRevenue: number
  commissionRate: number
  commissionAmount: number
  payableAmount: number
  status: 'PENDING' | 'PAID'
  paidAt?: string
}

export interface ShopListParams {
  keyword?: string
  city?: string | 'all'
  zoneType?: ZoneType | 'all'
}

export interface MarketplaceSections {
  flashSale: PlaytimeTicketView[]
  featuredShops: CybergameShop[]
  allTickets: PlaytimeTicketView[]
  cities: string[]
}

export interface CreateTicketOrderPayload {
  ticketId: string
  quantity: number
  /** true khi đã trừ đủ JCoin cho đơn này — bỏ qua bước chờ QR (xem phân hệ Kiếm tiền) */
  payWithJcoin?: boolean
}

export interface RegisterShopPayload {
  name: string
  city: string
  address: string
  description: string
}

export type UpdateShopProfilePayload = RegisterShopPayload

export interface UpsertZonePayload {
  id?: string
  name: string
  zoneType: ZoneType
  specs: string
  totalSeats: number
}

export interface UpsertTicketPayload {
  id?: string
  zoneId: string
  hours: number
  originalPrice: number
  sellPrice: number
  totalSlots: number
  availableSlots: number
  isFlashSale: boolean
}

export interface ShopDetailResult {
  shop: CybergameShop
  zones: PlaytimeZone[]
  tickets: PlaytimeTicketView[]
}

export interface ShopDashboardSummary {
  todayRevenue: number
  weekRevenue: number
  newOrdersCount: number
  lowSlotTickets: PlaytimeTicket[]
  topTickets: { ticket: PlaytimeTicket; zoneName: string; soldCount: number }[]
}
