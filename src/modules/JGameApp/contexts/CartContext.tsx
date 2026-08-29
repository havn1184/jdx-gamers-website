/**
 * CartContext — Giỏ hàng phụ kiện, persist localStorage (SC-28).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { findAccessoryById } from '../mocks/accessories.mock'
import type { CartItem } from '../features/Public/accessories/types/accessory.types'

const STORAGE_KEY = 'jgame_cart'

interface CartContextType {
  items: CartItem[]
  totalQuantity: number
  totalAmount: number
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

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
    const product = findAccessoryById(i.productId)
    return sum + (product?.price || 0) * i.quantity
  }, 0), [items])

  const value = useMemo<CartContextType>(
    () => ({ items, totalQuantity, totalAmount, addItem, updateQuantity, removeItem, clear }),
    [items, totalQuantity, totalAmount, addItem, updateQuantity, removeItem, clear]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart phải được dùng trong CartProvider')
  return ctx
}
