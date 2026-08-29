/**
 * useAccessories.page.fetchData — Logic trang Quản lý phụ kiện Gamer (hãng sản xuất/nhóm sản
 * phẩm/chi tiết sản phẩm), cùng mẫu với useCards.page.fetchData.ts.
 */
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from '../../../../../shared/hooks/useDebounce'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { AccessoryAdmin, AccessoryCategoryAdmin, EntityStatus } from '../../types/jgame.types'

export function useAccessoriesFetchData() {
  const [items, setItems] = useState<AccessoryAdmin[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<EntityStatus | 'all'>('all')
  const [category, setCategory] = useState<AccessoryCategoryAdmin | 'all'>('all')
  const debouncedKeyword = useDebounce(keyword, 500)

  const fetchData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const r = await JGameApiServiceAdmin.getAccessories({ keyword: debouncedKeyword, status, category })
      if (r.success && r.data) setItems(r.data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [debouncedKeyword, status, category])

  useEffect(() => { void fetchData() }, [fetchData])

  const handleDelete = useCallback(async (id: string) => {
    const r = await JGameApiServiceAdmin.deleteAccessory(id)
    if (r.success) void fetchData()
    return r.success
  }, [fetchData])

  return { items, loading, refreshing, keyword, setKeyword, status, setStatus, category, setCategory, refetch: fetchData, handleDelete }
}
