/**
 * Types cho Chợ vé giờ chơi Cybergame (Giai đoạn 2 — URD mục 7).
 */
import type { PaymentMethod } from '../../wallet/types/wallet.types'

export type ZoneType = 'standard' | 'vip' | 'highend'
export type ShopSyncMode = 'manual' | 'netbarbox' | 'dodonew'
export type ShopStatus = 'active' | 'inactive'

/** Nguồn gốc 1 gói vé — Manual (chủ Cybergame tự nhập) hay đồng bộ từ nền tảng ngoài (Netbarbox/DoDoNew). */
export const PlaytimeTicketSourcePlatform = {
  Manual: 0,
  Netbarbox: 1,
  Dodonew: 2,
} as const
export type PlaytimeTicketSourcePlatform = (typeof PlaytimeTicketSourcePlatform)[keyof typeof PlaytimeTicketSourcePlatform]

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
  /** Số lượt đánh giá — tổng hợp động từ PlaytimeReviewService bên BE. */
  reviewCount: number
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
  /** Nguồn gốc gói vé — chỉ có ở BE thật sau nc_ tích hợp Netbarbox, optional để không phá vỡ nhánh mock cũ. */
  sourcePlatform?: PlaytimeTicketSourcePlatform
  /** Đánh dấu thời điểm gói bị gỡ ở nguồn (Netbarbox) nhưng vẫn giữ lại lịch sử — null/undefined nếu còn tồn tại ở nguồn. */
  sourceRemovedAt?: string | null
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
  /** Thời điểm đơn chuyển sang PAID — null nếu chưa thanh toán. Mốc tính điều kiện đánh giá. */
  paidAt?: string | null
  /** Computed từ BE — true khi đơn đủ điều kiện đánh giá NGAY BÂY GIỜ (đã thanh toán, trong 3
   *  ngày kể từ paidAt, chưa đánh giá). FE KHÔNG tự tính lại ngày. */
  canReview: boolean
  /** Computed từ BE — true khi đơn đã có đánh giá (còn hạn hay không). */
  hasReviewed: boolean
}

/** 1 đánh giá khách hàng cho 1 đơn vé giờ chơi đã thanh toán. */
export interface PlaytimeReview {
  id: string
  orderId: string
  shopId: string
  shopName: string
  ticketId: string
  zoneName: string
  userId: string
  reviewerName: string
  /** Tổng thể 1-5 sao — BE tính từ 4 tiêu chí dưới, luôn có giá trị kể cả đánh giá trước nâng cấp. */
  rating: number
  /** 4 tiêu chí (20260902-nc_danh-gia-phong-game-da-tieu-chi.md) — null với đánh giá tạo TRƯỚC nâng cấp. */
  ratingHygiene: number | null
  ratingFood: number | null
  ratingService: number | null
  ratingEquipment: number | null
  comment?: string
  createdAt: string
}

export interface CreatePlaytimeReviewPayload {
  ratingHygiene: number
  ratingFood: number
  ratingService: number
  ratingEquipment: number
  comment?: string
}

/** GET shop-owner/shop/reviews/summary, admin/reviews/summary — trung bình 4 tiêu chí + tổng thể. */
export interface PlaytimeReviewCriteriaAverage {
  overall: number
  hygiene: number | null
  food: number | null
  service: number | null
  equipment: number | null
  reviewCount: number
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
  /** Bắt buộc — ví VND hoặc JCoin dùng thanh toán đơn (nc_vi-2-loai-tien-thanh-toan.md). */
  paymentMethod: PaymentMethod
  /** Mã refer hiện có trong localStorage tại thời điểm đặt vé — BE lưu vào chính đơn để trace,
   * kể cả khi không hợp lệ/không tính hoa hồng (20260901-nc_doi-tac-tiep-thi-nang-cap.md mục 3.2). */
  referrerCode?: string
  referralLinkCode?: string
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
  /** Chỉ dùng khi bật/tắt bán 1 gói đã có (nút "Bật bán"/"Ngừng bán") — không set khi tạo mới. */
  status?: TicketStatus
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
