/**
 * ShopOwnerApiService — Kênh Người Bán (Giai đoạn 2 — URD mục 7): đăng ký gian hàng,
 * quản lý zone/vé, đồng bộ NetBarBox/DoDoNew, đơn hàng đã bán, công nợ & lịch sử thanh toán.
 *
 * Toàn bộ method đã có BE thật (my-shop, register, updateShopProfile, setSyncMode, syncNow,
 * dashboard, orders, confirm-used, payouts, getZones/upsertZone/deleteZone,
 * getTickets/upsertTicket/deleteTicket) — không còn method nào giữ gate `JGAME_USE_MOCK`
 * (20260901-nc_shop-owner-zone-ve-crud.md, trước đó nhóm zone/ticket/sync CHƯA có endpoint BE).
 */
import { apiCall, buildJGameUrl, type ApiResponse } from '../../../../shared/services/api'
import type {
  CybergameShop, PlaytimeZone, PlaytimeTicket, ZoneType, TicketStatus, ShopSyncMode, RegisterShopPayload, UpdateShopProfilePayload,
  UpsertZonePayload, UpsertTicketPayload, PlaytimeOrder, PlaytimeOrderStatus, ShopPayoutPeriod, ShopDashboardSummary,
} from '../types/shop-owner.types'
import type { PlaytimeTerminal } from '../types/netbarbox.types'

// BE serialize enum về int (Program.cs không dùng JsonStringEnumConverter) — map đúng thứ tự khai
// báo trong Enums/*.cs của JGameApi sang string union Website đang dùng.
// Chiều ĐỌC (BE int -> FE string): dùng để normalize response.
const SHOP_STATUS_MAP = ['active', 'inactive'] as const
const SHOP_SYNC_MODE_MAP = ['manual', 'netbarbox', 'dodonew'] as const
const ZONE_TYPE_MAP = ['standard', 'vip', 'highend'] as const // khớp PlaytimeZoneType Standard=0/Vip=1/Highend=2
const PLAYTIME_ORDER_STATUS_MAP = [
  'PENDING', 'PAID', 'CONFIRMED', 'USED', 'SUPPLY_FAILED', 'REFUND_PROCESSING', 'REFUNDED', 'EXPIRED',
] as const
const SHOP_PAYOUT_STATUS_MAP = ['PENDING', 'PAID'] as const

// Chiều GHI (FE string -> BE int): dùng khi gửi request POST/PUT lên BE — thiếu bước này khiến
// System.Text.Json không bind được chuỗi vào enum int, BE trả 400 model-binding trước khi vào Controller
// (đã xảy ra thật với setSyncMode — 20260901-nc_shop-owner-zone-ve-crud.md mục 2.1).
function toSyncModeInt(mode: ShopSyncMode): number { return SHOP_SYNC_MODE_MAP.indexOf(mode) }
function toZoneTypeInt(zoneType: ZoneType): number { return ZONE_TYPE_MAP.indexOf(zoneType) }
function toStatusInt(status: TicketStatus): number { return SHOP_STATUS_MAP.indexOf(status) }

function normalizeShop(shop: CybergameShop): CybergameShop {
  return {
    ...shop,
    status: (typeof shop.status === 'number' ? SHOP_STATUS_MAP[shop.status] : shop.status) as CybergameShop['status'],
    syncMode: (typeof shop.syncMode === 'number' ? SHOP_SYNC_MODE_MAP[shop.syncMode] : shop.syncMode) as CybergameShop['syncMode'],
  }
}

function normalizeZone(zone: PlaytimeZone): PlaytimeZone {
  return {
    ...zone,
    zoneType: (typeof zone.zoneType === 'number' ? ZONE_TYPE_MAP[zone.zoneType] : zone.zoneType) as PlaytimeZone['zoneType'],
  }
}

function normalizeTicket(ticket: PlaytimeTicket): PlaytimeTicket {
  return {
    ...ticket,
    status: (typeof ticket.status === 'number' ? SHOP_STATUS_MAP[ticket.status] : ticket.status) as PlaytimeTicket['status'],
  }
}

function normalizePlaytimeOrder(order: PlaytimeOrder): PlaytimeOrder {
  const raw = order.status as unknown
  if (typeof raw === 'number') {
    return { ...order, status: (PLAYTIME_ORDER_STATUS_MAP[raw] ?? 'PENDING') as PlaytimeOrder['status'] }
  }
  return order
}

function normalizePayout(p: ShopPayoutPeriod): ShopPayoutPeriod {
  const raw = p.status as unknown
  if (typeof raw === 'number') {
    return { ...p, status: (SHOP_PAYOUT_STATUS_MAP[raw] ?? 'PENDING') as ShopPayoutPeriod['status'] }
  }
  return p
}

export class ShopOwnerApiService {
  private static readonly BASE_PATH = '/api/shop-owner'

  static async getMyShop(): Promise<ApiResponse<CybergameShop | null>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/my-shop`), { method: 'GET' })
    const result: ApiResponse<CybergameShop | null> = await response.json()
    if (result.success && result.data) result.data = normalizeShop(result.data)
    return result
  }

  static async registerShop(payload: RegisterShopPayload): Promise<ApiResponse<CybergameShop>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/register`), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async updateShopProfile(payload: UpdateShopProfilePayload): Promise<ApiResponse<CybergameShop>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/shop/profile`), { method: 'PUT', body: JSON.stringify(payload) })
    const result: ApiResponse<CybergameShop> = await response.json()
    if (result.success && result.data) result.data = normalizeShop(result.data)
    return result
  }

  static async setSyncMode(syncMode: ShopSyncMode): Promise<ApiResponse<CybergameShop>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/shop/sync-mode`), { method: 'PUT', body: JSON.stringify({ syncMode: toSyncModeInt(syncMode) }) })
    const result: ApiResponse<CybergameShop> = await response.json()
    if (result.success && result.data) result.data = normalizeShop(result.data)
    return result
  }

  static async syncNow(): Promise<ApiResponse<PlaytimeTicket[]>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/shop/sync-now`), { method: 'POST' })
    const result: ApiResponse<PlaytimeTicket[]> = await response.json()
    if (result.success && result.data) result.data = result.data.map(normalizeTicket)
    return result
  }

  static async getZones(): Promise<ApiResponse<PlaytimeZone[]>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/zones`), { method: 'GET' })
    const result: ApiResponse<PlaytimeZone[]> = await response.json()
    if (result.success && result.data) result.data = result.data.map(normalizeZone)
    return result
  }

  static async upsertZone(payload: UpsertZonePayload): Promise<ApiResponse<PlaytimeZone>> {
    const body = { ...payload, zoneType: toZoneTypeInt(payload.zoneType) }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/zones`), { method: 'POST', body: JSON.stringify(body) })
    const result: ApiResponse<PlaytimeZone> = await response.json()
    if (result.success && result.data) result.data = normalizeZone(result.data)
    return result
  }

  static async deleteZone(zoneId: string): Promise<ApiResponse<null>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/zones/${zoneId}`), { method: 'DELETE' })
    return response.json()
  }

  static async getTickets(): Promise<ApiResponse<PlaytimeTicket[]>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/tickets`), { method: 'GET' })
    const result: ApiResponse<PlaytimeTicket[]> = await response.json()
    if (result.success && result.data) result.data = result.data.map(normalizeTicket)
    return result
  }

  static async upsertTicket(payload: UpsertTicketPayload): Promise<ApiResponse<PlaytimeTicket>> {
    const body = { ...payload, status: payload.status ? toStatusInt(payload.status) : undefined }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/tickets`), { method: 'POST', body: JSON.stringify(body) })
    const result: ApiResponse<PlaytimeTicket> = await response.json()
    if (result.success && result.data) result.data = normalizeTicket(result.data)
    return result
  }

  static async deleteTicket(ticketId: string): Promise<ApiResponse<null>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/tickets/${ticketId}`), { method: 'DELETE' })
    return response.json()
  }

  static async getShopOrders(_status?: PlaytimeOrderStatus | 'all'): Promise<ApiResponse<PlaytimeOrder[]>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/orders`), { method: 'GET' })
    const result: ApiResponse<PlaytimeOrder[]> = await response.json()
    if (result.success && result.data) result.data = result.data.map(normalizePlaytimeOrder)
    return result
  }

  static async confirmTicketUsed(orderId: string): Promise<ApiResponse<PlaytimeOrder>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/orders/${orderId}/confirm-used`), { method: 'POST' })
    const result: ApiResponse<PlaytimeOrder> = await response.json()
    if (result.success && result.data) result.data = normalizePlaytimeOrder(result.data)
    return result
  }

  static async getDashboardSummary(): Promise<ApiResponse<ShopDashboardSummary>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/dashboard`), { method: 'GET' })
    return response.json()
  }

  /** BE gộp 1 endpoint `GET /api/shop-owner/payouts` trả mảng đầy đủ (không tách current/history như
   * trước — quyet-dinh-hop-nhat-api.md #18). Phần tử đầu tiên (kỳ hiện tại, PENDING) tách ra làm
   * "current", phần còn lại (đã PAID) làm "history" ngay tại client — cách đơn giản nhất, giữ nguyên 2
   * hàm public cũ để không phải sửa lại 2 nơi gọi hiện có. */
  private static async getAllPayouts(): Promise<ApiResponse<ShopPayoutPeriod[]>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/payouts`), { method: 'GET' })
    const result: ApiResponse<ShopPayoutPeriod[]> = await response.json()
    if (result.success && result.data) result.data = result.data.map(normalizePayout)
    return result
  }

  static async getPayoutSummary(): Promise<ApiResponse<ShopPayoutPeriod>> {
    const res = await this.getAllPayouts()
    if (!res.success || !res.data || res.data.length === 0) return { ...res, data: null }
    return { ...res, data: res.data[0] }
  }

  static async getPayoutHistory(): Promise<ApiResponse<ShopPayoutPeriod[]>> {
    const res = await this.getAllPayouts()
    if (!res.success || !res.data) return res
    return { ...res, data: res.data.slice(1) }
  }

  /** Khai báo 1 máy mới thủ công — BE đã có sẵn (20260831-nc_tich-hop-netbarbox-doi-soat.md mục 3.5.1),
   * chỉ thiếu chỗ gọi ở FE cho tới nc_ này (20260901-nc_shop-owner-zone-ve-crud.md). */
  static async createTerminal(payload: { zoneId: string; terminalNumber: string; netbarboxTerminalRef: string }): Promise<ApiResponse<PlaytimeTerminal>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/terminals`), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  static async updateTerminal(terminalId: string, payload: { zoneId?: string; terminalNumber?: string; netbarboxTerminalRef?: string }): Promise<ApiResponse<PlaytimeTerminal>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/terminals/${terminalId}`), { method: 'PUT', body: JSON.stringify(payload) })
    return response.json()
  }

  static async deleteTerminal(terminalId: string): Promise<ApiResponse<null>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/terminals/${terminalId}`), { method: 'DELETE' })
    return response.json()
  }
}
