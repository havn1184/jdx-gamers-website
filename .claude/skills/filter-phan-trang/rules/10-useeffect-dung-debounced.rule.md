# FPT-10 — useEffect dependency phải dùng debouncedSearchTerm

**Mức độ:** ERROR
**Kiểm tra:** tự động

## Mô tả
Mảng dependency của `useEffect` gọi API không được chứa `searchTerm`/`search` thô — phải dùng biến đã qua `useDebounce` (VD: `debouncedSearchTerm`). Dùng raw searchTerm sẽ gây gọi API liên tục theo từng ký tự gõ.

## Ví dụ đúng
```ts
useEffect(() => {
  fetchData();
}, [debouncedSearchTerm, filters.status, filters.dateFrom, filters.dateTo, filters.page, filters.limit]);
```

## Ví dụ sai
```ts
useEffect(() => {
  fetchData();
}, [filters.searchTerm, filters.page]); // dùng raw searchTerm -> spam API
```
