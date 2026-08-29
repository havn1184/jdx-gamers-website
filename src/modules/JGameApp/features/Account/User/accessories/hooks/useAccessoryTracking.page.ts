/**
 * useAccessoryTracking.page — Logic trang Theo dõi đơn hàng phụ kiện (SC-30).
 * Poll trạng thái mỗi 2s cho đến khi giao hàng xong (mô phỏng cập nhật vận đơn realtime).
 */
import { useEffect, useState } from 'react'
import { AccessoryApiService } from '../../../../Public/accessories/services/AccessoryApiService'
import type { AccessoryOrder, AccessoryOrderStatus } from '../../../../Public/accessories/types/accessory.types'

const TERMINAL_STATUSES: AccessoryOrderStatus[] = ['DELIVERED', 'CANCELLED', 'RETURNED']
const POLL_INTERVAL_MS = 2000

export function useAccessoryTracking(orderId: string | undefined) {
  const [order, setOrder] = useState<AccessoryOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) return
    let cancelled = false
    let timer: ReturnType<typeof setInterval> | null = null

    const poll = async () => {
      const r = await AccessoryApiService.getOrderTracking(orderId)
      if (cancelled) return
      if (!r.success || !r.data) {
        setErrorMessage(r.message || 'Không tìm thấy đơn hàng')
        setLoading(false)
        return
      }
      setOrder(r.data)
      setLoading(false)
      if (TERMINAL_STATUSES.includes(r.data.status) && timer) clearInterval(timer)
    }

    void poll()
    timer = setInterval(poll, POLL_INTERVAL_MS)
    return () => { cancelled = true; if (timer) clearInterval(timer) }
  }, [orderId])

  return { order, loading, errorMessage }
}
