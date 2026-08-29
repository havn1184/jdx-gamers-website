/**
 * useAuthSession — Khôi phục & đồng bộ thông tin user hiện tại từ token (dùng trong AuthProvider).
 */
import { useCallback, useState } from 'react'
import { TokenManager } from '../../../../shared/services/api'
import { AuthApiService } from '../services/AuthApiService'
import type { AuthUser } from '../types/auth.types'

export function useAuthSession() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (!TokenManager.isAuthenticated()) {
      setUser(null)
      setLoading(false)
      return
    }
    const r = await AuthApiService.getCurrentUser()
    setUser(r.success && r.data ? r.data : null)
    setLoading(false)
  }, [])

  return { user, loading, refreshUser }
}
