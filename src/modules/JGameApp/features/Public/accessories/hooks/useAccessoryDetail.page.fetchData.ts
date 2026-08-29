/**
 * useAccessoryDetail.page.fetchData — Logic trang Chi tiết sản phẩm phụ kiện (SC-27).
 */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AccessoryApiService } from '../services/AccessoryApiService'
import { useCart } from '../../../../contexts/CartContext'
import type { AccessoryProduct } from '../types/accessory.types'

export function useAccessoryDetailFetchData(productId: string | undefined) {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState<AccessoryProduct | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const fetchData = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    setErrorMessage(null)
    try {
      const r = await AccessoryApiService.getProductDetail(productId)
      if (r.success && r.data) setProduct(r.data)
      else setErrorMessage(r.message || 'Không tìm thấy sản phẩm')
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => { void fetchData() }, [fetchData])

  const handleAddToCart = useCallback(() => {
    if (!product) return
    addItem(product.id, quantity)
  }, [product, quantity, addItem])

  const handleBuyNow = useCallback(() => {
    if (!product) return
    addItem(product.id, quantity)
    navigate('/jgame/gio-hang')
  }, [product, quantity, addItem, navigate])

  return { product, loading, errorMessage, quantity, setQuantity, handleAddToCart, handleBuyNow }
}
