/**
 * JGamePortal — Shell chính của portal JGame (storefront khách hàng).
 *
 * KHÁC JpayPortal: KHÔNG chặn toàn bộ portal khi chưa đăng nhập — Guest vẫn
 * xem được Trang chủ/Chi tiết thẻ (URD nguyên tắc "Xem trước, đăng nhập mới mua").
 * Chỉ các route cần auth mới bị `RequireAuth` (khai báo trong routeConfig) chặn.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { CartProvider } from '../contexts/CartContext'
import { StorefrontLayout } from './StorefrontLayout'
import { consumeReturnTo } from '../shared/utils/pendingSelection'

function JGamePortalContent() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Vừa đăng nhập xong và có bước dở dang (FR-6.1.2) → quay lại đúng chỗ 1 lần
  useEffect(() => {
    if (!isAuthenticated) return
    const returnTo = consumeReturnTo()
    if (returnTo) navigate(returnTo.replace(/^#/, ''), { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  return <StorefrontLayout />
}

export function JGamePortal() {
  return (
    <AuthProvider>
      <CartProvider>
        <JGamePortalContent />
      </CartProvider>
    </AuthProvider>
  )
}
