/**
 * useShopSync.page — Logic trang Đồng bộ nền tảng (SC-P2-S4): thủ công / NetBarBox / DoDoNew.
 */
import { useCallback, useEffect, useState } from 'react'
import { useMyShop } from './useMyShop'
import { ShopOwnerApiService } from '../services/ShopOwnerApiService'
import type { PlaytimeTicket, ShopSyncMode } from '../types/shop-owner.types'

export function useShopSync() {
  const { shop, loading: loadingShop, refetch: refetchShop } = useMyShop()
  const [tickets, setTickets] = useState<PlaytimeTicket[]>([])
  const [savingMode, setSavingMode] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadTickets = useCallback(async () => {
    try {
      const r = await ShopOwnerApiService.getTickets()
      if (r.success && r.data) setTickets(r.data)
    } catch {
      // Không chặn cả trang chỉ vì phần "Số chỗ trống hiện tại" tải lỗi — bỏ qua, giữ danh sách rỗng.
    }
  }, [])

  useEffect(() => { void loadTickets() }, [loadTickets])

  const setSyncMode = useCallback(async (mode: ShopSyncMode) => {
    setSavingMode(true)
    setErrorMessage(null)
    try {
      const r = await ShopOwnerApiService.setSyncMode(mode)
      if (r.success) await refetchShop()
      else setErrorMessage(r.message || 'Không đổi được chế độ đồng bộ')
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSavingMode(false)
    }
  }, [refetchShop])

  const syncNow = useCallback(async () => {
    setSyncing(true)
    setErrorMessage(null)
    try {
      const r = await ShopOwnerApiService.syncNow()
      if (r.success && r.data) { setTickets(r.data); setLastSyncedAt(new Date().toISOString()) }
      else setErrorMessage(r.message || 'Đồng bộ thất bại')
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSyncing(false)
    }
  }, [])

  return { shop, loadingShop, tickets, savingMode, setSyncMode, syncing, syncNow, lastSyncedAt, errorMessage }
}
