/**
 * useReferrerDashboard.page.fetchData — Logic Dashboard Đối tác Referrer (SC-10).
 */
import { useCallback, useEffect, useState } from 'react'
import { ReferrerApiService } from '../services/ReferrerApiService'
import type { ReferrerSummary, ReferralTransactionItem, ReferralLink } from '../types/referrer.types'

export function useReferrerDashboardFetchData() {
  const [summary, setSummary] = useState<ReferrerSummary | null>(null)
  const [transactions, setTransactions] = useState<ReferralTransactionItem[]>([])
  const [links, setLinks] = useState<ReferralLink[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [summaryRes, txRes, linksRes] = await Promise.all([
      ReferrerApiService.getSummary(),
      ReferrerApiService.getTransactions(),
      ReferrerApiService.getLinks(),
    ])
    if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data)
    if (txRes.success && txRes.data) setTransactions(txRes.data)
    if (linksRes.success && linksRes.data) setLinks(linksRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  return { summary, transactions, links, loading }
}
