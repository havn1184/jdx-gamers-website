/**
 * useAccessory.dlg.form — Logic form Thêm/Sửa sản phẩm phụ kiện: khai báo hãng sản xuất
 * (nhập tự do, gợi ý từ các hãng đã có), nhóm sản phẩm và chi tiết sản phẩm.
 */
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { AccessoryAdmin, AccessoryFormPayload } from '../../types/jgame.types'

interface Props {
  initialData: AccessoryAdmin | null
  onSuccess: () => void
  onClose: () => void
}

function buildInitial(data: AccessoryAdmin | null): AccessoryFormPayload {
  return data
    ? { id: data.id, name: data.name, category: data.category, brand: data.brand, specs: data.specs, price: data.price, stockQuantity: data.stockQuantity, status: data.status, imageUrl: data.imageUrl }
    : { name: '', category: 'mouse', brand: '', specs: '', price: 0, stockQuantity: 0, status: 'active', imageUrl: '' }
}

export function useAccessoryForm({ initialData, onSuccess, onClose }: Props) {
  const [formData, setFormData] = useState<AccessoryFormPayload>(() => buildInitial(initialData))
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<unknown>(null)
  const [serverErrorOpen, setServerErrorOpen] = useState(false)
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([])

  const loadBrandSuggestions = useCallback(async () => {
    const r = await JGameApiServiceAdmin.getAccessoryBrands()
    if (r.success && r.data) setBrandSuggestions(r.data)
  }, [])

  useEffect(() => { void loadBrandSuggestions() }, [loadBrandSuggestions])

  useEffect(() => {
    setFormData(buildInitial(initialData))
    setTouched({})
  }, [initialData])

  const errors = {
    name: touched.name && !formData.name.trim() ? 'Tên sản phẩm là bắt buộc' : null,
    brand: touched.brand && !formData.brand.trim() ? 'Hãng sản xuất là bắt buộc' : null,
    price: touched.price && formData.price <= 0 ? 'Giá bán phải lớn hơn 0' : null,
  }

  const handleBlur = (field: string) => setTouched(p => ({ ...p, [field]: true }))

  const handleSubmit = async () => {
    setTouched({ name: true, brand: true, price: true })
    if (!formData.name.trim() || !formData.brand.trim() || formData.price <= 0) {
      toast.error('Vui lòng nhập đủ thông tin bắt buộc')
      return
    }
    setSubmitting(true)
    try {
      const r = formData.id
        ? await JGameApiServiceAdmin.updateAccessory(formData)
        : await JGameApiServiceAdmin.createAccessory(formData)
      if (r.success) {
        toast.success(formData.id ? 'Cập nhật thành công' : 'Tạo mới thành công')
        onClose()
        onSuccess()
        void loadBrandSuggestions()
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
    handleBlur, handleSubmit, brandSuggestions,
  }
}
