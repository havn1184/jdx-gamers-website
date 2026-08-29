/**
 * useHistory.page.fetchData — Logic trang Lịch sử giao dịch cá nhân (SC-08), nâng cấp 3 tab:
 * Thẻ game (GĐ1) / Phụ kiện (GĐ3) / Vé giờ chơi (GĐ2) — gộp chung 1 trang lịch sử duy nhất.
 */
import { useCallback, useEffect, useState } from 'react'
import { OrderApiService } from '../../order/services/OrderApiService'
import { AccessoryApiService } from '../../../../Public/accessories/services/AccessoryApiService'
import { PlaytimeApiService } from '../../../../Public/playtime/services/PlaytimeApiService'
import type { OrderSummary } from '../../order/types/order.types'
import type { AccessoryOrder } from '../../../../Public/accessories/types/accessory.types'
import type { PlaytimeOrder } from '../../../../Public/playtime/types/playtime.types'

export type HistoryTab = 'the-game' | 'phu-kien' | 've-gio-choi'

export function useHistoryFetchData() {
  const [tab, setTab] = useState<HistoryTab>('the-game')
  const [cardOrders, setCardOrders] = useState<OrderSummary[]>([])
  const [accessoryOrders, setAccessoryOrders] = useState<AccessoryOrder[]>([])
  const [playtimeOrders, setPlaytimeOrders] = useState<PlaytimeOrder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [cardRes, accessoryRes, playtimeRes] = await Promise.all([
      OrderApiService.getMyOrders(),
      AccessoryApiService.getMyOrders(),
      PlaytimeApiService.getMyOrders(),
    ])
    if (cardRes.success && cardRes.data) setCardOrders(cardRes.data)
    if (accessoryRes.success && accessoryRes.data) setAccessoryOrders(accessoryRes.data)
    if (playtimeRes.success && playtimeRes.data) setPlaytimeOrders(playtimeRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  return { tab, setTab, cardOrders, accessoryOrders, playtimeOrders, loading, refetch: fetchData }
}
