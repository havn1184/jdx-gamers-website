# Template: Dialog tạo mới entity có sinh mã tự động

**Dùng khi:** Tạo dialog create cho entity có mã sinh tự động.

**Lưu ý:**
- PHẢI hiển thị `AutoCodePreviewDisplay`
- KHÔNG render input `code`
- Submit qua hook create, không ghép mã ở FE

```tsx
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Label } from '@/shared/components/ui/label'
import { Button } from '@/shared/components/ui/button'
import { ValidationErrorDialog } from '@/shared/components/common'
import { cn } from '@/shared/components/ui/utils'
import { AutoCodePreviewDisplay } from '@/modules/BaseIndexApp/features/cai-dat/sinh-ma-tu-dong'
import { SelectCombobox } from '@/shared/components/form/SelectCombobox'
import { useCreateEmployeeForm } from '../hooks'

interface CreateEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateEmployeeDialog({ open, onOpenChange, onSuccess }: CreateEmployeeDialogProps) {
  const {
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
  } = useCreateEmployeeForm({
    onSuccess: () => {
      onOpenChange(false)
      onSuccess()
    },
  })

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent maxWidth='600px' className='w-[600px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <div className='flex items-center justify-between'>
              <DialogTitle>Tạo nhân viên mới</DialogTitle>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0'
                type='button'
                onClick={() => onOpenChange(false)}
                disabled={submitting}
                aria-label='Đóng'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <AutoCodePreviewDisplay
              preview={preview}
              loading={previewLoading}
              error={previewError}
              isInactive={isInactive}
              isNotConfigured={isNotConfigured}
            />

            <div className='space-y-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='fullName'>
                  Họ tên <span className='text-red-500'>*</span>
                </Label>
                <input
                  id='fullName'
                  value={formData.fullName}
                  onChange={event => setFormData(prev => ({ ...prev, fullName: event.target.value }))}
                  className={cn('invoice-input', errors.fullName && 'border-destructive')}
                  placeholder='VD: Nguyễn Văn A'
                />
                {errors.fullName && <p className='text-xs text-destructive'>{errors.fullName}</p>}
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='departmentId'>
                  Phòng ban <span className='text-red-500'>*</span>
                </Label>
                <SelectCombobox
                  id='departmentId'
                  value={formData.departmentId}
                  onChange={value => setFormData(prev => ({ ...prev, departmentId: value }))}
                  options={[]}
                  placeholder='Chọn phòng ban'
                />
                {errors.departmentId && <p className='text-xs text-destructive'>{errors.departmentId}</p>}
              </div>
            </div>
          </div>

          <DialogFooter className='flex justify-end gap-3 pt-4 border-t border-[#e0e0e0]'>
            <button
              type='button'
              className='btn-secondary'
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type='button'
              className='btn-primary'
              onClick={submitForm}
              disabled={submitting}
            >
              {submitting ? 'Đang lưu...' : 'Tạo mới'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ValidationErrorDialog
        open={apiError !== null}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setApiError(null)
          }
        }}
        errorDetails={(apiError as { errorDetails?: unknown } | null)?.errorDetails}
        message={(apiError as { message?: string } | null)?.message}
      />
    </>
  )
}
```

**Cần thay khi áp dụng:**
- Tên dialog và hook
- Các field thực tế của form
- `options={[]}` → data nguồn thực tế
- Import `SelectCombobox` đúng path của module đang dùng
