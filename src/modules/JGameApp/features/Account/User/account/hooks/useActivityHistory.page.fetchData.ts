/**
 * useActivityHistory.page.fetchData — Logic trang Lịch sử đăng nhập & hoạt động (SC-19).
 */
import { useCallback, useEffect, useState } from 'react'
import { AccountApiService } from '../services/AccountApiService'
import type { LoginHistoryEntry } from '../types/account.types'

export function useActivityHistoryFetchData() {
  const [items, setItems] = useState<LoginHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const r = await AccountApiService.getLoginHistory()
    if (r.success && r.data) setItems(r.data)
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  return { items, loading }
}
