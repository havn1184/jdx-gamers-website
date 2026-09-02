# DLGNEW-03 — Nút X đóng dialog (custom, không dùng mặc định Radix)

**Mức độ:** ERROR
**Kiểm tra:** tự động

## Mô tả
Dialog phải có nút đóng dạng icon `X` tự viết, có `data-qa='btn_dong_dialog'` (hoặc `btn_dong`), hoặc icon `<X>` kèm `variant='ghost'`. Không dựa vào nút đóng mặc định của Radix Dialog.

## Ví dụ đúng
```tsx
<Button variant='ghost' size='sm' data-qa='btn_dong_dialog' onClick={() => onOpenChange(false)}>
  <X className='h-4 w-4' />
</Button>
```

## Ví dụ sai
```tsx
<DialogContent>{/* không có nút X tự viết nào */}</DialogContent>
```
