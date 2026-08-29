# MPAGE-06 — TableHeader có background #f8f9fa

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
`TableHeader` nên có nền `bg-[#f8f9fa]` (hoặc `bg-gray-50`/`bg-gray-100`) để phân biệt với body.

## Ví dụ đúng
```tsx
<TableHeader className='bg-[#f8f9fa]'>...</TableHeader>
```

## Ví dụ sai
```tsx
<TableHeader>...</TableHeader> {/* không có background riêng */}
```
