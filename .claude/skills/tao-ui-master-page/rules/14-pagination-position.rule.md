# MPAGE-14 — PagingUtils nằm sau Table

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
`<PagingUtils>` phải được đặt sau thẻ đóng `</Table>` trong JSX, đúng thứ tự bố cục Header → Filters → Table → Pagination.

## Ví dụ đúng
```tsx
<Table>...</Table>
<PagingUtils ... />
```

## Ví dụ sai
```tsx
<PagingUtils ... />
<Table>...</Table> {/* Pagination đặt trước Table, sai vị trí */}
```
