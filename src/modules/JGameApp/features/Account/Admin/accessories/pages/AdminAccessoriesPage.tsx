/**
 * AdminAccessoriesPage — Quản lý phụ kiện Gamer: khai báo hãng sản xuất, nhóm sản phẩm,
 * chi tiết sản phẩm (giá bán, tồn kho, trạng thái) bán trên Kho phụ kiện (/jgame/phu-kien).
 */
import { useState } from 'react'
import { Plus, Pencil, Trash2, RefreshCw, X, AlertCircle } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { Input } from '../../../../../shared/components/ui/input'
import { Badge } from '../../../../../shared/components/ui/badge'
import { formatCurrency, formatNumber } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { AdminLayout } from '../../components/AdminLayout'
import { useAccessoriesFetchData } from '../hooks/useAccessories.page.fetchData'
import { useAccessoryForm } from '../hooks/useAccessory.dlg.form'
import type { AccessoryAdmin, AccessoryCategoryAdmin } from '../../types/jgame.types'

export const PAGE_ID = 'jgame-admin-accessories'
export const PAGE_FEATURES = [
  { label: 'Làm mới', code: 'btn-lam-moi' },
  { label: 'Thêm sản phẩm', code: 'btn-them-moi' },
  { label: 'Sửa (dòng)', code: 'row-edit' },
  { label: 'Xóa (dòng)', code: 'row-delete' },
]

const CATEGORY_LABEL: Record<AccessoryCategoryAdmin, string> = {
  mouse: 'Chuột', keyboard: 'Bàn phím', headset: 'Tai nghe', gpu: 'Card đồ họa', pc: 'PC Gaming', monitor: 'Màn hình', chair: 'Ghế',
}

export function AdminAccessoriesPage() {
  const { items, loading, refreshing, keyword, setKeyword, status, setStatus, category, setCategory, refetch, handleDelete } = useAccessoriesFetchData()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AccessoryAdmin | null>(null)
  const {
    formData, setFormData, errors, touched, submitting, serverError, serverErrorOpen, setServerErrorOpen, handleBlur, handleSubmit, brandSuggestions,
  } = useAccessoryForm({ initialData: editing, onSuccess: refetch, onClose: () => { setFormOpen(false); setEditing(null) } })

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (item: AccessoryAdmin) => { setEditing(item); setFormOpen(true) }

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
          <Button className='jgame-btn-primary text-white' onClick={openCreate} data-qa='btn_them_moi'>
            <Plus className='h-4 w-4 mr-2' /> Thêm sản phẩm
          </Button>
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
          {(Object.keys(CATEGORY_LABEL) as AccessoryCategoryAdmin[]).map(c => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
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

      {formOpen && (
        <div className='mb-6 rounded-xl border border-white/10 bg-white/5 p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-sm font-semibold text-white'>{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
            <button type='button' className='text-white/50 hover:text-white' onClick={() => { setFormOpen(false); setEditing(null) }}><X className='h-4 w-4' /></button>
          </div>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='space-y-1'>
              <Input placeholder='Tên sản phẩm' value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} onBlur={() => handleBlur('name')} className={cn(touched.name && errors.name && 'border-red-500')} data-qa='i_ten_san_pham' />
              {touched.name && errors.name && <p className='text-xs text-red-400'>{errors.name}</p>}
            </div>
            <select
              value={formData.category}
              onChange={e => setFormData(p => ({ ...p, category: e.target.value as AccessoryCategoryAdmin }))}
              aria-label='Chọn nhóm sản phẩm'
              className='rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
              data-qa='sel_nhom_san_pham_form'
            >
              {(Object.keys(CATEGORY_LABEL) as AccessoryCategoryAdmin[]).map(c => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
            </select>
            <div className='space-y-1'>
              <Input
                placeholder='Hãng sản xuất (VD: Logitech, Razer...)'
                value={formData.brand}
                onChange={e => setFormData(p => ({ ...p, brand: e.target.value }))}
                onBlur={() => handleBlur('brand')}
                className={cn(touched.brand && errors.brand && 'border-red-500')}
                list='dl_hang_san_xuat'
                data-qa='i_hang_san_xuat'
              />
              <datalist id='dl_hang_san_xuat'>
                {brandSuggestions.map(b => <option key={b} value={b} />)}
              </datalist>
              {touched.brand && errors.brand && <p className='text-xs text-red-400'>{errors.brand}</p>}
            </div>
            <select
              value={formData.status}
              onChange={e => setFormData(p => ({ ...p, status: e.target.value as 'active' | 'inactive' }))}
              aria-label='Chọn trạng thái'
              className='rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
              data-qa='sel_trang_thai_form'
            >
              <option value='active'>Đang bán</option>
              <option value='inactive'>Ngừng bán</option>
            </select>
            <Input placeholder='Thông số kỹ thuật (VD: 25600 DPI · 11 nút...)' value={formData.specs} onChange={e => setFormData(p => ({ ...p, specs: e.target.value }))} className='sm:col-span-2' data-qa='i_thong_so' />
            <div className='space-y-1'>
              <Input
                placeholder='Giá bán (VNĐ)' type='text' inputMode='numeric'
                value={formData.price || ''}
                onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value.replace(/\D/g, '')) || 0 }))}
                onBlur={() => handleBlur('price')}
                className={cn(touched.price && errors.price && 'border-red-500')}
                data-qa='i_gia_ban'
              />
              {touched.price && errors.price && <p className='text-xs text-red-400'>{errors.price}</p>}
            </div>
            <Input
              placeholder='Tồn kho' type='text' inputMode='numeric'
              value={formData.stockQuantity || ''}
              onChange={e => setFormData(p => ({ ...p, stockQuantity: Number(e.target.value.replace(/\D/g, '')) || 0 }))}
              data-qa='i_ton_kho'
            />
            <Input placeholder='URL ảnh sản phẩm (tuỳ chọn)' value={formData.imageUrl} onChange={e => setFormData(p => ({ ...p, imageUrl: e.target.value }))} className='sm:col-span-2' data-qa='i_anh_san_pham' />
          </div>
          {serverErrorOpen && (
            <div className='mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
              <AlertCircle className='h-4 w-4 flex-shrink-0' /> {(serverError as { message?: string } | null)?.message || 'Có lỗi xảy ra'}
              <button type='button' className='ml-auto text-red-300/70 hover:text-red-200' onClick={() => setServerErrorOpen(false)}><X className='h-3.5 w-3.5' /></button>
            </div>
          )}
          <div className='mt-4 flex gap-2'>
            <Button className='jgame-btn-primary text-white' disabled={submitting} onClick={handleSubmit} data-qa='btn_luu'>Lưu</Button>
            <Button variant='ghost' className='text-white/70 hover:bg-white/10' onClick={() => { setFormOpen(false); setEditing(null) }} data-qa='btn_huy'>Hủy</Button>
          </div>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className='py-12 text-center text-white/50'>Đang tải...</div>
      ) : items.length === 0 ? (
        <div className='py-12 text-center text-white/50'>Không có dữ liệu</div>
      ) : (
        <div className={cn('overflow-x-auto rounded-xl border border-white/10 transition-opacity duration-150', loading && 'pointer-events-none opacity-50')}>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
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
                  <td className='px-3 py-2 font-medium text-white'>{item.name}</td>
                  <td className='px-3 py-2'>{CATEGORY_LABEL[item.category]}</td>
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
                      <Button variant='ghost' size='sm' className='icon-warning border rounded-lg bg-white' title='Sửa' data-qa={`btn_sua_${item.id}`} onClick={() => openEdit(item)}><Pencil className='h-4 w-4' /></Button>
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
