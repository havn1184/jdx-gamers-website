```tsx
// Skeleton tổng thể của 1 Master Page
// Dialogs đặt NGOÀI CardContent nhưng trong Card (hoặc fragment) để tránh z-index issues
export default function TenFeaturePage() {
  const { /* destructure từ hook */ } = useTenFeature()

  return (
    <Card className='border-[#e0e0e0]'>
      <CardContent className='p-6 space-y-6'>

        {/* [1] Header — xem tpl.master-page.header.md */}
        <div className='flex items-center justify-between'>...</div>

        {/* [2] Filters — xem tpl.master-page.filters.md */}
        <div className='flex gap-4 flex-wrap'>...</div>

        {/* [3] Table — xem tpl.master-page.table.md + tpl.master-page.action-column.md */}
        <div className='overflow-x-auto'>
          <Table>...</Table>
        </div>

        {/* [4] Pagination — xem tpl.master-page.pagination-and-confirm.md */}
        <PagingUtils ... />

      </CardContent>

      {/* [5] Dialogs — luôn đặt ngoài CardContent, cuối JSX */}
      <TenFeatureDialog
        open={dialog.open}
        mode={dialog.mode}
        data={dialog.data}
        onClose={closeDialog}
        onSuccess={handleRefresh}
      />
      <ConfirmDialog ... />
    </Card>
  )
}
```
