/**
 * useShopRegister.page — Logic trang Đăng ký gian hàng (SC-P2-S1).
 */
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopOwnerApiService } from '../services/ShopOwnerApiService'

export function useShopRegister() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isValid = name.trim().length >= 3 && city.trim().length > 0 && address.trim().length >= 5

  const handleSubmit = useCallback(async () => {
    if (!isValid) return
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const r = await ShopOwnerApiService.registerShop({ name: name.trim(), city: city.trim(), address: address.trim(), description: description.trim() })
      if (r.success) {
        navigate('/jgame/chu-cybergame', { replace: true })
      } else {
        setErrorMessage(r.message || 'Không đăng ký được gian hàng')
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }, [isValid, name, city, address, description, navigate])

  return { name, setName, city, setCity, address, setAddress, description, setDescription, isValid, submitting, errorMessage, handleSubmit }
}
