/**
 * useAccessoryCheckout.page — Logic trang Checkout phụ kiện (SC-29).
 */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../../../../contexts/CartContext'
import { AccessoryApiService } from '../../../../Public/accessories/services/AccessoryApiService'
import { useJcoinBalance } from '../../tasks/hooks/useJcoinBalance'
import { TaskApiService } from '../../../../Public/tasks/services/TaskApiService'
import type { ShippingAddress, ShippingMethod } from '../../../../Public/accessories/types/accessory.types'

export function useAccessoryCheckout() {
  const navigate = useNavigate()
  const { items, totalAmount, clear } = useCart()
  const { balance: jcoinBalance, refetchBalance } = useJcoinBalance()
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [shippingMethodId, setShippingMethodId] = useState('')
  const [address, setAddress] = useState<ShippingAddress>({ fullName: '', phone: '', address: '' })
  const [useJcoin, setUseJcoin] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadShippingMethods = useCallback(async () => {
    const r = await AccessoryApiService.getShippingMethods()
    if (r.success && r.data) {
      setShippingMethods(r.data)
      setShippingMethodId(r.data[0]?.id || '')
    }
  }, [])

  useEffect(() => { void loadShippingMethods() }, [loadShippingMethods])

  const shippingFee = shippingMethods.find(m => m.id === shippingMethodId)?.fee ?? 0
  const grandTotal = totalAmount + shippingFee

  const handleSubmit = useCallback(async () => {
    if (!address.fullName.trim() || !address.phone.trim() || !address.address.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin giao hàng')
      return
    }
    if (items.length === 0) return

    const payWithJcoin = useJcoin && jcoinBalance >= grandTotal && grandTotal > 0

    setSubmitting(true)
    setErrorMessage(null)
    try {
      if (payWithJcoin) {
        const spendRes = await TaskApiService.spendWallet(grandTotal, 'SPEND_ACCESSORY', 'Thanh toán đơn hàng phụ kiện')
        if ((spendRes.data ?? 0) < grandTotal) {
          setErrorMessage('Số dư JCoin không đủ — vui lòng thử lại')
          setSubmitting(false)
          return
        }
      }
      const r = await AccessoryApiService.createOrder({ items, shippingAddress: address, shippingMethodId, payWithJcoin })
      if (r.success && r.data) {
        clear()
        void refetchBalance()
        navigate(`/jgame/don-hang-phu-kien/${r.data.id}`)
      } else {
        setErrorMessage(r.message || 'Không tạo được đơn hàng')
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }, [address, items, shippingMethodId, clear, navigate, useJcoin, jcoinBalance, grandTotal, refetchBalance])

  return {
    items, totalAmount, shippingMethods, shippingMethodId, setShippingMethodId,
    address, setAddress, shippingFee, grandTotal, useJcoin, setUseJcoin, jcoinBalance, submitting, errorMessage, handleSubmit,
  }
}
