# FPT-06 — Lưu currentPage vào sessionStorage

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
Trang phải lưu `currentPage` vào `sessionStorage` (key dạng `'{featureName}.currentPage'`) để giữ trạng thái trang khi người dùng quay lại danh sách (VD: sau khi xem chi tiết rồi back).

## Ví dụ đúng
```ts
sessionStorage.setItem('invoice-list.currentPage', String(page));
const saved = sessionStorage.getItem('invoice-list.currentPage');
```

## Ví dụ sai
```ts
// Không lưu currentPage ở đâu cả -> quay lại trang danh sách luôn về trang 1
```
