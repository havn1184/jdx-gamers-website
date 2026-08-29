/**
 * useAffiliateRegister.page — Logic trang Đăng ký làm Đối tác tiếp thị liên kết (SC-REF-01).
 */
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReferrerApiService } from '../services/ReferrerApiService'

export function useAffiliateRegister() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [channel, setChannel] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isValid = displayName.trim().length >= 2 && channel.trim().length >= 3

  const handleSubmit = useCallback(async () => {
    if (!isValid) return
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const r = await ReferrerApiService.register({ displayName: displayName.trim(), channel: channel.trim() })
      if (r.success) {
        navigate('/jgame/doi-tac', { replace: true })
      } else {
        setErrorMessage(r.message || 'Không đăng ký được — vui lòng thử lại')
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }, [isValid, displayName, channel, navigate])

  return { displayName, setDisplayName, channel, setChannel, isValid, submitting, errorMessage, handleSubmit }
}
