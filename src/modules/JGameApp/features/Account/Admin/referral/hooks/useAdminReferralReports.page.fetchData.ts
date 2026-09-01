/**
 * useAdminReferralReports.page.fetchData — Logic trang Báo cáo tổng hợp referral.
 * 20260901-nc_doi-tac-tiep-thi-nang-cap.md mục 4 bước 21.
 */
import { useCallback, useEffect, useState } from 'react'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { ReferralReportSummaryAdmin, ReferralCommissionCategory } from '../../types/jgame.types'

export function useAdminReferralReportsFetchData() {
  const [summary, setSummary] = useState<ReferralReportSummaryAdmin | null>(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [category, setCategory] = useState<ReferralCommissionCategory | 'all'>('all')
  const [partnerId, setPartnerId] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const r = await JGameApiServiceAdmin.getReferralReportSummary({
      from: from || undefined, to: to || undefined, category, partnerId: partnerId || undefined,
    })
    if (r.success) setSummary(r.data)
    setLoading(false)
  }, [from, to, category, partnerId])

  useEffect(() => { void fetchData() }, [fetchData])

  return { summary, loading, from, setFrom, to, setTo, category, setCategory, partnerId, setPartnerId, refetch: fetchData }
}
