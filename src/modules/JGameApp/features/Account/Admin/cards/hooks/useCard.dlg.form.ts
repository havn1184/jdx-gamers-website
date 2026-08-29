/**
 * useCard.dlg.form — Logic form Thêm/Sửa loại thẻ (SC-A2).
 */
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { CardProductAdmin, CardProductFormPayload, SupplierAdmin } from '../../types/jgame.types'

interface Props {
  initialData: CardProductAdmin | null
  onSuccess: () => void
  onClose: () => void
}

function buildInitial(data: CardProductAdmin | null): CardProductFormPayload {
  return data
    ? { id: data.id, name: data.name, category: data.category, supplierId: data.supplierId, status: data.status }
    : { name: '', category: 'game', supplierId: '', status: 'active' }
}

export function useCardForm({ initialData, onSuccess, onClose }: Props) {
  const [formData, setFormData] = useState<CardProductFormPayload>(() => buildInitial(initialData))
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<unknown>(null)
  const [serverErrorOpen, setServerErrorOpen] = useState(false)
  const [suppliers, setSuppliers] = useState<SupplierAdmin[]>([])

  const loadSuppliers = useCallback(async () => {
    const r = await JGameApiServiceAdmin.getSuppliers({ status: 'active' })
    if (r.success && r.data) setSuppliers(r.data)
  }, [])

  useEffect(() => { void loadSuppliers() }, [loadSuppliers])

  useEffect(() => {
    setFormData(buildInitial(initialData))
    setTouched({})
  }, [initialData])

  const errors = {
    name: touched.name && !formData.name.trim() ? 'Tên loại thẻ là bắt buộc' : null,
    supplierId: touched.supplierId && !formData.supplierId ? 'Chọn nhà cung cấp' : null,
  }

  const handleBlur = (field: string) => setTouched(p => ({ ...p, [field]: true }))

  const handleSubmit = async () => {
    setTouched({ name: true, supplierId: true })
    if (!formData.name.trim() || !formData.supplierId) {
      toast.error('Vui lòng nhập đủ thông tin bắt buộc')
      return
    }
    setSubmitting(true)
    try {
      const r = formData.id
        ? await JGameApiServiceAdmin.updateCard(formData)
        : await JGameApiServiceAdmin.createCard(formData)
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

  return {
    formData, setFormData, errors, touched, submitting,
    serverError, serverErrorOpen, setServerErrorOpen,
    handleBlur, handleSubmit, suppliers,
  }
}
