/**
 * CartContext — Giỏ hàng phụ kiện, persist localStorage (SC-28).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AccessoryApiService } from '../features/Public/accessories/services/AccessoryApiService'
import type { AccessoryProduct, CartItem } from '../features/Public/accessories/types/accessory.types'

const STORAGE_KEY = 'jgame_cart'

interface CartContextType {
  items: CartItem[]
  totalQuantity: number
  totalAmount: number
  /** Tra cứu thông tin sản phẩm đã cache (gọi BE thật khi item mới xuất hiện trong giỏ) — `undefined` nếu đang tải. */
  getProduct: (productId: string) => AccessoryProduct | undefined
  addItem: (productId: string, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function readCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as CartItem[]
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readCart())
  const [products, setProducts] = useState<Record<string, AccessoryProduct>>({})

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // Giỏ hàng chỉ lưu {productId, quantity} — cần tra cứu giá/tên/ảnh từ BE thật cho những
  // productId chưa có trong cache mỗi khi giỏ hàng đổi.
  useEffect(() => {
    const missingIds = items.map(i => i.productId).filter(id => !(id in products))
    if (missingIds.length === 0) return
    let cancelled = false
    void Promise.all(missingIds.map(id => AccessoryApiService.getProductDetail(id))).then(results => {
      if (cancelled) return
      setProducts(prev => {
        const next = { ...prev }
        results.forEach((res, idx) => {
          if (res.success && res.data) next[missingIds[idx]] = res.data
        })
        return next
      })
    })
    return () => { cancelled = true }
  }, [items, products])

  const getProduct = useCallback((productId: string) => products[productId], [products])

  const addItem = useCallback((productId: string, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === productId)
      if (existing) return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i)
      return [...prev, { productId, quantity }]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems(prev => quantity <= 0
      ? prev.filter(i => i.productId !== productId)
      : prev.map(i => i.productId === productId ? { ...i, quantity } : i))
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const totalQuantity = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])
  const totalAmount = useMemo(() => items.reduce((sum, i) => {
    const product = products[i.productId]
    return sum + (product?.price || 0) * i.quantity
  }, 0), [items, products])

  const value = useMemo<CartContextType>(
    () => ({ items, totalQuantity, totalAmount, getProduct, addItem, updateQuantity, removeItem, clear }),
    [items, totalQuantity, totalAmount, getProduct, addItem, updateQuantity, removeItem, clear]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart phải được dùng trong CartProvider')
  return ctx
}
