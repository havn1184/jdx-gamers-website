/**
 * AuthContext — Phiên đăng nhập JGame ĐỘC LẬP (không còn qua SSO).
 * Logic gọi API nằm trong `useAuthSession` (features/auth) — Context chỉ ghép
 * state lại và cung cấp `logout()`. Hook đăng ký/đăng nhập gọi `AuthApiService`
 * rồi gọi `refreshUser()` ở đây để đồng bộ state toàn app; `RequireAuth` và các
 * trang khác chỉ cần `isAuthenticated`/`loading` — không đổi cách dùng so với trước.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { TokenManager } from '../shared/services/api'
import { useAuthSession } from '../features/Public/auth/hooks/useAuthSession'
import { logActivity } from '../mocks/loginHistory.store'
import type { AuthUser } from '../features/Public/auth/types/auth.types'

interface AuthContextType {
  /** Có token hợp lệ hay không */
  isAuthenticated: boolean
  /** Thông tin tài khoản hiện tại (null khi chưa đăng nhập) */
  user: AuthUser | null
  /** Đang khôi phục phiên lúc load trang */
  loading: boolean
  /** Gọi lại sau khi login/register/verify2FA/updateProfile thành công để đồng bộ state */
  refreshUser: () => Promise<void>
  /** Đăng xuất */
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, refreshUser } = useAuthSession()

  useEffect(() => { void refreshUser() }, [refreshUser])

  const logout = useCallback(() => {
    const userId = TokenManager.getUserId()
    if (userId) logActivity(userId, 'LOGOUT')
    TokenManager.clearTokens()
    void refreshUser()
    window.location.hash = '#/jgame/dang-nhap'
  }, [refreshUser])

  const value = useMemo<AuthContextType>(
    () => ({ isAuthenticated: Boolean(user), user, loading, refreshUser, logout }),
    [user, loading, refreshUser, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải được dùng trong AuthProvider')
  return ctx
}
