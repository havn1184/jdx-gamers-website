/**
 * useShopDetail.page.fetchData — Logic Trang gian hàng (SC-P2-02). Poll mỗi 3s cho slot trực tiếp.
 *
 * `loading` chỉ true ở lần tải đầu tiên (chưa có `detail`) — dùng để hiện spinner toàn trang.
 * Đổi tab lọc Zone (`setZoneType`) hay poll nền đều fetch "âm thầm" qua `filtering`/không đổi
 * `loading`, tránh unmount toàn bộ trang (header/gallery/tab) gây giật màn hình mỗi lần bấm lọc.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { PlaytimeApiService } from '../services/PlaytimeApiService'
import type { ShopDetailResult, ZoneType } from '../types/playtime.types'

const POLL_INTERVAL_MS = 3000

export function useShopDetailFetchData(shopId: string | undefined) {
  const [detail, setDetail] = useState<ShopDetailResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [zoneType, setZoneType] = useState<ZoneType | 'all'>('all')
  const hasLoadedRef = useRef(false)

  const fetchData = useCallback(async (mode: 'initial' | 'filter' | 'poll') => {
    if (!shopId) return
    if (mode === 'initial') setLoading(true)
    if (mode === 'filter') setFiltering(true)
    const r = await PlaytimeApiService.getShopDetail(shopId, zoneType)
    if (r.success && r.data) setDetail(r.data)
    else if (mode !== 'poll') setNotFound(true)
    if (mode === 'initial') setLoading(false)
    if (mode === 'filter') setFiltering(false)
  }, [shopId, zoneType])

  // Tải lần đầu khi có shopId (đổi gian hàng cũng coi là tải mới).
  useEffect(() => {
    hasLoadedRef.current = false
    void fetchData('initial').then(() => { hasLoadedRef.current = true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId])

  // Đổi tab lọc Zone sau lần tải đầu → fetch âm thầm, giữ nguyên phần còn lại của trang.
  useEffect(() => {
    if (!hasLoadedRef.current) return
    void fetchData('filter')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneType])

  useEffect(() => {
    const id = setInterval(() => void fetchData('poll'), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchData])

  return { detail, loading, filtering, notFound, zoneType, setZoneType }
}
