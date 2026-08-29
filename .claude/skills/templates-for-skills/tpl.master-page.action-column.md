```tsx
// Cột Thao tác — thứ tự CỨNG: Xem → Sửa → Nhân bản → Xóa
// Không bỏ nút nào trừ khi có điều kiện nghiệp vụ rõ ràng
<TableCell className='text-center'>
  <div className='flex items-center justify-center gap-1'>

    {/* [1] Xem chi tiết — LUÔN CÓ */}
    <Button
      variant='ghost' size='sm'
      data-qa={`btn_xem_${item.id}`}
      title='Xem chi tiết'
      onClick={() => openDialog('view', item)}
    >
      <Eye className='h-4 w-4 icon-primary' />
    </Button>

    {/* [2] Chỉnh sửa — ẩn nếu record đã khóa/ký */}
    {!item.isLocked && (
      <Button
        variant='ghost' size='sm'
        data-qa={`btn_sua_${item.id}`}
        title='Chỉnh sửa'
        onClick={() => openDialog('edit', item)}
      >
        <Pencil className='h-4 w-4 icon-warning' />
      </Button>
    )}

    {/* [3] Nhân bản — chỉ có nếu feature hỗ trợ clone */}
    <Button
      variant='ghost' size='sm'
      data-qa={`btn_nhan_ban_${item.id}`}
      title='Nhân bản'
      onClick={() => handleClone(item.id)}
    >
      <Copy className='h-4 w-4 icon-success' />
    </Button>

    {/* [4] Xóa — ẩn nếu record đang được tham chiếu, luôn qua ConfirmDialog */}
    {!item.isUsed && (
      <Button
        variant='ghost' size='sm'
        data-qa={`btn_xoa_${item.id}`}
        title='Xóa'
        onClick={() => openConfirmDelete(item.id)}
      >
        <Trash2 className='h-4 w-4 icon-danger' />
      </Button>
    )}

  </div>
</TableCell>
```
