# DLG-01 — Import DialogContent từ shared

**Mức độ:** ERROR

Dialog phải import `DialogContent` từ `@/shared/components/ui/dialog` (hoặc đường dẫn tương đối tới cùng module), không tự tạo/copy component dialog riêng.

✅ Đúng:
```tsx
import { DialogContent } from '@/shared/components/ui/dialog';
```
❌ Sai: tự viết lại DialogContent hoặc import từ nơi khác.
