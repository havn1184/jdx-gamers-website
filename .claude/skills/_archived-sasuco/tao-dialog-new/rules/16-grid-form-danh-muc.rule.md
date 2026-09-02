# DLGNEW-16 — [Danh Mục] Form dùng grid layout

**Mức độ:** WARN
**Kiểm tra:** tự động (chỉ áp dụng khi phát hiện pattern Danh Mục CRUD — có `DmFormField`)

## Mô tả
Pattern Danh Mục CRUD nên bố cục form bằng class `grid-cols-*` (thường `grid-cols-5` hoặc `grid-cols-3`) thay vì flex tùy tiện.

## Ví dụ đúng
```tsx
<div className='grid grid-cols-3 gap-4'>...</div>
```

## Ví dụ sai
```tsx
<div className='flex flex-col gap-2'>{/* pattern Danh Mục nhưng không dùng grid */}</div>
```
