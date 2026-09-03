/**
 * useNphSettingsForm — Đổi mật khẩu + xoay khoá webhook (reveal-once). Secret chỉ tồn tại trong state
 * tạm của trang, không lưu ở đâu khác (giống quy ước resetUserPassword của Admin JGameApp).
 */
import { useCallback, useState } from 'react'
import { NphApiService } from '../../services'

export function useNphSettingsForm() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const [rotating, setRotating] = useState(false)
  const [rotateError, setRotateError] = useState<string | null>(null)
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null)

  const isPasswordFormValid = oldPassword.length > 0 && newPassword.length >= 6 && newPassword === confirmPassword

  const handleChangePassword = useCallback(async () => {
    if (!isPasswordFormValid || changingPassword) return
    setChangingPassword(true)
    setPasswordError(null)
    setPasswordSuccess(false)
    const result = await NphApiService.changePassword(oldPassword, newPassword)
    setChangingPassword(false)
    if (!result.success) {
      setPasswordError(result.message || 'Đổi mật khẩu thất bại.')
      return
    }
    setPasswordSuccess(true)
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }, [oldPassword, newPassword, isPasswordFormValid, changingPassword])

  const handleRotateSecret = useCallback(async () => {
    if (rotating) return
    setRotating(true)
    setRotateError(null)
    const result = await NphApiService.rotateWebhookSecret()
    setRotating(false)
    if (!result.success || !result.data?.webhookSecret) {
      setRotateError(result.message || 'Xoay khoá webhook thất bại.')
      return
    }
    setRevealedSecret(result.data.webhookSecret)
  }, [rotating])

  return {
    oldPassword, setOldPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword,
    isPasswordFormValid, changingPassword, passwordError, passwordSuccess, handleChangePassword,
    rotating, rotateError, revealedSecret, setRevealedSecret, handleRotateSecret,
  }
}
