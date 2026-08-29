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
} from '../types/jgame.types'

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
  static async getOrders(params?: JGameAdminListParams): Promise<ApiResponse<OrderAdminItem[]>> {
    if (JGAME_USE_MOCK) {
      const keyword = params?.keyword?.trim().toLowerCase()
      const filtered = orders.filter(o => !keyword || o.id.toLowerCase().includes(keyword) || o.productName.toLowerCase().includes(keyword))
      return mockApiCall(() => filtered)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/orders`), { method: 'GET' })
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
  static async getRevenueReport(): Promise<ApiResponse<RevenueReportRow[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => buildRevenueReport())
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/reports/revenue`), { method: 'GET' })
    return response.json()
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
