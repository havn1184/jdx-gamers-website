# DLGNEW-01 — Import DialogContent từ shared

**Mức độ:** ERROR
**Kiểm tra:** tự động

## Mô tả
Dialog phải import `DialogContent` từ `@/shared/components/ui/dialog` (hoặc đường dẫn tương đối tới `shared/components/ui/dialog`).

## Ví dụ đúng
```tsx
import { DialogContent, DialogHeader, DialogFooter } from '@/shared/components/ui/dialog';
```

## Ví dụ sai
```tsx
import { DialogContent } from 'some-other-ui-lib';
```
