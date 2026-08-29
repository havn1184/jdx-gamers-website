# FPT-02 — Cấm dùng pagination từ thư viện ngoài

**Mức độ:** ERROR
**Kiểm tra:** tự động

## Mô tả
Không được import/sử dụng component pagination từ các thư viện ngoài (MUI, Ant Design, react-bootstrap...). Toàn bộ phân trang phải dùng `PagingUtils` của dự án.

## Ví dụ đúng
```tsx
import { PagingUtils } from '@/shared/utils';
```

## Ví dụ sai
```tsx
import { Pagination } from '@mui/material';
import { Pagination } from 'antd';
```
