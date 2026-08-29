# MPAGE-09 — Action icon dùng đúng class màu

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
Mỗi icon hành động phải có đúng class màu: `Eye` → `icon-primary`, `Pencil` → `icon-warning`, `Copy` → `icon-success`, `Trash2` → `icon-danger`.

## Ví dụ đúng
```tsx
<Eye className='icon-primary h-4 w-4' />
<Pencil className='icon-warning h-4 w-4' />
<Trash2 className='icon-danger h-4 w-4' />
```

## Ví dụ sai
```tsx
<Eye className='h-4 w-4' /> {/* thiếu class icon-primary */}
```
