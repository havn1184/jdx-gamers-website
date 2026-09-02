# MPAGE-16 — Khai báo PAGE_ID + PAGE_FEATURES (bắt buộc)

**Mức độ:** ERROR
**Kiểm tra:** tự động (chỉ áp dụng cho file nằm trong thư mục `pages/`)

## Mô tả
Mọi Master Page phải `export const PAGE_ID = '...'` khớp với `navItem.id` trong NavMenu, và `export const PAGE_FEATURES = [...]` liệt kê đầy đủ các nút/thao tác thực tế (không được để rỗng). Đây là điều kiện bắt buộc để sơ đồ dự án và export menu permission hoạt động.

## Ví dụ đúng
```tsx
export const PAGE_ID = 'khach-hang-list';
export const PAGE_FEATURES = [
  { label: 'Làm mới', code: 'btn-refresh' },
  { label: 'Tạo mới', code: 'btn-create' },
];
```

## Ví dụ sai
```tsx
export function KhachHangPage() { ... } // thiếu PAGE_ID và PAGE_FEATURES
```
