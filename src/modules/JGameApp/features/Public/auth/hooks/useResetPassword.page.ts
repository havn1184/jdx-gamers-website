/**
 * useResetPassword.page — Logic trang Đặt lại mật khẩu (SC-14). Token lấy từ query param `?token=`.
 */
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthApiService } from '../services/AuthApiService'

export function useResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (newPassword.length < 8) {
      setErrorMessage('Mật khẩu tối thiểu 8 ký tự')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp')
      return
    }
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const r = await AuthApiService.resetPassword({ token, newPassword })
      if (r.success) {
        navigate('/jgame/dang-nhap', { replace: true })
      } else {
        setErrorMessage(r.message || 'Đặt lại mật khẩu thất bại')
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }

  return { token, newPassword, setNewPassword, confirmPassword, setConfirmPassword, submitting, errorMessage, handleSubmit }
}
