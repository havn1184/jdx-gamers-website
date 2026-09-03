import { useCallback, useEffect, useState } from 'react'
import { NphApiService } from '../../services'
import type { NphDashboard } from '../../types'

export function useNphDashboardFetchData() {
  const [dashboard, setDashboard] = useState<NphDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const result = await NphApiService.getDashboard()
    if (result.success && result.data) {
      setDashboard(result.data)
      setErrorMessage(null)
    } else {
      setErrorMessage(result.message || 'Không tải được dữ liệu tổng quan.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  return { dashboard, loading, errorMessage, refetch: fetchData }
}
