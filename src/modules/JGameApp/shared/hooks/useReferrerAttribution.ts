/**
 * Ghi nhận nguồn referer (FR-6.6.1) — mô hình "last-click attribution", TTL 30 ngày.
 * Gọi 1 lần ở StorefrontLayout khi portal mount.
 */
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const STORAGE_KEY = 'jgame_referrer'
const TTL_DAYS = 30

interface StoredReferrer {
  code: string
  savedAt: number
}

export function useReferrerAttribution() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (!ref) return
    const payload: StoredReferrer = { code: ref, savedAt: Date.now() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
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
