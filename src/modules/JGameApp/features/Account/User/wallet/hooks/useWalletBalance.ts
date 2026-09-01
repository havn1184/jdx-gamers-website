/**
 * useWalletBalance — Số dư ví (VND + JCoin) hiện tại, dùng ở Header (badge) và các trang
 * thanh toán (chọn phương thức thanh toán). Chỉ fetch khi đã đăng nhập.
 */
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../../../contexts/AuthContext'
import { WalletApiService } from '../../../../Public/wallet/services/WalletApiService'
import type { WalletBalance } from '../../../../Public/wallet/types/wallet.types'

const EMPTY_BALANCE: WalletBalance = { vndBalance: 0, jcoinBalance: 0 }

export function useWalletBalance() {
  const { isAuthenticated } = useAuth()
  const [balance, setBalance] = useState<WalletBalance>(EMPTY_BALANCE)
  const [loading, setLoading] = useState(false)

  const fetchBalance = useCallback(async () => {
    if (!isAuthenticated) { setBalance(EMPTY_BALANCE); return }
    setLoading(true)
    const r = await WalletApiService.getWallet()
    if (r.success && r.data) setBalance(r.data)
    setLoading(false)
  }, [isAuthenticated])

  useEffect(() => { void fetchBalance() }, [fetchBalance])

  return { balance, loading, refetchBalance: fetchBalance }
}
