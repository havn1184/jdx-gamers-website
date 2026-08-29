/**
 * useShopOrders.page.fetchData — Logic trang Đơn hàng đã bán (SC-P2-S5).
 */
import { useCallback, useEffect, useState } from 'react'
import { ShopOwnerApiService } from '../services/ShopOwnerApiService'
import type { PlaytimeOrder, PlaytimeOrderStatus } from '../types/shop-owner.types'

export function useShopOrdersFetchData() {
  const [items, setItems] = useState<PlaytimeOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<PlaytimeOrderStatus | 'all'>('all')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const r = await ShopOwnerApiService.getShopOrders(status)
    if (r.success && r.data) setItems(r.data)
    setLoading(false)
  }, [status])

  useEffect(() => { void fetchData() }, [fetchData])

  const confirmUsed = useCallback(async (orderId: string) => {
    setConfirmingId(orderId)
    try {
      await ShopOwnerApiService.confirmTicketUsed(orderId)
      await fetchData()
    } finally {
      setConfirmingId(null)
    }
  }, [fetchData])

  return { items, loading, status, setStatus, confirmingId, confirmUsed }
}
