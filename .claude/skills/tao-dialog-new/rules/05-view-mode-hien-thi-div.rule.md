# DLGNEW-05 — View mode hiển thị div/DmFieldValue, không dùng input disabled

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
Ở chế độ View, dữ liệu nên hiển thị bằng `DmFieldValue`/`DmTabFieldValue` (pattern Danh Mục) hoặc `<div>`/`<span>` (pattern Nghiệp Vụ) thay vì `<Input disabled>`.

## Ví dụ đúng
```tsx
{isReadonly ? <div className='px-3 py-2 text-gray-900'>{value}</div> : <Input value={value} onChange={...} />}
```

## Ví dụ sai
```tsx
<Input value={value} disabled={isReadonly} />
```
