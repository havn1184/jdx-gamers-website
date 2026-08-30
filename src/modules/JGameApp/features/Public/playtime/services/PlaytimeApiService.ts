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
  CybergameShop, PlaytimeZone, ShopListParams, ShopDetailResult, PlaytimeTicketView, MarketplaceSections,
  CreateTicketOrderPayload, PlaytimeOrder, PlaytimeOrderStatus, ZoneType, ShopStatus, ShopSyncMode, MockShopArt,
} from '../types/playtime.types'

function getMockUserId(): string {
  return TokenManager.getUserId() || 'demo-user'
}

/**
 * BE (`JGameApi`) giữ chuẩn enum số nguyên (không dùng JsonStringEnumConverter — xem
 * `quyet-dinh-hop-nhat-api.md` mục "Enum — giữ nguyên chuẩn int"), trong khi Website luôn dùng
 * chuỗi ('active'/'standard'/'PENDING'...) — nên phải tự map số → chuỗi ở tầng service, không đổi UI.
 * Đối chiếu `JGameApi.Enums.EntityStatus`/`ShopSyncMode`/`PlaytimeZoneType`/`PlaytimeOrderStatus`.
 */
const STATUS_BY_INT: Record<number, ShopStatus> = { 0: 'active', 1: 'inactive' }
const SYNC_MODE_BY_INT: Record<number, ShopSyncMode> = { 0: 'manual', 1: 'netbarbox', 2: 'dodonew' }
const ZONE_TYPE_BY_INT: Record<number, ZoneType> = { 0: 'standard', 1: 'vip', 2: 'highend' }
const ORDER_STATUS_BY_INT: Record<number, PlaytimeOrderStatus> = {
  0: 'PENDING', 1: 'PAID', 2: 'CONFIRMED', 3: 'USED', 4: 'SUPPLY_FAILED', 5: 'REFUND_PROCESSING', 6: 'REFUNDED', 7: 'EXPIRED',
}

/** Bảng art trang trí cố định — BE không có field `art` (thuần trang trí phía FE), chọn xác định theo id gian hàng. */
const SHOP_ART_PALETTE: MockShopArt[] = [
  { gradient: ['#7C3AED', '#EC4899'], icon: 'Cpu' },
  { gradient: ['#22D3EE', '#7C3AED'], icon: 'Zap' },
  { gradient: ['#F97316', '#EF4444'], icon: 'Trophy' },
  { gradient: ['#22C55E', '#0EA5E9'], icon: 'Monitor' },
  { gradient: ['#EC4899', '#F97316'], icon: 'Gamepad2' },
  { gradient: ['#DC2626', '#111827'], icon: 'Swords' },
]

function deriveShopArt(shopId: string): MockShopArt {
  let hash = 0
  for (let i = 0; i < shopId.length; i++) hash = (hash * 31 + shopId.charCodeAt(i)) >>> 0
  return SHOP_ART_PALETTE[hash % SHOP_ART_PALETTE.length]
}

function mapShop(raw: CybergameShop & { status: unknown; syncMode: unknown }): CybergameShop {
  return {
    ...raw,
    status: STATUS_BY_INT[raw.status as number] ?? 'active',
    syncMode: SYNC_MODE_BY_INT[raw.syncMode as number] ?? 'manual',
    art: raw.art ?? deriveShopArt(raw.id),
  }
}

function mapZone(raw: PlaytimeZone & { zoneType: unknown }): PlaytimeZone {
  return { ...raw, zoneType: ZONE_TYPE_BY_INT[raw.zoneType as number] ?? 'standard' }
}

function mapTicketView(raw: PlaytimeTicketView & { zoneType: unknown; status: unknown }): PlaytimeTicketView {
  return {
    ...raw,
    zoneType: ZONE_TYPE_BY_INT[raw.zoneType as number] ?? 'standard',
    status: (STATUS_BY_INT[raw.status as number] as PlaytimeTicketView['status']) ?? 'active',
    shopArt: raw.shopArt ?? deriveShopArt(raw.shopId),
  }
}

function mapOrder(raw: PlaytimeOrder & { zoneType: unknown; status: unknown }): PlaytimeOrder {
  return {
    ...raw,
    zoneType: ZONE_TYPE_BY_INT[raw.zoneType as number] ?? 'standard',
    status: ORDER_STATUS_BY_INT[raw.status as number] ?? 'PENDING',
  }
}

export class PlaytimeApiService {
  private static readonly SHOPS_PATH = '/api/playtime-shops'
  private static readonly TICKETS_FLASH_SALE_PATH = '/api/playtime-tickets/flash-sale'
  private static readonly TICKET_DETAIL_PATH = '/api/playtime/tickets'
  private static readonly ORDERS_PATH = '/api/orders/playtime'

  /**
   * BE chưa có endpoint gộp `/marketplace` (chỉ có `playtime-shops`, `playtime-shops/{id}/tickets`,
   * `playtime-tickets/flash-sale`) — ghép ở tầng FE từ 3 lời gọi thật thay vì đổi API đã build.
   */
  static async getMarketplaceSections(): Promise<ApiResponse<MarketplaceSections>> {
    if (JGAME_USE_MOCK) {
      return mockApiCall(() => ({
        flashSale: listFlashSaleTicketViews(),
        featuredShops: listFeaturedShops(),
        allTickets: listAllActiveTicketViews(),
        cities: listCities(),
      }), 350)
    }

    const shopsResult = await this.getShops()
    if (!shopsResult.success || !shopsResult.data) {
      return { success: false, data: null, message: shopsResult.message ?? 'Không tải được danh sách gian hàng', errors: shopsResult.errors }
    }
    const shops = shopsResult.data
    const featuredShops = [...shops].sort((a, b) => b.totalSold - a.totalSold).slice(0, 6)
    const cities = Array.from(new Set(shops.map(s => s.city))).sort()

    const flashSaleResponse = await apiCall(buildJGameUrl(this.TICKETS_FLASH_SALE_PATH), { method: 'GET' })
    const flashSaleJson: ApiResponse<PlaytimeTicketView[]> = await flashSaleResponse.json()
    const flashSale = flashSaleJson.success && flashSaleJson.data ? flashSaleJson.data.map(mapTicketView) : []

    const perShopResponses = await Promise.all(
      shops.map(s => apiCall(buildJGameUrl(`${this.SHOPS_PATH}/${s.id}/tickets`), { method: 'GET' }).then(r => r.json() as Promise<ApiResponse<PlaytimeTicketView[]>>))
    )
    const allTickets = perShopResponses.flatMap(r => (r.success && r.data ? r.data.map(mapTicketView) : []))

    return { success: true, data: { flashSale, featuredShops, allTickets, cities }, message: null, errors: null }
  }

  static async getShops(params?: ShopListParams): Promise<ApiResponse<CybergameShop[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => listShops(params), 300)
    const url = buildJGameUrlWithParams(this.SHOPS_PATH, params as Record<string, unknown> | undefined)
    const response = await apiCall(url, { method: 'GET' })
    const result: ApiResponse<CybergameShop[]> = await response.json()
    if (result.success && result.data) result.data = result.data.map(mapShop)
    return result
  }

  static async getShopDetail(shopId: string, zoneType?: ZoneType | 'all'): Promise<ApiResponse<ShopDetailResult>> {
    if (JGAME_USE_MOCK) {
      const shop = getShopById(shopId)
      if (!shop) return mockApiError('Không tìm thấy gian hàng')
      return mockApiCall(() => ({ shop, zones: listZonesByShop(shopId), tickets: listTicketViewsByShop(shopId, zoneType) }), 300)
    }
    const url = buildJGameUrlWithParams(`${this.SHOPS_PATH}/${shopId}`, { zoneType })
    const response = await apiCall(url, { method: 'GET' })
    const result: ApiResponse<ShopDetailResult> = await response.json()
    if (result.success && result.data) {
      result.data = {
        shop: mapShop(result.data.shop),
        zones: result.data.zones.map(mapZone),
        tickets: result.data.tickets.map(mapTicketView),
      }
    }
    return result
  }

  static async getTicket(ticketId: string): Promise<ApiResponse<PlaytimeTicketView>> {
    if (JGAME_USE_MOCK) {
      const ticket = getTicketViewById(ticketId)
      if (!ticket) return mockApiError('Không tìm thấy vé')
      return mockApiCall(() => ticket, 200)
    }
    const response = await apiCall(buildJGameUrl(`${this.TICKET_DETAIL_PATH}/${ticketId}`), { method: 'GET' })
    const result: ApiResponse<PlaytimeTicketView> = await response.json()
    if (result.success && result.data) result.data = mapTicketView(result.data)
    return result
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
    const response = await apiCall(buildJGameUrl(this.ORDERS_PATH), { method: 'POST', body: JSON.stringify(payload) })
    const result: ApiResponse<PlaytimeOrder> = await response.json()
    if (result.success && result.data) result.data = mapOrder(result.data)
    return result
  }

  static async getPayment(orderId: string): Promise<ApiResponse<{ orderId: string; qrCode: string; expiredAt: string }>> {
    if (JGAME_USE_MOCK) {
      const payment = getMockPlaytimePayment(orderId)
      if (!payment) return mockApiError('Không tìm thấy thông tin thanh toán')
      return mockApiCall(() => payment, 200)
    }
    const response = await apiCall(buildJGameUrl(`${this.ORDERS_PATH}/${orderId}/payment`), { method: 'GET' })
    return response.json()
  }

  static async getOrderStatus(orderId: string): Promise<ApiResponse<PlaytimeOrder>> {
    if (JGAME_USE_MOCK) {
      const order = getMockPlaytimeOrder(orderId)
      if (!order) return mockApiError('Không tìm thấy đơn hàng')
      return mockApiCall(() => order, 150)
    }
    const response = await apiCall(buildJGameUrl(`${this.ORDERS_PATH}/${orderId}`), { method: 'GET' })
    const result: ApiResponse<PlaytimeOrder> = await response.json()
    if (result.success && result.data) result.data = mapOrder(result.data)
    return result
  }

  /** Gọi khi countdown QR hết hạn mà đơn vẫn PENDING — hoàn lại slot đã giữ chỗ. */
  static async expireOrder(orderId: string): Promise<ApiResponse<null>> {
    if (JGAME_USE_MOCK) {
      expireMockPlaytimeOrder(orderId)
      return mockApiCall(() => null, 100)
    }
    const response = await apiCall(buildJGameUrl(`${this.ORDERS_PATH}/${orderId}/expire`), { method: 'POST' })
    return response.json()
  }

  static async getMyOrders(status?: PlaytimeOrderStatus | 'all'): Promise<ApiResponse<PlaytimeOrder[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => listMockPlaytimeOrdersByUser(getMockUserId(), status), 350)
    const response = await apiCall(buildJGameUrl(this.ORDERS_PATH), { method: 'GET' })
    const result: ApiResponse<PlaytimeOrder[]> = await response.json()
    if (result.success && result.data) {
      const mapped = result.data.map(mapOrder)
      result.data = !status || status === 'all' ? mapped : mapped.filter(o => o.status === status)
    }
    return result
  }
}
