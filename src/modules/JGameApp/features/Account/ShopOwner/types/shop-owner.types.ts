/**
 * Re-export types dùng cho Chủ Cybergame — giữ 1 nguồn types duy nhất ở feature `playtime`
 * (CybergameShop/PlaytimeZone/PlaytimeTicket là entity chung giữa khách hàng và chủ Cybergame).
 */
export type {
  CybergameShop, PlaytimeZone, PlaytimeTicket, ZoneType, ShopSyncMode, TicketStatus,
  RegisterShopPayload, UpdateShopProfilePayload, UpsertZonePayload, UpsertTicketPayload,
  PlaytimeOrder, PlaytimeOrderStatus, ShopPayoutPeriod, ShopDashboardSummary,
} from '../../../Public/playtime/types/playtime.types'
/** Const object (không phải type-only) — export riêng để dùng được giá trị `.Netbarbox` ở nơi gọi. */
export { PlaytimeTicketSourcePlatform } from '../../../Public/playtime/types/playtime.types'
