# DLGNEW-07 — Footer có pattern phù hợp (Hủy/Lưu hoặc DmDialogFooter)

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
Footer dialog nên dùng `DmDialogFooter` hoặc footer tự viết có đủ nút Hủy (`data-qa='btn_huy'`) và Lưu (`data-qa='btn_luu'`).

## Ví dụ đúng
```tsx
<DmDialogFooter isView={isReadonly} isCreate={isCreate} onClose={close} onSave={submit} />
```

## Ví dụ sai
```tsx
<DialogFooter>{/* chỉ có nút Lưu, thiếu Hủy, và không dùng DmDialogFooter */}</DialogFooter>
```
