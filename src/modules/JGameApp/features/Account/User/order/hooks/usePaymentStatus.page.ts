/**
 * usePaymentStatus.page — Logic trang Thanh toán QR (SC-05).
 * Poll trạng thái đơn hàng mỗi 2s (mô phỏng realtime webhook), điều hướng khi có kết quả.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OrderApiService } from '../services/OrderApiService'
import type { OrderStatus, PaymentInfo } from '../types/order.types'

const POLL_INTERVAL_MS = 2000
const TERMINAL_STATUSES: OrderStatus[] = ['SUCCESS', 'SUPPLY_FAILED', 'REFUND_PROCESSING', 'REFUNDED', 'EXPIRED']

export function usePaymentStatus(orderId: string | undefined) {
  const navigate = useNavigate()
  const [payment, setPayment] = useState<PaymentInfo | null>(null)
  const [status, setStatus] = useState<OrderStatus>('PENDING')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!orderId) return

    let cancelled = false

    const loadPayment = async () => {
      const r = await OrderApiService.getPayment(orderId)
      if (!cancelled && r.success && r.data) setPayment(r.data)
      if (!cancelled) setLoading(false)
    }

    const poll = async () => {
      const r = await OrderApiService.getOrderStatus(orderId)
      if (cancelled) return
      if (!r.success || !r.data) {
        setErrorMessage(r.message || 'Không lấy được trạng thái đơn hàng')
        return
      }
      setStatus(r.data.status)
      if (TERMINAL_STATUSES.includes(r.data.status) && timerRef.current) {
        clearInterval(timerRef.current)
        navigate(`/jgame/ket-qua/${orderId}`, { replace: true })
      }
    }

    void loadPayment()
    void poll()
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [orderId, navigate])

  return { payment, status, loading, errorMessage }
}
