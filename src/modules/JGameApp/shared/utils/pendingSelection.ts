/**
 * Giữ lựa chọn hiện tại (mệnh giá + số lượng) khi Guest bị chuyển sang đăng nhập,
 * để quay lại đúng bước sau khi xác thực xong (FR-6.1.2).
 *
 * Giới hạn (mock/GĐ1): chỉ khôi phục đúng bước nếu SSO điều hướng lại về route
 * `/jgame/*` sau khi đăng nhập — nếu SSO điều hướng sang portal mặc định khác
 * của tài khoản, cần cấu hình redirect phía SSO (ngoài phạm vi JGameApp).
 */
const SELECTION_KEY = 'jgame_pending_selection'
const RETURN_TO_KEY = 'jgame_return_to'

export interface PendingSelection {
  denominationId: string
  quantity: number
}

export function savePendingSelection(selection: PendingSelection, returnToHash: string): void {
  sessionStorage.setItem(SELECTION_KEY, JSON.stringify(selection))
  sessionStorage.setItem(RETURN_TO_KEY, returnToHash)
}

/** Chỉ lưu đường dẫn quay lại — dùng cho các luồng tự giữ lựa chọn riêng (VD: vé giờ chơi). */
export function saveReturnTo(returnToHash: string): void {
  sessionStorage.setItem(RETURN_TO_KEY, returnToHash)
}

export function readPendingSelection(): PendingSelection | null {
  try {
    const raw = sessionStorage.getItem(SELECTION_KEY)
    return raw ? (JSON.parse(raw) as PendingSelection) : null
  } catch {
    return null
  }
}

/** Lấy đường dẫn cần quay lại sau đăng nhập (nếu có) rồi xoá — chỉ dùng được 1 lần. */
export function consumeReturnTo(): string | null {
  const value = sessionStorage.getItem(RETURN_TO_KEY)
  if (value) sessionStorage.removeItem(RETURN_TO_KEY)
  return value
}

/** Xoá lựa chọn dở dang + đường dẫn quay lại (dùng khi huỷ hoặc hoàn tất luồng mua hàng). */
export function clearPendingSelection(): void {
  sessionStorage.removeItem(SELECTION_KEY)
  sessionStorage.removeItem(RETURN_TO_KEY)
}
