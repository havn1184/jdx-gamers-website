/**
 * useJGameReports.page.fetchData — Logic Báo cáo doanh thu & đối soát (SC-A6).
 */
import { useCallback, useEffect, useState } from 'react'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { RevenueReportRow } from '../../types/jgame.types'

export function useJGameReportsFetchData() {
  const [rows, setRows] = useState<RevenueReportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const r = await JGameApiServiceAdmin.getRevenueReport()
      if (r.success && r.data) setRows(r.data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  return { rows, loading, refreshing, refetch: fetchData }
}
