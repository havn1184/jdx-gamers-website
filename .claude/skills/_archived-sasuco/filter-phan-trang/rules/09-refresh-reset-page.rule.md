# FPT-09 — Nút Làm mới phải reset page về 1

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
Khi có nút "Làm mới", hàm xử lý (`handleRefresh`/`onRefresh`/`refresh`) nên reset `page` về `1` nhưng giữ nguyên filter và `limit` hiện tại. Không reset filter về mặc định, không gọi API trực tiếp bỏ qua state.

## Ví dụ đúng
```ts
const handleRefresh = () => {
  setCurrentPage(1);
  setFilters(prev => ({ ...prev, page: 1 }));
};
```

## Ví dụ sai
```ts
const handleRefresh = () => {
  fetchData(); // không reset page, giữ nguyên page cũ có thể lệch dữ liệu
};
```
