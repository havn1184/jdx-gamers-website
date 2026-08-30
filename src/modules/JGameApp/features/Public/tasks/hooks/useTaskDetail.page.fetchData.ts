/**
 * useTaskDetail.page.fetchData — Logic trang Chi tiết nhiệm vụ + tiến độ (SC-TASK-02).
 * Poll mỗi 3s để thấy tiến độ/số người tham gia tự cập nhật (mô phỏng game đồng bộ về JGame).
 */
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import { TaskApiService } from '../services/TaskApiService'
import type { GameTask, UserTaskProgress } from '../types/task.types'

const POLL_INTERVAL_MS = 3000

export function useTaskDetailFetchData(taskId: string | undefined) {
  const { isAuthenticated } = useAuth()
  const [task, setTask] = useState<GameTask | null>(null)
  const [progress, setProgress] = useState<UserTaskProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = useCallback(async (silent = false) => {
    if (!taskId) return
    if (!silent) setLoading(true)
    const taskRes = await TaskApiService.getTaskDetail(taskId)
    if (taskRes.success && taskRes.data) {
      setTask(taskRes.data)
      if (isAuthenticated) {
        const progressRes = await TaskApiService.getMyProgress(taskId)
        if (progressRes.success) setProgress(progressRes.data)
      }
    } else if (!silent) {
      setNotFound(true)
    }
    if (!silent) setLoading(false)
  }, [taskId, isAuthenticated])

  useEffect(() => {
    void fetchData()
    const id = setInterval(() => void fetchData(true), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchData])

  const handleRegister = useCallback(async () => {
    if (!taskId) return
    setRegistering(true)
    setErrorMessage(null)
    try {
      // BE chỉ trả { registrationCode } khi đăng ký thành công (không trả progress đầy đủ
      // như trước) — gọi lại getMyProgress để lấy tiến độ mới nhất cho UI.
      const r = await TaskApiService.registerTask(taskId)
      if (r.success && r.data) {
        const progressRes = await TaskApiService.getMyProgress(taskId)
        if (progressRes.success) setProgress(progressRes.data)
      } else {
        setErrorMessage(r.message || 'Không đăng ký được nhiệm vụ')
      }
    } finally {
      setRegistering(false)
    }
  }, [taskId])

  return { task, progress, loading, notFound, registering, errorMessage, handleRegister }
}
