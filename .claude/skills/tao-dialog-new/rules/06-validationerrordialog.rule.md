# DLGNEW-06 — Dùng ValidationErrorDialog cho lỗi server

**Mức độ:** ERROR
**Kiểm tra:** tự động

## Mô tả
Lỗi trả về từ server (validation lỗi nghiệp vụ) phải hiển thị qua `ValidationErrorDialog` (hoặc state `serverError`), không hiển thị bằng `alert()`/toast tùy tiện.

## Ví dụ đúng
```tsx
<ValidationErrorDialog open={serverErrorOpen} message={serverError} onClose={...} />
```

## Ví dụ sai
```tsx
catch (e) { alert(e.message); } // không dùng ValidationErrorDialog
```
