/**
 * RequireNphAuth — Bảo vệ khu tự phục vụ NPH: chỉ phiên NPH hợp lệ (token riêng, KHÔNG phải
 * Customer/Admin) được vào, còn lại điều hướng về `/jgame/nph/dang-nhap`
 * (20260903-nc_quan-tri-nha-phat-hanh-game.md mục 1.2/2.2). Đồng thời cấp `NphAuthProvider` cho cây
 * con — NPH là 1 hệ phiên độc lập, không mount Provider ở gốc JGamePortal như AuthProvider.
 */
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { NphTokenManager } from '../features/Account/Nph/services'
import { NphAuthProvider } from '../features/Account/Nph/contexts/NphAuthContext'

export function RequireNphAuth({ children }: { children: ReactNode }) {
  if (!NphTokenManager.isAuthenticated()) return <Navigate to='/jgame/nph/dang-nhap' replace />

  return <NphAuthProvider>{children}</NphAuthProvider>
}
