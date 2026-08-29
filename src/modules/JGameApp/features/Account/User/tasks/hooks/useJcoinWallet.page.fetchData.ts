/**
 * useJcoinWallet.page.fetchData — Logic trang Ví JCoin (SC-TASK-04).
 */
import { useCallback, useEffect, useState } from 'react'
import { TaskApiService } from '../../../../Public/tasks/services/TaskApiService'
import type { JcoinTransaction } from '../../../../../mocks/jcoinWallet.store'

const POLL_INTERVAL_MS = 4000

export function useJcoinWalletFetchData() {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<JcoinTransaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    const [balanceRes, txRes] = await Promise.all([TaskApiService.getWalletBalance(), TaskApiService.getWalletTransactions()])
    if (balanceRes.success && balanceRes.data != null) setBalance(balanceRes.data)
    if (txRes.success && txRes.data) setTransactions(txRes.data)
    if (!silent) setLoading(false)
  }, [])

  useEffect(() => {
    void fetchData()
    const id = setInterval(() => void fetchData(true), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchData])

  return { balance, transactions, loading, refetch: fetchData }
}
