# MPAGE-15 — PagingUtils có pageSizeOptions chuẩn

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
`<PagingUtils>` nên khai báo `pageSizeOptions={[10, 20, 50, 100]}` theo chuẩn dự án.

## Ví dụ đúng
```tsx
<PagingUtils pageSizeOptions={[10, 20, 50, 100]} />
```

## Ví dụ sai
```tsx
<PagingUtils /> {/* không khai báo pageSizeOptions, hoặc dùng bộ khác chuẩn */}
```
