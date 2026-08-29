/**
 * RequireAuth — Bảo vệ route cần đăng nhập (xác nhận thanh toán, QR, kết quả,
 * lịch sử, dashboard đối tác...). Guest → lưu returnTo rồi chuyển sang trang
 * đăng nhập RIÊNG của JGame (không còn qua SSO, FR-6.1.2).
 */
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { consumeReturnTo } from '../shared/utils/pendingSelection'
import { PageLoader } from '../shared/components/common/PageLoader'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  if (!isAuthenticated) {
    sessionStorage.setItem('jgame_return_to', `/jgame${location.pathname}${location.search}`)
    return <Navigate to='/jgame/dang-nhap' replace />
  }

  return <>{children}</>
}

/** Gọi sau khi xác nhận đã đăng nhập (VD: ở trang chủ JGame) để quay lại đúng bước dở dang. */
export function useConsumeReturnTo(): string | null {
  return consumeReturnTo()
}
