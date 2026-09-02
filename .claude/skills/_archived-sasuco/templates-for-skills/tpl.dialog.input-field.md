```tsx
// Input văn bản có validation — hỗ trợ 3 mode (view/create/edit)
// isViewMode = mode === 'view'
<div className='space-y-1.5'>
  <Label htmlFor='name'>Tên <span className='text-red-500'>*</span></Label>
  {isViewMode
    ? <div className='px-3 py-2 text-gray-900'>{formData.name || '-'}</div>
    : <>
        <input
          id='name' type='text'
          data-qa='i_ten'
          className={cn('invoice-input', errors.name && 'border-destructive')}
          value={formData.name}
          onChange={e => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
        />
        {touched.name && errors.name && (
          <p className='text-xs text-destructive flex items-center gap-1'>
            <AlertCircle className='h-3 w-3' />{errors.name}
          </p>
        )}
      </>
  }
</div>
```

```tsx
// Input số tiền / số lượng — type='text' inputMode='numeric', căn phải
<div className='space-y-1.5'>
  <Label>Số lượng <span className='text-red-500'>*</span></Label>
  {isViewMode
    ? <div className='px-3 py-2 text-gray-900 text-right'>{formatNumber(formData.quantity)}</div>
    : <>
        <input
          type='text' inputMode='numeric'
          data-qa='i_so_luong'
          className={cn('invoice-input text-right', errors.quantity && 'border-destructive')}
          value={formatNumber(formData.quantity)}
          onChange={e => handleChange('quantity', e.target.value.replace(/\./g, ''))}
          onBlur={() => handleBlur('quantity')}
        />
        {touched.quantity && errors.quantity && (
          <p className='text-xs text-destructive flex items-center gap-1'>
            <AlertCircle className='h-3 w-3' />{errors.quantity}
          </p>
        )}
      </>
  }
</div>
```
