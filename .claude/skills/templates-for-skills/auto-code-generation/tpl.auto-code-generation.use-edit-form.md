# Template: Hook form chỉnh sửa entity có sinh mã tự động

**Dùng khi:** Tạo hook cho form chỉnh sửa entity đã có mã.

**Lưu ý:**
- KHÔNG gọi `useAutoCodePreview`
- `code` là immutable
- Payload update KHÔNG chứa `code`

```ts
import { useEffect, useState } from 'react'
import { EmployeeApiService } from '../services'
import type { EmployeeDocument } from '../types'

interface UseEditEmployeeFormOptions {
  item: EmployeeDocument | null
  onSuccess?: (data: unknown) => void
}

interface EditEmployeeFormData {
  fullName: string
  departmentId: string
}

interface EditEmployeeFormErrors {
  fullName?: string
  departmentId?: string
}

export function useEditEmployeeForm({ item, onSuccess }: UseEditEmployeeFormOptions) {
  const [formData, setFormData] = useState<EditEmployeeFormData>({
    fullName: '',
    departmentId: '',
  })
  const [errors, setErrors] = useState<EditEmployeeFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<unknown>(null)

  useEffect(() => {
    if (!item) {
      return
    }

    setFormData({
      fullName: item.fullName ?? '',
      departmentId: item.departmentId ?? '',
    })
    setErrors({})
  }, [item])

  const validateForm = () => {
    const nextErrors: EditEmployeeFormErrors = {}

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Họ tên bắt buộc'
    }

    if (!formData.departmentId) {
      nextErrors.departmentId = 'Phòng ban bắt buộc'
    }

    return nextErrors
  }

  const submitUpdate = async (employeeId: string) => {
    const nextErrors = validateForm()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setApiError(null)

    try {
      const response = await EmployeeApiService.update(employeeId, {
        fullName: formData.fullName,
        departmentId: formData.departmentId,
      })

      if (response.success) {
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
    submitting,
    apiError,
    setApiError,
    submitUpdate,
  }
}
```

**Cần thay khi áp dụng:**
- `EmployeeDocument` → document type của entity
- `EmployeeApiService` → service của entity
- Fields load từ `item`
- Validation rule theo nghiệp vụ
