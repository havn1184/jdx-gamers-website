/**
 * AccessoryApiService — Kho phụ kiện Gamer (Giai đoạn 3 — URD mục 8).
 * Qua gate mock (JGAME_USE_MOCK). Khi có BE thật: xoá nhánh mock, giữ nhánh apiCall.
 */
import { apiCall, buildJGameUrl, buildJGameUrlWithParams, JGAME_USE_MOCK, mockApiCall, mockApiError, TokenManager, type ApiResponse } from '../../../../shared/services/api'
import { MOCK_ACCESSORY_PRODUCTS, MOCK_SHIPPING_METHODS, MOCK_ACCESSORY_BRANDS, findAccessoryById } from '../../../../mocks/accessories.mock'
import { createMockAccessoryOrder, getMockAccessoryOrder, listMockAccessoryOrdersByUser } from '../../../../mocks/accessoryOrders.store'
import type {
  AccessoryProduct, AccessoryListParams, ShippingMethod, AccessoryOrder, CreateAccessoryOrderPayload,
} from '../types/accessory.types'

function getMockUserId(): string {
  return TokenManager.getUserId() || 'demo-user'
}

export class AccessoryApiService {
  private static readonly BASE_PATH = '/api/accessories'
  /** Path App-style: /api/orders/accessory (không phải /api/accessories/orders). */
  private static readonly ORDERS_PATH = '/api/orders/accessory'

  static async getProducts(params?: AccessoryListParams): Promise<ApiResponse<AccessoryProduct[]>> {
    if (JGAME_USE_MOCK) {
      return mockApiCall(() => {
        const keyword = params?.keyword?.trim().toLowerCase()
        return MOCK_ACCESSORY_PRODUCTS.filter(p => {
          const matchCategory = !params?.category || params.category === 'all' || p.category === params.category
          const matchBrand = !params?.brand || params.brand === 'all' || p.brand === params.brand
          const matchKeyword = !keyword || p.name.toLowerCase().includes(keyword) || p.brand.toLowerCase().includes(keyword)
          return p.status === 'active' && matchCategory && matchBrand && matchKeyword
        })
      })
    }
    const url = buildJGameUrlWithParams(this.BASE_PATH, params as Record<string, unknown> | undefined)
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }

  static async getProductDetail(id: string): Promise<ApiResponse<AccessoryProduct>> {
    if (JGAME_USE_MOCK) {
      const product = findAccessoryById(id)
      if (!product) return mockApiError('Không tìm thấy sản phẩm')
      return mockApiCall(() => product)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/${id}`), { method: 'GET' })
    return response.json()
  }

  static async getBrands(): Promise<ApiResponse<string[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => MOCK_ACCESSORY_BRANDS, 100)
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/brands`), { method: 'GET' })
    return response.json()
  }

  static async getShippingMethods(): Promise<ApiResponse<ShippingMethod[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => MOCK_SHIPPING_METHODS, 200)
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/shipping-methods`), { method: 'GET' })
    return response.json()
  }

  static async createOrder(payload: CreateAccessoryOrderPayload): Promise<ApiResponse<AccessoryOrder>> {
    if (JGAME_USE_MOCK) {
      try {
        const order = createMockAccessoryOrder(getMockUserId(), payload.items, payload.shippingAddress, payload.shippingMethodId, payload.payWithJcoin)
        return mockApiCall(() => order, 300)
      } catch (e) {
        return mockApiError((e as Error).message)
      }
    }
    const response = await apiCall(buildJGameUrl(this.ORDERS_PATH), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async getOrderTracking(orderId: string): Promise<ApiResponse<AccessoryOrder>> {
    if (JGAME_USE_MOCK) {
      const order = getMockAccessoryOrder(orderId)
      if (!order) return mockApiError('Không tìm thấy đơn hàng')
      return mockApiCall(() => order, 200)
    }
    const response = await apiCall(buildJGameUrl(`${this.ORDERS_PATH}/${orderId}`), { method: 'GET' })
    return response.json()
  }

  static async getMyOrders(): Promise<ApiResponse<AccessoryOrder[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => listMockAccessoryOrdersByUser(getMockUserId()), 300)
    const response = await apiCall(buildJGameUrl(this.ORDERS_PATH), { method: 'GET' })
    return response.json()
  }
}
