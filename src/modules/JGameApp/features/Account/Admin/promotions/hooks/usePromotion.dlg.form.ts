/**
 * usePromotion.dlg.form — Logic form Thêm/Sửa khuyến mãi/voucher (SC-A7).
 */
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { PromotionAdmin, PromotionFormPayload } from '../../types/jgame.types'

interface Props {
  initialData: PromotionAdmin | null
  onSuccess: () => void
  onClose: () => void
}

function buildInitial(data: PromotionAdmin | null): PromotionFormPayload {
  return data
    ? { id: data.id, code: data.code, discountType: data.discountType, discountValue: data.discountValue, startAt: data.startAt, endAt: data.endAt, status: data.status }
    : { code: '', discountType: 'percent', discountValue: 10, startAt: '', endAt: '', status: 'active' }
}

export function usePromotionForm({ initialData, onSuccess, onClose }: Props) {
  const [formData, setFormData] = useState<PromotionFormPayload>(() => buildInitial(initialData))
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<unknown>(null)
  const [serverErrorOpen, setServerErrorOpen] = useState(false)

  useEffect(() => {
    setFormData(buildInitial(initialData))
    setTouched({})
  }, [initialData])

  const errors = {
    code: touched.code && !formData.code.trim() ? 'Mã khuyến mãi là bắt buộc' : null,
    endAt: touched.endAt && formData.startAt && formData.endAt && formData.endAt < formData.startAt ? 'Ngày kết thúc phải sau ngày bắt đầu' : null,
  }

  const handleBlur = (field: string) => setTouched(p => ({ ...p, [field]: true }))

  const handleSubmit = async () => {
    setTouched({ code: true, endAt: true })
    if (!formData.code.trim() || (formData.startAt && formData.endAt && formData.endAt < formData.startAt)) {
      toast.error('Vui lòng kiểm tra lại thông tin')
      return
    }
    setSubmitting(true)
    try {
      const r = formData.id
        ? await JGameApiServiceAdmin.updatePromotion(formData)
        : await JGameApiServiceAdmin.createPromotion(formData)
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
