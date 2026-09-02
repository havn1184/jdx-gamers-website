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

// ===== Đối tác tiếp thị — Đa liên kết + Đối soát + Thanh toán (20260901-nc_doi-tac-tiep-thi-nang-cap.md) =====

export type ReferralReconcileStatusAdmin = 'pending' | 'confirmed' | 'reversed'
export type ReferralCommissionCategory = 'cardtopup' | 'playtimeticket'
export type ReferralPayoutStatusAdmin = 'pending' | 'approved' | 'rejected' | 'paid'

export const REFERRAL_COMMISSION_CATEGORY_LABELS: Record<ReferralCommissionCategory, string> = {
  cardtopup: 'Thẻ nạp',
  playtimeticket: 'Vé giờ chơi',
}

export const REFERRAL_PAYOUT_STATUS_ADMIN_LABELS: Record<ReferralPayoutStatusAdmin, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  paid: 'Đã thanh toán',
}

/** GET /api/admin/referral/transactions — mở rộng `AdminService.GetAllReferralTransactionsAsync`. */
export interface ReferralTransactionAdmin {
  id: string
  orderId: string
  partnerId: string
  partnerName: string
  amount: number
  commissionAmount: number
  category: ReferralCommissionCategory
  status: ReferralReconcileStatusAdmin
  createdAt: string
}

export interface ReferralTransactionAdminListParams {
  from?: string
  to?: string
  partnerId?: string
  category?: ReferralCommissionCategory | 'all'
  status?: ReferralReconcileStatusAdmin | 'all'
}

/** GET /api/admin/referral/payouts — danh sách yêu cầu rút hoa hồng, duyệt/từ chối/đánh dấu đã trả. */
export interface ReferralPayoutAdmin {
  id: string
  partnerId: string
  partnerName: string
  amount: number
  status: ReferralPayoutStatusAdmin
  requestedAt: string
  processedAt?: string | null
  processedBy?: string | null
  rejectReason?: string | null
}

/** GET/PUT /api/admin/referral/commission-rates — tỷ lệ hoa hồng hiện hành theo loại + lịch sử. */
export interface ReferralCommissionRateAdmin {
  category: ReferralCommissionCategory
  ratePercent: number
  updatedAt: string
  updatedBy?: string | null
}

export interface ReferralCommissionRateHistoryAdmin {
  category: ReferralCommissionCategory
  oldRatePercent: number
  newRatePercent: number
  changedBy: string
  changedAt: string
}

/** GET /api/admin/referral/reports/summary — báo cáo tổng hợp đối soát/thanh toán. */
export interface ReferralReportSummaryAdmin {
  totalClicks: number
  totalOrders: number
  totalCommission: number
  totalCommissionByStatus: Record<ReferralReconcileStatusAdmin, number>
  totalPaid: number
  totalOwed: number
}

export interface ReferralReportFilterParams {
  from?: string
  to?: string
  category?: ReferralCommissionCategory | 'all'
  partnerId?: string
}

// ===== Tài khoản hệ thống (20260902-nc_quan-tri-tai-khoan-he-thong.md) =====

/** Khớp thứ tự int enum `AdminUserKind` (Backend Enums/AdminEnums.cs) — dùng để build query `kind=`. */
export type AdminUserKind = 'customer' | 'shopOwner' | 'affiliate' | 'admin'

/** GET /api/admin/users — 1 dòng trong danh sách tài khoản (field giống hệt `AdminUserResponse` Backend). */
export interface AdminUserItem {
  id: string
  phone: string
  email: string
  name: string
  kind: AdminUserKind
  isBothShopOwnerAndAffiliate: boolean
  isLocked: boolean
  createdAt: string
  lastLoginAt: string | null
  vndBalance: number
  jcoinBalance: number
}

export interface AdminUserListParams {
  keyword?: string
  kind?: AdminUserKind | 'all'
  page?: number
  limit?: number
}

/** Khớp `PagedResult<T>` (Backend `Core/Responses/ApiResponse.cs`) — response của mọi endpoint phân trang
 * server-side thật (khác các trang CRUD danh mục cũ lọc phía FE, không có total/page/limit). */
export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
