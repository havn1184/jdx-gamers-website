/**
 * useTicketReserve.page — Logic trang Xác nhận đặt vé (SC-P2-03).
 * Đọc lựa chọn vé đã lưu (sessionStorage) từ trang Gian hàng, tạo đơn khi bấm "Đặt vé ngay".
 */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlaytimeApiService } from '../../../../Public/playtime/services/PlaytimeApiService'
import { useAuth } from '../../../../../contexts/AuthContext'
import { useJcoinBalance } from '../../tasks/hooks/useJcoinBalance'
import { TaskApiService } from '../../../../Public/tasks/services/TaskApiService'
import { saveReturnTo } from '../../../../../shared/utils/pendingSelection'
import type { PlaytimeTicketView } from '../../../../Public/playtime/types/playtime.types'

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
  const { balance: jcoinBalance, refetchBalance } = useJcoinBalance()
  const [selection, setSelection] = useState<TicketSelectionState | null>(null)
  const [agreedPolicy, setAgreedPolicy] = useState(false)
  const [useJcoin, setUseJcoin] = useState(false)
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

  const handleReserve = useCallback(async () => {
    if (!selection || !agreedPolicy) return

    if (!isAuthenticated) {
      saveReturnTo('/jgame/cho-ve/xac-nhan-dat-ve')
      window.location.hash = '#/jgame/dang-nhap'
      return
    }

    const total = selection.ticket.sellPrice * selection.quantity
    const payWithJcoin = useJcoin && jcoinBalance >= total && total > 0

    setSubmitting(true)
    setErrorMessage(null)
    try {
      if (payWithJcoin) {
        const spendRes = await TaskApiService.spendWallet(total, 'SPEND_TICKET', `Thanh toán vé ${selection.ticket.shopName} — ${selection.ticket.zoneName}`)
        if ((spendRes.data ?? 0) < total) {
          setErrorMessage('Số dư JCoin không đủ — vui lòng thử lại')
          setSubmitting(false)
          return
        }
      }
      const r = await PlaytimeApiService.createOrder({ ticketId: selection.ticket.id, quantity: selection.quantity, payWithJcoin })
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
  }, [selection, agreedPolicy, isAuthenticated, navigate, useJcoin, jcoinBalance, refetchBalance])

  return { selection, agreedPolicy, setAgreedPolicy, useJcoin, setUseJcoin, jcoinBalance, submitting, errorMessage, handleReserve }
}
