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

  const loadTickets = useCallback(async () => {
    const r = await ShopOwnerApiService.getTickets()
    if (r.success && r.data) setTickets(r.data)
  }, [])

  useEffect(() => { void loadTickets() }, [loadTickets])

  const setSyncMode = useCallback(async (mode: ShopSyncMode) => {
    setSavingMode(true)
    try {
      await ShopOwnerApiService.setSyncMode(mode)
      await refetchShop()
    } finally {
      setSavingMode(false)
    }
  }, [refetchShop])

  const syncNow = useCallback(async () => {
    setSyncing(true)
    try {
      const r = await ShopOwnerApiService.syncNow()
      if (r.success && r.data) setTickets(r.data)
      setLastSyncedAt(new Date().toISOString())
    } finally {
      setSyncing(false)
    }
  }, [])

  return { shop, loadingShop, tickets, savingMode, setSyncMode, syncing, syncNow, lastSyncedAt }
}
