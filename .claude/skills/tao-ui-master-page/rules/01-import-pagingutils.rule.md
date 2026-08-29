# MPAGE-01 — Import PagingUtils từ @/shared/utils

**Mức độ:** ERROR
**Kiểm tra:** tự động

## Mô tả
Master Page phải import `PagingUtils` từ `@/shared/utils` (hoặc đường dẫn tương đối tới `shared/utils`).

## Ví dụ đúng
```tsx
import { PagingUtils } from '@/shared/utils';
```

## Ví dụ sai
```tsx
// Trang danh sách có bảng + phân trang nhưng không import PagingUtils
```
