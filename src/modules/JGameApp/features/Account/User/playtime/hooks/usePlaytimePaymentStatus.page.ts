/**
 * usePlaytimePaymentStatus.page — Logic trang Thanh toán QR vé (SC-P2-04).
 * Poll trạng thái đơn mỗi 2s; nếu countdown giữ chỗ (5 phút) về 0 mà vẫn PENDING → tự hết hạn,
 * hoàn lại slot đã giữ chỗ (FR-7.2.4).
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlaytimeApiService } from '../../../../Public/playtime/services/PlaytimeApiService'
import type { PlaytimeOrderStatus } from '../../../../Public/playtime/types/playtime.types'

const POLL_INTERVAL_MS = 2000
const TERMINAL_STATUSES: PlaytimeOrderStatus[] = ['CONFIRMED', 'SUPPLY_FAILED', 'REFUND_PROCESSING', 'REFUNDED', 'EXPIRED']

export function usePlaytimePaymentStatus(orderId: string | undefined) {
  const navigate = useNavigate()
  const [payment, setPayment] = useState<{ orderId: string; qrCode: string; expiredAt: string } | null>(null)
  const [status, setStatus] = useState<PlaytimeOrderStatus>('PENDING')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expiredHandled = useRef(false)
  const expiredAtRef = useRef<string | null>(null)

  useEffect(() => {
    if (!orderId) return
    let cancelled = false

    const loadPayment = async () => {
      const r = await PlaytimeApiService.getPayment(orderId)
      if (!cancelled && r.success && r.data) {
        setPayment(r.data)
        expiredAtRef.current = r.data.expiredAt
      }
      if (!cancelled) setLoading(false)
    }

    const poll = async () => {
      const r = await PlaytimeApiService.getOrderStatus(orderId)
      if (cancelled) return
      if (!r.success || !r.data) {
        setErrorMessage(r.message || 'Không lấy được trạng thái đơn hàng')
        return
      }
      setStatus(r.data.status)

      if (r.data.status === 'PENDING' && expiredAtRef.current && Date.now() > new Date(expiredAtRef.current).getTime() && !expiredHandled.current) {
        expiredHandled.current = true
        await PlaytimeApiService.expireOrder(orderId)
        return
      }

      if (TERMINAL_STATUSES.includes(r.data.status) && timerRef.current) {
        clearInterval(timerRef.current)
        navigate(`/jgame/cho-ve/ket-qua/${orderId}`, { replace: true })
      }
    }

    void loadPayment()
    void poll()
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, navigate])

  return { payment, status, loading, errorMessage }
}
