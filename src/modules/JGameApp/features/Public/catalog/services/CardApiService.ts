/**
 * CardApiService — Danh mục thẻ game (URD mục 18.1).
 * Qua gate mock (JGAME_USE_MOCK) — khi có BE thật, xoá nhánh mock, giữ nhánh apiCall.
 */
import { apiCall, buildJGameUrl, buildJGameUrlWithParams, JGAME_USE_MOCK, mockApiCall, mockApiError, type ApiResponse } from '../../../../shared/services/api'
import { MOCK_CARD_PRODUCTS, findProductById } from '../../../../mocks/cardProducts.mock'
import type { CardProduct, CardProductListParams } from '../types/card.types'

export class CardApiService {
  private static readonly BASE_PATH = '/api/catalog'

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
    const url = buildJGameUrlWithParams(`${this.BASE_PATH}/products`, params as Record<string, unknown> | undefined)
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }

  static async getCardProductDetail(productId: string): Promise<ApiResponse<CardProduct>> {
    if (JGAME_USE_MOCK) {
      const product = findProductById(productId)
      if (!product) return mockApiError('Không tìm thấy loại thẻ')
      return mockApiCall(() => product)
    }
    const url = buildJGameUrl(`${this.BASE_PATH}/products/${productId}`)
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }
}
