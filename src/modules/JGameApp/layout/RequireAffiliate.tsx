/**
 * RequireAffiliate — Bảo vệ trang Dashboard Đối tác: chưa đăng ký → điều hướng sang trang đăng ký.
 * Cùng mẫu với RequireShopOwner/RequireAdmin.
 */
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useMyAffiliate } from '../features/Account/Partner/hooks/useMyAffiliate'
import { PageLoader } from '../shared/components/common/PageLoader'

export function RequireAffiliate({ children }: { children: ReactNode }) {
  const { isAffiliate, loading } = useMyAffiliate()

  if (loading) return <PageLoader />
  if (!isAffiliate) return <Navigate to='/jgame/doi-tac/dang-ky' replace />

  return <>{children}</>
}
