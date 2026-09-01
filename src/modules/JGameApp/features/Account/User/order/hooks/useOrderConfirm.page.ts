/**
 * useOrderConfirm.page — Logic trang Xác nhận đơn hàng (SC-03).
 * Đọc lựa chọn đã lưu ở CardDetailPage (sessionStorage), tạo đơn hàng khi bấm Thanh toán.
 */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CardApiService } from '../../../../Public/catalog/services/CardApiService'
import { OrderApiService } from '../services/OrderApiService'
import { getActiveReferrerCode } from '../../../../../shared/hooks/useReferrerAttribution'
import { useAuth } from '../../../../../contexts/AuthContext'
import { useWalletBalance } from '../../wallet/hooks/useWalletBalance'
import { savePendingSelection, consumePendingSelection } from '../../../../../shared/utils/pendingSelection'
import type { CardProduct, CardDenomination } from '../../../../Public/catalog/types/card.types'
import type { PaymentMethod } from '../../../../Public/wallet/types/wallet.types'

interface SelectionState {
  product: CardProduct
  denomination: CardDenomination
  quantity: number
}

export function useOrderConfirm() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { balance: wallet, refetchBalance } = useWalletBalance()
  const [selection, setSelection] = useState<SelectionState | null>(null)
  const [agreedPolicy, setAgreedPolicy] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('jgame_selection')
    if (!raw) return
    let cancelled = false
    try {
      const { denominationId, quantity } = JSON.parse(raw) as { denominationId: string; quantity: number }
      // sessionStorage chỉ lưu denominationId — BE không có API tra cứu 1 mệnh giá độc lập,
      // nên tải danh sách sản phẩm rồi tìm đúng mệnh giá (giống cách mock cũ đã làm).
      void CardApiService.getCardProducts().then(res => {
        if (cancelled || !res.success || !res.data) return
        for (const product of res.data) {
          const denomination = product.denominations.find(d => d.id === denominationId)
          if (denomination) {
            setSelection({ product, denomination, quantity })
            return
          }
        }
      })
    } catch { /* bỏ qua selection hỏng */ }
    return () => { cancelled = true }
  }, [])

  // Vừa đăng nhập xong sau khi bị chuyển hướng lúc bấm "Thanh toán" lúc chưa đăng nhập
  // — khôi phục lại phương thức thanh toán đã chọn (mệnh giá/số lượng đã tự khôi phục qua
  // `jgame_selection` ở effect trên), không bắt user chọn lại (FR-6.1.2).
  useEffect(() => {
    if (!isAuthenticated || !selection) return
    const pending = consumePendingSelection()
    if (pending?.paymentMethod == null || pending.denominationId !== selection.denomination.id) return
    setPaymentMethod(pending.paymentMethod)
    setAgreedPolicy(true)
  }, [isAuthenticated, selection])

  const handlePay = useCallback(async () => {
    if (!selection || !agreedPolicy || paymentMethod === null) return

    if (!isAuthenticated) {
      savePendingSelection(
        { denominationId: selection.denomination.id, quantity: selection.quantity, paymentMethod },
        '/jgame/xac-nhan-don-hang',
      )
      window.location.hash = '#/jgame/dang-nhap'
      return
    }

    setSubmitting(true)
    setErrorMessage(null)
    try {
      // Thanh toán ví là atomic (trừ ví + tạo đơn trong 1 lời gọi BE) — không còn bước
      // trừ ví riêng trước khi tạo đơn (nc_vi-2-loai-tien-thanh-toan.md).
      const r = await OrderApiService.createOrder({
        denominationId: selection.denomination.id,
        quantity: selection.quantity,
        referrerCode: getActiveReferrerCode(),
        paymentMethod,
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
  }, [selection, agreedPolicy, isAuthenticated, navigate, paymentMethod, refetchBalance])

  return { selection, agreedPolicy, setAgreedPolicy, paymentMethod, setPaymentMethod, wallet, submitting, errorMessage, handlePay }
}
