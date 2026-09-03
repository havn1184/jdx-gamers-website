/**
 * NphAuthContext — Phiên đăng nhập NPH, ĐỘC LẬP với AuthContext của Customer/Admin. Chỉ bọc quanh
 * các trang cổng NPH (qua RequireNphAuth) — không mount ở gốc JGamePortal như AuthProvider.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { NphAuthService, NphTokenManager } from '../services'
import type { NphProfile } from '../types'

interface NphAuthContextType {
  profile: NphProfile | null
  logout: () => void
}

const NphAuthContext = createContext<NphAuthContextType | undefined>(undefined)

export function NphAuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<NphProfile | null>(() => NphTokenManager.getProfile())

  const logout = useCallback(() => {
    NphAuthService.logout()
    setProfile(null)
    window.location.hash = '#/jgame/nph/dang-nhap'
  }, [])

  const value = useMemo<NphAuthContextType>(() => ({ profile, logout }), [profile, logout])

  return <NphAuthContext.Provider value={value}>{children}</NphAuthContext.Provider>
}

export function useNphAuth(): NphAuthContextType {
  const ctx = useContext(NphAuthContext)
  if (!ctx) throw new Error('useNphAuth phải được dùng trong NphAuthProvider')
  return ctx
}
