# FPT-11 — pageSize được lưu vào localStorage

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
`pageSize` nên được đồng bộ với `localStorage` (key `app_page_size`) — thường tự động qua `PagingUtils`/`getPageSizeFromStorage`, không cần code tay riêng nếu đã dùng `<PagingUtils>`.

## Ví dụ đúng
```tsx
<PagingUtils itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} ... />
// PagingUtils tự lưu vào localStorage 'app_page_size'
```

## Ví dụ sai
```ts
// Tự quản lý pageSize hoàn toàn trong state, không liên kết localStorage lẫn PagingUtils
```
