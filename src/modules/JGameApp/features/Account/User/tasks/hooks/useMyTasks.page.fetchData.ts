/**
 * useMyTasks.page.fetchData — Logic trang Nhiệm vụ của tôi (SC-TASK-03).
 */
import { useCallback, useEffect, useState } from 'react'
import { TaskApiService } from '../../../../Public/tasks/services/TaskApiService'
import type { GameTask, UserTaskProgress } from '../../../../Public/tasks/types/task.types'

const POLL_INTERVAL_MS = 3000

export function useMyTasksFetchData() {
  const [items, setItems] = useState<{ task: GameTask; progress: UserTaskProgress }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    const r = await TaskApiService.getMyTasks()
    if (r.success && r.data) setItems(r.data)
    if (!silent) setLoading(false)
  }, [])

  useEffect(() => {
    void fetchData()
    const id = setInterval(() => void fetchData(true), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchData])

  return { items, loading }
}
