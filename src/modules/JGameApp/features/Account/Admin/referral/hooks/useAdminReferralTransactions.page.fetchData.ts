/**
 * useAdminReferralTransactions.page.fetchData — Logic tab "Giao dịch" trong AdminReferralPartnersPage.
 * Bộ lọc from/to/partnerId/category/status theo doc mục 3.3 (GET /api/admin/referral/transactions).
 */
import { useCallback, useEffect, useState } from 'react'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { ReferralTransactionAdmin, ReferralCommissionCategory, ReferralReconcileStatusAdmin } from '../../types/jgame.types'

export function useAdminReferralTransactionsFetchData() {
  const [items, setItems] = useState<ReferralTransactionAdmin[]>([])
  const [loading, setLoading] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [partnerId, setPartnerId] = useState('')
  const [category, setCategory] = useState<ReferralCommissionCategory | 'all'>('all')
  const [status, setStatus] = useState<ReferralReconcileStatusAdmin | 'all'>('all')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const r = await JGameApiServiceAdmin.getReferralTransactions({
        from: from || undefined, to: to || undefined, partnerId: partnerId || undefined, category, status,
      })
      if (r.success && r.data) setItems(r.data)
    } finally {
      setLoading(false)
    }
  }, [from, to, partnerId, category, status])

  useEffect(() => { void fetchData() }, [fetchData])

  return { items, loading, from, setFrom, to, setTo, partnerId, setPartnerId, category, setCategory, status, setStatus, refetch: fetchData }
}
