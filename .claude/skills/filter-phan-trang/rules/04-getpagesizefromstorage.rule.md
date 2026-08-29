# FPT-04 — Dùng getPageSizeFromStorage() để khởi tạo pageSize

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
`itemsPerPage`/`pageSize` nên được khởi tạo bằng `getPageSizeFromStorage()` để lấy giá trị đã lưu ở `localStorage` (`app_page_size`), tránh reset về mặc định mỗi lần vào trang.

## Ví dụ đúng
```ts
import { getPageSizeFromStorage } from '@/shared/utils/PagingUtils';
const [itemsPerPage] = useState(() => getPageSizeFromStorage(10));
```

## Ví dụ sai
```ts
const [itemsPerPage] = useState(10); // luôn reset về 10, không đọc localStorage
```
