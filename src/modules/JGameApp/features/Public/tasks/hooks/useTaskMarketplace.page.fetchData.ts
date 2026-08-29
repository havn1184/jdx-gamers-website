/**
 * useTaskMarketplace.page.fetchData — Logic trang Nhiệm vụ đang mở (SC-TASK-01).
 * Poll lại mỗi 3s để thấy số người tham gia tăng dần "trực tiếp" (mô phỏng đồng bộ từ game).
 */
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { TaskApiService } from '../services/TaskApiService'
import type { GameTask, TaskRequirementType } from '../types/task.types'

export type TaskFilter = TaskRequirementType | 'all'
const POLL_INTERVAL_MS = 3000

export function useTaskMarketplaceFetchData() {
  const [items, setItems] = useState<GameTask[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [requirementType, setRequirementType] = useState<TaskFilter>('all')
  const debouncedKeyword = useDebounce(keyword, 400)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    const r = await TaskApiService.getTasks({ keyword: debouncedKeyword, requirementType })
    if (r.success && r.data) setItems(r.data)
    if (!silent) setLoading(false)
  }, [debouncedKeyword, requirementType])

  useEffect(() => {
    void fetchData()
    const id = setInterval(() => void fetchData(true), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchData])

  return { items, loading, keyword, setKeyword, requirementType, setRequirementType }
}
