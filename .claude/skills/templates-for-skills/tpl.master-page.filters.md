```tsx
// Khu vực filter: ô tìm kiếm + DatePicker (nếu cần) + dropdown trạng thái (nếu cần)
// Quy tắc: flex gap-4 flex-wrap, ô tìm kiếm luôn đứng đầu tiên
<div className='flex gap-4 flex-wrap'>
  {/* Ô tìm kiếm — BẮT BUỘC */}
  <div className='flex-1 min-w-[300px] relative'>
    <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
    <input
      type='text'
      data-qa='i_tim_kiem'
      className='invoice-input pl-9 w-full'
      placeholder='Tìm kiếm...'
      value={filters.search}
      onChange={e => handleFilterChange('search', e.target.value)}
    />
  </div>

  {/* Filter ngày — nếu cần */}
  <DatePicker
    value={filters.fromDate}
    onChange={val => handleFilterChange('fromDate', val)}
    placeholder='Từ ngày'
    className='w-[150px]'
    dataQa='dt_tu_ngay'
  />
  <DatePicker
    value={filters.toDate}
    onChange={val => handleFilterChange('toDate', val)}
    placeholder='Đến ngày'
    className='w-[150px]'
    dataQa='dt_den_ngay'
  />

  {/* Dropdown trạng thái — nếu cần */}
  <select
    data-qa='sel_trang_thai'
    className='invoice-input w-[160px]'
    value={filters.status}
    onChange={e => handleFilterChange('status', e.target.value)}
  >
    <option value=''>Tất cả trạng thái</option>
    <option value='1'>Hoạt động</option>
    <option value='0'>Ngừng hoạt động</option>
  </select>
</div>
```
