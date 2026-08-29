# DLGNEW-10 — Validate onBlur, không validate onChange

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
Việc validate input nên chạy ở sự kiện `onBlur` (khi rời field), không validate ngay theo từng `onChange` — tránh báo lỗi khi người dùng còn đang gõ dở.

## Ví dụ đúng
```tsx
<Input onBlur={() => handleBlur('ten')} onChange={e => updateField('ten', e.target.value)} />
```

## Ví dụ sai
```tsx
<Input onChange={e => { updateField('ten', e.target.value); validate('ten', e.target.value); }} />
```
