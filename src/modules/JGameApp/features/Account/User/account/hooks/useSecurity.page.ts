/**
 * useSecurity.page — Logic trang Bảo mật: đổi mật khẩu + bật/tắt 2FA (SC-18).
 */
import { useState } from 'react'
import { toast } from 'sonner'
import { AuthApiService, MOCK_2FA_DEMO_CODE } from '../../../../Public/auth/services/AuthApiService'
import { useAuth } from '../../../../../contexts/AuthContext'

export function useSecurity() {
  const { user, refreshUser } = useAuth()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const [twoFAStep, setTwoFAStep] = useState<'idle' | 'confirming'>('idle')
  const [twoFASecret, setTwoFASecret] = useState<string | null>(null)
  const [twoFACode, setTwoFACode] = useState('')
  const [processing2FA, setProcessing2FA] = useState(false)

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { toast.error('Mật khẩu mới tối thiểu 8 ký tự'); return }
    if (newPassword !== confirmPassword) { toast.error('Mật khẩu xác nhận không khớp'); return }
    setChangingPassword(true)
    try {
      const r = await AuthApiService.changePassword({ oldPassword, newPassword })
      if (r.success) {
        toast.success('Đổi mật khẩu thành công')
        setOldPassword(''); setNewPassword(''); setConfirmPassword('')
      } else {
        toast.error(r.message || 'Đổi mật khẩu thất bại')
      }
    } finally {
      setChangingPassword(false)
    }
  }

  const startEnable2FA = async () => {
    setProcessing2FA(true)
    try {
      const r = await AuthApiService.enable2FA()
      if (r.success && r.data) {
        setTwoFASecret(r.data.secret)
        setTwoFAStep('confirming')
      }
    } finally {
      setProcessing2FA(false)
    }
  }

  const confirmEnable2FA = async () => {
    if (twoFACode !== MOCK_2FA_DEMO_CODE) { toast.error('Mã xác nhận không đúng'); return }
    setTwoFAStep('idle')
    setTwoFACode('')
    toast.success('Đã bật xác thực 2 lớp')
    await refreshUser()
  }

  const disable2FA = async () => {
    setProcessing2FA(true)
    try {
      const r = await AuthApiService.disable2FA()
      if (r.success) {
        toast.success('Đã tắt xác thực 2 lớp')
        await refreshUser()
      }
    } finally {
      setProcessing2FA(false)
    }
  }

  return {
    user,
    oldPassword, setOldPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword,
    changingPassword, handleChangePassword,
    twoFAStep, twoFASecret, twoFACode, setTwoFACode, processing2FA,
    startEnable2FA, confirmEnable2FA, disable2FA,
  }
}
