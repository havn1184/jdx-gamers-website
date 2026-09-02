/**
 * useMyTasks.page.fetchData — Logic trang Nhiệm vụ của tôi (SC-TASK-03).
 * 1 request `GET /api/tasks/my` trả `{ task, progress }[]`; lọc client-side theo trạng thái;
 * poll 15s khi còn nhiệm vụ đang thực hiện, dừng khi tab ẩn.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { MyTaskItem } from '../../../../Public/tasks/types/task.types'
import { TaskApiService } from '../../../../Public/tasks/services/TaskApiService'

export type MyTaskFilter = 'all' | 'inProgress' | 'completed'
const POLL_INTERVAL_MS = 15000

export function useMyTasksFetchData() {
  const [items, setItems] = useState<MyTaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [filter, setFilter] = useState<MyTaskFilter>('all')

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    const r = await TaskApiService.getMyTasks()
    if (r.success && r.data) {
      setItems(r.data)
      setErrorMessage(null)
    } else if (!silent) {
      setErrorMessage(r.message || 'Không tải được nhiệm vụ của tôi')
    }
    if (!silent) setLoading(false)
  }, [])

  const hasInProgress = items.some(i => i.progress.status === 'inProgress')

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!hasInProgress) return
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') void fetchData(true)
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [hasInProgress, fetchData])

  const summary = useMemo(() => {
    const completed = items.filter(i => i.progress.status === 'completed')
    return {
      inProgressCount: items.length - completed.length,
      completedCount: completed.length,
      earnedJcoin: completed.reduce((sum, i) => sum + i.task.rewardJcoin, 0),
    }
  }, [items])

  const visibleItems = useMemo(() => {
    if (filter === 'completed') return items.filter(i => i.progress.status === 'completed')
    if (filter === 'inProgress') return items.filter(i => i.progress.status !== 'completed')
    return items
  }, [items, filter])

  return { items, visibleItems, summary, loading, errorMessage, filter, setFilter, refetch: fetchData }
}
