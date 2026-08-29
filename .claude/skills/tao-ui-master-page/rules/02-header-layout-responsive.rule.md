# MPAGE-02 — Header dùng layout responsive flex-col sm:flex-row

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
Header của Master Page nên dùng `flex-col sm:flex-row sm:justify-between gap-3` (hoặc tối thiểu `flex ... justify-between`) để responsive tốt trên mobile.

## Ví dụ đúng
```tsx
<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>...</div>
```

## Ví dụ sai
```tsx
<div className='flex'>{/* thiếu justify-between, không responsive theo breakpoint sm */}</div>
```
