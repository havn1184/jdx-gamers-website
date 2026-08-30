/**
 * Types cho khu Quản trị JGame (chuyển từ AdminApp về JGameApp — website độc lập, xem
 * tài liệu `nc-jgame-chuyen-admin-ve-jgameapp-va-role`) — theo URD mục 19 (Data Dictionary) + mục 17.2 (SC-A2..A7).
 * Field FE dùng camelCase, giữ nguyên ý nghĩa gợi ý snake_case trong URD (BE thật chưa có — xem shared/services/api/mockGate.ts).
 */

export type EntityStatus = 'active' | 'inactive'

export interface CardDenominationAdmin {
  id: string
  faceValue: number
  sellPrice: number
  supplierSku: string
  status: EntityStatus
}

export interface CardProductAdmin {
  id: string
  name: string
  category: 'game' | 'mobile' | 'international'
  supplierId: string
  supplierName: string
  status: EntityStatus
  denominations: CardDenominationAdmin[]
}

export interface CardProductFormPayload {
  id?: string
  name: string
  category: CardProductAdmin['category']
  supplierId: string
  status: EntityStatus
}

export type ApiProtocol = 'REST' | 'SOAP' | 'XML' | 'OTHER'
export type AuthMethod = 'API_KEY' | 'OAUTH2' | 'HMAC' | 'OTHER'

export interface SupplierAdmin {
  id: string
  name: string
  apiProtocol: ApiProtocol
  authMethod: AuthMethod
  priorityDefault: number
  timeoutOverrideMs?: number
  status: EntityStatus
}

export interface SupplierFormPayload {
  id?: string
  name: string
  apiProtocol: ApiProtocol
  authMethod: AuthMethod
  priorityDefault: number
  status: EntityStatus
}

export type AdminOrderStatus =
  | 'PENDING' | 'PAID' | 'SUCCESS' | 'SUPPLY_FAILED' | 'REFUND_PROCESSING' | 'REFUNDED' | 'EXPIRED'
  // Trạng thái riêng của domain Playtime/Accessory (BE thật gộp 3 domain vào 1 response
  // AdminOrderSummaryResponse — xem JGameApiServiceAdmin.getOrders — nên union cần đủ cả 3 bộ enum).
  | 'CONFIRMED' | 'USED' | 'PACKING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURNED'

/** Loại đơn — khớp `AdminOrderType` BE (Card=0/Playtime=1/Accessory=2), thêm khi BE gộp 3 domain vào 1 API. */
export type AdminOrderType = 'card' | 'playtime' | 'accessory'

export interface OrderAdminItem {
  id: string
  productName: string
  supplierName: string
  totalAmount: number
  status: AdminOrderStatus
  referrerCode?: string
  createdAt: string
  /** Chỉ có khi lấy từ BE thật (`GET /api/admin/orders`) — BE gộp cả 3 domain, mock cục bộ (jgame.mockdata.ts) không có field này. */
  orderType?: AdminOrderType
}

/** Tổng quan dashboard admin từ BE thật (`GET /api/admin/dashboard`) — GMV/số đơn/tỉ lệ thành công theo domain.
 * Shape khác hẳn cách Website tự gộp dữ liệu hiện tại (useAdminDashboard.page.fetchData.ts) nên KHÔNG dùng để
 * thay thế logic dashboard hiện có ở bước này — chỉ khai báo sẵn cho lần dùng sau. */
export interface AdminDashboardSummary {
  gmvToday: number
  gmvMonth: number
  ordersToday: number
  cardOrderSuccessRate: number
  playtimeOrderSuccessRate: number
  accessoryOrderSuccessRate: number
}

export interface ReferralPartnerAdmin {
  id: string
  referralCode: string
  name: string
  commissionRateDefault: number
  totalOrders: number
  refundRatePercent: number
  status: EntityStatus
}

export interface ReferralPartnerFormPayload {
  id?: string
  referralCode: string
  name: string
  commissionRateDefault: number
  status: EntityStatus
}

export type DiscountType = 'percent' | 'fixed'

export interface PromotionAdmin {
  id: string
  code: string
  discountType: DiscountType
  discountValue: number
  startAt: string
  endAt: string
  status: EntityStatus
}

export interface PromotionFormPayload {
  id?: string
  code: string
  discountType: DiscountType
  discountValue: number
  startAt: string
  endAt: string
  status: EntityStatus
}

export interface RevenueReportRow {
  supplierName: string
  totalOrders: number
  successOrders: number
  failedOrders: number
  gmv: number
  failRatePercent: number
}

export interface JGameAdminListParams {
  keyword?: string
  status?: EntityStatus | 'all'
}

// ===== Phụ kiện Gamer (khai báo hãng sản xuất/nhóm sản phẩm/chi tiết sản phẩm) =====

export type AccessoryCategoryAdmin = 'mouse' | 'keyboard' | 'headset' | 'gpu' | 'pc' | 'monitor' | 'chair'

export interface AccessoryAdmin {
  id: string
  /** Mã sản phẩm (SKU) — khai báo thủ công hoặc dùng gợi ý tự sinh theo nhóm/hãng */
  sku: string
  name: string
  category: AccessoryCategoryAdmin
  /** Hãng sản xuất — nhập tự do, gợi ý từ các hãng đã khai báo trước đó (VD: Logitech, Razer, ASUS ROG...) */
  brand: string
  specs: string
  price: number
  stockQuantity: number
  status: EntityStatus
  /** Ảnh bìa — luôn là ảnh đầu tiên trong galleryImages */
  imageUrl: string
  /** Bộ ảnh minh hoạ sản phẩm (tối thiểu 1 ảnh) */
  galleryImages: string[]
}

export interface AccessoryFormPayload {
  id?: string
  sku: string
  name: string
  category: AccessoryCategoryAdmin
  brand: string
  specs: string
  price: number
  stockQuantity: number
  status: EntityStatus
  galleryImages: string[]
}

export interface AccessoryAdminListParams extends JGameAdminListParams {
  category?: AccessoryCategoryAdmin | 'all'
}
