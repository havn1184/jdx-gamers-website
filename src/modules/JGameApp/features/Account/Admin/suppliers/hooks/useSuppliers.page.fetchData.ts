/**
 * useSuppliers.page.fetchData — Logic trang NCC & cấu hình routing (SC-A3).
 */
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from '../../../../../shared/hooks/useDebounce'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { SupplierAdmin, EntityStatus } from '../../types/jgame.types'

export function useSuppliersFetchData() {
  const [items, setItems] = useState<SupplierAdmin[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<EntityStatus | 'all'>('all')
  const debouncedKeyword = useDebounce(keyword, 500)

  const fetchData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const r = await JGameApiServiceAdmin.getSuppliers({ keyword: debouncedKeyword, status })
      if (r.success && r.data) setItems(r.data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [debouncedKeyword, status])

  useEffect(() => { void fetchData() }, [fetchData])

  const handleDelete = useCallback(async (id: string) => {
    const r = await JGameApiServiceAdmin.deleteSupplier(id)
    if (r.success) void fetchData()
    return r.success
  }, [fetchData])

  return { items, loading, refreshing, keyword, setKeyword, status, setStatus, refetch: fetchData, handleDelete }
}
