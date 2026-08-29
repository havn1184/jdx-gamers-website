/**
 * useOrders.page.fetchData — Logic trang Danh sách & chi tiết giao dịch (SC-A4).
 */
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from '../../../../../shared/hooks/useDebounce'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { OrderAdminItem } from '../../types/jgame.types'

export function useOrdersFetchData() {
  const [items, setItems] = useState<OrderAdminItem[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 500)

  const fetchData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const r = await JGameApiServiceAdmin.getOrders({ keyword: debouncedKeyword })
      if (r.success && r.data) setItems(r.data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [debouncedKeyword])

  useEffect(() => { void fetchData() }, [fetchData])

  const resolveOrder = useCallback(async (id: string, action: 'refund' | 'reissue') => {
    const r = await JGameApiServiceAdmin.manualResolveOrder(id, action)
    if (r.success) void fetchData()
    return r.success
  }, [fetchData])

  return { items, loading, refreshing, keyword, setKeyword, refetch: fetchData, resolveOrder }
}
