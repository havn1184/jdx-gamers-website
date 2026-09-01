/**
 * Ghi nhận nguồn referer (FR-6.6.1) — mô hình "last-click attribution", TTL 30 ngày.
 * Gọi 1 lần ở StorefrontLayout khi portal mount.
 *
 * Mở rộng (20260901-nc_doi-tac-tiep-thi-nang-cap.md mục 3.2 "Luồng click + lưu mã refer"):
 * khi phát hiện `?ref=CODE` MỚI trên URL, ngoài lưu localStorage còn gọi
 * `POST /api/referral/track-click` fire-and-forget (timeout ngắn, nuốt lỗi — không chặn render
 * trang, không lộ thông tin nếu code không tồn tại — BE luôn trả 200).
 */
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiCall, buildJGameUrl } from '../services/api'

const STORAGE_KEY = 'jgame_referrer'
const TTL_DAYS = 30
const TRACK_CLICK_TIMEOUT_MS = 3000

interface StoredReferrer {
  code: string
  savedAt: number
}

/** Fire-and-forget — không chặn render, nuốt mọi lỗi (mạng chậm/lỗi/BE chưa có). */
function trackClick(code: string): void {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TRACK_CLICK_TIMEOUT_MS)
    void apiCall(
      buildJGameUrl('/api/referral/track-click'),
      {
        method: 'POST',
        body: JSON.stringify({ code, path: window.location.pathname }),
        signal: controller.signal,
      },
      { silent: true, skipAuth: true },
    )
      .catch(() => { /* nuốt lỗi — không ảnh hưởng trải nghiệm người dùng */ })
      .finally(() => clearTimeout(timer))
  } catch {
    /* nuốt lỗi — không ảnh hưởng trải nghiệm người dùng */
  }
}

export function useReferrerAttribution() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (!ref) return
    const payload: StoredReferrer = { code: ref, savedAt: Date.now() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    trackClick(ref)
  }, [searchParams])
}

/** Lấy mã referer còn hiệu lực (chưa hết TTL 30 ngày) — dùng khi tạo đơn hàng. */
export function getActiveReferrerCode(): string | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const { code, savedAt } = JSON.parse(raw) as StoredReferrer
    const expired = Date.now() - savedAt > TTL_DAYS * 24 * 60 * 60 * 1000
    if (expired) {
      localStorage.removeItem(STORAGE_KEY)
      return undefined
    }
    return code
  } catch {
    return undefined
  }
}

/**
 * Alias — mọi luồng tạo đơn/mã liên kết mới (Playtime/Accessory) nên dùng tên này cho rõ nghĩa
 * (nc_doi-tac-tiep-thi-nang-cap.md gọi hàm chung là `getActiveReferralCode()`), giữ nguyên
 * `getActiveReferrerCode()` để không phải sửa lại `useOrderConfirm.page.ts` đang import tên cũ.
 */
export const getActiveReferralLinkCode = getActiveReferrerCode
