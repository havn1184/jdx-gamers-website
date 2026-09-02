# DLGNEW-20 — Hook reset state khi dialog đóng/mở lại (deps có `open`)

**Mức độ:** ERROR (kiểm tra thủ công)
**Kiểm tra:** thủ công

## Mô tả
Vì dialog thường chỉ ẩn/hiện (không unmount), hook khởi tạo `formData` bằng `useState(initialData)` sẽ không tự reset khi mở lại với dữ liệu khác. Hook phải có `useEffect` reset `formData`/`errors` phụ thuộc vào cả `initialData` và `open` (không chỉ `initialData`), để xử lý đúng các case: đổi record khi Sửa, tạo mới liên tiếp, và mở lại chế độ Xem.

## Ví dụ đúng
```tsx
export function useXxxDialogForm(initialData, onSuccess, onClose, cloneMode, open) {
  const [formData, setFormData] = useState(() => buildInitial(initialData));

  useEffect(() => {
    if (open === false) return;
    setFormData(buildInitial(initialData));
    setErrors({});
  }, [initialData, cloneMode, open]);
}
```

## Ví dụ sai
```tsx
export function useXxxDialogForm(initialData) {
  const [formData, setFormData] = useState(initialData); // không reset khi mở lại dialog với record khác
}
```

## Ghi chú
`tao-ui-dialog` đã có rule tự động tương đương (`UIDLG-16`) áp dụng riêng cho pattern dialog hook; ở `tao-dialog-new` rule này ghi nhận để reviewer đối chiếu thủ công khi tự viết hook mới, vì script hiện tại của skill này (16 checks gốc) chưa bao gồm kiểm tra tự động này.
