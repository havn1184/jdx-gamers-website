# MPAGE-07 — TableRow có hover:bg-gray-50

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
`TableRow` nên có `hover:bg-gray-50` để người dùng dễ theo dõi hàng đang trỏ chuột tới.

## Ví dụ đúng
```tsx
<TableRow className='hover:bg-gray-50'>...</TableRow>
```

## Ví dụ sai
```tsx
<TableRow>...</TableRow> {/* thiếu hiệu ứng hover */}
```
