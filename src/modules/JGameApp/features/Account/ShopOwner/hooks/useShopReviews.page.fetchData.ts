/**
 * useShopReviews.page.fetchData — Logic trang "Đánh giá khách hàng" (Chủ Cybergame)
 * (20260902-nc_danh-gia-phong-game-da-tieu-chi.md).
 */
import { useCallback, useEffect, useState } from 'react'
import { ShopOwnerApiService } from '../services/ShopOwnerApiService'
import type { PlaytimeReview, PlaytimeReviewCriteriaAverage } from '../../../Public/playtime/types/playtime.types'

const PAGE_SIZE = 20

export function useShopReviewsFetchData() {
  const [items, setItems] = useState<PlaytimeReview[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [summary, setSummary] = useState<PlaytimeReviewCriteriaAverage | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [listRes, summaryRes] = await Promise.all([
      ShopOwnerApiService.getShopReviews(page, PAGE_SIZE),
      ShopOwnerApiService.getShopReviewSummary(),
    ])
    if (listRes.success && listRes.data) {
      setItems(listRes.data.items)
      setTotal(listRes.data.total)
      setTotalPages(listRes.data.totalPages)
    }
    if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data)
    setLoading(false)
  }, [page])

  useEffect(() => { void fetchData() }, [fetchData])

  return { items, total, totalPages, page, setPage, summary, loading }
}
