# FPT-03 — Cấm tự viết pagination UI thủ công

**Mức độ:** ERROR
**Kiểm tra:** tự động

## Mô tả
Không được tự viết nút Previous/Next hay `<button>` gọi trực tiếp `setPage`/`setCurrentPage` để điều hướng trang. Phải dùng component `<PagingUtils>`.

## Ví dụ đúng
```tsx
<PagingUtils currentPage={page} totalItems={total} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={setLimit} />
```

## Ví dụ sai
```tsx
<button onClick={() => setPage(p => p - 1)}>Previous</button>
<button onClick={() => setCurrentPage(page + 1)}>Next</button>
```
