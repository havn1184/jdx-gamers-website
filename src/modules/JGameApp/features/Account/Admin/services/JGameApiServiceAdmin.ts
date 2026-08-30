/**
 * JGameApiServiceAdmin — Khu Quản trị JGame (chuyển từ AdminApp về JGameApp — website độc lập).
 *
 * BE thật CHƯA CÓ — toàn bộ qua gate mock dùng chung với storefront (`JGAME_USE_MOCK`,
 * xem `shared/services/api/mockGate.ts`). Khi có BE thật: xoá nhánh mock, giữ nhánh apiCall.
 */
import { apiCall, buildJGameUrl, JGAME_USE_MOCK, mockApiCall, mockApiError, type ApiResponse } from '../../../../shared/services/api'
import {
  cardProducts, suppliers, orders, referralPartners, promotions, accessories, buildRevenueReport,
} from './jgame.mockdata'
import type {
  CardProductAdmin, CardProductFormPayload, SupplierAdmin, SupplierFormPayload,
  OrderAdminItem, ReferralPartnerAdmin, ReferralPartnerFormPayload,
  PromotionAdmin, PromotionFormPayload, RevenueReportRow, JGameAdminListParams,
  AccessoryAdmin, AccessoryFormPayload, AccessoryAdminListParams,
  AdminOrderStatus, AdminOrderType, AdminDashboardSummary,
} from '../types/jgame.types'

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
  static async getCards(params?: JGameAdminListParams): Promise<ApiResponse<CardProductAdmin[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => filterByKeywordStatus(cardProducts, params, p => [p.name, p.supplierName]))
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/cards`), { method: 'GET' })
    return response.json()
  }

  static async createCard(data: CardProductFormPayload): Promise<ApiResponse<CardProductAdmin>> {
    if (JGAME_USE_MOCK) {
      const supplier = suppliers.find(s => s.id === data.supplierId)
      const created: CardProductAdmin = {
        id: `card-${Date.now()}`, name: data.name, category: data.category,
        supplierId: data.supplierId, supplierName: supplier?.name || '', status: data.status, denominations: [],
      }
      cardProducts.unshift(created)
      return mockApiCall(() => created)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/cards`), { method: 'POST', body: JSON.stringify(data) })
    return response.json()
  }

  static async updateCard(data: CardProductFormPayload): Promise<ApiResponse<CardProductAdmin>> {
    if (JGAME_USE_MOCK) {
      const found = cardProducts.find(p => p.id === data.id)
      if (!found) return mockApiError('Không tìm thấy loại thẻ')
      const supplier = suppliers.find(s => s.id === data.supplierId)
      Object.assign(found, { name: data.name, category: data.category, supplierId: data.supplierId, supplierName: supplier?.name || found.supplierName, status: data.status })
      return mockApiCall(() => found)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/cards`), { method: 'PUT', body: JSON.stringify(data) })
    return response.json()
  }

  static async deleteCard(id: string): Promise<ApiResponse<boolean>> {
    if (JGAME_USE_MOCK) {
      const idx = cardProducts.findIndex(p => p.id === id)
      if (idx === -1) return mockApiError('Không tìm thấy loại thẻ')
      cardProducts.splice(idx, 1)
      return mockApiCall(() => true)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/cards/${id}`), { method: 'DELETE' })
    return response.json()
  }

  // ===== NCC & routing =====
  static async getSuppliers(params?: JGameAdminListParams): Promise<ApiResponse<SupplierAdmin[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => filterByKeywordStatus(suppliers, params, s => [s.name]))
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/suppliers`), { method: 'GET' })
    return response.json()
  }

  static async createSupplier(data: SupplierFormPayload): Promise<ApiResponse<SupplierAdmin>> {
    if (JGAME_USE_MOCK) {
      const created: SupplierAdmin = { id: `sup-${Date.now()}`, ...data }
      suppliers.unshift(created)
      return mockApiCall(() => created)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/suppliers`), { method: 'POST', body: JSON.stringify(data) })
    return response.json()
  }

  static async updateSupplier(data: SupplierFormPayload): Promise<ApiResponse<SupplierAdmin>> {
    if (JGAME_USE_MOCK) {
      const found = suppliers.find(s => s.id === data.id)
      if (!found) return mockApiError('Không tìm thấy NCC')
      Object.assign(found, data)
      return mockApiCall(() => found)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/suppliers`), { method: 'PUT', body: JSON.stringify(data) })
    return response.json()
  }

  static async deleteSupplier(id: string): Promise<ApiResponse<boolean>> {
    if (JGAME_USE_MOCK) {
      const idx = suppliers.findIndex(s => s.id === id)
      if (idx === -1) return mockApiError('Không tìm thấy NCC')
      suppliers.splice(idx, 1)
      return mockApiCall(() => true)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/suppliers/${id}`), { method: 'DELETE' })
    return response.json()
  }

  // ===== Giao dịch =====
  /** GET /api/admin/orders (path PHẲNG, không có `/jgame` — 1 trong 3 endpoint admin đã build thật, khác
   * các method CRUD khác trong file này vẫn còn dùng `${BASE_PATH}/...` vì BE chưa scaffold).
   * BE trả gộp cả 3 domain (`AdminOrderSummaryResponse[]`), không hỗ trợ filter theo keyword như mock
   * → lọc keyword ở phía FE sau khi nhận dữ liệu, giữ đúng hành vi cũ. */
  static async getOrders(params?: JGameAdminListParams): Promise<ApiResponse<OrderAdminItem[]>> {
    if (JGAME_USE_MOCK) {
      const keyword = params?.keyword?.trim().toLowerCase()
      const filtered = orders.filter(o => !keyword || o.id.toLowerCase().includes(keyword) || o.productName.toLowerCase().includes(keyword))
      return mockApiCall(() => filtered)
    }
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
    if (JGAME_USE_MOCK) {
      return mockApiCall(() => {
        const report = buildRevenueReport()
        const gmv = report.reduce((sum, r) => sum + r.gmv, 0)
        const totalOrders = report.reduce((sum, r) => sum + r.totalOrders, 0)
        const successOrders = report.reduce((sum, r) => sum + r.successOrders, 0)
        const rate = totalOrders ? successOrders / totalOrders : 0
        return { gmvToday: gmv, gmvMonth: gmv, ordersToday: totalOrders, cardOrderSuccessRate: rate, playtimeOrderSuccessRate: rate, accessoryOrderSuccessRate: rate }
      })
    }
    const response = await apiCall(buildJGameUrl('/api/admin/dashboard'), { method: 'GET' })
    return response.json()
  }

  /** Xử lý thủ công 1 giao dịch (FR liên quan mục 12) — hoàn tiền hoặc cấp lại mã. */
  static async manualResolveOrder(id: string, action: 'refund' | 'reissue'): Promise<ApiResponse<boolean>> {
    if (JGAME_USE_MOCK) {
      const order = orders.find(o => o.id === id)
      if (!order) return mockApiError('Không tìm thấy đơn hàng')
      order.status = action === 'refund' ? 'REFUNDED' : 'SUCCESS'
      return mockApiCall(() => true)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/orders/${id}/resolve`), { method: 'POST', body: JSON.stringify({ action }) })
    return response.json()
  }

  // ===== Đối tác Referral (quản trị TOÀN BỘ đối tác) =====
  static async getReferralPartners(params?: JGameAdminListParams): Promise<ApiResponse<ReferralPartnerAdmin[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => filterByKeywordStatus(referralPartners, params, p => [p.name, p.referralCode]))
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/referral-partners`), { method: 'GET' })
    return response.json()
  }

  static async createReferralPartner(data: ReferralPartnerFormPayload): Promise<ApiResponse<ReferralPartnerAdmin>> {
    if (JGAME_USE_MOCK) {
      const created: ReferralPartnerAdmin = { id: `ref-${Date.now()}`, totalOrders: 0, refundRatePercent: 0, ...data }
      referralPartners.unshift(created)
      return mockApiCall(() => created)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/referral-partners`), { method: 'POST', body: JSON.stringify(data) })
    return response.json()
  }

  static async updateReferralPartner(data: ReferralPartnerFormPayload): Promise<ApiResponse<ReferralPartnerAdmin>> {
    if (JGAME_USE_MOCK) {
      const found = referralPartners.find(p => p.id === data.id)
      if (!found) return mockApiError('Không tìm thấy đối tác')
      Object.assign(found, data)
      return mockApiCall(() => found)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/referral-partners`), { method: 'PUT', body: JSON.stringify(data) })
    return response.json()
  }

  static async deleteReferralPartner(id: string): Promise<ApiResponse<boolean>> {
    if (JGAME_USE_MOCK) {
      const idx = referralPartners.findIndex(p => p.id === id)
      if (idx === -1) return mockApiError('Không tìm thấy đối tác')
      referralPartners.splice(idx, 1)
      return mockApiCall(() => true)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/referral-partners/${id}`), { method: 'DELETE' })
    return response.json()
  }

  // ===== Khuyến mãi/voucher =====
  static async getPromotions(params?: JGameAdminListParams): Promise<ApiResponse<PromotionAdmin[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => filterByKeywordStatus(promotions, params, p => [p.code]))
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/promotions`), { method: 'GET' })
    return response.json()
  }

  static async createPromotion(data: PromotionFormPayload): Promise<ApiResponse<PromotionAdmin>> {
    if (JGAME_USE_MOCK) {
      const created: PromotionAdmin = { id: `promo-${Date.now()}`, ...data }
      promotions.unshift(created)
      return mockApiCall(() => created)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/promotions`), { method: 'POST', body: JSON.stringify(data) })
    return response.json()
  }

  static async updatePromotion(data: PromotionFormPayload): Promise<ApiResponse<PromotionAdmin>> {
    if (JGAME_USE_MOCK) {
      const found = promotions.find(p => p.id === data.id)
      if (!found) return mockApiError('Không tìm thấy chương trình khuyến mãi')
      Object.assign(found, data)
      return mockApiCall(() => found)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/promotions`), { method: 'PUT', body: JSON.stringify(data) })
    return response.json()
  }

  static async deletePromotion(id: string): Promise<ApiResponse<boolean>> {
    if (JGAME_USE_MOCK) {
      const idx = promotions.findIndex(p => p.id === id)
      if (idx === -1) return mockApiError('Không tìm thấy chương trình khuyến mãi')
      promotions.splice(idx, 1)
      return mockApiCall(() => true)
    }
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
    if (JGAME_USE_MOCK) return mockApiCall(() => buildRevenueReport())
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
  static async getAccessories(params?: AccessoryAdminListParams): Promise<ApiResponse<AccessoryAdmin[]>> {
    if (JGAME_USE_MOCK) {
      return mockApiCall(() => {
        const filtered = filterByKeywordStatus(accessories, params, p => [p.name, p.brand])
        return !params?.category || params.category === 'all' ? filtered : filtered.filter(p => p.category === params.category)
      })
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/accessories`), { method: 'GET' })
    return response.json()
  }

  static async getAccessoryById(id: string): Promise<ApiResponse<AccessoryAdmin | null>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => accessories.find(p => p.id === id) || null)
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/accessories/${id}`), { method: 'GET' })
    return response.json()
  }

  /** Danh sách hãng sản xuất đã khai báo — dùng để gợi ý khi thêm/sửa sản phẩm. */
  static async getAccessoryBrands(): Promise<ApiResponse<string[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => Array.from(new Set(accessories.map(p => p.brand))).sort())
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/accessories/brands`), { method: 'GET' })
    return response.json()
  }

  static async createAccessory(data: AccessoryFormPayload): Promise<ApiResponse<AccessoryAdmin>> {
    if (JGAME_USE_MOCK) {
      const created: AccessoryAdmin = { id: `acc-${Date.now()}`, ...data, imageUrl: data.galleryImages[0] || '' }
      accessories.unshift(created)
      return mockApiCall(() => created)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/accessories`), { method: 'POST', body: JSON.stringify(data) })
    return response.json()
  }

  static async updateAccessory(data: AccessoryFormPayload): Promise<ApiResponse<AccessoryAdmin>> {
    if (JGAME_USE_MOCK) {
      const found = accessories.find(p => p.id === data.id)
      if (!found) return mockApiError('Không tìm thấy sản phẩm')
      Object.assign(found, data, { imageUrl: data.galleryImages[0] || '' })
      return mockApiCall(() => found)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/accessories`), { method: 'PUT', body: JSON.stringify(data) })
    return response.json()
  }

  static async deleteAccessory(id: string): Promise<ApiResponse<boolean>> {
    if (JGAME_USE_MOCK) {
      const idx = accessories.findIndex(p => p.id === id)
      if (idx === -1) return mockApiError('Không tìm thấy sản phẩm')
      accessories.splice(idx, 1)
      return mockApiCall(() => true)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/accessories/${id}`), { method: 'DELETE' })
    return response.json()
  }
}
