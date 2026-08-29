/**
 * mockGate — Điểm gate mock DUY NHẤT cho toàn bộ JGameApp (BE thật chưa có).
 *
 * Mọi ApiService method PHẢI rẽ nhánh qua `JGAME_USE_MOCK` ở đây:
 *   if (JGAME_USE_MOCK) return mockApiCall(() => ...)
 *   const url = buildJGameUrl(...); const res = await apiCall(url, ...); return res.json()
 *
 * Khi có BE thật: đặt VITE_JGAME_USE_MOCK=false trong .env — không cần sửa code gọi
 * ở page/hook, vì cả 2 nhánh đã có sẵn cùng 1 chữ ký `Promise<ApiResponse<T>>`.
 */
import type { ApiResponse } from './types'

export const JGAME_USE_MOCK: boolean =
  (import.meta.env?.VITE_JGAME_USE_MOCK as string | undefined) !== 'false'

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
