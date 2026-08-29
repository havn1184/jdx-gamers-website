/**
 * useJcoinBalance — Số dư JCoin hiện tại, dùng ở Header (badge) và các trang thanh toán
 * (tuỳ chọn "Dùng số dư JCoin"). Chỉ fetch khi đã đăng nhập.
 */
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../../../contexts/AuthContext'
import { TaskApiService } from '../../../../Public/tasks/services/TaskApiService'

export function useJcoinBalance() {
  const { isAuthenticated } = useAuth()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchBalance = useCallback(async () => {
    if (!isAuthenticated) { setBalance(0); return }
    setLoading(true)
    const r = await TaskApiService.getWalletBalance()
    if (r.success && r.data != null) setBalance(r.data)
    setLoading(false)
  }, [isAuthenticated])

  useEffect(() => { void fetchBalance() }, [fetchBalance])

  return { balance, loading, refetchBalance: fetchBalance }
}
