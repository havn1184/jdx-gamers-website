/**
 * OrderApiService — Đặt hàng, thanh toán, cấp mã thẻ (URD mục 18.3, 18.4).
 * Qua gate mock (JGAME_USE_MOCK) — khi có BE thật, xoá nhánh mock, giữ nhánh apiCall.
 */
import { apiCall, buildJGameUrl, JGAME_USE_MOCK, mockApiCall, mockApiError, TokenManager, type ApiResponse } from '../../../../../shared/services/api'
import {
  createMockOrder, getMockOrder, getMockPayment, getMockCardCode,
  revealMockCardCode, getMockRefund, listMockOrdersByUser,
} from '../../../../../mocks/orders.store'
import type {
  CreateOrderPayload, OrderSummary, PaymentInfo, CardCodeResult, RefundInfo, OrderHistoryFilter,
} from '../types/order.types'

/** Mock chưa có hệ thống user thật — dùng userId cố định theo access token hiện có (demo). */
function getMockUserId(): string {
  return TokenManager.getUserId() || 'demo-user'
}

export class OrderApiService {
  private static readonly BASE_PATH = '/api/orders'

  static async createOrder(payload: CreateOrderPayload): Promise<ApiResponse<OrderSummary>> {
    if (JGAME_USE_MOCK) {
      try {
        const order = createMockOrder(getMockUserId(), payload.denominationId, payload.quantity, payload.referrerCode, undefined, payload.payWithJcoin)
        return mockApiCall(() => order, 300)
      } catch (e) {
        return mockApiError((e as Error).message)
      }
    }
    const url = buildJGameUrl(`${this.BASE_PATH}`)
    const response = await apiCall(url, { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async getPayment(orderId: string): Promise<ApiResponse<PaymentInfo>> {
    if (JGAME_USE_MOCK) {
      const payment = getMockPayment(orderId)
      if (!payment) return mockApiError('Không tìm thấy thông tin thanh toán')
      return mockApiCall(() => payment, 200)
    }
    const url = buildJGameUrl(`${this.BASE_PATH}/${orderId}/payment`)
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }

  /** Polling trạng thái đơn hàng (mô phỏng realtime webhook — mục 6.2, SC-05). */
  static async getOrderStatus(orderId: string): Promise<ApiResponse<OrderSummary>> {
    if (JGAME_USE_MOCK) {
      const order = getMockOrder(orderId)
      if (!order) return mockApiError('Không tìm thấy đơn hàng')
      return mockApiCall(() => order, 150)
    }
    const url = buildJGameUrl(`${this.BASE_PATH}/${orderId}`)
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }

  static async getCardCode(orderId: string): Promise<ApiResponse<CardCodeResult>> {
    if (JGAME_USE_MOCK) {
      const code = getMockCardCode(orderId)
      if (!code) return mockApiError('Mã thẻ chưa sẵn sàng')
      return mockApiCall(() => code, 200)
    }
    const url = buildJGameUrl(`${this.BASE_PATH}/${orderId}/card-code`)
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }

  /** Xem lại đầy đủ mã thẻ — yêu cầu xác thực lại theo cấu hình (mock: luôn cho phép). */
  static async revealCardCode(orderId: string): Promise<ApiResponse<CardCodeResult>> {
    if (JGAME_USE_MOCK) {
      const code = revealMockCardCode(orderId)
      if (!code) return mockApiError('Không thể hiển thị mã thẻ')
      return mockApiCall(() => code, 200)
    }
    const url = buildJGameUrl(`${this.BASE_PATH}/${orderId}/card-code/reveal`)
    const response = await apiCall(url, { method: 'POST' })
    return response.json()
  }

  static async getRefund(orderId: string): Promise<ApiResponse<RefundInfo>> {
    if (JGAME_USE_MOCK) {
      const refund = getMockRefund(orderId)
      if (!refund) return mockApiError('Không có yêu cầu hoàn tiền')
      return mockApiCall(() => refund, 150)
    }
    const url = buildJGameUrl(`${this.BASE_PATH}/${orderId}/refund`)
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }

  static async getMyOrders(filter?: OrderHistoryFilter): Promise<ApiResponse<OrderSummary[]>> {
    if (JGAME_USE_MOCK) {
      return mockApiCall(() => listMockOrdersByUser(getMockUserId(), filter?.status), 350)
    }
    const url = buildJGameUrl(`${this.BASE_PATH}/me`)
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }
}
