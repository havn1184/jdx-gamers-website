/**
 * useWallet.page.fetchData — Logic trang Ví (VND + JCoin): số dư + lịch sử giao dịch.
 */
import { useCallback, useEffect, useState } from 'react'
import { WalletApiService } from '../../../../Public/wallet/services/WalletApiService'
import type { PaymentMethod, WalletBalance, WalletTransaction } from '../../../../Public/wallet/types/wallet.types'

const POLL_INTERVAL_MS = 4000
const EMPTY_BALANCE: WalletBalance = { vndBalance: 0, jcoinBalance: 0 }

export function useWalletFetchData() {
  const [balance, setBalance] = useState<WalletBalance>(EMPTY_BALANCE)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [currencyFilter, setCurrencyFilter] = useState<PaymentMethod | 'all'>('all')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    const [balanceRes, txRes] = await Promise.all([
      WalletApiService.getWallet(),
      WalletApiService.getTransactions(currencyFilter === 'all' ? undefined : currencyFilter),
    ])
    if (balanceRes.success && balanceRes.data) setBalance(balanceRes.data)
    if (txRes.success && txRes.data) setTransactions(txRes.data)
    if (!silent) setLoading(false)
  }, [currencyFilter])

  useEffect(() => {
    void fetchData()
    const id = setInterval(() => void fetchData(true), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchData])

  return { balance, transactions, currencyFilter, setCurrencyFilter, loading, refetch: fetchData }
}
