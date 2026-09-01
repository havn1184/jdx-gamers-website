/**
 * Types cho tích hợp Netbarbox — kết nối 2 chiều, đồng bộ danh mục, quản lý máy/khung giờ.
 * Nguồn: `Backend/.claude/system-architect/20260831-nc_tich-hop-netbarbox-doi-soat.md` mục 3.6.
 */

/** Trạng thái kết nối Netbarbox — BE serialize enum về int theo đúng thứ tự khai báo (không dùng JsonStringEnumConverter). */
export const NetbarboxConnectionStatus = {
  NotConnected: 0,
  Connected: 1,
  Error: 2,
} as const
export type NetbarboxConnectionStatus = (typeof NetbarboxConnectionStatus)[keyof typeof NetbarboxConnectionStatus]

/** Response của GET/POST/DELETE `api/shop-owner/netbarbox-connection` — cùng 1 shape. */
export interface NetbarboxConnectionInfo {
  status: NetbarboxConnectionStatus
  shopRefName: string | null
  lastCatalogSyncAt: string | null
}

export interface ConnectNetbarboxPayload {
  connectionSecret: string
}

/** 1 dòng lịch sử đồng bộ — `GET api/shop-owner/netbarbox-connection/sync-history`. */
export interface NetbarboxSyncHistoryItem {
  id: string
  syncedAt: string
  success: boolean
  newCount: number
  updatedCount: number
  removedCount: number
  skippedCount: number
  skippedReasons: string[]
  errorMessage: string | null
}

/** Kết quả đồng bộ danh mục thật — lồng trong `data` của `POST api/shop-owner/shop/sync-now`
 * khi SyncMode=Netbarbox (khác nhánh Manual/DoDoNew trả về `PlaytimeTicket[]`). */
export interface NetbarboxSyncResultResponse {
  success: boolean
  newCount: number
  updatedCount: number
  removedCount: number
  skippedCount: number
  skippedReasons: string[]
}

/** Trạng thái máy hiển thị — tính động phía BE (kết hợp trạng thái Netbarbox báo về + đơn đang giữ máy), không lưu cứng. */
export const PlaytimeTerminalStatus = {
  Available: 0,
  Reserved: 1,
  InUse: 2,
  Offline: 3,
  Unknown: 4,
} as const
export type PlaytimeTerminalStatus = (typeof PlaytimeTerminalStatus)[keyof typeof PlaytimeTerminalStatus]

/** 1 máy vật lý — `GET api/playtime/shops/{shopId}/terminals`. */
export interface PlaytimeTerminal {
  id: string
  zoneId: string
  terminalNumber: string
  status: PlaytimeTerminalStatus
}

/** 1 khung giờ của 1 khu vực trong 1 ngày — `GET api/playtime/zones/{zoneId}/slots`. */
export interface PlaytimeSlot {
  id: string
  zoneId: string
  date: string
  slotStart: string
  slotEnd: string
  totalCapacity: number
  bookedCount: number
  availableCount: number
}
