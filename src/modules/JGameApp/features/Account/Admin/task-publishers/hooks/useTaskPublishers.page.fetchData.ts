import { useCallback, useEffect, useState } from 'react'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { TaskPublisherAdmin, TaskPublisherFormPayload } from '../../types/jgame.types'

export function useTaskPublishersFetchData() {
  const [items, setItems] = useState<TaskPublisherAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  /** Kết quả reveal-once (password/webhookSecret) sau thao tác tạo/xoay khoá/đặt lại mật khẩu —
   * hiển thị panel inline, KHÔNG Dialog (quy ước UI khu Admin JGameApp). */
  const [revealPanel, setRevealPanel] = useState<{ name: string; password: string | null; webhookSecret: string | null } | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const result = await JGameApiServiceAdmin.getTaskPublishers()
    if (result.success && result.data) {
      setItems(result.data)
      setErrorMessage(null)
    } else {
      setErrorMessage(result.message || 'Không tải được danh sách NPH.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  const handleCreate = useCallback(async (data: TaskPublisherFormPayload) => {
    const result = await JGameApiServiceAdmin.createTaskPublisher(data)
    if (result.success && result.data) {
      setRevealPanel({ name: result.data.name, password: result.data.password, webhookSecret: result.data.webhookSecret })
      void fetchData()
    }
    return result
  }, [fetchData])

  const handleRotateSecret = useCallback(async (id: string, name: string) => {
    const result = await JGameApiServiceAdmin.rotateTaskPublisherSecret(id)
    if (result.success && result.data) {
      setRevealPanel({ name, password: null, webhookSecret: result.data.webhookSecret })
      void fetchData()
    }
    return result
  }, [fetchData])

  const handleResetPassword = useCallback(async (id: string, name: string) => {
    const result = await JGameApiServiceAdmin.resetTaskPublisherPassword(id)
    if (result.success && result.data) {
      setRevealPanel({ name, password: result.data.password, webhookSecret: null })
      void fetchData()
    }
    return result
  }, [fetchData])

  const handleSuspend = useCallback(async (id: string) => {
    const result = await JGameApiServiceAdmin.suspendTaskPublisher(id)
    if (result.success) void fetchData()
    return result
  }, [fetchData])

  const handleActivate = useCallback(async (id: string) => {
    const result = await JGameApiServiceAdmin.activateTaskPublisher(id)
    if (result.success) void fetchData()
    return result
  }, [fetchData])

  return {
    items, loading, errorMessage, refetch: fetchData,
    revealPanel, setRevealPanel,
    handleCreate, handleRotateSecret, handleResetPassword, handleSuspend, handleActivate,
  }
}
