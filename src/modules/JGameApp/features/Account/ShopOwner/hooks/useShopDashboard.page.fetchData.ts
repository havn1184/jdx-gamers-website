/**
 * useShopDashboard.page.fetchData — Logic trang Tổng quan gian hàng (SC-P2-S2).
 */
import { useCallback, useEffect, useState } from 'react'
import { ShopOwnerApiService } from '../services/ShopOwnerApiService'
import type { ShopDashboardSummary } from '../types/shop-owner.types'

export function useShopDashboardFetchData() {
  const [summary, setSummary] = useState<ShopDashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const r = await ShopOwnerApiService.getDashboardSummary()
    if (r.success && r.data) setSummary(r.data)
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  return { summary, loading, refetch: fetchData }
}
