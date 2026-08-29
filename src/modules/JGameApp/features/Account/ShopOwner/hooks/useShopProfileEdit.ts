/**
 * useShopProfileEdit — Chỉnh sửa thông tin gian hàng (tên/thành phố/địa chỉ/mô tả) sau khi đã
 * đăng ký — khác với useShopRegister (chỉ dùng cho lần đăng ký đầu tiên).
 */
import { useCallback, useEffect, useState } from 'react'
import { ShopOwnerApiService } from '../services/ShopOwnerApiService'
import type { CybergameShop } from '../types/shop-owner.types'

export function useShopProfileEdit(shop: CybergameShop | null, onSaved: () => void) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (shop) { setName(shop.name); setCity(shop.city); setAddress(shop.address); setDescription(shop.description) }
  }, [shop])

  const isValid = name.trim().length >= 3 && city.trim().length > 0 && address.trim().length >= 5

  const startEdit = useCallback(() => { setErrorMessage(null); setEditing(true) }, [])
  const cancelEdit = useCallback(() => {
    if (shop) { setName(shop.name); setCity(shop.city); setAddress(shop.address); setDescription(shop.description) }
    setErrorMessage(null)
    setEditing(false)
  }, [shop])

  const handleSave = useCallback(async () => {
    if (!isValid) return
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const r = await ShopOwnerApiService.updateShopProfile({ name: name.trim(), city: city.trim(), address: address.trim(), description: description.trim() })
      if (r.success) {
        setEditing(false)
        onSaved()
      } else {
        setErrorMessage(r.message || 'Không cập nhật được thông tin gian hàng')
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }, [isValid, name, city, address, description, onSaved])

  return {
    editing, startEdit, cancelEdit,
    name, setName, city, setCity, address, setAddress, description, setDescription,
    isValid, submitting, errorMessage, handleSave,
  }
}
