/**
 * useMarketplaceHome.page.fetchData — Logic Trang tổng quan Chợ vé (SC-P2-01).
 * Poll lại mỗi 3s để phản ánh slot trống giảm dần "trực tiếp" (mô phỏng realtime).
 */
import { useCallback, useEffect, useState } from 'react'
import { PlaytimeApiService } from '../services/PlaytimeApiService'
import type { MarketplaceSections, ZoneType } from '../types/playtime.types'

const POLL_INTERVAL_MS = 3000

export type MarketplaceZoneFilter = ZoneType | 'all'

export function useMarketplaceHomeFetchData() {
  const [sections, setSections] = useState<MarketplaceSections | null>(null)
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState<string>('all')
  const [zoneType, setZoneType] = useState<MarketplaceZoneFilter>('all')

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    const r = await PlaytimeApiService.getMarketplaceSections()
    if (r.success && r.data) setSections(r.data)
    if (!silent) setLoading(false)
  }, [])

  useEffect(() => {
    void fetchData()
    const id = setInterval(() => void fetchData(true), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchData])

  const filteredTickets = (sections?.allTickets || []).filter(t => {
    if (city !== 'all' && t.shopCity !== city) return false
    if (zoneType !== 'all' && t.zoneType !== zoneType) return false
    return true
  })

  return { sections, filteredTickets, loading, city, setCity, zoneType, setZoneType }
}
