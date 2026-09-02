/**
 * mockGate — helper mock cho các phần CÓ CHỦ ĐÍCH chưa gọi API thật trong JGameApp.
 *
 * Cờ toàn cục `JGAME_USE_MOCK` đã bị xoá (20260902-nc_admin-crud-that-thay-mock.md) — mọi phân hệ
 * đều đã gọi BE thật, không còn nơi nào rẽ nhánh theo cờ này nữa. `mockApiCall`/`mockApiError` vẫn
 * còn dùng ở 2 chỗ có lý do cụ thể (xem comment tại từng nơi gọi):
 * `JGameApiServiceAdmin.manualResolveOrder` (BE chưa có endpoint) và CRUD đối tác Referral
 * (BE chỉ có API đọc, chưa có Create/Update/Delete).
 */
import type { ApiResponse } from './types'

/** Giả lập độ trễ mạng rồi trả kết quả từ factory (tính toán tại thời điểm gọi, không cache). */
function mockDelay<T>(factory: () => T, ms: number): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(factory()), ms))
}

/** Bọc 1 hàm sinh dữ liệu mock thành response chuẩn `ApiResponse<T>`, có độ trễ giả lập mạng. */
export async function mockApiCall<T>(factory: () => T, delayMs = 450): Promise<ApiResponse<T>> {
  const data = await mockDelay(factory, delayMs)
  return { success: true, data, message: null }
}

/** Mock 1 lỗi nghiệp vụ (dùng khi cần giả lập nhánh thất bại — VD: hết mã thẻ). */
export async function mockApiError<T = null>(message: string, delayMs = 450): Promise<ApiResponse<T>> {
  await mockDelay(() => null, delayMs)
  return { success: false, data: null as T, message }
}
