# DLGNEW-02 — maxWidth hoặc max-w-[X] bắt buộc

**Mức độ:** ERROR
**Kiểm tra:** tự động

## Mô tả
Dialog phải kiểm soát chiều rộng qua prop `maxWidth` hoặc className `max-w-[Xpx]`/`max-w-[Xvw]`/`max-h-[Xvh]`.

## Ví dụ đúng
```tsx
<DialogContent maxWidth='600px' className='w-[600px] max-h-[90vh] overflow-y-auto'>
```

## Ví dụ sai
```tsx
<DialogContent className='overflow-y-auto'> {/* không kiểm soát chiều rộng */}
```
