/**
 * Re-export types dùng cho Kênh Người Bán — giữ 1 nguồn types duy nhất ở feature `playtime`
 * (CybergameShop/PlaytimeZone/PlaytimeTicket là entity chung giữa khách hàng và chủ gian hàng).
 */
export type {
  CybergameShop, PlaytimeZone, PlaytimeTicket, ZoneType, ShopSyncMode,
  RegisterShopPayload, UpdateShopProfilePayload, UpsertZonePayload, UpsertTicketPayload,
  PlaytimeOrder, PlaytimeOrderStatus, ShopPayoutPeriod, ShopDashboardSummary,
} from '../../../Public/playtime/types/playtime.types'
