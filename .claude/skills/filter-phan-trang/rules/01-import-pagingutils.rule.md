# FPT-01 — Bắt buộc import PagingUtils/SimplePaging

**Mức độ:** ERROR
**Kiểm tra:** tự động

## Mô tả
Mọi trang danh sách (page file trong `pages/`) phải import `PagingUtils` hoặc `SimplePaging` từ `@/shared/utils` (hoặc `@/shared/utils/PagingUtils`, hoặc đường dẫn tương đối tới `shared/utils`). Không được tự viết component phân trang riêng.

## Ví dụ đúng
```tsx
import { PagingUtils } from '@/shared/utils';
// hoặc
import { PagingUtils } from '@/shared/utils/PagingUtils';
```

## Ví dụ sai
```tsx
// Thiếu import PagingUtils hoàn toàn trong page có bảng dữ liệu phân trang
import { Table } from '@/shared/components/ui/table';
```
