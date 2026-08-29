/**
 * useCards.page.fetchData — Logic trang Danh mục thẻ & mệnh giá (SC-A2).
 */
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from '../../../../../shared/hooks/useDebounce'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { CardProductAdmin, EntityStatus } from '../../types/jgame.types'

export function useCardsFetchData() {
  const [items, setItems] = useState<CardProductAdmin[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<EntityStatus | 'all'>('all')
  const debouncedKeyword = useDebounce(keyword, 500)

  const fetchData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const r = await JGameApiServiceAdmin.getCards({ keyword: debouncedKeyword, status })
      if (r.success && r.data) setItems(r.data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [debouncedKeyword, status])

  useEffect(() => { void fetchData() }, [fetchData])

  const handleDelete = useCallback(async (id: string) => {
    const r = await JGameApiServiceAdmin.deleteCard(id)
    if (r.success) void fetchData()
    return r.success
  }, [fetchData])

  return { items, loading, refreshing, keyword, setKeyword, status, setStatus, refetch: fetchData, handleDelete }
}
