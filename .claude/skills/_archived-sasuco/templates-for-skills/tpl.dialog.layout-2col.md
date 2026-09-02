```tsx
// Layout 2 cột — dùng grid thay vì flex để căn chỉnh đồng đều
{/* 2 cột bằng nhau */}
<div className='grid grid-cols-2 gap-4'>
  <div className='space-y-1.5'>
    <Label>Field 1</Label>
    ...
  </div>
  <div className='space-y-1.5'>
    <Label>Field 2</Label>
    ...
  </div>
</div>

{/* 1/3 + 2/3 */}
<div className='grid grid-cols-3 gap-4'>
  <div className='space-y-1.5'>...</div>
  <div className='col-span-2 space-y-1.5'>...</div>
</div>

{/* Field chiếm full width trong grid 2 cột */}
<div className='grid grid-cols-2 gap-4'>
  <div className='space-y-1.5'>...</div>
  <div className='space-y-1.5'>...</div>
  <div className='col-span-2 space-y-1.5'>
    <Label>Ghi chú</Label>
    ...
  </div>
</div>
```
