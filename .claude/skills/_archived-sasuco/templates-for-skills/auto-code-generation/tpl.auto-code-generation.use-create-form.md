# Template: Hook form tạo mới entity có sinh mã tự động

**Dùng khi:** Tạo hook cho form tạo mới entity có `Code` được sinh tự động từ BE.

**Lưu ý:**
- Chỉ dùng cho form tạo mới
- PHẢI gọi `useAutoCodePreview(catalogCodeType)`
- KHÔNG có field `code` trong form state
- KHÔNG truyền `code` trong payload create

```ts
import { useState } from 'react'
import { useAutoCodePreview } from '@/modules/BaseIndexApp/features/cai-dat/sinh-ma-tu-dong/hooks'
import { EmployeeApiService } from '../services'

interface UseCreateEmployeeFormOptions {
  onSuccess?: (data: unknown) => void
}

interface CreateEmployeeFormData {
  fullName: string
  departmentId: string
}

interface CreateEmployeeFormErrors {
  fullName?: string
  departmentId?: string
}

export function useCreateEmployeeForm({ onSuccess }: UseCreateEmployeeFormOptions) {
  const [formData, setFormData] = useState<CreateEmployeeFormData>({
    fullName: '',
    departmentId: '',
  })
  const [errors, setErrors] = useState<CreateEmployeeFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<unknown>(null)

  // 0 = CatalogCodeType.Employee
  // Đổi sang loại entity tương ứng khi áp dụng template
  const {
    preview,
    loading: previewLoading,
    error: previewError,
    isInactive,
    isNotConfigured,
  } = useAutoCodePreview(0)

  const validateForm = () => {
    const nextErrors: CreateEmployeeFormErrors = {}

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Họ tên bắt buộc'
    }

    if (!formData.departmentId) {
      nextErrors.departmentId = 'Phòng ban bắt buộc'
    }

    return nextErrors
  }

  const submitForm = async () => {
    const nextErrors = validateForm()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setApiError(null)

    try {
      const response = await EmployeeApiService.create({
        fullName: formData.fullName,
        departmentId: formData.departmentId,
      })

      if (response.success) {
        const generatedCode = response.data.code
        void generatedCode
        onSuccess?.(response.data)
        return
      }

      setApiError(response)
    } catch (error) {
      setApiError(error)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    formData,
    setFormData,
    errors,
    preview,
    previewLoading,
    previewError,
    isInactive,
    isNotConfigured,
    submitting,
    apiError,
    setApiError,
    submitForm,
  }
}
```

**Cần thay khi áp dụng:**
- `EmployeeApiService` → service của entity
- `0` → `CatalogCodeType` tương ứng
- `CreateEmployeeFormData` → fields thực tế của form
- Validation rule theo nghiệp vụ entity
