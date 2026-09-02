# DLGNEW-11 — [Danh Mục] Footer có Lưu & Thêm mới

**Mức độ:** WARN
**Kiểm tra:** tự động (chỉ áp dụng khi phát hiện pattern Danh Mục CRUD — có `DmFormField`)

## Mô tả
Pattern Danh Mục CRUD nên dùng `DmDialogFooter`, hoặc footer tự viết có nút Lưu (`btn_luu`) kèm chức năng "Lưu & Thêm mới" cho mode Create.

## Ví dụ đúng
```tsx
<DmDialogFooter isCreate={isCreate} onSave={submit} onSaveAndAdd={submitAndAdd} />
```

## Ví dụ sai
```tsx
{/* Pattern Danh Mục nhưng chỉ có nút Lưu, thiếu Lưu & Thêm mới cho mode tạo mới */}
```
