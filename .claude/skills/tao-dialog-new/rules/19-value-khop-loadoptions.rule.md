# DLGNEW-19 — value phải khớp kiểu dữ liệu với loadOptions

**Mức độ:** ERROR (kiểm tra thủ công)
**Kiểm tra:** thủ công

## Mô tả
Prop `value` truyền vào `SearchCombobox`/`TableSearchCombobox` phải cùng kiểu (string vs number) và cùng nguồn giá trị với option trả về từ `loadOptions`. Lệch kiểu (VD: `value` là number nhưng option.value là string) khiến control không tự chọn đúng item ban đầu.

## Ví dụ đúng
```tsx
// loadOptions trả về { value: string, label: string }
<SearchCombobox value={String(formData.khachHangId)} loadOptions={loadKhachHang} />
```

## Ví dụ sai
```tsx
// loadOptions trả về value dạng string, nhưng value truyền vào là number
<SearchCombobox value={formData.khachHangId /* number */} loadOptions={loadKhachHang} />
```

## Ghi chú
Cần đọc code `loadOptions` thực tế để xác nhận kiểu dữ liệu khớp nhau — chưa tự động hoá được trong script hiện tại.
