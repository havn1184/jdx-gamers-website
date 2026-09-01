/**
 * NetbarboxConnectionApiService — Kết nối 2 chiều Netbarbox <-> JGame + đồng bộ danh mục dịch vụ
 * cho Chủ gian hàng (xem nc_ mục 3.6). BE thật đã có sẵn — không dùng mock gate.
 */
import { apiCall, buildJGameUrl, type ApiResponse } from '../../../../shared/services/api'
import type {
  NetbarboxConnectionInfo, ConnectNetbarboxPayload, NetbarboxSyncHistoryItem, NetbarboxSyncResultResponse,
} from '../types/netbarbox.types'

export class NetbarboxConnectionApiService {
  private static readonly BASE_PATH = '/api/shop-owner/netbarbox-connection'

  /** Lấy trạng thái kết nối hiện tại của gian hàng đang đăng nhập. */
  static async getConnection(): Promise<ApiResponse<NetbarboxConnectionInfo>> {
    const response = await apiCall(buildJGameUrl(this.BASE_PATH), { method: 'GET' })
    return response.json()
  }

  /** Nhập ConnectionSecret do Netbarbox cấp để xác thực + hoàn tất kết nối. */
  static async connect(payload: ConnectNetbarboxPayload): Promise<ApiResponse<NetbarboxConnectionInfo>> {
    const response = await apiCall(buildJGameUrl(this.BASE_PATH), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }

  /** Ngắt kết nối, chuyển SyncMode về Manual. */
  static async disconnect(): Promise<ApiResponse<null>> {
    const response = await apiCall(buildJGameUrl(this.BASE_PATH), { method: 'DELETE' })
    return response.json()
  }

  /** Lịch sử các lần đồng bộ danh mục gần nhất. */
  static async getSyncHistory(): Promise<ApiResponse<NetbarboxSyncHistoryItem[]>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/sync-history`), { method: 'GET' })
    return response.json()
  }

  /** Đồng bộ danh mục thật từ Netbarbox — tái sử dụng đúng endpoint `shop/sync-now` sẵn có của
   * `ShopOwnerApiService.syncNow()`. Khi SyncMode=Netbarbox, BE tự trả về `NetbarboxSyncResultResponse`
   * lồng trong `data` (khác shape `PlaytimeTicket[]` của nhánh Manual/DoDoNew) nên tách 1 method riêng
   * với kiểu trả đúng, KHÔNG đổi lại `ShopOwnerApiService.syncNow()` đang dùng cho trang Đồng bộ nền tảng. */
  static async syncCatalogNow(): Promise<ApiResponse<NetbarboxSyncResultResponse>> {
    const response = await apiCall(buildJGameUrl('/api/shop-owner/shop/sync-now'), { method: 'POST' })
    return response.json()
  }
}
