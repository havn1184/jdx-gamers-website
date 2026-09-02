# DLGNEW-15 — Hook riêng cho logic, dialog không gọi API trực tiếp

**Mức độ:** ERROR
**Kiểm tra:** tự động

## Mô tả
Toàn bộ logic form/gọi API phải nằm trong hook riêng dạng `useXxxDialogForm`/`useXxxDlgForm`. Component dialog chỉ render UI và gọi hàm từ hook, không tự gọi API trực tiếp bên trong dialog.

## Ví dụ đúng
```tsx
const { formData, errors, submitting, handleSubmit } = useKHFormDialogForm(initialData, onSuccess, onClose);
```

## Ví dụ sai
```tsx
// Trong component dialog
const handleSubmit = async () => {
  await api.post('/api/khach-hang', formData); // gọi API trực tiếp trong dialog, không qua hook
};
```
