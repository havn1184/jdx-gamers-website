/**
 * useOrderConfirm.page — Logic trang Xác nhận đơn hàng (SC-03).
 * Đọc lựa chọn đã lưu ở CardDetailPage (sessionStorage), tạo đơn hàng khi bấm Thanh toán.
 */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { findDenominationById } from '../../../../../mocks/cardProducts.mock'
import { OrderApiService } from '../services/OrderApiService'
import { getActiveReferrerCode } from '../../../../../shared/hooks/useReferrerAttribution'
import { useAuth } from '../../../../../contexts/AuthContext'
import { useJcoinBalance } from '../../tasks/hooks/useJcoinBalance'
import { TaskApiService } from '../../../../Public/tasks/services/TaskApiService'
import { savePendingSelection } from '../../../../../shared/utils/pendingSelection'
import type { CardProduct, CardDenomination } from '../../../../Public/catalog/types/card.types'

interface SelectionState {
  product: CardProduct
  denomination: CardDenomination
  quantity: number
}

export function useOrderConfirm() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { balance: jcoinBalance, refetchBalance } = useJcoinBalance()
  const [selection, setSelection] = useState<SelectionState | null>(null)
  const [agreedPolicy, setAgreedPolicy] = useState(false)
  const [useJcoin, setUseJcoin] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('jgame_selection')
    if (!raw) return
    try {
      const { denominationId, quantity } = JSON.parse(raw) as { denominationId: string; quantity: number }
      const found = findDenominationById(denominationId)
      if (found) setSelection({ product: found.product, denomination: found.denomination, quantity })
    } catch { /* bỏ qua selection hỏng */ }
  }, [])

  const handlePay = useCallback(async () => {
    if (!selection || !agreedPolicy) return

    if (!isAuthenticated) {
      savePendingSelection({ denominationId: selection.denomination.id, quantity: selection.quantity }, '/jgame/xac-nhan-don-hang')
      window.location.hash = '#/jgame/dang-nhap'
      return
    }

    const total = selection.denomination.sellPrice * selection.quantity
    const payWithJcoin = useJcoin && jcoinBalance >= total

    setSubmitting(true)
    setErrorMessage(null)
    try {
      if (payWithJcoin) {
        const spendRes = await TaskApiService.spendWallet(total, 'SPEND_CARD', `Thanh toán thẻ ${selection.product.name}`)
        if ((spendRes.data ?? 0) < total) {
          setErrorMessage('Số dư JCoin không đủ — vui lòng thử lại')
          setSubmitting(false)
          return
        }
      }
      const r = await OrderApiService.createOrder({
        denominationId: selection.denomination.id,
        quantity: selection.quantity,
        referrerCode: getActiveReferrerCode(),
        payWithJcoin,
      })
      if (r.success && r.data) {
        sessionStorage.removeItem('jgame_selection')
        void refetchBalance()
        navigate(`/jgame/thanh-toan/${r.data.id}`)
      } else {
        setErrorMessage(r.message || 'Không tạo được đơn hàng')
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }, [selection, agreedPolicy, isAuthenticated, navigate, useJcoin, jcoinBalance, refetchBalance])

  return { selection, agreedPolicy, setAgreedPolicy, useJcoin, setUseJcoin, jcoinBalance, submitting, errorMessage, handlePay }
}
