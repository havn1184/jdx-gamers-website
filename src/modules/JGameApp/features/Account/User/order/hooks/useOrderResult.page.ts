/**
 * useOrderResult.page — Logic trang Kết quả giao dịch (SC-06 thành công / SC-07 thất bại-hoàn tiền).
 */
import { useCallback, useEffect, useState } from 'react'
import { OrderApiService } from '../services/OrderApiService'
import type { OrderSummary, CardCodeResult, RefundInfo } from '../types/order.types'

export function useOrderResult(orderId: string | undefined) {
  const [order, setOrder] = useState<OrderSummary | null>(null)
  const [cardCode, setCardCode] = useState<CardCodeResult | null>(null)
  const [refund, setRefund] = useState<RefundInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [revealing, setRevealing] = useState(false)

  const fetchData = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    const orderRes = await OrderApiService.getOrderStatus(orderId)
    if (orderRes.success && orderRes.data) setOrder(orderRes.data)

    if (orderRes.data?.status === 'SUCCESS') {
      const codeRes = await OrderApiService.getCardCode(orderId)
      if (codeRes.success && codeRes.data) setCardCode(codeRes.data)
    } else if (orderRes.data?.status === 'REFUND_PROCESSING' || orderRes.data?.status === 'REFUNDED') {
      const refundRes = await OrderApiService.getRefund(orderId)
      if (refundRes.success && refundRes.data) setRefund(refundRes.data)
    }
    setLoading(false)
  }, [orderId])

  useEffect(() => { void fetchData() }, [fetchData])

  const revealFullCode = useCallback(async () => {
    if (!orderId) return
    setRevealing(true)
    try {
      const r = await OrderApiService.revealCardCode(orderId)
      if (r.success && r.data) setCardCode(r.data)
    } finally {
      setRevealing(false)
    }
  }, [orderId])

  return { order, cardCode, refund, loading, revealing, revealFullCode }
}
