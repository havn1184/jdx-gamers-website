/**
 * PlaytimeApiService — Chợ vé giờ chơi Cybergame, phía khách hàng (Giai đoạn 2 — URD mục 7).
 * Qua gate mock (JGAME_USE_MOCK). Khi có BE thật: xoá nhánh mock, giữ nhánh apiCall.
 */
import { apiCall, buildJGameUrl, buildJGameUrlWithParams, JGAME_USE_MOCK, mockApiCall, mockApiError, TokenManager, type ApiResponse } from '../../../../shared/services/api'
import {
  listShops, listCities, getShopById, listZonesByShop, listTicketViewsByShop,
  listAllActiveTicketViews, listFlashSaleTicketViews, listFeaturedShops, getTicketViewById,
} from '../../../../mocks/playtimeShops.store'
import { createMockPlaytimeOrder, getMockPlaytimeOrder, getMockPlaytimePayment, expireMockPlaytimeOrder, listMockPlaytimeOrdersByUser } from '../../../../mocks/playtimeOrders.store'
import type {
  CybergameShop, ShopListParams, ShopDetailResult, PlaytimeTicketView, MarketplaceSections,
  CreateTicketOrderPayload, PlaytimeOrder, PlaytimeOrderStatus, ZoneType,
} from '../types/playtime.types'

function getMockUserId(): string {
  return TokenManager.getUserId() || 'demo-user'
}

export class PlaytimeApiService {
  private static readonly BASE_PATH = '/api/playtime'

  static async getMarketplaceSections(): Promise<ApiResponse<MarketplaceSections>> {
    if (JGAME_USE_MOCK) {
      return mockApiCall(() => ({
        flashSale: listFlashSaleTicketViews(),
        featuredShops: listFeaturedShops(),
        allTickets: listAllActiveTicketViews(),
        cities: listCities(),
      }), 350)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/marketplace`), { method: 'GET' })
    return response.json()
  }

  static async getShops(params?: ShopListParams): Promise<ApiResponse<CybergameShop[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => listShops(params), 300)
    const url = buildJGameUrlWithParams(`${this.BASE_PATH}/shops`, params as Record<string, unknown> | undefined)
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }

  static async getShopDetail(shopId: string, zoneType?: ZoneType | 'all'): Promise<ApiResponse<ShopDetailResult>> {
    if (JGAME_USE_MOCK) {
      const shop = getShopById(shopId)
      if (!shop) return mockApiError('Không tìm thấy gian hàng')
      return mockApiCall(() => ({ shop, zones: listZonesByShop(shopId), tickets: listTicketViewsByShop(shopId, zoneType) }), 300)
    }
    const url = buildJGameUrlWithParams(`${this.BASE_PATH}/shops/${shopId}`, { zoneType })
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }

  static async getTicket(ticketId: string): Promise<ApiResponse<PlaytimeTicketView>> {
    if (JGAME_USE_MOCK) {
      const ticket = getTicketViewById(ticketId)
      if (!ticket) return mockApiError('Không tìm thấy vé')
      return mockApiCall(() => ticket, 200)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/tickets/${ticketId}`), { method: 'GET' })
    return response.json()
  }

  static async createOrder(payload: CreateTicketOrderPayload): Promise<ApiResponse<PlaytimeOrder>> {
    if (JGAME_USE_MOCK) {
      try {
        const order = createMockPlaytimeOrder(getMockUserId(), payload.ticketId, payload.quantity, payload.payWithJcoin)
        return mockApiCall(() => order, 300)
      } catch (e) {
        return mockApiError((e as Error).message)
      }
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/orders`), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async getPayment(orderId: string): Promise<ApiResponse<{ orderId: string; qrCode: string; expiredAt: string }>> {
    if (JGAME_USE_MOCK) {
      const payment = getMockPlaytimePayment(orderId)
      if (!payment) return mockApiError('Không tìm thấy thông tin thanh toán')
      return mockApiCall(() => payment, 200)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/orders/${orderId}/payment`), { method: 'GET' })
    return response.json()
  }

  static async getOrderStatus(orderId: string): Promise<ApiResponse<PlaytimeOrder>> {
    if (JGAME_USE_MOCK) {
      const order = getMockPlaytimeOrder(orderId)
      if (!order) return mockApiError('Không tìm thấy đơn hàng')
      return mockApiCall(() => order, 150)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/orders/${orderId}`), { method: 'GET' })
    return response.json()
  }

  /** Gọi khi countdown QR hết hạn mà đơn vẫn PENDING — hoàn lại slot đã giữ chỗ. */
  static async expireOrder(orderId: string): Promise<ApiResponse<null>> {
    if (JGAME_USE_MOCK) {
      expireMockPlaytimeOrder(orderId)
      return mockApiCall(() => null, 100)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/orders/${orderId}/expire`), { method: 'POST' })
    return response.json()
  }

  static async getMyOrders(status?: PlaytimeOrderStatus | 'all'): Promise<ApiResponse<PlaytimeOrder[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => listMockPlaytimeOrdersByUser(getMockUserId(), status), 350)
    const url = buildJGameUrlWithParams(`${this.BASE_PATH}/orders/me`, { status })
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }
}
