/**
 * RequireShopOwner — Bảo vệ các trang Kênh Người Bán: chưa có gian hàng → điều hướng
 * sang trang đăng ký. Đặt cùng nhóm layout guard với RequireAuth/GuestOnly.
 */
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useMyShop } from '../features/Account/ShopOwner/hooks/useMyShop'
import { PageLoader } from '../shared/components/common/PageLoader'

export function RequireShopOwner({ children }: { children: ReactNode }) {
  const { shop, loading } = useMyShop()

  if (loading) return <PageLoader />
  if (!shop) return <Navigate to='/jgame/kenh-nguoi-ban/dang-ky' replace />

  return <>{children}</>
}
