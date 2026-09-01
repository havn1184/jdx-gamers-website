/**
 * PlaytimeApiService — Chợ vé giờ chơi Cybergame, phía khách hàng (Giai đoạn 2 — URD mục 7).
 */
import { apiCall, buildJGameUrl, buildJGameUrlWithParams, type ApiResponse } from '../../../../shared/services/api'
import type {
  CybergameShop, PlaytimeZone, ShopListParams, ShopDetailResult, PlaytimeTicketView, MarketplaceSections,
  CreateTicketOrderPayload, PlaytimeOrder, PlaytimeOrderStatus, PlaytimeReview, ZoneType, ShopStatus, ShopSyncMode, MockShopArt,
} from '../types/playtime.types'

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

function mapShop(raw: Omit<CybergameShop, 'status' | 'syncMode'> & { status: unknown; syncMode: unknown }): CybergameShop {
  return {
    ...raw,
    status: STATUS_BY_INT[raw.status as number] ?? 'active',
    syncMode: SYNC_MODE_BY_INT[raw.syncMode as number] ?? 'manual',
    art: raw.art ?? deriveShopArt(raw.id),
  }
}

function mapZone(raw: Omit<PlaytimeZone, 'zoneType'> & { zoneType: unknown }): PlaytimeZone {
  return { ...raw, zoneType: ZONE_TYPE_BY_INT[raw.zoneType as number] ?? 'standard' }
}

function mapTicketView(raw: Omit<PlaytimeTicketView, 'zoneType' | 'status'> & { zoneType: unknown; status: unknown }): PlaytimeTicketView {
  return {
    ...raw,
    zoneType: ZONE_TYPE_BY_INT[raw.zoneType as number] ?? 'standard',
    status: (STATUS_BY_INT[raw.status as number] as PlaytimeTicketView['status']) ?? 'active',
    shopArt: raw.shopArt ?? deriveShopArt(raw.shopId),
  }
}

function mapOrder(raw: Omit<PlaytimeOrder, 'zoneType' | 'status'> & { zoneType: unknown; status: unknown }): PlaytimeOrder {
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

    return { success: true, data: { flashSale, featuredShops, allTickets, cities }, message: null }
  }

  static async getShops(params?: ShopListParams): Promise<ApiResponse<CybergameShop[]>> {
    // Sentinel 'all' chỉ có ý nghĩa ở UI/mock — BE nhận zoneType dạng enum số, gửi thẳng 'all' sẽ
    // bị BE trả 400. Bỏ qua param khi giá trị là 'all'.
    const realParams: Record<string, unknown> = {}
    if (params?.keyword) realParams.keyword = params.keyword
    if (params?.city && params.city !== 'all') realParams.city = params.city
    if (params?.zoneType && params.zoneType !== 'all') realParams.zoneType = params.zoneType
    const url = buildJGameUrlWithParams(this.SHOPS_PATH, realParams)
    const response = await apiCall(url, { method: 'GET' })
    const result: ApiResponse<CybergameShop[]> = await response.json()
    if (result.success && result.data) result.data = result.data.map(mapShop)
    return result
  }

  static async getShopDetail(shopId: string, zoneType?: ZoneType | 'all'): Promise<ApiResponse<ShopDetailResult>> {
    // Sentinel 'all' chỉ có ý nghĩa ở UI/mock — BE nhận zoneType dạng enum số (0-2), gửi thẳng
    // 'all' sẽ bị BE trả 400. Bỏ qua param khi giá trị là 'all' (tương đương "không lọc").
    const url = buildJGameUrlWithParams(`${this.SHOPS_PATH}/${shopId}`, zoneType && zoneType !== 'all' ? { zoneType } : undefined)
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
    const response = await apiCall(buildJGameUrl(`${this.TICKET_DETAIL_PATH}/${ticketId}`), { method: 'GET' })
    const result: ApiResponse<PlaytimeTicketView> = await response.json()
    if (result.success && result.data) result.data = mapTicketView(result.data)
    return result
  }

  /** Vé "tương tự" — cùng loại zone, từ CÁC SHOP KHÁC — mục "Sản phẩm tương tự của shop khác". */
  static async getSimilarTickets(ticketId: string): Promise<ApiResponse<PlaytimeTicketView[]>> {
    const response = await apiCall(buildJGameUrl(`${this.TICKET_DETAIL_PATH}/${ticketId}/similar`), { method: 'GET' })
    const result: ApiResponse<PlaytimeTicketView[]> = await response.json()
    if (result.success && result.data) result.data = result.data.map(mapTicketView)
    return result
  }

  /** Đánh giá công khai của 1 gian hàng — dùng ở trang chi tiết gian hàng/vé. */
  static async getShopReviews(shopId: string): Promise<ApiResponse<PlaytimeReview[]>> {
    const response = await apiCall(buildJGameUrl(`${this.SHOPS_PATH}/${shopId}/reviews`), { method: 'GET' })
    return response.json()
  }

  static async createOrder(payload: CreateTicketOrderPayload): Promise<ApiResponse<PlaytimeOrder>> {
    const response = await apiCall(buildJGameUrl(this.ORDERS_PATH), { method: 'POST', body: JSON.stringify(payload) })
    const result: ApiResponse<PlaytimeOrder> = await response.json()
    if (result.success && result.data) result.data = mapOrder(result.data)
    return result
  }

  static async getPayment(orderId: string): Promise<ApiResponse<{ orderId: string; qrCode: string; expiredAt: string }>> {
    const response = await apiCall(buildJGameUrl(`${this.ORDERS_PATH}/${orderId}/payment`), { method: 'GET' })
    return response.json()
  }

  static async getOrderStatus(orderId: string): Promise<ApiResponse<PlaytimeOrder>> {
    const response = await apiCall(buildJGameUrl(`${this.ORDERS_PATH}/${orderId}`), { method: 'GET' })
    const result: ApiResponse<PlaytimeOrder> = await response.json()
    if (result.success && result.data) result.data = mapOrder(result.data)
    return result
  }

  /** Gọi khi countdown QR hết hạn mà đơn vẫn PENDING — hoàn lại slot đã giữ chỗ. */
  static async expireOrder(orderId: string): Promise<ApiResponse<null>> {
    const response = await apiCall(buildJGameUrl(`${this.ORDERS_PATH}/${orderId}/expire`), { method: 'POST' })
    return response.json()
  }

  static async getMyOrders(status?: PlaytimeOrderStatus | 'all'): Promise<ApiResponse<PlaytimeOrder[]>> {
    const response = await apiCall(buildJGameUrl(this.ORDERS_PATH), { method: 'GET' })
    const result: ApiResponse<PlaytimeOrder[]> = await response.json()
    if (result.success && result.data) {
      const mapped = result.data.map(mapOrder)
      result.data = !status || status === 'all' ? mapped : mapped.filter(o => o.status === status)
    }
    return result
  }

  /** Xác nhận thanh toán ngay (mock) — Pending → Paid. Đơn cũng tự động chuyển Paid sau ~6s
   *  (mô phỏng webhook cổng thanh toán) nên KHÔNG bắt buộc gọi — chỉ dùng khi cần kết quả tức thời. */
  static async confirmPayment(orderId: string): Promise<ApiResponse<PlaytimeOrder>> {
    const response = await apiCall(buildJGameUrl(`${this.ORDERS_PATH}/${orderId}/confirm-payment`), { method: 'POST' })
    const result: ApiResponse<PlaytimeOrder> = await response.json()
    if (result.success && result.data) result.data = mapOrder(result.data)
    return result
  }

  /** Đánh giá 1 đơn đã thanh toán — chỉ được trong vòng 3 ngày kể từ lúc thanh toán, mỗi đơn 1 lần. */
  static async createReview(orderId: string, rating: number, comment?: string): Promise<ApiResponse<PlaytimeReview>> {
    const response = await apiCall(buildJGameUrl(`${this.ORDERS_PATH}/${orderId}/review`), {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    })
    return response.json()
  }

  /** Đánh giá của user hiện tại — màn "Đánh giá của tôi" (Account). */
  static async getMyReviews(): Promise<ApiResponse<PlaytimeReview[]>> {
    const response = await apiCall(buildJGameUrl('/api/reviews/playtime/my'), { method: 'GET' })
    return response.json()
  }
}
