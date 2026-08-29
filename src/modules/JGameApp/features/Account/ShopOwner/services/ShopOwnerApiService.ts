/**
 * ShopOwnerApiService — Kênh Người Bán (Giai đoạn 2 — URD mục 7): đăng ký gian hàng,
 * quản lý zone/vé, đồng bộ NetBarBox/DoDoNew, đơn hàng đã bán, công nợ & lịch sử thanh toán.
 * Qua gate mock (JGAME_USE_MOCK). Khi có BE thật: xoá nhánh mock, giữ nhánh apiCall.
 */
import { apiCall, buildJGameUrl, JGAME_USE_MOCK, mockApiCall, mockApiError, TokenManager, type ApiResponse } from '../../../../shared/services/api'
import {
  getShopByOwnerId, registerShop, updateShopSyncMode, syncShopNow,
  listZonesByShop, upsertZone, deleteZone, listTicketsByShopRaw, upsertTicket, deleteTicket,
} from '../../../../mocks/playtimeShops.store'
import { listMockPlaytimeOrdersByShop, confirmMockPlaytimeOrderUsed } from '../../../../mocks/playtimeOrders.store'
import { getCurrentPayoutPeriod, getPayoutHistory } from '../../../../mocks/shopPayouts.mock'
import type {
  CybergameShop, PlaytimeZone, PlaytimeTicket, ShopSyncMode, RegisterShopPayload,
  UpsertZonePayload, UpsertTicketPayload, PlaytimeOrder, PlaytimeOrderStatus, ShopPayoutPeriod, ShopDashboardSummary,
} from '../types/shop-owner.types'

function getMockOwnerId(): string {
  return TokenManager.getUserId() || 'demo-user'
}

export class ShopOwnerApiService {
  private static readonly BASE_PATH = '/api/shop-owner'

  static async getMyShop(): Promise<ApiResponse<CybergameShop | null>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => getShopByOwnerId(getMockOwnerId()) || null, 250)
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/shop`), { method: 'GET' })
    return response.json()
  }

  static async registerShop(payload: RegisterShopPayload): Promise<ApiResponse<CybergameShop>> {
    if (JGAME_USE_MOCK) {
      const ownerId = getMockOwnerId()
      if (getShopByOwnerId(ownerId)) return mockApiError('Bạn đã có gian hàng, không thể đăng ký thêm')
      return mockApiCall(() => registerShop(ownerId, payload), 400)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/shop`), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async setSyncMode(syncMode: ShopSyncMode): Promise<ApiResponse<CybergameShop>> {
    if (JGAME_USE_MOCK) {
      const shop = getShopByOwnerId(getMockOwnerId())
      if (!shop) return mockApiError('Bạn chưa có gian hàng')
      return mockApiCall(() => updateShopSyncMode(shop.id, syncMode)!, 250)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/shop/sync-mode`), { method: 'PUT', body: JSON.stringify({ syncMode }) })
    return response.json()
  }

  static async syncNow(): Promise<ApiResponse<PlaytimeTicket[]>> {
    if (JGAME_USE_MOCK) {
      const shop = getShopByOwnerId(getMockOwnerId())
      if (!shop) return mockApiError('Bạn chưa có gian hàng')
      return mockApiCall(() => { syncShopNow(shop.id); return listTicketsByShopRaw(shop.id) }, 900)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/shop/sync-now`), { method: 'POST' })
    return response.json()
  }

  static async getZones(): Promise<ApiResponse<PlaytimeZone[]>> {
    if (JGAME_USE_MOCK) {
      const shop = getShopByOwnerId(getMockOwnerId())
      if (!shop) return mockApiError('Bạn chưa có gian hàng')
      return mockApiCall(() => listZonesByShop(shop.id), 250)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/zones`), { method: 'GET' })
    return response.json()
  }

  static async upsertZone(payload: UpsertZonePayload): Promise<ApiResponse<PlaytimeZone>> {
    if (JGAME_USE_MOCK) {
      const shop = getShopByOwnerId(getMockOwnerId())
      if (!shop) return mockApiError('Bạn chưa có gian hàng')
      return mockApiCall(() => upsertZone(shop.id, payload), 300)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/zones`), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async deleteZone(zoneId: string): Promise<ApiResponse<null>> {
    if (JGAME_USE_MOCK) {
      const shop = getShopByOwnerId(getMockOwnerId())
      if (!shop) return mockApiError('Bạn chưa có gian hàng')
      deleteZone(shop.id, zoneId)
      return mockApiCall(() => null, 250)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/zones/${zoneId}`), { method: 'DELETE' })
    return response.json()
  }

  static async getTickets(): Promise<ApiResponse<PlaytimeTicket[]>> {
    if (JGAME_USE_MOCK) {
      const shop = getShopByOwnerId(getMockOwnerId())
      if (!shop) return mockApiError('Bạn chưa có gian hàng')
      return mockApiCall(() => listTicketsByShopRaw(shop.id), 250)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/tickets`), { method: 'GET' })
    return response.json()
  }

  static async upsertTicket(payload: UpsertTicketPayload): Promise<ApiResponse<PlaytimeTicket>> {
    if (JGAME_USE_MOCK) {
      const shop = getShopByOwnerId(getMockOwnerId())
      if (!shop) return mockApiError('Bạn chưa có gian hàng')
      return mockApiCall(() => upsertTicket(shop.id, payload), 300)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/tickets`), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async deleteTicket(ticketId: string): Promise<ApiResponse<null>> {
    if (JGAME_USE_MOCK) {
      const shop = getShopByOwnerId(getMockOwnerId())
      if (!shop) return mockApiError('Bạn chưa có gian hàng')
      deleteTicket(shop.id, ticketId)
      return mockApiCall(() => null, 250)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/tickets/${ticketId}`), { method: 'DELETE' })
    return response.json()
  }

  static async getShopOrders(status?: PlaytimeOrderStatus | 'all'): Promise<ApiResponse<PlaytimeOrder[]>> {
    if (JGAME_USE_MOCK) {
      const shop = getShopByOwnerId(getMockOwnerId())
      if (!shop) return mockApiError('Bạn chưa có gian hàng')
      return mockApiCall(() => listMockPlaytimeOrdersByShop(shop.id, status), 300)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/orders`), { method: 'GET' })
    return response.json()
  }

  static async confirmTicketUsed(orderId: string): Promise<ApiResponse<PlaytimeOrder>> {
    if (JGAME_USE_MOCK) {
      const shop = getShopByOwnerId(getMockOwnerId())
      if (!shop) return mockApiError('Bạn chưa có gian hàng')
      const order = confirmMockPlaytimeOrderUsed(orderId, shop.id)
      if (!order) return mockApiError('Không thể xác nhận đơn hàng này')
      return mockApiCall(() => order, 250)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/orders/${orderId}/confirm-used`), { method: 'POST' })
    return response.json()
  }

  static async getDashboardSummary(): Promise<ApiResponse<ShopDashboardSummary>> {
    if (JGAME_USE_MOCK) {
      const shop = getShopByOwnerId(getMockOwnerId())
      if (!shop) return mockApiError('Bạn chưa có gian hàng')
      return mockApiCall(() => {
        const orders = listMockPlaytimeOrdersByShop(shop.id)
        const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0)
        const startOfWeek = new Date(Date.now() - 7 * 86400000)
        const revenueSince = (from: Date) => orders.filter(o => ['CONFIRMED', 'USED'].includes(o.status) && new Date(o.createdAt) >= from).reduce((s, o) => s + o.totalAmount, 0)
        const tickets = listTicketsByShopRaw(shop.id)
        const zones = listZonesByShop(shop.id)
        const soldByTicket = new Map<string, number>()
        orders.forEach(o => { if (['CONFIRMED', 'USED'].includes(o.status)) soldByTicket.set(o.ticketId, (soldByTicket.get(o.ticketId) || 0) + o.quantity) })
        const topTickets = [...soldByTicket.entries()]
          .sort((a, b) => b[1] - a[1]).slice(0, 5)
          .map(([ticketId, soldCount]) => {
            const t = tickets.find(x => x.id === ticketId)
            const zoneName = zones.find(z => z.id === t?.zoneId)?.name || ''
            return t ? { ticket: t, zoneName, soldCount } : null
          }).filter((v): v is { ticket: PlaytimeTicket; zoneName: string; soldCount: number } => Boolean(v))
        return {
          todayRevenue: revenueSince(startOfToday),
          weekRevenue: revenueSince(startOfWeek),
          newOrdersCount: orders.filter(o => o.status === 'PAID' || o.status === 'CONFIRMED').length,
          lowSlotTickets: tickets.filter(t => t.status === 'active' && t.availableSlots <= 3 && t.availableSlots > 0),
          topTickets,
        }
      }, 350)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/dashboard`), { method: 'GET' })
    return response.json()
  }

  static async getPayoutSummary(): Promise<ApiResponse<ShopPayoutPeriod>> {
    if (JGAME_USE_MOCK) {
      const shop = getShopByOwnerId(getMockOwnerId())
      if (!shop) return mockApiError('Bạn chưa có gian hàng')
      return mockApiCall(() => getCurrentPayoutPeriod(shop.id), 250)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/payouts/current`), { method: 'GET' })
    return response.json()
  }

  static async getPayoutHistory(): Promise<ApiResponse<ShopPayoutPeriod[]>> {
    if (JGAME_USE_MOCK) {
      const shop = getShopByOwnerId(getMockOwnerId())
      if (!shop) return mockApiError('Bạn chưa có gian hàng')
      return mockApiCall(() => getPayoutHistory(shop.id), 300)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/payouts/history`), { method: 'GET' })
    return response.json()
  }
}
