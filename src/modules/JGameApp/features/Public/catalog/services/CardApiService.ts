/**
 * CardApiService — Danh mục thẻ game (URD mục 18.1).
 * Qua gate mock (JGAME_USE_MOCK) — khi có BE thật, xoá nhánh mock, giữ nhánh apiCall.
 */
import { apiCall, buildJGameUrl, buildJGameUrlWithParams, JGAME_USE_MOCK, mockApiCall, mockApiError, type ApiResponse } from '../../../../shared/services/api'
import { MOCK_CARD_PRODUCTS, findProductById } from '../../../../mocks/cardProducts.mock'
import type { CardDenomination, CardProduct, CardProductListParams, CardProductStatus } from '../types/card.types'

/**
 * BE (`JGameApi`) giữ chuẩn enum số nguyên (không dùng JsonStringEnumConverter — xem
 * `quyet-dinh-hop-nhat-api.md` mục "Enum — giữ nguyên chuẩn int"), trong khi Website luôn dùng
 * chuỗi ('active'/'game'...) — nên phải tự map số → chuỗi ở tầng service, không đổi UI.
 */
const CATEGORY_BY_INT: Record<number, CardProduct['category']> = { 0: 'game', 1: 'mobile', 2: 'international' }
const STATUS_BY_INT: Record<number, CardProductStatus> = { 0: 'active', 1: 'inactive' }

function mapDenomination(raw: CardDenomination & { status: unknown }): CardDenomination {
  return { ...raw, status: STATUS_BY_INT[raw.status as number] ?? 'active' }
}

function mapProduct(raw: CardProduct & { category: unknown; status: unknown }): CardProduct {
  return {
    ...raw,
    category: CATEGORY_BY_INT[raw.category as number] ?? 'game',
    status: STATUS_BY_INT[raw.status as number] ?? 'active',
    denominations: (raw.denominations ?? []).map(d => mapDenomination(d as CardDenomination & { status: unknown })),
  }
}

export class CardApiService {
  private static readonly BASE_PATH = '/api/card-products'

  static async getCardProducts(params?: CardProductListParams): Promise<ApiResponse<CardProduct[]>> {
    if (JGAME_USE_MOCK) {
      return mockApiCall(() => {
        const keyword = params?.keyword?.trim().toLowerCase()
        return MOCK_CARD_PRODUCTS.filter(p => {
          const matchCategory = !params?.category || params.category === 'all' || p.category === params.category
          const matchKeyword = !keyword || p.name.toLowerCase().includes(keyword) || p.supplierName.toLowerCase().includes(keyword)
          return p.status === 'active' && matchCategory && matchKeyword
        })
      })
    }
    const url = buildJGameUrlWithParams(this.BASE_PATH, params as Record<string, unknown> | undefined)
    const response = await apiCall(url, { method: 'GET' })
    const result: ApiResponse<CardProduct[]> = await response.json()
    if (result.success && result.data) result.data = result.data.map(mapProduct)
    return result
  }

  static async getCardProductDetail(productId: string): Promise<ApiResponse<CardProduct>> {
    if (JGAME_USE_MOCK) {
      const product = findProductById(productId)
      if (!product) return mockApiError('Không tìm thấy loại thẻ')
      return mockApiCall(() => product)
    }
    const url = buildJGameUrl(`${this.BASE_PATH}/${productId}`)
    const response = await apiCall(url, { method: 'GET' })
    const result: ApiResponse<CardProduct> = await response.json()
    if (result.success && result.data) result.data = mapProduct(result.data)
    return result
  }
}
