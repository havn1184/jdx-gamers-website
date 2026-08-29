/**
 * useVerifyPhone.page — Logic trang Xác thực số điện thoại bằng OTP (SC-16).
 */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthApiService } from '../services/AuthApiService'
import { useAuth } from '../../../../contexts/AuthContext'

const RESEND_COOLDOWN_SECONDS = 60

export function useVerifyPhone() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  const sendOtp = useCallback(async () => {
    await AuthApiService.sendPhoneOtp()
    setCooldown(RESEND_COOLDOWN_SECONDS)
  }, [])

  useEffect(() => { void sendOtp() }, [sendOtp])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  const handleSubmit = async () => {
    if (otp.length !== 6) return
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const r = await AuthApiService.verifyPhoneOtp(otp)
      if (r.success) {
        await refreshUser()
        navigate('/jgame/ho-so', { replace: true })
      } else {
        setErrorMessage(r.message || 'Mã OTP không đúng')
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }

  return { otp, setOtp, submitting, errorMessage, cooldown, resend: sendOtp, handleSubmit }
}
