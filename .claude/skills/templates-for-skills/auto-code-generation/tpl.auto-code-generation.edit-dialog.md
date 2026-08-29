# Template: Dialog chỉnh sửa entity có sinh mã tự động

**Dùng khi:** Tạo dialog edit cho entity đã được sinh mã từ trước.

**Lưu ý:**
- KHÔNG hiển thị `AutoCodePreviewDisplay`
- Hiển thị `item.code` dạng readonly
- KHÔNG cho sửa hoặc gửi lại `code`

```tsx
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Label } from '@/shared/components/ui/label'
import { Button } from '@/shared/components/ui/button'
import { ValidationErrorDialog } from '@/shared/components/common'
import { cn } from '@/shared/components/ui/utils'
import { SelectCombobox } from '@/shared/components/form/SelectCombobox'
import { useEditEmployeeForm } from '../hooks'
import type { EmployeeDocument } from '../types'

interface EditEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: EmployeeDocument | null
  onSuccess: () => void
}

export function EditEmployeeDialog({ open, onOpenChange, item, onSuccess }: EditEmployeeDialogProps) {
  const {
    formData,
    setFormData,
    errors,
    submitting,
    apiError,
    setApiError,
    submitUpdate,
  } = useEditEmployeeForm({
    item,
    onSuccess: () => {
      onOpenChange(false)
      onSuccess()
    },
  })

  if (!item) {
    return null
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent maxWidth='600px' className='w-[600px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <div className='flex items-center justify-between'>
              <DialogTitle>Chỉnh sửa nhân viên</DialogTitle>
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
            <div className='space-y-1.5'>
              <Label className='text-gray-500 text-xs'>Mã nhân viên</Label>
              <div className='px-3 py-2 font-mono font-bold text-blue-700 bg-gray-50 rounded border border-gray-200'>
                {item.code}
              </div>
              <p className='text-xs text-gray-400'>Mã được sinh tự động khi tạo và không thể thay đổi.</p>
            </div>

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
              onClick={() => submitUpdate(item.id)}
              disabled={submitting}
            >
              {submitting ? 'Đang lưu...' : 'Lưu'}
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
- Tên entity trong title/props/type
- Các field editable thực tế
- `options={[]}` → dữ liệu thật
- Import component đúng module đang dùng
