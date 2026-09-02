/**
 * useTaskMarketplace.page.fetchData — Logic trang Nhiệm vụ đang mở (SC-TASK-01).
 * Lọc server-side (`GET /api/tasks?requirementType=&keyword=`, từ khoá debounce 400ms);
 * poll 15s để cập nhật số suất còn lại, dừng khi tab ẩn (nc_nhiem-vu-web-dong-bo.md).
 */
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { useAuth } from '../../../../contexts/AuthContext'
import type { GameTask, TaskRequirementType } from '../types/task.types'
import { TaskApiService } from '../services/TaskApiService'

export type TaskFilter = TaskRequirementType | 'all'
const POLL_INTERVAL_MS = 15000

export function useTaskMarketplaceFetchData() {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState<GameTask[]>([])
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [requirementType, setRequirementType] = useState<TaskFilter>('all')
  const debouncedKeyword = useDebounce(keyword, 400)
  const hasActiveFilter = requirementType !== 'all' || keyword.trim() !== ''

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    const r = await TaskApiService.getTasks({ keyword: debouncedKeyword, requirementType })
    if (r.success && r.data) {
      setItems(r.data)
      setErrorMessage(null)
    } else if (!silent) {
      setErrorMessage(r.message || 'Không tải được danh sách nhiệm vụ')
    }
    if (!silent) setLoading(false)
  }, [debouncedKeyword, requirementType])

  // Badge "Đã đăng ký" trên card — chỉ khi đã đăng nhập (endpoint yêu cầu auth).
  const fetchRegistered = useCallback(async () => {
    if (!isAuthenticated) {
      setRegisteredIds(new Set())
      return
    }
    const r = await TaskApiService.getMyTasks()
    if (r.success && r.data) setRegisteredIds(new Set(r.data.map(i => i.task.id)))
  }, [isAuthenticated])

  useEffect(() => {
    void fetchData()
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') void fetchData(true)
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchData])

  useEffect(() => {
    void fetchRegistered()
  }, [fetchRegistered])

  const clearFilter = useCallback(() => {
    setKeyword('')
    setRequirementType('all')
  }, [])

  return {
    items, registeredIds, loading, errorMessage, keyword, setKeyword, requirementType, setRequirementType,
    hasActiveFilter, clearFilter, refetch: fetchData,
  }
}
