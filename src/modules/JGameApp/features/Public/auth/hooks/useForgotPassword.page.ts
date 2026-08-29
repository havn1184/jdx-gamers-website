/**
 * useForgotPassword.page — Logic trang Quên mật khẩu (SC-13). Chuẩn hoá: chỉ nhận số điện thoại.
 */
import { useState } from 'react'
import { AuthApiService } from '../services/AuthApiService'

const PHONE_RE = /^0\d{9,10}$/

export function useForgotPassword() {
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!phone.trim()) {
      setErrorMessage('Vui lòng nhập số điện thoại')
      return
    }
    if (!PHONE_RE.test(phone.trim())) {
      setErrorMessage('Số điện thoại không hợp lệ (VD: 0912345678)')
      return
    }
    setSubmitting(true)
    setErrorMessage(null)
    try {
      await AuthApiService.forgotPassword({ identifier: phone.trim() })
      // Luôn báo thành công (chống dò tài khoản) — theo đúng FR chống enumeration
      setSent(true)
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }

  return { phone, setPhone, submitting, sent, errorMessage, handleSubmit }
}
