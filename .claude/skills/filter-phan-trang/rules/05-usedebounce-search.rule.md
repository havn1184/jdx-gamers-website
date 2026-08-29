# FPT-05 — Debounce ô tìm kiếm bằng useDebounce(800ms)

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
Khi trang có ô tìm kiếm (`searchTerm`/`search`/`keyword`), phải dùng `useDebounce(value, 800)` từ `@/shared/hooks/useDebounce` để tránh gọi API dồn dập khi gõ. Nếu có `useDebounce` nhưng delay khác 800ms cũng bị cảnh báo.

## Ví dụ đúng
```ts
import { useDebounce } from '@/shared/hooks/useDebounce';
const debouncedSearchTerm = useDebounce(searchTerm, 800);
```

## Ví dụ sai
```ts
// Có ô search nhưng gọi API ngay theo mỗi keystroke, không debounce
useEffect(() => { fetchData(); }, [searchTerm]);
```
