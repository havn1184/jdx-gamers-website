# MPAGE-17 — Dialog phải đặt ngoài CardContent

**Mức độ:** WARN (kiểm tra thủ công)
**Kiểm tra:** thủ công

## Mô tả
Theo cấu trúc chuẩn Header → Filters → Table → Pagination → Dialogs, các `<Dialog>`/`<XxxFormDialog>` phải được render ở ngoài `<CardContent>` (là anh em của `<Card>`, không lồng bên trong), để tránh dialog bị ảnh hưởng bởi style/overflow của Card.

## Ví dụ đúng
```tsx
<Card>
  <CardContent>{/* Header, Filters, Table, Pagination */}</CardContent>
</Card>
<XxxFormDialog open={open} onOpenChange={setOpen} />
<ConfirmDialog open={delOpen} onConfirm={handleDelete} />
```

## Ví dụ sai
```tsx
<Card>
  <CardContent>
    {/* ... */}
    <XxxFormDialog open={open} onOpenChange={setOpen} /> {/* lồng trong CardContent */}
  </CardContent>
</Card>
```

## Ghi chú
Khó phát hiện đáng tin cậy bằng regex đơn thuần (cần phân tích cấu trúc JSX/AST) nên để reviewer kiểm tra thủ công.
