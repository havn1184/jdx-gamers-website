# MPAGE-03 — Nút Làm mới với RefreshCw + animate-spin

**Mức độ:** WARN
**Kiểm tra:** tự động

## Mô tả
Master Page nên có nút "Làm mới" dùng icon `RefreshCw`, và icon phải quay (`animate-spin`) khi đang loading.

## Ví dụ đúng
```tsx
<RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
```

## Ví dụ sai
```tsx
<RefreshCw className='h-4 w-4' /> {/* có icon nhưng thiếu animate-spin khi loading */}
```
