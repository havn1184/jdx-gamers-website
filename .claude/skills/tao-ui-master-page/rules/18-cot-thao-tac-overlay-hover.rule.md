# MPAGE-18 — Cột Thao tác dạng overlay khi hover, sticky right width=0

**Mức độ:** WARN (kiểm tra thủ công)
**Kiểm tra:** thủ công

## Mô tả
Không hiển thị cột "Thao tác" cố định chiếm chỗ trong table. Action buttons phải hiện dạng overlay khi hover row, neo bằng cột sticky phải với `width: 0`, `opacity-0 group-hover:opacity-100`, để luôn nằm sát mép phải viewport mà không chiếm diện tích cột khi không hover.

## Ví dụ đúng
```tsx
<TableCell className='sticky right-0 z-20 bg-transparent' style={{ width: 0, minWidth: 0, padding: 0, border: 'none', overflow: 'visible' }}>
  <div className='absolute right-0 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 ...'>
    <DmRowActions actions={getRowActions(item)} />
  </div>
</TableCell>
```

## Ví dụ sai
```tsx
<TableHead className='w-[140px] text-center'>Thao tác</TableHead>
{/* cột Thao tác hiển thị cố định, chiếm chỗ luôn thay vì overlay khi hover */}
```

## Ghi chú
Cần đối chiếu trực quan (screenshot/UI thực tế) để xác nhận đúng behavior overlay-on-hover, không thể quyết định chắc chắn chỉ bằng static regex.
