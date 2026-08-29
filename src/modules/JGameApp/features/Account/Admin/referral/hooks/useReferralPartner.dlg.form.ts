/**
 * useReferralPartner.dlg.form — Logic form Thêm/Sửa đối tác Referral (SC-A5).
 */
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { ReferralPartnerAdmin, ReferralPartnerFormPayload } from '../../types/jgame.types'

interface Props {
  initialData: ReferralPartnerAdmin | null
  onSuccess: () => void
  onClose: () => void
}

function buildInitial(data: ReferralPartnerAdmin | null): ReferralPartnerFormPayload {
  return data
    ? { id: data.id, referralCode: data.referralCode, name: data.name, commissionRateDefault: data.commissionRateDefault, status: data.status }
    : { referralCode: '', name: '', commissionRateDefault: 0.05, status: 'active' }
}

export function useReferralPartnerForm({ initialData, onSuccess, onClose }: Props) {
  const [formData, setFormData] = useState<ReferralPartnerFormPayload>(() => buildInitial(initialData))
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<unknown>(null)
  const [serverErrorOpen, setServerErrorOpen] = useState(false)

  useEffect(() => {
    setFormData(buildInitial(initialData))
    setTouched({})
  }, [initialData])

  const errors = {
    referralCode: touched.referralCode && !formData.referralCode.trim() ? 'Mã giới thiệu là bắt buộc' : null,
    name: touched.name && !formData.name.trim() ? 'Tên đối tác là bắt buộc' : null,
  }

  const handleBlur = (field: string) => setTouched(p => ({ ...p, [field]: true }))

  const handleSubmit = async () => {
    setTouched({ referralCode: true, name: true })
    if (!formData.referralCode.trim() || !formData.name.trim()) {
      toast.error('Vui lòng nhập đủ thông tin bắt buộc')
      return
    }
    setSubmitting(true)
    try {
      const r = formData.id
        ? await JGameApiServiceAdmin.updateReferralPartner(formData)
        : await JGameApiServiceAdmin.createReferralPartner(formData)
      if (r.success) {
        toast.success(formData.id ? 'Cập nhật thành công' : 'Tạo mới thành công')
        onClose()
        onSuccess()
      } else {
        setServerError(r)
        setServerErrorOpen(true)
      }
    } catch {
      toast.error('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }

  return { formData, setFormData, errors, touched, submitting, serverError, serverErrorOpen, setServerErrorOpen, handleBlur, handleSubmit }
}
