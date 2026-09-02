```tsx
// Card bảng chi tiết (dòng hàng hóa/dịch vụ) — có nút Thêm dòng khi edit/create
<Card className='border-[#e0e0e0]'>
  <CardHeader className='pb-4'>
    <div className='flex items-center justify-between'>
      <CardTitle className='text-base font-semibold'>Danh sách hàng hóa</CardTitle>
      {!isView && (
        <button className='btn-secondary' data-qa='btn_them_dong' onClick={addRow}>
          <Plus className='h-4 w-4 mr-2' />
          Thêm dòng
        </button>
      )}
    </div>
  </CardHeader>
  <CardContent className='p-0'>
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow className='bg-[#f8f9fa] border-b border-[#e0e0e0]'>
            <TableHead className='w-[50px] text-center'>STT</TableHead>
            <TableHead>Hàng hóa</TableHead>
            <TableHead className='text-right w-[120px]'>Số lượng</TableHead>
            <TableHead className='text-right w-[150px]'>Đơn giá</TableHead>
            <TableHead className='text-right w-[150px]'>Thành tiền</TableHead>
            {!isView && <TableHead className='w-[50px] text-center'>Xóa</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.id} className='hover:bg-gray-50'>
              {/* ... các cell */}
            </TableRow>
          ))}
          {/* Dòng tổng cộng */}
          <TableRow className='bg-[#f8f9fa] font-medium'>
            <TableCell colSpan={4} className='text-right'>Tổng cộng:</TableCell>
            <TableCell className='text-right'>{formatCurrency(total)}</TableCell>
            {!isView && <TableCell />}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </CardContent>
</Card>
```
