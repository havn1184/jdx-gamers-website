```tsx
// Bảng dữ liệu: header bg-[#f8f9fa], loading state, empty state, data rows
// Thay n=5 bằng số cột thực tế của trang
<div className='overflow-x-auto'>
  <Table>
    <TableHeader>
      <TableRow className='bg-[#f8f9fa] border-b border-[#e0e0e0]'>
        <TableHead className='w-[50px] text-center'>STT</TableHead>
        <TableHead>Tên</TableHead>
        <TableHead>Mã</TableHead>
        <TableHead className='text-right'>Số tiền</TableHead>
        <TableHead className='text-center w-[140px]'>Thao tác</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {loading ? (
        <TableRow>
          <TableCell colSpan={5} className='text-center py-12'>
            <PageLoader />
          </TableCell>
        </TableRow>
      ) : items.length === 0 ? (
        <TableRow>
          <TableCell colSpan={5} className='text-center py-12 text-gray-500'>
            Không có dữ liệu
          </TableCell>
        </TableRow>
      ) : (
        items.map((item, index) => (
          <TableRow key={item.id} className='hover:bg-gray-50'>
            <TableCell className='text-center'>{startIndex + index + 1}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.code}</TableCell>
            <TableCell className='text-right'>{formatCurrency(item.amount)}</TableCell>
            <TableCell className='text-center'>
              {/* → xem tpl.master-page.action-column.md */}
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
</div>
```
