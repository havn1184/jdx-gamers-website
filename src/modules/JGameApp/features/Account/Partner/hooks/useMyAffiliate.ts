/**
 * useMyAffiliate — Kiểm tra tài khoản hiện tại đã là Đối tác tiếp thị liên kết chưa
 * (dùng cho guard RequireAffiliate + điều hướng trang đăng ký).
 */
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import { ReferrerApiService } from '../services/ReferrerApiService'

export function useMyAffiliate() {
  const { isAuthenticated } = useAuth()
  const [isAffiliate, setIsAffiliate] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) { setIsAffiliate(false); setLoading(false); return }
    setLoading(true)
    const r = await ReferrerApiService.getMyAffiliateStatus()
    if (r.success) setIsAffiliate(Boolean(r.data))
    setLoading(false)
  }, [isAuthenticated])

  useEffect(() => { void fetchData() }, [fetchData])

  return { isAffiliate, loading, refetch: fetchData }
}
