/**
 * useProfile.page — Logic trang Hồ sơ cá nhân (SC-17).
 */
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AccountApiService } from '../services/AccountApiService'
import { AuthApiService } from '../../../../Public/auth/services/AuthApiService'
import { useAuth } from '../../../../../contexts/AuthContext'

export function useProfile() {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [dob, setDob] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sendingEmailVerify, setSendingEmailVerify] = useState(false)

  useEffect(() => {
    if (!user) return
    setName(user.name)
    setAvatarUrl(user.avatarUrl || '')
    setDob(user.dob || '')
  }, [user])

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập họ tên')
      return
    }
    setSubmitting(true)
    try {
      const r = await AccountApiService.updateProfile({ name, avatarUrl: avatarUrl || undefined, dob: dob || undefined })
      if (r.success) {
        toast.success('Cập nhật hồ sơ thành công')
        await refreshUser()
      } else {
        toast.error(r.message || 'Cập nhật thất bại')
      }
    } catch {
      toast.error('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendEmailVerify = async () => {
    setSendingEmailVerify(true)
    try {
      const r = await AuthApiService.sendEmailVerification()
      if (r.success) toast.success('Đã gửi email xác thực — kiểm tra console log (demo)')
      else toast.error(r.message || 'Gửi thất bại')
    } finally {
      setSendingEmailVerify(false)
    }
  }

  return { user, name, setName, avatarUrl, setAvatarUrl, dob, setDob, submitting, sendingEmailVerify, handleSave, handleSendEmailVerify }
}
