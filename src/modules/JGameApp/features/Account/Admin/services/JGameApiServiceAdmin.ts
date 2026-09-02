/**
 * JGameApiServiceAdmin — Khu Quản trị JGame (chuyển từ AdminApp về JGameApp — website độc lập).
 *
 * Dashboard/Orders/RevenueReport/CRUD danh mục (cards/suppliers/promotions/accessories) đều đã gọi
 * BE thật (20260902-nc_admin-crud-that-thay-mock.md — trước đó CRUD danh mục dùng mock cục bộ qua
 * cờ `ADMIN_CRUD_MOCK_ONLY`, nay đã gỡ bỏ). Còn lại đúng 2 chỗ vẫn cố ý dùng mock — xem comment tại
 * từng method: `manualResolveOrder` (BE chưa có endpoint xử lý thủ công đơn hàng, ngoài phạm vi nc_
 * trên) và CRUD đối tác Referral (BE chỉ có API đọc, chưa có Create/Update/Delete).
 */
import { apiCall, buildJGameUrl, buildJGameUrlWithParams, mockApiCall, mockApiError, type ApiResponse } from '../../../../shared/services/api'
import {
  orders, referralPartners,
} from './jgame.mockdata'
import type {
  CardProductAdmin, CardProductFormPayload, SupplierAdmin, SupplierFormPayload,
  OrderAdminItem, ReferralPartnerAdmin, ReferralPartnerFormPayload,
  PromotionAdmin, PromotionFormPayload, RevenueReportRow, JGameAdminListParams,
  AccessoryAdmin, AccessoryFormPayload, AccessoryAdminListParams,
  AdminOrderStatus, AdminOrderType, AdminDashboardSummary,
  ReferralTransactionAdmin, ReferralTransactionAdminListParams, ReferralPayoutAdmin,
  ReferralCommissionRateAdmin, ReferralCommissionRateHistoryAdmin, ReferralCommissionCategory,
  ReferralReportSummaryAdmin, ReferralReportFilterParams,
} from '../types/jgame.types'

/** Map các enum int BE (Enums/ReferralEnums.cs) sang string union FE dùng. */
const RECONCILE_STATUS_MAP = ['pending', 'confirmed', 'reversed'] as const
const REFERRAL_COMMISSION_CATEGORY_MAP: ReferralCommissionCategory[] = ['cardtopup', 'playtimeticket']
const REFERRAL_PAYOUT_STATUS_MAP = ['pending', 'approved', 'rejected', 'paid'] as const

function toCommissionCategoryInt(category: ReferralCommissionCategory): number {
  const idx = REFERRAL_COMMISSION_CATEGORY_MAP.indexOf(category)
  return idx === -1 ? 0 : idx
}

function normalizeReferralTransaction(tx: ReferralTransactionAdmin): ReferralTransactionAdmin {
  return {
    ...tx,
    status: typeof tx.status === 'number' ? (RECONCILE_STATUS_MAP[tx.status as unknown as number] ?? 'pending') : tx.status,
    category: typeof tx.category === 'number' ? (REFERRAL_COMMISSION_CATEGORY_MAP[tx.category as unknown as number] ?? 'cardtopup') : tx.category,
  }
}

function normalizeReferralPayout(p: ReferralPayoutAdmin): ReferralPayoutAdmin {
  return { ...p, status: typeof p.status === 'number' ? (REFERRAL_PAYOUT_STATUS_MAP[p.status as unknown as number] ?? 'pending') : p.status }
}

function normalizeCommissionRate(r: ReferralCommissionRateAdmin): ReferralCommissionRateAdmin {
  return { ...r, category: typeof r.category === 'number' ? (REFERRAL_COMMISSION_CATEGORY_MAP[r.category as unknown as number] ?? 'cardtopup') : r.category }
}

function normalizeCommissionRateHistory(h: ReferralCommissionRateHistoryAdmin): ReferralCommissionRateHistoryAdmin {
  return { ...h, category: typeof h.category === 'number' ? (REFERRAL_COMMISSION_CATEGORY_MAP[h.category as unknown as number] ?? 'cardtopup') : h.category }
}

/** Response thô GET /api/admin/orders (BE gộp cả 3 domain — quyet-dinh-hop-nhat-api.md #15). */
interface AdminOrderSummaryResponseDto {
  id: string
  orderType: 0 | 1 | 2
  customerNameMasked: string
  totalAmount: number
  status: number
  createdAt: string
}

/** Response thô GET /api/admin/reports/revenue (BE trả theo NGÀY, không theo NCC — quyet-dinh-hop-nhat-api.md #14). */
interface AdminRevenueByDayResponseDto {
  date: string
  revenue: number
}

const ORDER_TYPE_LABELS: Record<0 | 1 | 2, AdminOrderType> = { 0: 'card', 1: 'playtime', 2: 'accessory' }

/** Map status int BE → string domain-riêng (BE dùng enum status RIÊNG theo từng orderType, xem
 * AdminOrderSummaryResponse.cs class-doc — PHẢI đọc đúng bảng enum tương ứng orderType, không dùng chung 1 bảng). */
const CARD_ORDER_STATUS: AdminOrderStatus[] = ['PENDING', 'PAID', 'SUCCESS', 'SUPPLY_FAILED', 'REFUND_PROCESSING', 'REFUNDED', 'EXPIRED']
const PLAYTIME_ORDER_STATUS: AdminOrderStatus[] = ['PENDING', 'PAID', 'CONFIRMED', 'USED', 'SUPPLY_FAILED', 'REFUND_PROCESSING', 'REFUNDED', 'EXPIRED']
const ACCESSORY_ORDER_STATUS: AdminOrderStatus[] = ['PENDING', 'PAID', 'PACKING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED']

function mapAdminOrderStatus(orderType: 0 | 1 | 2, status: number): AdminOrderStatus {
  const table = orderType === 0 ? CARD_ORDER_STATUS : orderType === 1 ? PLAYTIME_ORDER_STATUS : ACCESSORY_ORDER_STATUS
  return table[status] ?? 'PENDING'
}

/** BE gộp orders KHÔNG trả productName/supplierName (chỉ trả customerNameMasked) — map tạm sang
 * shape OrderAdminItem cũ để UI (bảng/badge) không vỡ, kèm field orderType mới cho nơi cần phân biệt domain. */
function mapAdminOrderSummary(dto: AdminOrderSummaryResponseDto): OrderAdminItem {
  const orderType = ORDER_TYPE_LABELS[dto.orderType]
  return {
    id: dto.id,
    productName: `Đơn ${orderType === 'card' ? 'thẻ' : orderType === 'playtime' ? 'vé giờ chơi' : 'phụ kiện'}`,
    supplierName: dto.customerNameMasked,
    totalAmount: dto.totalAmount,
    status: mapAdminOrderStatus(dto.orderType, dto.status),
    createdAt: dto.createdAt,
    orderType,
  }
}

function filterByKeywordStatus<T extends { status: string }>(
  items: T[], params: JGameAdminListParams | undefined, getKeywordFields: (item: T) => string[]
): T[] {
  const keyword = params?.keyword?.trim().toLowerCase()
  return items.filter(item => {
    const matchStatus = !params?.status || params.status === 'all' || item.status === params.status
    const matchKeyword = !keyword || getKeywordFields(item).some(f => f.toLowerCase().includes(keyword))
    return matchStatus && matchKeyword
  })
}

export class JGameApiServiceAdmin {
  private static readonly BASE_PATH = '/api/admin/jgame'

  // ===== Danh mục thẻ & mệnh giá =====
  // BE (GetCards) hỗ trợ filter `keyword` server-side, KHÔNG hỗ trợ `status` — lọc status còn lại ở
  // FE sau khi nhận dữ liệu (keyword đã lọc server-side nên KHÔNG lọc lại ở đây, tránh double-filter).
  static async getCards(params?: JGameAdminListParams): Promise<ApiResponse<CardProductAdmin[]>> {
    const url = buildJGameUrlWithParams(`${this.BASE_PATH}/cards`, params?.keyword ? { keyword: params.keyword } : undefined)
    const response = await apiCall(url, { method: 'GET' })
    const result: ApiResponse<CardProductAdmin[]> = await response.json()
    if (!result.success || !result.data || !params?.status || params.status === 'all') return result
    return { ...result, data: result.data.filter(p => p.status === params.status) }
  }

  static async createCard(data: CardProductFormPayload): Promise<ApiResponse<CardProductAdmin>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/cards`), { method: 'POST', body: JSON.stringify(data) })
    return response.json()
  }

  static async updateCard(data: CardProductFormPayload): Promise<ApiResponse<CardProductAdmin>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/cards`), { method: 'PUT', body: JSON.stringify(data) })
    return response.json()
  }

  static async deleteCard(id: string): Promise<ApiResponse<boolean>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/cards/${id}`), { method: 'DELETE' })
    return response.json()
  }

  // ===== NCC & routing =====
  // BE (GetSuppliers) hỗ trợ filter `keyword` server-side, KHÔNG hỗ trợ `status` — cùng cách xử lý
  // như getCards() ở trên.
  static async getSuppliers(params?: JGameAdminListParams): Promise<ApiResponse<SupplierAdmin[]>> {
    const url = buildJGameUrlWithParams(`${this.BASE_PATH}/suppliers`, params?.keyword ? { keyword: params.keyword } : undefined)
    const response = await apiCall(url, { method: 'GET' })
    const result: ApiResponse<SupplierAdmin[]> = await response.json()
    if (!result.success || !result.data || !params?.status || params.status === 'all') return result
    return { ...result, data: result.data.filter(s => s.status === params.status) }
  }

  static async createSupplier(data: SupplierFormPayload): Promise<ApiResponse<SupplierAdmin>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/suppliers`), { method: 'POST', body: JSON.stringify(data) })
    return response.json()
  }

  static async updateSupplier(data: SupplierFormPayload): Promise<ApiResponse<SupplierAdmin>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/suppliers`), { method: 'PUT', body: JSON.stringify(data) })
    return response.json()
  }

  static async deleteSupplier(id: string): Promise<ApiResponse<boolean>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/suppliers/${id}`), { method: 'DELETE' })
    return response.json()
  }

  // ===== Giao dịch =====
  /** GET /api/admin/orders (path PHẲNG, không có `/jgame` — 1 trong 3 endpoint admin đã build thật, khác
   * các method CRUD khác trong file này vẫn còn dùng `${BASE_PATH}/...` vì BE chưa scaffold).
   * BE trả gộp cả 3 domain (`AdminOrderSummaryResponse[]`), không hỗ trợ filter theo keyword như mock
   * → lọc keyword ở phía FE sau khi nhận dữ liệu, giữ đúng hành vi cũ. */
  static async getOrders(params?: JGameAdminListParams): Promise<ApiResponse<OrderAdminItem[]>> {
    const response = await apiCall(buildJGameUrl('/api/admin/orders'), { method: 'GET' })
    const result = await response.json() as ApiResponse<AdminOrderSummaryResponseDto[]>
    if (!result.success || !result.data) return result as unknown as ApiResponse<OrderAdminItem[]>
    const mapped = result.data.map(mapAdminOrderSummary)
    const keyword = params?.keyword?.trim().toLowerCase()
    const filtered = keyword
      ? mapped.filter(o => o.id.toLowerCase().includes(keyword) || o.productName.toLowerCase().includes(keyword) || o.supplierName.toLowerCase().includes(keyword))
      : mapped
    return { ...result, data: filtered }
  }

  /** GET /api/admin/dashboard — 1 trong 3 endpoint admin đã build thật. Website hiện CHƯA gọi endpoint này
   * (trang Tổng quan tự gộp dữ liệu từ getOrders/getSuppliers/getReferralPartners/getPromotions/getRevenueReport
   * — xem useAdminDashboard.page.fetchData.ts), nên method này khai báo sẵn cho lần dùng sau, chưa wiring vào hook
   * để tránh phải viết lại UI trang Tổng quan (shape 2 bên khác hẳn nhau). */
  static async getDashboard(): Promise<ApiResponse<AdminDashboardSummary>> {
    const response = await apiCall(buildJGameUrl('/api/admin/dashboard'), { method: 'GET' })
    return response.json()
  }

  /**
   * Xử lý thủ công 1 giao dịch (FR liên quan mục 12) — hoàn tiền hoặc cấp lại mã.
   * BE CHƯA có endpoint `${BASE_PATH}/orders/{id}/resolve` (nằm ngoài phạm vi
   * 20260902-nc_admin-crud-that-thay-mock.md — việc này đụng business logic từng domain đơn hàng
   * (CardOrderService/PlaytimeOrderService/AccessoryOrderService), không phải CRUD danh mục đơn
   * thuần) — vẫn giữ mock có chủ đích, giống cách CRUD đối tác Referral đang làm.
   */
  static async manualResolveOrder(id: string, action: 'refund' | 'reissue'): Promise<ApiResponse<boolean>> {
    const order = orders.find(o => o.id === id)
    if (!order) return mockApiError('Không tìm thấy đơn hàng')
    order.status = action === 'refund' ? 'REFUNDED' : 'SUCCESS'
    return mockApiCall(() => true)
  }

  // ===== Đối tác Referral (quản trị TOÀN BỘ đối tác) =====
  /** GET /api/admin/referral/partners — nối dây `AdminService.GetAllAffiliatePartnersAsync` có sẵn
   * (20260901-nc_doi-tac-tiep-thi-nang-cap.md mục 3.3), path PHẲNG `/api/admin/referral/...`
   * (khác `${BASE_PATH}` = `/api/admin/jgame` dùng cho CRUD danh mục cards/suppliers/promotions/
   * accessories ở file này). BE không hỗ trợ filter keyword/status server-side (giống pattern
   * getOrders) → lọc phía FE sau khi nhận dữ liệu. */
  static async getReferralPartners(params?: JGameAdminListParams): Promise<ApiResponse<ReferralPartnerAdmin[]>> {
    const response = await apiCall(buildJGameUrl('/api/admin/referral/partners'), { method: 'GET' })
    const result: ApiResponse<ReferralPartnerAdmin[]> = await response.json()
    if (!result.success || !result.data) return result
    return { ...result, data: filterByKeywordStatus(result.data, params, p => [p.name, p.referralCode]) }
  }

  /**
   * BE (nc_ mục 3.3) CHỈ nối dây API ĐỌC danh sách đối tác (`GET /api/admin/referral/partners`) —
   * KHÔNG có endpoint tạo/sửa/xoá đối tác từ phía Admin (AdminService chỉ có GetAllAffiliatePartnersAsync,
   * không có Create/Update/Delete tương ứng). Giữ nguyên mock cho 3 method dưới đây — deviation có chủ đích,
   * không suy diễn thêm endpoint ngoài tài liệu.
   */
  static async createReferralPartner(data: ReferralPartnerFormPayload): Promise<ApiResponse<ReferralPartnerAdmin>> {
    const created: ReferralPartnerAdmin = { id: `ref-${Date.now()}`, totalOrders: 0, refundRatePercent: 0, ...data }
    referralPartners.unshift(created)
    return mockApiCall(() => created)
  }

  static async updateReferralPartner(data: ReferralPartnerFormPayload): Promise<ApiResponse<ReferralPartnerAdmin>> {
    const found = referralPartners.find(p => p.id === data.id)
    if (!found) return mockApiError('Không tìm thấy đối tác')
    Object.assign(found, data)
    return mockApiCall(() => found)
  }

  static async deleteReferralPartner(id: string): Promise<ApiResponse<boolean>> {
    const idx = referralPartners.findIndex(p => p.id === id)
    if (idx === -1) return mockApiError('Không tìm thấy đối tác')
    referralPartners.splice(idx, 1)
    return mockApiCall(() => true)
  }

  /** GET /api/admin/referral/transactions — mở rộng `AdminService.GetAllReferralTransactionsAsync`
   * nhận filter (khoảng thời gian/đối tác/loại/trạng thái). */
  static async getReferralTransactions(params?: ReferralTransactionAdminListParams): Promise<ApiResponse<ReferralTransactionAdmin[]>> {
    const realParams: Record<string, unknown> = {}
    if (params?.from) realParams.from = params.from
    if (params?.to) realParams.to = params.to
    if (params?.partnerId) realParams.partnerId = params.partnerId
    if (params?.category && params.category !== 'all') realParams.category = toCommissionCategoryInt(params.category)
    if (params?.status && params.status !== 'all') realParams.status = RECONCILE_STATUS_MAP.indexOf(params.status)
    const url = buildJGameUrlWithParams('/api/admin/referral/transactions', realParams)
    const response = await apiCall(url, { method: 'GET' })
    const result: ApiResponse<ReferralTransactionAdmin[]> = await response.json()
    if (result.success && result.data) result.data = result.data.map(normalizeReferralTransaction)
    return result
  }

  // ===== Thanh toán hoa hồng (duyệt/từ chối/đánh dấu đã trả) =====
  static async getReferralPayouts(status?: ReferralPayoutAdmin['status'] | 'all'): Promise<ApiResponse<ReferralPayoutAdmin[]>> {
    const url = buildJGameUrlWithParams(
      '/api/admin/referral/payouts',
      status && status !== 'all' ? { status: REFERRAL_PAYOUT_STATUS_MAP.indexOf(status) } : undefined,
    )
    const response = await apiCall(url, { method: 'GET' })
    const result: ApiResponse<ReferralPayoutAdmin[]> = await response.json()
    if (result.success && result.data) result.data = result.data.map(normalizeReferralPayout)
    return result
  }

  static async approveReferralPayout(id: string): Promise<ApiResponse<ReferralPayoutAdmin>> {
    const response = await apiCall(buildJGameUrl(`/api/admin/referral/payouts/${id}/approve`), { method: 'POST' })
    const result: ApiResponse<ReferralPayoutAdmin> = await response.json()
    if (result.success && result.data) result.data = normalizeReferralPayout(result.data)
    return result
  }

  static async rejectReferralPayout(id: string, reason: string): Promise<ApiResponse<ReferralPayoutAdmin>> {
    const response = await apiCall(buildJGameUrl(`/api/admin/referral/payouts/${id}/reject`), { method: 'POST', body: JSON.stringify({ reason }) })
    const result: ApiResponse<ReferralPayoutAdmin> = await response.json()
    if (result.success && result.data) result.data = normalizeReferralPayout(result.data)
    return result
  }

  static async markReferralPayoutPaid(id: string): Promise<ApiResponse<ReferralPayoutAdmin>> {
    const response = await apiCall(buildJGameUrl(`/api/admin/referral/payouts/${id}/mark-paid`), { method: 'POST' })
    const result: ApiResponse<ReferralPayoutAdmin> = await response.json()
    if (result.success && result.data) result.data = normalizeReferralPayout(result.data)
    return result
  }

  // ===== Cấu hình tỷ lệ hoa hồng theo loại =====
  static async getCommissionRates(): Promise<ApiResponse<{ rates: ReferralCommissionRateAdmin[]; history: ReferralCommissionRateHistoryAdmin[] }>> {
    const response = await apiCall(buildJGameUrl('/api/admin/referral/commission-rates'), { method: 'GET' })
    const result: ApiResponse<{ rates: ReferralCommissionRateAdmin[]; history: ReferralCommissionRateHistoryAdmin[] }> = await response.json()
    if (result.success && result.data) {
      result.data = {
        rates: result.data.rates.map(normalizeCommissionRate),
        history: result.data.history.map(normalizeCommissionRateHistory),
      }
    }
    return result
  }

  static async updateCommissionRate(category: ReferralCommissionCategory, ratePercent: number): Promise<ApiResponse<ReferralCommissionRateAdmin>> {
    const response = await apiCall(
      buildJGameUrl(`/api/admin/referral/commission-rates/${toCommissionCategoryInt(category)}`),
      { method: 'PUT', body: JSON.stringify({ ratePercent }) },
    )
    const result: ApiResponse<ReferralCommissionRateAdmin> = await response.json()
    if (result.success && result.data) result.data = normalizeCommissionRate(result.data)
    return result
  }

  // ===== Báo cáo tổng hợp referral =====
  static async getReferralReportSummary(params?: ReferralReportFilterParams): Promise<ApiResponse<ReferralReportSummaryAdmin>> {
    const realParams: Record<string, unknown> = {}
    if (params?.from) realParams.from = params.from
    if (params?.to) realParams.to = params.to
    if (params?.partnerId) realParams.partnerId = params.partnerId
    if (params?.category && params.category !== 'all') realParams.category = toCommissionCategoryInt(params.category)
    const url = buildJGameUrlWithParams('/api/admin/referral/reports/summary', realParams)
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }

  // ===== Khuyến mãi/voucher =====
  // BE (GetPromotions) hỗ trợ filter `keyword` (theo mã) server-side, KHÔNG hỗ trợ `status`.
  static async getPromotions(params?: JGameAdminListParams): Promise<ApiResponse<PromotionAdmin[]>> {
    const url = buildJGameUrlWithParams(`${this.BASE_PATH}/promotions`, params?.keyword ? { keyword: params.keyword } : undefined)
    const response = await apiCall(url, { method: 'GET' })
    const result: ApiResponse<PromotionAdmin[]> = await response.json()
    if (!result.success || !result.data || !params?.status || params.status === 'all') return result
    return { ...result, data: result.data.filter(p => p.status === params.status) }
  }

  static async createPromotion(data: PromotionFormPayload): Promise<ApiResponse<PromotionAdmin>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/promotions`), { method: 'POST', body: JSON.stringify(data) })
    return response.json()
  }

  static async updatePromotion(data: PromotionFormPayload): Promise<ApiResponse<PromotionAdmin>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/promotions`), { method: 'PUT', body: JSON.stringify(data) })
    return response.json()
  }

  static async deletePromotion(id: string): Promise<ApiResponse<boolean>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/promotions/${id}`), { method: 'DELETE' })
    return response.json()
  }

  // ===== Báo cáo doanh thu & đối soát =====
  /** GET /api/admin/reports/revenue — 1 trong 3 endpoint admin đã build thật, path PHẲNG.
   *
   * QUYẾT ĐỊNH (nc_ mục 4 Bước 7): BE chỉ làm bản báo cáo THEO NGÀY (`{date, revenue}`), KHÔNG có bản
   * theo NCC như mock cũ (`RevenueReportRow` có supplierName/totalOrders/successOrders/failedOrders/failRatePercent).
   * Đây là 2 báo cáo khác bản chất — sửa UI hẳn sang hiển thị theo ngày là việc lớn, NGOÀI PHẠM VI bước này.
   * Ưu tiên không vỡ build: map tạm `date` → `supplierName` (cột đầu bảng hiện tại), `revenue` → `gmv`,
   * các field còn lại (totalOrders/successOrders/failedOrders/failRatePercent) = 0 vì BE không trả.
   * TODO (bước sau): đổi UI trang Báo cáo (`reports/`) sang bảng theo ngày thay vì theo NCC. */
  static async getRevenueReport(): Promise<ApiResponse<RevenueReportRow[]>> {
    const response = await apiCall(buildJGameUrl('/api/admin/reports/revenue'), { method: 'GET' })
    const result = await response.json() as ApiResponse<AdminRevenueByDayResponseDto[]>
    if (!result.success || !result.data) return result as unknown as ApiResponse<RevenueReportRow[]>
    const mapped: RevenueReportRow[] = result.data.map(row => ({
      supplierName: row.date,
      totalOrders: 0,
      successOrders: 0,
      failedOrders: 0,
      gmv: row.revenue,
      failRatePercent: 0,
    }))
    return { ...result, data: mapped }
  }

  // ===== Phụ kiện Gamer (hãng sản xuất/nhóm sản phẩm/chi tiết sản phẩm) =====
  // BE (GetAccessories) hỗ trợ filter keyword/category/brand server-side đầy đủ — không cần lọc lại ở FE.
  static async getAccessories(params?: AccessoryAdminListParams): Promise<ApiResponse<AccessoryAdmin[]>> {
    const query: Record<string, unknown> = {}
    if (params?.keyword) query.keyword = params.keyword
    if (params?.category && params.category !== 'all') query.category = params.category
    const url = buildJGameUrlWithParams(`${this.BASE_PATH}/accessories`, Object.keys(query).length > 0 ? query : undefined)
    const response = await apiCall(url, { method: 'GET' })
    const result: ApiResponse<AccessoryAdmin[]> = await response.json()
    if (!result.success || !result.data || !params?.status || params.status === 'all') return result
    return { ...result, data: result.data.filter(p => p.status === params.status) }
  }

  static async getAccessoryById(id: string): Promise<ApiResponse<AccessoryAdmin | null>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/accessories/${id}`), { method: 'GET' })
    return response.json()
  }

  /** Danh sách hãng sản xuất đã khai báo — dùng để gợi ý khi thêm/sửa sản phẩm. */
  static async getAccessoryBrands(): Promise<ApiResponse<string[]>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/accessories/brands`), { method: 'GET' })
    return response.json()
  }

  static async createAccessory(data: AccessoryFormPayload): Promise<ApiResponse<AccessoryAdmin>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/accessories`), { method: 'POST', body: JSON.stringify(data) })
    return response.json()
  }

  static async updateAccessory(data: AccessoryFormPayload): Promise<ApiResponse<AccessoryAdmin>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/accessories`), { method: 'PUT', body: JSON.stringify(data) })
    return response.json()
  }

  static async deleteAccessory(id: string): Promise<ApiResponse<boolean>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/accessories/${id}`), { method: 'DELETE' })
    return response.json()
  }
}
