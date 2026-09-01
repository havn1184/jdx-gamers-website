/**
 * useReferralPayout.page — Logic trang "Thanh toán" (yêu cầu rút hoa hồng + lịch sử).
 * 20260901-nc_doi-tac-tiep-thi-nang-cap.md mục 4 bước 15.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ReferrerApiService } from '../services/ReferrerApiService'
import type { ReferrerSummary, ReferralPayoutRequestItem } from '../types/referrer.types'

export function useReferralPayout() {
  const [summary, setSummary] = useState<ReferrerSummary | null>(null)
  const [payouts, setPayouts] = useState<ReferralPayoutRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [summaryRes, payoutsRes] = await Promise.all([
      ReferrerApiService.getSummary(),
      ReferrerApiService.getPayouts(),
    ])
    if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data)
    if (payoutsRes.success && payoutsRes.data) setPayouts(payoutsRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  /** Có thể rút = TotalCommission - tổng đã Approved/Paid trước đó (BE tính lại chuẩn khi tạo yêu cầu,
   * đây chỉ là ước lượng hiển thị phía FE để người dùng biết giới hạn trước khi nhập). */
  const availableToWithdraw = useMemo(() => {
    if (!summary) return 0
    const alreadyRequested = payouts
      .filter(p => p.status === 'approved' || p.status === 'paid' || p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0)
    return Math.max(0, summary.totalCommission - alreadyRequested)
  }, [summary, payouts])

  const amountNumber = Number(amount.replace(/\D/g, '')) || 0
  const isValid = amountNumber > 0 && amountNumber <= availableToWithdraw

  const handleSubmit = useCallback(async () => {
    if (!isValid) return
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const r = await ReferrerApiService.requestPayout({ amount: amountNumber })
      if (r.success) {
        setAmount('')
        void fetchData()
      } else {
        setErrorMessage(r.message || 'Không tạo được yêu cầu rút — vui lòng thử lại')
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }, [isValid, amountNumber, fetchData])

  return {
    summary, payouts, loading, amount, setAmount, availableToWithdraw,
    isValid, submitting, errorMessage, handleSubmit,
  }
}
