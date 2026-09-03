/**
 * useNphWalletFetchData — Số dư quỹ + lịch sử nạp + form nạp tiền. Nạp tiền xong BE trả `qrCode` là URL
 * checkout cổng thanh toán (VtcPay) — mở tab mới để NPH thanh toán, giữ nguyên trang hiện tại để họ quay
 * lại xem lịch sử. Cũng cho phép "Xác nhận" thủ công (endpoint dev/dự phòng BE có sẵn) để tiện test.
 */
import { useCallback, useEffect, useState } from 'react'
import { NphApiService } from '../../services'
import type { NphTopup, NphWallet } from '../../types'

export function useNphWalletFetchData() {
  const [wallet, setWallet] = useState<NphWallet | null>(null)
  const [topups, setTopups] = useState<NphTopup[]>([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [walletResult, topupsResult] = await Promise.all([NphApiService.getWallet(), NphApiService.getWalletTopups()])
    if (walletResult.success && walletResult.data) setWallet(walletResult.data)
    if (topupsResult.success && topupsResult.data) setTopups(topupsResult.data)
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  const handleTopup = useCallback(async () => {
    if (amount < 1000 || submitting) return
    setSubmitting(true)
    setErrorMessage(null)
    const result = await NphApiService.createWalletTopup(amount)
    setSubmitting(false)
    if (!result.success || !result.data) {
      setErrorMessage(result.message || 'Tạo yêu cầu nạp quỹ thất bại.')
      return
    }
    window.open(result.data.qrCode, '_blank', 'noopener,noreferrer')
    setAmount(0)
    void fetchData()
  }, [amount, submitting, fetchData])

  const handleConfirm = useCallback(async (topupId: string) => {
    const result = await NphApiService.confirmWalletTopup(topupId)
    if (result.success) void fetchData()
    return result
  }, [fetchData])

  return { wallet, topups, loading, amount, setAmount, submitting, errorMessage, handleTopup, handleConfirm, refetch: fetchData }
}
