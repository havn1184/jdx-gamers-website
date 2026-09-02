# FPT-07 — Reset page=1 khi filter thay đổi

**Mức độ:** ERROR
**Kiểm tra:** tự động

## Mô tả
Khi bất kỳ filter nào (status, searchTerm, dateFrom, dateTo...) thay đổi, phải reset `page` về `1` (qua `setCurrentPage(1)`, `setFilters(prev => ({...prev, page: 1}))`, hoặc clear `currentPage` khỏi storage). Tránh trường hợp đang ở trang 5 rồi lọc dữ liệu chỉ còn 1 trang → hiển thị rỗng.

## Ví dụ đúng
```ts
const handleFilterChange = (next) => {
  setFilters(prev => ({ ...prev, ...next, page: 1 }));
  setCurrentPage(1);
  clearCurrentPageFromStorage();
};
```

## Ví dụ sai
```ts
const handleFilterChange = (next) => {
  setFilters(prev => ({ ...prev, ...next })); // quên reset page
};
```
