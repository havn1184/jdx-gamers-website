/**
 * useShopPayouts.page.fetchData — Logic trang Công nợ & Lịch sử thanh toán (SC-P2-S6).
 */
import { useCallback, useEffect, useState } from 'react'
import { ShopOwnerApiService } from '../services/ShopOwnerApiService'
import type { ShopPayoutPeriod } from '../types/shop-owner.types'

export function useShopPayoutsFetchData() {
  const [current, setCurrent] = useState<ShopPayoutPeriod | null>(null)
  const [history, setHistory] = useState<ShopPayoutPeriod[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [currentRes, historyRes] = await Promise.all([ShopOwnerApiService.getPayoutSummary(), ShopOwnerApiService.getPayoutHistory()])
    if (currentRes.success && currentRes.data) setCurrent(currentRes.data)
    if (historyRes.success && historyRes.data) setHistory(historyRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  return { current, history, loading }
}
