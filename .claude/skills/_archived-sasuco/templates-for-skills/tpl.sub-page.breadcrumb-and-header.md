```tsx
// Breadcrumb điều hướng + Page Header với nút Back và action buttons theo mode
import { ArrowLeft, ChevronRight, Pencil, Loader2 } from 'lucide-react'

{/* Breadcrumb */}
<nav className='flex items-center gap-1 text-sm text-gray-500'>
  <button
    className='hover:text-gray-900 transition-colors'
    onClick={() => navigate(-1)}
  >
    Danh sách Tên Feature
  </button>
  <ChevronRight className='h-4 w-4' />
  <span className='text-gray-900 font-medium'>
    {isCreate ? 'Tạo mới' : isEdit ? 'Chỉnh sửa' : 'Chi tiết'}
  </span>
</nav>

{/* Page Header */}
<div className='flex items-center justify-between'>
  <div className='flex items-center gap-3'>
    <button
      className='btn-secondary p-2'
      data-qa='btn_quay_lai'
      title='Quay lại'
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className='h-4 w-4' />
    </button>
    <div>
      <h1 className='text-xl font-semibold text-gray-900'>
        {isCreate ? 'Tạo mới' : isEdit ? 'Chỉnh sửa' : 'Chi tiết'} Tên Feature
      </h1>
      {!isCreate && (
        <p className='text-sm text-gray-500 mt-0.5'>Mã: {item?.code}</p>
      )}
    </div>
  </div>

  <div className='flex gap-2'>
    {/* View mode: chỉ có nút Sửa */}
    {isView && (
      <button className='btn-primary' data-qa='btn_chinh_sua' onClick={handleEdit}>
        <Pencil className='h-4 w-4 mr-2' />
        Chỉnh sửa
      </button>
    )}
    {/* Edit/Create mode: Hủy + Lưu */}
    {(isEdit || isCreate) && (
      <>
        <button className='btn-secondary' data-qa='btn_huy' onClick={handleCancel} disabled={saving}>
          Hủy
        </button>
        <button className='btn-primary' data-qa='btn_luu' onClick={handleSubmit} disabled={saving}>
          {saving
            ? <><Loader2 className='h-4 w-4 mr-2 animate-spin' />Đang lưu...</>
            : isCreate ? 'Tạo mới' : 'Lưu thay đổi'
          }
        </button>
      </>
    )}
  </div>
</div>
```
