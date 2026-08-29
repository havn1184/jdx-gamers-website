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
    // location.pathname đã là đường dẫn đầy đủ (khớp Route cha `/jgame/*` ở App.tsx) —
    // KHÔNG được nối thêm '/jgame' nữa, nếu không returnTo sẽ bị lặp tiền tố
    // (VD: '/jgame/jgame/tai-khoan') → không khớp route nào → rơi về Trang chủ.
    sessionStorage.setItem('jgame_return_to', `${location.pathname}${location.search}`)
    return <Navigate to='/jgame/dang-nhap' replace />
  }

  return <>{children}</>
}

/** Gọi sau khi xác nhận đã đăng nhập (VD: ở trang chủ JGame) để quay lại đúng bước dở dang. */
export function useConsumeReturnTo(): string | null {
  return consumeReturnTo()
}
