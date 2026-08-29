/**
 * GuestOnly — Chặn route chỉ dành cho Guest (Đăng nhập/Đăng ký/Quên mật khẩu).
 * Đã đăng nhập rồi thì điều hướng về trang chủ.
 */
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PageLoader } from '../shared/components/common/PageLoader'

export function GuestOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <PageLoader />
  if (isAuthenticated) return <Navigate to='/jgame' replace />
  return <>{children}</>
}
