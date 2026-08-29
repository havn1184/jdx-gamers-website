```tsx
// Footer buttons theo mode: View / Create / Edit
// Thứ tự: nút phụ (Hủy/Đóng) bên trái, nút chính bên phải
<DialogFooter>
  {mode === 'view' ? (
    <button className='btn-secondary' data-qa='btn_dong' onClick={onClose}>
      Đóng
    </button>
  ) : (
    <>
      <button className='btn-secondary' data-qa='btn_huy' onClick={onClose} disabled={saving}>
        Hủy
      </button>
      <button
        className='btn-primary'
        data-qa='btn_luu'
        onClick={handleSubmit}
        disabled={saving}
      >
        {saving
          ? <><Loader2 className='h-4 w-4 mr-2 animate-spin' />Đang lưu...</>
          : mode === 'create' ? 'Tạo mới' : 'Lưu'
        }
      </button>
    </>
  )}
</DialogFooter>
```
