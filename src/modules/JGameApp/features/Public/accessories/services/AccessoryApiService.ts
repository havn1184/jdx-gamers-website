/**
 * AccessoryApiService — Kho phụ kiện Gamer (Giai đoạn 3 — URD mục 8).
 */
import { apiCall, buildJGameUrl, buildJGameUrlWithParams, type ApiResponse } from '../../../../shared/services/api'
import type {
  AccessoryProduct, AccessoryListParams, ShippingMethod, AccessoryOrder, CreateAccessoryOrderPayload,
} from '../types/accessory.types'

export class AccessoryApiService {
  private static readonly BASE_PATH = '/api/accessories'
  /** Path App-style: /api/orders/accessory (không phải /api/accessories/orders). */
  private static readonly ORDERS_PATH = '/api/orders/accessory'

  static async getProducts(params?: AccessoryListParams): Promise<ApiResponse<AccessoryProduct[]>> {
    // Sentinel 'all' chỉ có ý nghĩa ở UI/mock — BE nhận category dạng enum số (0-6), gửi thẳng
    // 'all' sẽ bị BE trả 400. Bỏ qua param khi giá trị là 'all' (tương đương "không lọc").
    const realParams: Record<string, unknown> = {}
    if (params?.keyword) realParams.keyword = params.keyword
    if (params?.category && params.category !== 'all') realParams.category = params.category
    if (params?.brand && params.brand !== 'all') realParams.brand = params.brand
    const url = buildJGameUrlWithParams(this.BASE_PATH, realParams)
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }

  static async getProductDetail(id: string): Promise<ApiResponse<AccessoryProduct>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/${id}`), { method: 'GET' })
    return response.json()
  }

  static async getBrands(): Promise<ApiResponse<string[]>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/brands`), { method: 'GET' })
    return response.json()
  }

  static async getShippingMethods(): Promise<ApiResponse<ShippingMethod[]>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/shipping-methods`), { method: 'GET' })
    return response.json()
  }

  static async createOrder(payload: CreateAccessoryOrderPayload): Promise<ApiResponse<AccessoryOrder>> {
    const response = await apiCall(buildJGameUrl(this.ORDERS_PATH), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async getOrderTracking(orderId: string): Promise<ApiResponse<AccessoryOrder>> {
    const response = await apiCall(buildJGameUrl(`${this.ORDERS_PATH}/${orderId}`), { method: 'GET' })
    return response.json()
  }

  static async getMyOrders(): Promise<ApiResponse<AccessoryOrder[]>> {
    const response = await apiCall(buildJGameUrl(this.ORDERS_PATH), { method: 'GET' })
    return response.json()
  }
}
