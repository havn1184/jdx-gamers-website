/**
 * PlaytimeTerminalApiService — Đọc danh sách máy + khung giờ của gian hàng (route chung `api/playtime`).
 * BE hiện CHƯA có API tạo/sửa Terminal (chỉ đồng bộ trạng thái qua webhook Netbarbox) nên service
 * này chỉ có method đọc (GET) — xem ghi chú khoảng trống API trong `ShopTerminalsPage.tsx`.
 */
import { apiCall, buildJGameUrl, buildJGameUrlWithParams, type ApiResponse } from '../../../../shared/services/api'
import type { PlaytimeTerminal, PlaytimeSlot } from '../types/netbarbox.types'

export class PlaytimeTerminalApiService {
  private static readonly BASE_PATH = '/api/playtime'

  /** Danh sách máy vật lý của 1 gian hàng, kèm trạng thái thời gian thực. */
  static async getTerminals(shopId: string): Promise<ApiResponse<PlaytimeTerminal[]>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/shops/${shopId}/terminals`), { method: 'GET' })
    return response.json()
  }

  /** Sức chứa theo khung giờ của 1 khu vực trong khoảng ngày [fromDate, toDate] — tự sinh khi truy vấn lần đầu. */
  static async getSlots(zoneId: string, fromDate: string, toDate: string): Promise<ApiResponse<PlaytimeSlot[]>> {
    const url = buildJGameUrlWithParams(`${this.BASE_PATH}/zones/${zoneId}/slots`, { fromDate, toDate })
    const response = await apiCall(url, { method: 'GET' })
    return response.json()
  }
}
