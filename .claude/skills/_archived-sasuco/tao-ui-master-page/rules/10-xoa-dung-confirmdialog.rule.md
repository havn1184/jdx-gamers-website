# MPAGE-10 — Xóa phải dùng ConfirmDialog

**Mức độ:** ERROR
**Kiểm tra:** tự động

## Mô tả
Chức năng xóa bản ghi phải hiển thị `ConfirmDialog` để người dùng xác nhận, không được gọi API xóa trực tiếp khi click icon Xóa.

## Ví dụ đúng
```tsx
<ConfirmDialog open={delOpen} onConfirm={handleDelete} variant='destructive' />
```

## Ví dụ sai
```tsx
<Trash2 onClick={() => api.delete(`/api/xxx/${id}`)} /> {/* xóa ngay, không xác nhận */}
```
