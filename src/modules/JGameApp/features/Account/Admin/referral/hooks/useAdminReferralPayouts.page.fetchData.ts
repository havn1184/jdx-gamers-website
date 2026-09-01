/**
 * useAdminReferralPayouts.page.fetchData — Logic trang Duyệt thanh toán hoa hồng (Admin).
 * 20260901-nc_doi-tac-tiep-thi-nang-cap.md mục 4 bước 19.
 */
import { useCallback, useEffect, useState } from 'react'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { ReferralPayoutAdmin, ReferralPayoutStatusAdmin } from '../../types/jgame.types'

export function useAdminReferralPayoutsFetchData() {
  const [items, setItems] = useState<ReferralPayoutAdmin[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<ReferralPayoutStatusAdmin | 'all'>('all')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const r = await JGameApiServiceAdmin.getReferralPayouts(status)
      if (r.success && r.data) setItems(r.data)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { void fetchData() }, [fetchData])

  const handleApprove = useCallback(async (id: string) => {
    setProcessingId(id)
    setErrorMessage(null)
    try {
      const r = await JGameApiServiceAdmin.approveReferralPayout(id)
      if (r.success) void fetchData()
      else setErrorMessage(r.message || 'Không duyệt được yêu cầu')
    } finally {
      setProcessingId(null)
    }
  }, [fetchData])

  const handleReject = useCallback(async (id: string, reason: string) => {
    setProcessingId(id)
    setErrorMessage(null)
    try {
      const r = await JGameApiServiceAdmin.rejectReferralPayout(id, reason)
      if (r.success) void fetchData()
      else setErrorMessage(r.message || 'Không từ chối được yêu cầu')
    } finally {
      setProcessingId(null)
    }
  }, [fetchData])

  const handleMarkPaid = useCallback(async (id: string) => {
    setProcessingId(id)
    setErrorMessage(null)
    try {
      const r = await JGameApiServiceAdmin.markReferralPayoutPaid(id)
      if (r.success) void fetchData()
      else setErrorMessage(r.message || 'Không đánh dấu được đã thanh toán')
    } finally {
      setProcessingId(null)
    }
  }, [fetchData])

  return { items, loading, status, setStatus, processingId, errorMessage, handleApprove, handleReject, handleMarkPaid, refetch: fetchData }
}
