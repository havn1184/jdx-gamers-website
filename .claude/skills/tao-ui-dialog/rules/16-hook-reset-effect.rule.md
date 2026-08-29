# DLG-16 — Hook dialog form phải reset khi initialData đổi

**Mức độ:** ERROR

Nếu hook `use*DialogForm` khởi tạo `useState` từ `initialData`, hook đó BẮT BUỘC phải có `useEffect` reset `formData`/`errors` khi `initialData` thay đổi, và deps của effect đó PHẢI có `open`.

**Lý do bắt buộc `open` trong deps:** nếu thiếu, luồng create → đóng → create lại sẽ không reset form vì `initialData` vẫn giữ nguyên giá trị `null` giữa 2 lần mở — effect không chạy lại do dependency không đổi.

✅ Đúng:
```tsx
useEffect(() => {
  setFormData(initialData ?? defaultValues);
  setErrors({});
}, [initialData, cloneMode, open]);
```
