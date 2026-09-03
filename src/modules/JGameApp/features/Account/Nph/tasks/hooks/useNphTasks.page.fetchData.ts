import { useCallback, useEffect, useState } from 'react'
import { NphApiService } from '../../services'
import type { NphTask } from '../../types'

export function useNphTasksFetchData() {
  const [tasks, setTasks] = useState<NphTask[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const result = await NphApiService.getTasks()
    if (result.success && result.data) {
      setTasks(result.data)
      setErrorMessage(null)
    } else {
      setErrorMessage(result.message || 'Không tải được danh sách nhiệm vụ.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  const toggleStatus = useCallback(async (id: string) => {
    const result = await NphApiService.toggleTaskStatus(id)
    if (result.success && result.data) {
      setTasks(prev => prev.map(t => (t.id === id ? result.data! : t)))
    }
    return result
  }, [])

  return { tasks, loading, errorMessage, refetch: fetchData, toggleStatus }
}
