/**
 * useContactForm.page — Logic form Liên hệ (SC-22).
 */
import { useState } from 'react'
import { toast } from 'sonner'
import { ContactApiService } from '../services/ContactApiService'

export function useContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }
    setSubmitting(true)
    try {
      const r = await ContactApiService.sendMessage({ name, email, message })
      if (r.success) {
        toast.success('Đã gửi liên hệ! Chúng tôi sẽ phản hồi sớm.')
        setName(''); setEmail(''); setMessage('')
      } else {
        toast.error(r.message || 'Gửi thất bại')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return { name, setName, email, setEmail, message, setMessage, submitting, handleSubmit }
}
