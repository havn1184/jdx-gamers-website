/**
 * useAdminReviews.page.fetchData — Logic trang Quản trị "Đánh giá phòng game"
 * (20260902-nc_danh-gia-phong-game-da-tieu-chi.md).
 */
import { useCallback, useEffect, useState } from 'react'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { AdminReviewShopSummary } from '../../types/jgame.types'
import type { PlaytimeReview } from '../../../../Public/playtime/types/playtime.types'

const PAGE_SIZE = 20

export function useAdminReviewsFetchData() {
  const [shopSummaries, setShopSummaries] = useState<AdminReviewShopSummary[]>([])
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null)

  const [items, setItems] = useState<PlaytimeReview[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [listLoading, setListLoading] = useState(false)

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true)
    const r = await JGameApiServiceAdmin.getReviewShopSummary()
    if (r.success && r.data) setShopSummaries(r.data)
    setSummaryLoading(false)
  }, [])

  const fetchList = useCallback(async () => {
    setListLoading(true)
    const r = await JGameApiServiceAdmin.getReviews(selectedShopId || undefined, page, PAGE_SIZE)
    if (r.success && r.data) {
      setItems(r.data.items)
      setTotal(r.data.total)
      setTotalPages(r.data.totalPages)
    }
    setListLoading(false)
  }, [selectedShopId, page])

  useEffect(() => { void fetchSummary() }, [fetchSummary])
  useEffect(() => { void fetchList() }, [fetchList])
  useEffect(() => { setPage(1) }, [selectedShopId])

  return {
    shopSummaries, summaryLoading,
    selectedShopId, setSelectedShopId,
    items, total, totalPages, page, setPage, listLoading,
  }
}
