/**
 * useTaskRanking.page.fetchData — Logic trang "Bảng xếp hạng JCoin" (20260902-nc_xep-hang-jcoin.md).
 */
import { useCallback, useEffect, useState } from 'react'
import { TaskApiService } from '../services/TaskApiService'
import type { TaskRanking, TaskRankingPeriod } from '../types/task.types'

export function useTaskRankingFetchData() {
  const [period, setPeriod] = useState<TaskRankingPeriod>('week')
  const [ranking, setRanking] = useState<TaskRanking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const r = await TaskApiService.getRanking(period)
    if (r.success && r.data) setRanking(r.data)
    else setError(r.message || 'Không tải được bảng xếp hạng')
    setLoading(false)
  }, [period])

  useEffect(() => { void fetchData() }, [fetchData])

  return { period, setPeriod, ranking, loading, error, refetch: fetchData }
}
