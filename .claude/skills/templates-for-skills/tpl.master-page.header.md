```tsx
// Tiêu đề trang + nút Làm mới (bắt buộc) + nút Thêm mới (nếu feature cho phép tạo)
<div className='flex items-center justify-between'>
  <h1 className='text-xl font-semibold text-gray-900'>Tên Trang</h1>
  <div className='flex gap-2'>
    <button
      className='btn-secondary'
      data-qa='btn_lam_moi'
      onClick={handleRefresh}
      disabled={refreshing}
    >
      <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
      Làm mới
    </button>
    <button
      className='btn-primary'
      data-qa='btn_them_moi'
      onClick={() => openDialog('create')}
    >
      <Plus className='h-4 w-4 mr-2' />
      Thêm mới
    </button>
  </div>
</div>
```
