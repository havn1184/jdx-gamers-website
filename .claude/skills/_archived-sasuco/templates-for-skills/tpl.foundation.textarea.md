# Template: Textarea

## Textarea KHÔNG có validation

```tsx
<div className='space-y-1.5'>
  <Label htmlFor='desc'>Mô tả</Label>
  <Textarea id='desc' data-qa='i_mo_ta' value={formData.description}
    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
    rows={2} className='invoice-textarea' />
</div>
```

---

## Textarea CÓ validation

```tsx
<div className='space-y-1.5'>
  <Label htmlFor='desc'>Mô tả <span className='text-red-500'>*</span></Label>
  <Textarea id='desc' data-qa='i_mo_ta' value={formData.description}
    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
    onBlur={() => handleBlur('description')} rows={2}
    className={cn('invoice-textarea', errors.description && 'border-destructive')} />
  {touched.description && errors.description && (
    <p className='text-xs text-destructive flex items-center gap-1'>
      <AlertCircle className='h-3 w-3' />{errors.description}
    </p>
  )}
</div>
```

---

## View mode — bắt buộc có whitespace-pre-wrap

```tsx
{isViewMode
  ? <div className='px-3 py-2 text-gray-900 whitespace-pre-wrap'>{formData.description || '-'}</div>
  : <Textarea id='desc' data-qa='i_mo_ta' value={formData.description}
      onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
      rows={3} className='invoice-textarea' />
}
```

---

## FormFieldTextarea (ưu tiên cho dialog 3 mode)

Dùng `<FormFieldTextarea>` từ `@/shared/components/common` thay cho code thủ công khi dialog có cả 3 mode (View/Create/Edit):

```tsx
import { FormFieldTextarea } from '@/shared/components/common'

<FormFieldTextarea
  id='description' label='Mô tả'
  value={formData.description} error={errors.description}
  touched={touched.description} isViewMode={isViewMode}
  rows={3}
  onChange={value => handleChange('description', value)}
  onBlur={() => handleBlur('description')}
/>
```
