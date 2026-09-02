# DLGNEW-18 — SearchCombobox/TableSearchCombobox phải có initialLabel khi Sửa/Nhân bản

**Mức độ:** ERROR (kiểm tra thủ công)
**Kiểm tra:** thủ công

## Mô tả
Khi mở dialog ở mode Sửa hoặc Nhân bản, các trường `SearchCombobox`/`TableSearchCombobox` đại diện cho khóa ngoại (FK) đã có sẵn ID phải truyền kèm `initialLabel` (tên hiển thị) — nếu không, control sẽ hiển thị rỗng dù đã có giá trị chọn.

## Ví dụ đúng
```tsx
<SearchCombobox
  value={formData.khachHangId}
  initialLabel={formData.khachHangTen}
  loadOptions={loadKhachHang}
  onChange={(id, label) => updateField('khachHangId', id)}
/>
```

## Ví dụ sai
```tsx
<SearchCombobox
  value={formData.khachHangId}
  loadOptions={loadKhachHang}
  onChange={...}
  {/* thiếu initialLabel -> control hiển thị trống khi Sửa/Nhân bản */}
/>
```

## Ghi chú
Reviewer cần kiểm tra thủ công vì cần đối chiếu dữ liệu thực tế trả về từ API mới xác định được field label tương ứng.
