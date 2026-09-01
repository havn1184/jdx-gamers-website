/**
 * useAdminReferralCommissionRates.page — Logic trang Cấu hình tỷ lệ hoa hồng theo loại + lịch sử.
 * 20260901-nc_doi-tac-tiep-thi-nang-cap.md mục 4 bước 20.
 */
import { useCallback, useEffect, useState } from 'react'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { ReferralCommissionRateAdmin, ReferralCommissionRateHistoryAdmin, ReferralCommissionCategory } from '../../types/jgame.types'

export function useAdminReferralCommissionRates() {
  const [rates, setRates] = useState<ReferralCommissionRateAdmin[]>([])
  const [history, setHistory] = useState<ReferralCommissionRateHistoryAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<ReferralCommissionCategory | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const r = await JGameApiServiceAdmin.getCommissionRates()
    if (r.success && r.data) {
      setRates(r.data.rates)
      setHistory(r.data.history)
    }
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  const startEdit = useCallback((category: ReferralCommissionCategory, currentRatePercent: number) => {
    setEditingCategory(category)
    setEditValue(String(Math.round(currentRatePercent * 100)))
    setErrorMessage(null)
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingCategory(null)
    setEditValue('')
  }, [])

  const handleSave = useCallback(async () => {
    if (!editingCategory) return
    const ratePercent = (Number(editValue.replace(/\D/g, '')) || 0) / 100
    setSaving(true)
    setErrorMessage(null)
    try {
      const r = await JGameApiServiceAdmin.updateCommissionRate(editingCategory, ratePercent)
      if (r.success) {
        setEditingCategory(null)
        setEditValue('')
        void fetchData()
      } else {
        setErrorMessage(r.message || 'Không lưu được — vui lòng thử lại')
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSaving(false)
    }
  }, [editingCategory, editValue, fetchData])

  return { rates, history, loading, editingCategory, editValue, setEditValue, saving, errorMessage, startEdit, cancelEdit, handleSave }
}
