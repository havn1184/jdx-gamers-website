/**
 * useWalletTopup.page — Logic trang Nạp tiền vào ví VND: tạo yêu cầu rồi xác nhận ngay
 * (mock, không chờ webhook ~6s) để UX tức thời, cùng tinh thần luồng đặt vé trước khi có ví.
 */
import { useCallback, useState } from 'react'
import { WalletApiService } from '../../../../Public/wallet/services/WalletApiService'

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000]

export function useWalletTopup() {
  const [amount, setAmount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successAmount, setSuccessAmount] = useState<number | null>(null)

  const handleTopup = useCallback(async () => {
    if (amount < 1000) return
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const createRes = await WalletApiService.topup(amount)
      if (!createRes.success || !createRes.data) {
        setErrorMessage(createRes.message || 'Không tạo được yêu cầu nạp tiền')
        return
      }
      const confirmRes = await WalletApiService.confirmTopup(createRes.data.id)
      if (confirmRes.success && confirmRes.data) {
        setSuccessAmount(confirmRes.data.amount)
      } else {
        setErrorMessage(confirmRes.message || 'Không xác nhận được nạp tiền')
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }, [amount])

  return { amount, setAmount, quickAmounts: QUICK_AMOUNTS, submitting, errorMessage, successAmount, handleTopup }
}
