# MPAGE-08 — Cột Thao tác đúng thứ tự Xem → Sửa → Nhân bản → Xóa

**Mức độ:** ERROR
**Kiểm tra:** tự động

## Mô tả
Icon hành động trên mỗi dòng bảng phải theo đúng thứ tự cố định: `Eye` (Xem) → `Pencil` (Sửa) → `Copy` (Nhân bản) → `Trash2` (Xóa).

## Ví dụ đúng
```tsx
<Eye .../> <Pencil .../> <Copy .../> <Trash2 .../>
```

## Ví dụ sai
```tsx
<Trash2 .../> <Eye .../> {/* Xóa đứng trước Xem, sai thứ tự chuẩn */}
```
