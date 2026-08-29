/**
 * useMyShop — Lấy gian hàng của chủ tài khoản hiện tại (dùng cho guard RequireShopOwner + layout).
 */
import { useCallback, useEffect, useState } from 'react'
import { ShopOwnerApiService } from '../services/ShopOwnerApiService'
import type { CybergameShop } from '../types/shop-owner.types'

export function useMyShop() {
  const [shop, setShop] = useState<CybergameShop | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const r = await ShopOwnerApiService.getMyShop()
    if (r.success) setShop(r.data)
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  return { shop, loading, refetch: fetchData }
}
