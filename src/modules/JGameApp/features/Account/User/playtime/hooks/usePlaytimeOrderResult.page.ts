/**
 * usePlaytimeOrderResult.page — Logic trang Kết quả đặt vé (SC-P2-05).
 */
import { useCallback, useEffect, useState } from 'react'
import { PlaytimeApiService } from '../../../../Public/playtime/services/PlaytimeApiService'
import type { PlaytimeOrder } from '../../../../Public/playtime/types/playtime.types'

export function usePlaytimeOrderResult(orderId: string | undefined) {
  const [order, setOrder] = useState<PlaytimeOrder | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    const r = await PlaytimeApiService.getOrderStatus(orderId)
    if (r.success && r.data) setOrder(r.data)
    setLoading(false)
  }, [orderId])

  useEffect(() => { void fetchData() }, [fetchData])

  return { order, loading }
}
