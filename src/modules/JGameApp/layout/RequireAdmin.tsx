/**
 * RequireAdmin — Bảo vệ khu Quản trị JGame: chỉ tài khoản role='admin' được vào,
 * còn lại điều hướng về trang chủ. Cùng mẫu với RequireShopOwner/RequireAffiliate.
 */
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PageLoader } from '../shared/components/common/PageLoader'

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />
  if (!user || user.role !== 'admin') return <Navigate to='/jgame' replace />

  return <>{children}</>
}
