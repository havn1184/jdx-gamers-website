# MPAGE-04 — Nút Thêm mới (nếu page hỗ trợ CRUD)

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
Nếu trang có chức năng tạo mới, nên có nút "Thêm mới" với icon `Plus`. Trang chỉ đọc dữ liệu (read-only) thì không bắt buộc.

## Ví dụ đúng
```tsx
<Button data-qa='btn_them_moi'><Plus className='h-4 w-4' /> Thêm mới</Button>
```

## Ví dụ sai
```tsx
// Trang có handleCreate/Create API nhưng không có nút Thêm mới nào trên UI
```
