/**
 * useTicketReserve.page — Logic trang Xác nhận đặt vé (SC-P2-03).
 * Đọc lựa chọn vé đã lưu (sessionStorage) từ trang Gian hàng, tạo đơn khi bấm "Đặt vé ngay".
 */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlaytimeApiService } from '../../../../Public/playtime/services/PlaytimeApiService'
import { getActiveReferrerCode } from '../../../../../shared/hooks/useReferrerAttribution'
import { useAuth } from '../../../../../contexts/AuthContext'
import { useWalletBalance } from '../../wallet/hooks/useWalletBalance'
import { savePendingSelection, consumePendingSelection } from '../../../../../shared/utils/pendingSelection'
import type { PlaytimeTicketView } from '../../../../Public/playtime/types/playtime.types'
import { PaymentMethod } from '../../../../Public/wallet/types/wallet.types'

const SELECTION_KEY = 'jgame_ticket_selection'

interface TicketSelectionState {
  ticket: PlaytimeTicketView
  quantity: number
}

export function saveTicketSelection(ticketId: string, quantity: number): void {
  sessionStorage.setItem(SELECTION_KEY, JSON.stringify({ ticketId, quantity }))
}

export function useTicketReserve() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { balance: wallet, refetchBalance } = useWalletBalance()
  const [selection, setSelection] = useState<TicketSelectionState | null>(null)
  const [agreedPolicy, setAgreedPolicy] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadSelection = useCallback(async () => {
    const raw = sessionStorage.getItem(SELECTION_KEY)
    if (!raw) return
    try {
      const { ticketId, quantity } = JSON.parse(raw) as { ticketId: string; quantity: number }
      const r = await PlaytimeApiService.getTicket(ticketId)
      if (r.success && r.data) setSelection({ ticket: r.data, quantity })
    } catch { /* bỏ qua selection hỏng */ }
  }, [])

  useEffect(() => { void loadSelection() }, [loadSelection])

  // Vừa đăng nhập xong sau khi bị chuyển hướng lúc bấm "Đặt vé ngay" lúc chưa đăng nhập
  // — vé/số lượng đã tự khôi phục qua `jgame_ticket_selection` (loadSelection ở trên),
  // ở đây chỉ cần khôi phục lại phương thức thanh toán đã chọn (FR-6.1.2).
  useEffect(() => {
    if (!isAuthenticated || !selection) return
    const pending = consumePendingSelection()
    if (pending?.paymentMethod == null) return
    setPaymentMethod(pending.paymentMethod)
    setAgreedPolicy(true)
  }, [isAuthenticated, selection])

  // Vé miễn phí (total = 0) — BE vẫn yêu cầu paymentMethod nhưng trừ ví 0đ luôn thành công
  // với bất kỳ ví nào, nên tự chọn Vnd để không bắt user chọn phương thức cho đơn 0đ.
  useEffect(() => {
    if (selection && selection.ticket.sellPrice * selection.quantity === 0) {
      setPaymentMethod(PaymentMethod.Vnd)
    }
  }, [selection])

  const handleReserve = useCallback(async () => {
    if (!selection || !agreedPolicy || paymentMethod === null) return

    if (!isAuthenticated) {
      savePendingSelection({ paymentMethod }, '/jgame/cho-ve/xac-nhan-dat-ve')
      window.location.hash = '#/jgame/dang-nhap'
      return
    }

    setSubmitting(true)
    setErrorMessage(null)
    try {
      const referrerCode = getActiveReferrerCode()
      const r = await PlaytimeApiService.createOrder({
        ticketId: selection.ticket.id,
        quantity: selection.quantity,
        paymentMethod,
        referrerCode,
        referralLinkCode: referrerCode,
      })
      if (r.success && r.data) {
        sessionStorage.removeItem(SELECTION_KEY)
        void refetchBalance()
        navigate(`/jgame/cho-ve/thanh-toan/${r.data.id}`)
      } else {
        setErrorMessage(r.message || 'Không đặt được vé — vui lòng thử lại')
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }, [selection, agreedPolicy, isAuthenticated, navigate, paymentMethod, refetchBalance])

  return { selection, agreedPolicy, setAgreedPolicy, paymentMethod, setPaymentMethod, wallet, submitting, errorMessage, handleReserve }
}
