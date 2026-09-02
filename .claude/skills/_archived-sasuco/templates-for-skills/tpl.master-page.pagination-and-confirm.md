```tsx
// Pagination component — import từ @/shared/components/common
<PagingUtils
  currentPage={paging.currentPage}
  totalPages={paging.totalPages}
  totalItems={paging.totalItems}
  pageSize={paging.pageSize}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
/>
```

```tsx
// ConfirmDialog xóa — render cuối JSX, ngoài CardContent
<ConfirmDialog
  open={confirmDelete.open}
  title='Xác nhận xóa'
  description={`Bạn có chắc muốn xóa "${confirmDelete.itemName}"? Hành động này không thể hoàn tác.`}
  onConfirm={handleDeleteConfirm}
  onCancel={() => setConfirmDelete({ open: false, id: '', itemName: '' })}
/>
```
