/**
 * useSupplier.dlg.form — Logic form Thêm/Sửa NCC (SC-A3).
 */
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { SupplierAdmin, SupplierFormPayload } from '../../types/jgame.types'

interface Props {
  initialData: SupplierAdmin | null
  onSuccess: () => void
  onClose: () => void
}

function buildInitial(data: SupplierAdmin | null): SupplierFormPayload {
  return data
    ? { id: data.id, name: data.name, apiProtocol: data.apiProtocol, authMethod: data.authMethod, priorityDefault: data.priorityDefault, status: data.status }
    : { name: '', apiProtocol: 'REST', authMethod: 'API_KEY', priorityDefault: 1, status: 'active' }
}

export function useSupplierForm({ initialData, onSuccess, onClose }: Props) {
  const [formData, setFormData] = useState<SupplierFormPayload>(() => buildInitial(initialData))
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<unknown>(null)
  const [serverErrorOpen, setServerErrorOpen] = useState(false)

  useEffect(() => {
    setFormData(buildInitial(initialData))
    setTouched({})
  }, [initialData])

  const errors = {
    name: touched.name && !formData.name.trim() ? 'Tên NCC là bắt buộc' : null,
  }

  const handleBlur = (field: string) => setTouched(p => ({ ...p, [field]: true }))

  const handleSubmit = async () => {
    setTouched({ name: true })
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên NCC')
      return
    }
    setSubmitting(true)
    try {
      const r = formData.id
        ? await JGameApiServiceAdmin.updateSupplier(formData)
        : await JGameApiServiceAdmin.createSupplier(formData)
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
