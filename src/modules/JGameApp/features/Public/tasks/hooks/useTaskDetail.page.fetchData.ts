/**
 * useTaskDetail.page.fetchData — Logic trang Chi tiết nhiệm vụ + tiến độ (SC-TASK-02).
 *
 * - Khách: chỉ tải nhiệm vụ (route public), KHÔNG gọi endpoint tiến độ (yêu cầu auth).
 * - Đã đăng nhập: tải thêm tiến độ; poll 15s khi đang thực hiện, dừng khi tab ẩn / đã hoàn thành / chưa đăng ký.
 * - "Đồng bộ ngay": `POST /progress/sync`, cooldown 60s khớp `Tasks:Simulation:ManualSyncMinIntervalSeconds` của BE.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../../../contexts/AuthContext'
import type { GameTask, UserTaskProgress } from '../types/task.types'
import { TaskApiService, emptyProgress } from '../services/TaskApiService'

const POLL_INTERVAL_MS = 15000
const SYNC_COOLDOWN_MS = 60000

export function useTaskDetailFetchData(taskId: string | undefined) {
  const { isAuthenticated } = useAuth()
  const [task, setTask] = useState<GameTask | null>(null)
  const [progress, setProgress] = useState<UserTaskProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cooldownLeft, setCooldownLeft] = useState(0)
  const cooldownUntilRef = useRef<number>(0)

  const fetchData = useCallback(async (silent = false) => {
    if (!taskId) return
    if (!silent) setLoading(true)
    const taskRes = await TaskApiService.getTaskDetail(taskId)
    if (taskRes.success && taskRes.data) {
      const loadedTask = taskRes.data
      setTask(loadedTask)
      if (isAuthenticated) {
        const progressRes = await TaskApiService.getMyProgress(taskId)
        if (progressRes.success && progressRes.data) setProgress(progressRes.data)
        else if (progressRes.success) setProgress(emptyProgress(taskId, loadedTask.requirementTargetValue))
      } else {
        setProgress(emptyProgress(taskId, loadedTask.requirementTargetValue))
      }
    } else if (!silent) {
      setNotFound(true)
    }
    if (!silent) setLoading(false)
  }, [taskId, isAuthenticated])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  // Poll chỉ khi đang thực hiện (tiến độ có thể thay đổi), dừng khi tab ẩn.
  const shouldPoll = isAuthenticated && progress?.status === 'inProgress'
  useEffect(() => {
    if (!shouldPoll) return
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') void fetchData(true)
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [shouldPoll, fetchData])

  // Đếm ngược cooldown nút "Đồng bộ ngay".
  useEffect(() => {
    if (cooldownLeft <= 0) return
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((cooldownUntilRef.current - Date.now()) / 1000))
      setCooldownLeft(left)
    }, 1000)
    return () => clearInterval(id)
  }, [cooldownLeft])

  const handleRegister = useCallback(async () => {
    if (!taskId) return
    setRegistering(true)
    setErrorMessage(null)
    try {
      // BE chỉ trả { registrationCode } — gọi lại getMyProgress để có tiến độ đầy đủ (mã đăng ký, mốc, nhật ký).
      const r = await TaskApiService.registerTask(taskId)
      if (r.success && r.data) {
        const progressRes = await TaskApiService.getMyProgress(taskId)
        if (progressRes.success && progressRes.data) setProgress(progressRes.data)
        const taskRes = await TaskApiService.getTaskDetail(taskId)
        if (taskRes.success && taskRes.data) setTask(taskRes.data)
        toast.success('Đăng ký nhiệm vụ thành công - nhập mã vào game để bắt đầu')
      } else {
        setErrorMessage(r.message || 'Không đăng ký được nhiệm vụ')
      }
    } finally {
      setRegistering(false)
    }
  }, [taskId])

  const handleSync = useCallback(async () => {
    if (!taskId || syncing || cooldownLeft > 0) return
    setSyncing(true)
    try {
      const r = await TaskApiService.syncProgress(taskId)
      if (r.success && r.data) {
        setProgress(r.data)
        toast.success('Đã đồng bộ tiến độ')
      } else {
        toast.error(r.message || 'Đồng bộ tiến độ thất bại')
      }
    } finally {
      cooldownUntilRef.current = Date.now() + SYNC_COOLDOWN_MS
      setCooldownLeft(SYNC_COOLDOWN_MS / 1000)
      setSyncing(false)
    }
  }, [taskId, syncing, cooldownLeft])

  const copyRegistrationCode = useCallback(async () => {
    const code = progress?.registrationCode
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Đã sao chép mã nhiệm vụ')
    } catch {
      toast.error('Không sao chép được, hãy chọn và copy thủ công')
    }
  }, [progress?.registrationCode])

  return {
    task, progress, loading, notFound, registering, syncing, cooldownLeft, errorMessage,
    handleRegister, handleSync, copyRegistrationCode, refetch: fetchData,
  }
}
