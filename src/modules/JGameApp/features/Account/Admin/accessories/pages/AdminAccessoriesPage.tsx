/**
 * AdminAccessoriesPage — Danh sách phụ kiện Gamer. Thêm/Sửa mở sub-page riêng
 * (AdminAccessoryFormPage) — không nhúng form trong danh sách.
 */
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, RefreshCw, ImageOff } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { Input } from '../../../../../shared/components/ui/input'
import { Badge } from '../../../../../shared/components/ui/badge'
import { formatCurrency, formatNumber } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { AdminLayout } from '../../components/AdminLayout'
import { useAccessoriesFetchData } from '../hooks/useAccessories.page.fetchData'
import { ACCESSORY_CATEGORY_LABEL, type AccessoryCategoryAdmin } from '../hooks/useAccessoryForm.page'

export const PAGE_ID = 'jgame-admin-accessories'
export const PAGE_FEATURES = [
  { label: 'Làm mới', code: 'btn-lam-moi' },
  { label: 'Thêm sản phẩm', code: 'btn-them-moi' },
  { label: 'Sửa (dòng)', code: 'row-edit' },
  { label: 'Xóa (dòng)', code: 'row-delete' },
]

export function AdminAccessoriesPage() {
  const { items, loading, refreshing, keyword, setKeyword, status, setStatus, category, setCategory, refetch, handleDelete } = useAccessoriesFetchData()

  return (
    <AdminLayout>
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-xl font-bold text-white'>Phụ kiện Gamer</h1>
          <p className='text-sm text-white/60'>Khai báo hãng sản xuất, nhóm sản phẩm & chi tiết sản phẩm bán trên Kho phụ kiện</p>
        </div>
        <div className='flex flex-shrink-0 gap-2'>
          <Button variant='ghost' className='border border-white/20 text-white hover:bg-white/10' disabled={refreshing} onClick={() => refetch(true)} data-qa='btn_lam_moi'>
            <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} /> Làm mới
          </Button>
          <Link to='/jgame/quan-tri/phu-kien/them'>
            <Button className='jgame-btn-primary text-white' data-qa='btn_them_moi'>
              <Plus className='h-4 w-4 mr-2' /> Thêm sản phẩm
            </Button>
          </Link>
        </div>
      </div>

      <div className='mb-4 flex flex-wrap gap-3'>
        <Input placeholder='Tìm theo tên sản phẩm, hãng...' value={keyword} onChange={e => setKeyword(e.target.value)} className='min-w-[220px] flex-1' data-qa='i_tim_kiem' />
        <select
          value={category}
          onChange={e => setCategory(e.target.value as AccessoryCategoryAdmin | 'all')}
          aria-label='Lọc theo nhóm sản phẩm'
          className='min-w-[160px] rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
          data-qa='sel_nhom_san_pham'
        >
          <option value='all'>Tất cả nhóm</option>
          {(Object.keys(ACCESSORY_CATEGORY_LABEL) as AccessoryCategoryAdmin[]).map(c => <option key={c} value={c}>{ACCESSORY_CATEGORY_LABEL[c]}</option>)}
        </select>
        <select
          value={status}
          onChange={e => setStatus(e.target.value as 'all' | 'active' | 'inactive')}
          aria-label='Lọc theo trạng thái'
          className='min-w-[160px] rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
          data-qa='sel_trang_thai'
        >
          <option value='all'>Tất cả</option>
          <option value='active'>Đang bán</option>
          <option value='inactive'>Ngừng bán</option>
        </select>
      </div>

      {loading && items.length === 0 ? (
        <div className='py-12 text-center text-white/50'>Đang tải...</div>
      ) : items.length === 0 ? (
        <div className='py-12 text-center text-white/50'>Không có dữ liệu</div>
      ) : (
        <div className={cn('overflow-x-auto rounded-xl border border-white/10 transition-opacity duration-150', loading && 'pointer-events-none opacity-50')}>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Ảnh</th>
                <th className='px-3 py-2 text-left font-medium'>Mã SP</th>
                <th className='px-3 py-2 text-left font-medium'>Tên sản phẩm</th>
                <th className='px-3 py-2 text-left font-medium'>Nhóm</th>
                <th className='px-3 py-2 text-left font-medium'>Hãng sản xuất</th>
                <th className='px-3 py-2 text-right font-medium'>Giá bán</th>
                <th className='px-3 py-2 text-right font-medium'>Tồn kho</th>
                <th className='px-3 py-2 text-center font-medium'>Trạng thái</th>
                <th className='w-[100px] px-3 py-2 text-center font-medium'>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className='border-t border-white/10 text-white/80'>
                  <td className='px-3 py-2'>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className='h-10 w-10 rounded-lg object-cover' />
                    ) : (
                      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/30'><ImageOff className='h-4 w-4' /></div>
                    )}
                  </td>
                  <td className='px-3 py-2 font-mono text-xs text-white/60'>{item.sku}</td>
                  <td className='px-3 py-2 font-medium text-white'>{item.name}</td>
                  <td className='px-3 py-2'>{ACCESSORY_CATEGORY_LABEL[item.category]}</td>
                  <td className='px-3 py-2'>{item.brand}</td>
                  <td className='px-3 py-2 text-right'>{formatCurrency(item.price)}</td>
                  <td className={cn('px-3 py-2 text-right', item.stockQuantity === 0 && 'font-semibold text-red-400')}>{formatNumber(item.stockQuantity)}</td>
                  <td className='px-3 py-2 text-center'>
                    <Badge className={cn('border-none', item.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300')}>
                      {item.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                    </Badge>
                  </td>
                  <td className='px-3 py-2'>
                    <div className='flex items-center justify-center gap-1'>
                      <Link to={`/jgame/quan-tri/phu-kien/${item.id}/sua`}>
                        <Button variant='ghost' size='sm' className='icon-warning border rounded-lg bg-white' title='Sửa' data-qa={`btn_sua_${item.id}`}><Pencil className='h-4 w-4' /></Button>
                      </Link>
                      <Button variant='ghost' size='sm' className='icon-danger border rounded-lg bg-white' title='Xóa' data-qa={`btn_xoa_${item.id}`} onClick={() => handleDelete(item.id)}><Trash2 className='h-4 w-4' /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
