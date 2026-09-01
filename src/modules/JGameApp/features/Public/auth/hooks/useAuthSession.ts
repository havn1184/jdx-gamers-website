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
    try {
      const r = await AuthApiService.getCurrentUser()
      setUser(r.success && r.data ? r.data : null)
    } catch {
      // Token còn hạn theo claim cục bộ nhưng BE từ chối (VD: đổi JWT secret ở server,
      // token phát trước đó không còn hợp lệ) — không được để loading treo vô hạn
      // (GuestOnly/RequireAuth đều gate theo `loading`, xem GuestOnly.tsx).
      TokenManager.clearTokens()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return { user, loading, refreshUser }
}
