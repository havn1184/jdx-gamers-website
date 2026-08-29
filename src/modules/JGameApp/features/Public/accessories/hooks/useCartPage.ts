/**
 * useCartPage — Logic trang Giỏ hàng (SC-28): ghép item giỏ hàng với thông tin sản phẩm.
 */
import { useMemo } from 'react'
import { useCart } from '../../../../contexts/CartContext'
import { findAccessoryById } from '../../../../mocks/accessories.mock'

export function useCartPage() {
  const { items, totalAmount, updateQuantity, removeItem } = useCart()

  const detailedItems = useMemo(() => {
    return items
      .map(item => {
        const product = findAccessoryById(item.productId)
        if (!product) return null
        return { product, quantity: item.quantity, lineTotal: product.price * item.quantity }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
  }, [items])

  return { detailedItems, totalAmount, updateQuantity, removeItem, isEmpty: items.length === 0 }
}
