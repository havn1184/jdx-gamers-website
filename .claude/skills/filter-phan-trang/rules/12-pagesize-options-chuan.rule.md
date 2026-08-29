# FPT-12 — Page size options chuẩn [10, 20, 50, 100]

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
Nếu khai báo `pageSizeOptions`, giá trị chuẩn của dự án là `[10, 20, 50, 100]` (default `10`). Không tự ý đổi bộ tùy chọn khác trừ khi có yêu cầu nghiệp vụ riêng.

## Ví dụ đúng
```tsx
<PagingUtils pageSizeOptions={[10, 20, 50, 100]} />
```

## Ví dụ sai
```tsx
<PagingUtils pageSizeOptions={[5, 15, 30]} />
```
