import { useCallback, useEffect, useState } from 'react'
import { NphApiService } from '../../services'
import type { NphTransaction } from '../../types'

export function useNphTransactionsFetchData() {
  const [transactions, setTransactions] = useState<NphTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const result = await NphApiService.getTransactions()
    if (result.success && result.data) {
      setTransactions(result.data)
      setErrorMessage(null)
    } else {
      setErrorMessage(result.message || 'Không tải được lịch sử giao dịch.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  return { transactions, loading, errorMessage }
}
