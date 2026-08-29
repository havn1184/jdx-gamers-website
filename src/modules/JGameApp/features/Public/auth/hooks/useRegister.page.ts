/**
 * useRegister.page — Logic trang Đăng ký (SC-11).
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthApiService } from '../services/AuthApiService'
import { TokenManager } from '../../../../shared/services/api'
import { useAuth } from '../../../../contexts/AuthContext'

export interface RegisterFormState {
  email: string
  phone: string
  password: string
  confirmPassword: string
  agreedTerms: boolean
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^0\d{9,10}$/

export function useRegister() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [formData, setFormData] = useState<RegisterFormState>({ email: '', phone: '', password: '', confirmPassword: '', agreedTerms: false })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const errors = {
    email: touched.email && !EMAIL_RE.test(formData.email) ? 'Email không hợp lệ' : null,
    phone: touched.phone && !PHONE_RE.test(formData.phone) ? 'Số điện thoại không hợp lệ (VD: 0912345678)' : null,
    password: touched.password && formData.password.length < 8 ? 'Mật khẩu tối thiểu 8 ký tự' : null,
    confirmPassword: touched.confirmPassword && formData.confirmPassword !== formData.password ? 'Mật khẩu xác nhận không khớp' : null,
  }

  const handleBlur = (field: string) => setTouched(p => ({ ...p, [field]: true }))

  const handleSubmit = async () => {
    setTouched({ email: true, phone: true, password: true, confirmPassword: true })
    const valid = EMAIL_RE.test(formData.email) && PHONE_RE.test(formData.phone) &&
      formData.password.length >= 8 && formData.confirmPassword === formData.password && formData.agreedTerms
    if (!valid) {
      if (!formData.agreedTerms) setErrorMessage('Vui lòng đồng ý với điều khoản sử dụng')
      return
    }
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const r = await AuthApiService.register({
        email: formData.email, phone: formData.phone, password: formData.password, agreedTerms: formData.agreedTerms,
      })
      if (r.success && r.data?.accessToken) {
        TokenManager.setTokens(r.data.accessToken, r.data.refreshToken)
        await refreshUser()
        navigate('/jgame')
      } else {
        setErrorMessage(r.message || 'Đăng ký thất bại')
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }

  return { formData, setFormData, errors, touched, submitting, errorMessage, handleBlur, handleSubmit }
}
