# MPAGE-05 — Table bọc trong div overflow-x-auto

**Mức độ:** ERROR
**Kiểm tra:** tự động

## Mô tả
`<Table>` phải được bọc trong `<div className='overflow-x-auto'>` để bảng cuộn ngang được trên màn hình nhỏ, không vỡ layout.

## Ví dụ đúng
```tsx
<div className='overflow-x-auto'>
  <Table>...</Table>
</div>
```

## Ví dụ sai
```tsx
<Table>...</Table> {/* không có div overflow-x-auto bao ngoài */}
```
