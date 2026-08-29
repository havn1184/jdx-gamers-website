/**
 * useHome.page.fetchData — Logic Trang chủ tổng hợp 3 phân hệ (Nạp thẻ/Chợ vé/Phụ kiện).
 * Lấy dữ liệu thật trực tiếp từ API từng phân hệ — không tạo mock riêng, luôn đồng bộ.
 */
import { useEffect, useState } from 'react'
import { CardApiService } from '../../catalog/services/CardApiService'
import { PlaytimeApiService } from '../../playtime/services/PlaytimeApiService'
import { AccessoryApiService } from '../../accessories/services/AccessoryApiService'
import type { CardProduct } from '../../catalog/types/card.types'
import type { MarketplaceSections } from '../../playtime/types/playtime.types'
import type { AccessoryProduct } from '../../accessories/types/accessory.types'

export function useHomeFetchData() {
  const [cardProviders, setCardProviders] = useState<CardProduct[]>([])
  const [cardProviderCount, setCardProviderCount] = useState(0)
  const [playtimeSections, setPlaytimeSections] = useState<MarketplaceSections | null>(null)
  const [accessories, setAccessories] = useState<AccessoryProduct[]>([])
  const [accessoryCount, setAccessoryCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      const [cardsRes, playtimeRes, accessoriesRes] = await Promise.all([
        CardApiService.getCardProducts(),
        PlaytimeApiService.getMarketplaceSections(),
        AccessoryApiService.getProducts(),
      ])
      if (cancelled) return
      if (cardsRes.success && cardsRes.data) { setCardProviders(cardsRes.data.slice(0, 6)); setCardProviderCount(cardsRes.data.length) }
      if (playtimeRes.success && playtimeRes.data) setPlaytimeSections(playtimeRes.data)
      if (accessoriesRes.success && accessoriesRes.data) { setAccessories(accessoriesRes.data.slice(0, 4)); setAccessoryCount(accessoriesRes.data.length) }
      setLoading(false)
    }

    void fetchData()
    // Poll lại mỗi 4s để khu Chợ vé trên trang chủ cũng thấy slot trống giảm dần "trực tiếp"
    const id = setInterval(() => void fetchData(), 4000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  return { cardProviders, cardProviderCount, playtimeSections, accessories, accessoryCount, loading }
}
