# MPAGE-12 — Xử lý loading state

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
Master Page nên xử lý trạng thái đang tải dữ liệu (`PageLoader`, `isLoading`, "Đang tải...") để người dùng biết dữ liệu đang được tải.

## Ví dụ đúng
```tsx
{loading ? <PageLoader colSpan={4} /> : <TableBody>...</TableBody>}
```

## Ví dụ sai
```tsx
<TableBody>{items.map(...)}</TableBody> {/* không xử lý gì khi đang loading, hiển thị bảng trống */}
```
