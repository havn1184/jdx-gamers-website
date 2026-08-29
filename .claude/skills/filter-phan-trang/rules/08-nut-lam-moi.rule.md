# FPT-08 — Nên có nút Làm mới (Refresh)

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
Trang danh sách nên có nút "Làm mới" với icon `RefreshCw` để người dùng chủ động tải lại dữ liệu.

## Ví dụ đúng
```tsx
<Button variant='outline' onClick={onRefresh} disabled={refreshing}>
  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
  {refreshing ? 'Đang tải...' : 'Làm mới'}
</Button>
```

## Ví dụ sai
```tsx
// Không có bất kỳ cơ chế refresh thủ công nào, chỉ tự fetch trong useEffect
```
