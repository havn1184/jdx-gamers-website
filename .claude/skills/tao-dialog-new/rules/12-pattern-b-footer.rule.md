# DLGNEW-12 — [Nghiệp Vụ] Footer có tổng tiền hoặc Ghi sổ/Bỏ ghi

**Mức độ:** WARN
**Kiểm tra:** tự động (chỉ áp dụng khi phát hiện pattern Full-Screen Nghiệp Vụ — có `SearchCombobox`/`<Label`)

## Mô tả
Pattern Full-Screen Nghiệp Vụ nên có hiển thị tổng tiền (`formatCurrency`/`formatNumber`/"Tổng tiền") hoặc chức năng Ghi sổ/Bỏ ghi ở footer.

## Ví dụ đúng
```tsx
<div>Tổng tiền: {formatCurrency(total)}</div>
<Button data-qa='btn_ghi_so'>Ghi sổ</Button>
```

## Ví dụ sai
```tsx
{/* Dialog nghiệp vụ có nhiều dòng hạch toán nhưng không hiển thị tổng tiền */}
```
