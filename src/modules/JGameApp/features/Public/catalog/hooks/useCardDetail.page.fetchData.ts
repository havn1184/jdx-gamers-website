/**
 * useCardDetail.page.fetchData — Logic trang chi tiết loại thẻ + chọn mệnh giá (SC-02).
 */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CardApiService } from '../services/CardApiService'
import { savePendingSelection, consumePendingSelection } from '../../../../shared/utils/pendingSelection'
import { useAuth } from '../../../../contexts/AuthContext'
import type { CardProduct, CardDenomination } from '../types/card.types'

export function useCardDetailFetchData(productId: string | undefined) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState<CardProduct | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedDenomination, setSelectedDenomination] = useState<CardDenomination | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [agreedPolicy, setAgreedPolicy] = useState(false)

  const fetchData = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    setErrorMessage(null)
    try {
      const r = await CardApiService.getCardProductDetail(productId)
      if (r.success && r.data) {
        setProduct(r.data)
        setSelectedDenomination(r.data.denominations.find(d => d.status === 'active' && d.stockQuantity !== 0) ?? r.data.denominations[0] ?? null)
      } else {
        setErrorMessage(r.message || 'Không tìm thấy loại thẻ')
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => { void fetchData() }, [fetchData])

  // Vừa đăng nhập xong sau khi bị chuyển hướng lúc bấm "Mua ngay" lúc chưa đăng nhập
  // — khôi phục đúng mệnh giá/số lượng đã chọn rồi tiếp tục sang bước xác nhận đơn hàng,
  // không bắt user chọn lại từ đầu (FR-6.1.2).
  useEffect(() => {
    if (!product || !isAuthenticated) return
    const pending = consumePendingSelection()
    if (!pending?.denominationId) return
    const matched = product.denominations.find(d => d.id === pending.denominationId)
    if (!matched) return
    const restoredQuantity = pending.quantity ?? 1
    setSelectedDenomination(matched)
    setQuantity(restoredQuantity)
    setAgreedPolicy(true)
    sessionStorage.setItem('jgame_selection', JSON.stringify({ denominationId: matched.id, quantity: restoredQuantity }))
    navigate('/jgame/xac-nhan-don-hang')
  }, [product, isAuthenticated, navigate])

  const handleBuyNow = useCallback(() => {
    if (!selectedDenomination || !agreedPolicy) return
    const selection = { denominationId: selectedDenomination.id, quantity }

    if (!isAuthenticated) {
      savePendingSelection(selection, `/jgame/the/${productId}`)
      window.location.hash = '#/jgame/dang-nhap'
      return
    }
    sessionStorage.setItem('jgame_selection', JSON.stringify(selection))
    navigate('/jgame/xac-nhan-don-hang')
  }, [selectedDenomination, agreedPolicy, quantity, isAuthenticated, productId, navigate])

  return {
    product, loading, errorMessage,
    selectedDenomination, setSelectedDenomination,
    quantity, setQuantity,
    agreedPolicy, setAgreedPolicy,
    handleBuyNow,
  }
}
