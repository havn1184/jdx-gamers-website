```tsx
// Card thông tin chuẩn — layout grid theo từng ROW, 3 mode (view/edit/create)
// ✔ CardContent dùng space-y-3 (KHÔNG dùng grid-cols-2 trực tiếp trong CardContent)
// ✔ Mỗi hàng: div.grid.grid-cols-N.gap-3.items-end (N thường = 5 hoặc 6)
// ✔ Nút thêm nhanh FK nằm trong flex justify-between cùng hàng với Label
// ✔ Inline error dùng AlertCircle, không dùng <p> trần
// ✔ Field chỉ đọc / auto-generated: h-9 flex items-center px-3 border-slate-100 bg-slate-50
// ✔ Field số tiền read-only: thêm justify-end font-semibold

<Card className='border-[#e0e0e0]'>
  <CardHeader className='pb-4'>
    <CardTitle className='text-base font-semibold'>Thông tin chứng từ</CardTitle>
  </CardHeader>
  <CardContent className='space-y-3'>

    {/* Row 1: 5 cột — [FK 1] [FK 2] [Ngày] [Mã số (auto)] [Số tiền (read-only)] */}
    <div className='grid grid-cols-5 gap-3 items-end'>

      {/* FK có nút thêm nhanh */}
      <div className='space-y-1.5'>
        <div className='flex items-center justify-between'>
          <Label>Loại phiếu <span className='text-red-500'>*</span></Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type='button' variant='ghost' size='sm'
                data-qa='btn_tao_nhanh_loai'
                className='h-6 w-6 rounded-full p-0 text-[#1565C0] bg-blue-50 hover:bg-[#1565C0] hover:text-white'
                onClick={onTaoNhanhLoai}
              >
                <Plus className='h-3.5 w-3.5' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tạo mới loại phiếu</TooltipContent>
          </Tooltip>
        </div>
        <SearchCombobox
          dataQa='sel_loai'
          value={form.loaiId}
          onChange={(v, l) => handleChange('loaiId', v)}
          placeholder='Chọn loại...'
          loadOptions={loadLoaiOptions}
          className={cn(errors.loaiId && touched.loaiId && 'border-destructive')}
        />
        {touched.loaiId && errors.loaiId && (
          <p className='flex items-center gap-1 text-xs text-destructive'>
            <AlertCircle className='h-3 w-3' />{errors.loaiId}
          </p>
        )}
      </div>

      {/* DatePicker */}
      <div className='space-y-1.5'>
        <Label>Ngày chứng từ <span className='text-red-500'>*</span></Label>
        <DatePicker
          dataQa='dt_ngay_ct'
          value={form.ngayChungTu}
          onChange={(v) => handleChange('ngayChungTu', v)}
          className={cn('h-9 w-full', errors.ngayChungTu && touched.ngayChungTu && 'border-destructive')}
          placeholder='Chọn ngày'
        />
        {touched.ngayChungTu && errors.ngayChungTu && (
          <p className='flex items-center gap-1 text-xs text-destructive'>
            <AlertCircle className='h-3 w-3' />{errors.ngayChungTu}
          </p>
        )}
      </div>

      {/* Mã số auto-code (input editable, pre-filled từ useAutoCodePreview) */}
      <div className='space-y-1.5'>
        <Label>Số phiếu</Label>
        <input
          type='text' data-qa='i_so_phieu'
          className='invoice-input h-9 w-full'
          value={form.soPhieu}
          onChange={(e) => handleChange('soPhieu', e.target.value)}
          placeholder='Số phiếu...'
        />
      </div>

      {/* Field chỉ đọc (auto-generated / computed) */}
      <div className='space-y-1.5'>
        <Label>Mã phân loại</Label>
        <div className='h-9 flex items-center px-3 text-sm text-gray-900 rounded-md border border-slate-100 bg-slate-50'>
          {value || '—'}
        </div>
      </div>

      {/* Số tiền read-only + validate */}
      <div className='space-y-1.5'>
        <Label>Tổng tiền</Label>
        <div className={cn(
          'h-9 flex items-center justify-end px-3 text-sm font-semibold rounded-md border',
          errors.soTien && touched.soTien
            ? 'border-destructive text-destructive'
            : 'border-slate-100 bg-slate-50 text-gray-900'
        )}>
          {formatCurrency(total)}
        </div>
        {touched.soTien && errors.soTien && (
          <p className='flex items-center gap-1 text-xs text-destructive'>
            <AlertCircle className='h-3 w-3' />{errors.soTien}
          </p>
        )}
      </div>
    </div>

    {/* Row 2: field rộng dùng col-span — [Lý do (×3)] [Ghi chú (×2)] */}
    <div className='grid grid-cols-5 gap-3 items-end'>
      <div className='col-span-3 space-y-1.5'>
        <Label>Lý do <span className='text-red-500'>*</span></Label>
        <input
          type='text' data-qa='i_ly_do'
          className={cn('invoice-input h-9 w-full', errors.lyDo && touched.lyDo && 'border-destructive')}
          value={form.lyDo}
          onChange={(e) => handleChange('lyDo', e.target.value)}
          onBlur={() => handleBlur('lyDo')}
          placeholder='Nhập lý do...'
        />
        {touched.lyDo && errors.lyDo && (
          <p className='flex items-center gap-1 text-xs text-destructive'>
            <AlertCircle className='h-3 w-3' />{errors.lyDo}
          </p>
        )}
      </div>
      <div className='col-span-2 space-y-1.5'>
        <Label>Ghi chú</Label>
        <input
          type='text' data-qa='i_ghi_chu'
          className='invoice-input h-9 w-full'
          value={form.ghiChu}
          onChange={(e) => handleChange('ghiChu', e.target.value)}
          placeholder='Ghi chú nội bộ...'
        />
      </div>
    </div>

  </CardContent>
</Card>
```

> ⚠️ **KHÔNG làm:**
> ```tsx
> // SAI — grid-cols-2 trực tiếp trong CardContent
> <CardContent className='grid grid-cols-2 gap-4'>
>   <div>field 1</div>
>   <div>field 2</div>
> </CardContent>
>
> // SAI — label dùng <label> HTML thường thay vì <Label> component
> <label className='block text-sm font-medium text-gray-700'>Tên</label>
>
> // SAI — inline error không có AlertCircle
> <p className='text-xs text-destructive'>{errors.field}</p>
>
> // SAI — field chỉ đọc dùng px-3 py-2 (không có h-9, không align)
> <div className='px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded bg-gray-50'>{value}</div>
> ```
