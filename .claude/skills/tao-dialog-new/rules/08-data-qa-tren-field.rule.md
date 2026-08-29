# DLGNEW-08 — data-qa trên ít nhất 2 field

**Mức độ:** ERROR
**Kiểm tra:** tự động

## Mô tả
Dialog phải có `data-qa` trên ít nhất 2 field nhập liệu, dùng đúng tiền tố theo loại control: `i_` (input), `sel_` (select), `dt_` (date picker), `chk_` (checkbox), `r_` (radio).

## Ví dụ đúng
```tsx
<Input data-qa='i_ten' ... />
<Select data-qa='sel_trang_thai' ... />
```

## Ví dụ sai
```tsx
<Input ... /> {/* thiếu data-qa hoàn toàn hoặc chỉ có 1 field có data-qa */}
```
