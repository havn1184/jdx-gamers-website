# MPAGE-13 — Xử lý empty state

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
Khi bảng không có dữ liệu, nên hiển thị thông báo phù hợp (VD: "Không có dữ liệu") thay vì để bảng trống trơn.

## Ví dụ đúng
```tsx
{items.length === 0 ? <div className='py-12 text-center text-gray-500'>Không có dữ liệu</div> : ...}
```

## Ví dụ sai
```tsx
<TableBody>{items.map(item => <TableRow>...</TableRow>)}</TableBody> {/* không xử lý mảng rỗng */}
```
