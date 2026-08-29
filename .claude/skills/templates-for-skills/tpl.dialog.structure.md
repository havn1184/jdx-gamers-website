```tsx
// Cấu trúc đầy đủ 1 Dialog: DialogContent + nút X + Header + Body + Footer
// Lưu ý: maxWidth prop BẮT BUỘC — xem bảng kích thước trong SKILL.md
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent maxWidth='600px' className='w-[600px] max-h-[90vh] overflow-y-auto'>

    {/* Nút X custom — BẮT BUỘC, không dùng nút X mặc định của Radix */}
    <button
      className='absolute right-4 top-4'
      variant='ghost'
      onClick={onClose}
      data-qa='btn_dong_dialog'
      aria-label='Đóng'
    >
      <X className='h-4 w-4' />
    </button>

    <DialogHeader>
      <DialogTitle>
        {mode === 'view' ? 'Xem chi tiết' : mode === 'edit' ? 'Chỉnh sửa' : 'Thêm mới'} Tên Feature
      </DialogTitle>
    </DialogHeader>

    <div className='space-y-4 py-4'>
      {/* Các fields — xem tpl.dialog.input-field.md */}
    </div>

    {/* Footer — xem tpl.dialog.footer-buttons.md */}
    <DialogFooter>...</DialogFooter>

  </DialogContent>
</Dialog>
```
