# DLGNEW-04 — Có logic 3 mode (View/Create/Edit) với isReadonly

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
Dialog nên hỗ trợ 3 mode View/Create/Edit thông qua cờ `isReadonly`/`isReadOnly`/`isView`/`viewOnly`, hoặc so sánh `mode === 'view' | 'create' | 'edit'`.

## Ví dụ đúng
```tsx
const isReadonly = mode === 'view';
```

## Ví dụ sai
```tsx
// Dialog chỉ có 1 chế độ duy nhất, không phân biệt View/Create/Edit dù nghiệp vụ cần cả 3
```
