/**
 * useNphLogin — Form đăng nhập NPH (email + mật khẩu), gọi NphAuthService riêng (không qua AuthContext
 * Customer/Admin). Đăng nhập thành công → điều hướng thẳng sang Tổng quan NPH.
 */
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { NphAuthService } from '../services'

export function useNphLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isValid = email.trim().length > 0 && password.length > 0

  const handleSubmit = useCallback(async () => {
    if (!isValid || submitting) return
    setSubmitting(true)
    setErrorMessage(null)
    const result = await NphAuthService.login(email.trim(), password)
    setSubmitting(false)
    if (!result.success) {
      setErrorMessage(result.message || 'Đăng nhập thất bại, vui lòng thử lại.')
      return
    }
    navigate('/jgame/nph', { replace: true })
  }, [email, password, isValid, submitting, navigate])

  return { email, setEmail, password, setPassword, isValid, submitting, errorMessage, handleSubmit }
}
