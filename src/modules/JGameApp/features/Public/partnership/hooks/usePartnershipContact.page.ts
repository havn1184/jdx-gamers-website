/**
 * usePartnershipContact.page — Logic form liên hệ hợp tác dùng chung cho khối
 * Cybergame và Nhà phát triển game trên trang Đối tác. Tái dùng ContactApiService
 * hiện có (không thêm endpoint mới) — tiêu đề phân loại được prefix vào `message`.
 */
import { useState } from 'react'
import { toast } from 'sonner'
import { ContactApiService } from '../../static-pages/services/ContactApiService'

export type PartnershipContactType = 'cybergame' | 'game-dev'

const SUBJECT_BY_TYPE: Record<PartnershipContactType, string> = {
  cybergame: '[Hợp tác Cybergame]',
  'game-dev': '[Hợp tác Nhà phát triển game]',
}

export function usePartnershipContact(type: PartnershipContactType) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }
    setSubmitting(true)
    try {
      const payload = { name, email, message: `${SUBJECT_BY_TYPE[type]} ${message}` }
      const r = await ContactApiService.sendMessage(payload)
      if (r.success) {
        toast.success('Đã gửi yêu cầu hợp tác! JGame sẽ liên hệ lại sớm.')
        setSubmitted(true)
        setName(''); setEmail(''); setMessage('')
      } else {
        toast.error(r.message || 'Gửi thất bại, vui lòng thử lại')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => setSubmitted(false)

  return { name, setName, email, setEmail, message, setMessage, submitting, submitted, handleSubmit, reset }
}
