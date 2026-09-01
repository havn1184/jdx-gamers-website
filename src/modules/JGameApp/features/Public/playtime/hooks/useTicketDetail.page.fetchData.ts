/**
 * useTicketDetail.page.fetchData — Logic trang Chi tiết vé giờ chơi: vé + vé khác cùng shop +
 * vé tương tự shop khác + đánh giá công khai của shop.
 */
import { useCallback, useEffect, useState } from 'react'
import { PlaytimeApiService } from '../services/PlaytimeApiService'
import type { PlaytimeReview, PlaytimeTicketView } from '../types/playtime.types'

interface TicketDetailData {
  ticket: PlaytimeTicketView
  otherShopTickets: PlaytimeTicketView[]
  similarTickets: PlaytimeTicketView[]
  reviews: PlaytimeReview[]
}

export function useTicketDetailFetchData(ticketId: string | undefined) {
  const [data, setData] = useState<TicketDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const fetchData = useCallback(async () => {
    if (!ticketId) return
    setLoading(true)
    setNotFound(false)
    const ticketRes = await PlaytimeApiService.getTicket(ticketId)
    if (!ticketRes.success || !ticketRes.data) {
      setNotFound(true)
      setLoading(false)
      return
    }
    const ticket = ticketRes.data

    const [shopTicketsRes, similarRes, reviewsRes] = await Promise.all([
      PlaytimeApiService.getShopDetail(ticket.shopId),
      PlaytimeApiService.getSimilarTickets(ticketId),
      PlaytimeApiService.getShopReviews(ticket.shopId),
    ])

    setData({
      ticket,
      otherShopTickets: (shopTicketsRes.success && shopTicketsRes.data ? shopTicketsRes.data.tickets : [])
        .filter(t => t.id !== ticketId),
      similarTickets: similarRes.success && similarRes.data ? similarRes.data : [],
      reviews: reviewsRes.success && reviewsRes.data ? reviewsRes.data : [],
    })
    setLoading(false)
  }, [ticketId])

  useEffect(() => { void fetchData() }, [fetchData])

  return { data, loading, notFound }
}
