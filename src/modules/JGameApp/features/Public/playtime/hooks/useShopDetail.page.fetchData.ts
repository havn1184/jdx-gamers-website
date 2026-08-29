/**
 * useShopDetail.page.fetchData — Logic Trang gian hàng (SC-P2-02). Poll mỗi 3s cho slot trực tiếp.
 */
import { useCallback, useEffect, useState } from 'react'
import { PlaytimeApiService } from '../services/PlaytimeApiService'
import type { ShopDetailResult, ZoneType } from '../types/playtime.types'

const POLL_INTERVAL_MS = 3000

export function useShopDetailFetchData(shopId: string | undefined) {
  const [detail, setDetail] = useState<ShopDetailResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [zoneType, setZoneType] = useState<ZoneType | 'all'>('all')

  const fetchData = useCallback(async (silent = false) => {
    if (!shopId) return
    if (!silent) setLoading(true)
    const r = await PlaytimeApiService.getShopDetail(shopId, zoneType)
    if (r.success && r.data) setDetail(r.data)
    else if (!silent) setNotFound(true)
    if (!silent) setLoading(false)
  }, [shopId, zoneType])

  useEffect(() => {
    void fetchData()
    const id = setInterval(() => void fetchData(true), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchData])

  return { detail, loading, notFound, zoneType, setZoneType }
}
