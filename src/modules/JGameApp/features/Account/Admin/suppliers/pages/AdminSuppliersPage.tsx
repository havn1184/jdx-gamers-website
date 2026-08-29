/**
 * AdminSuppliersPage — Quản lý NCC & cấu hình routing (SC-A3).
 */
import { useState } from 'react'
import { Plus, Pencil, Trash2, RefreshCw, X, AlertCircle } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { Input } from '../../../../../shared/components/ui/input'
import { Badge } from '../../../../../shared/components/ui/badge'
import { cn } from '../../../../../shared/components/ui/utils'
import { AdminLayout } from '../../components/AdminLayout'
import { useSuppliersFetchData } from '../hooks/useSuppliers.page.fetchData'
import { useSupplierForm } from '../hooks/useSupplier.dlg.form'
import type { SupplierAdmin, ApiProtocol, AuthMethod } from '../../types/jgame.types'

export const PAGE_ID = 'jgame-admin-suppliers'
export const PAGE_FEATURES = [
  { label: 'Làm mới', code: 'btn-lam-moi' },
  { label: 'Thêm NCC', code: 'btn-them-moi' },
  { label: 'Sửa (dòng)', code: 'row-edit' },
  { label: 'Xóa (dòng)', code: 'row-delete' },
]

export function AdminSuppliersPage() {
  const { items, loading, refreshing, keyword, setKeyword, status, setStatus, refetch, handleDelete } = useSuppliersFetchData()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SupplierAdmin | null>(null)
  const { formData, setFormData, errors, touched, submitting, serverError, serverErrorOpen, setServerErrorOpen, handleBlur, handleSubmit } =
    useSupplierForm({ initialData: editing, onSuccess: refetch, onClose: () => { setFormOpen(false); setEditing(null) } })

  return (
    <AdminLayout>
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-xl font-bold text-white'>Nhà cung cấp thẻ game</h1>
          <p className='text-sm text-white/60'>Quản lý NCC, giao thức tích hợp, thứ tự ưu tiên routing</p>
        </div>
        <div className='flex flex-shrink-0 gap-2'>
          <Button variant='ghost' className='border border-white/20 text-white hover:bg-white/10' disabled={refreshing} onClick={() => refetch(true)} data-qa='btn_lam_moi'>
            <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} /> Làm mới
          </Button>
          <Button className='jgame-btn-primary text-white' onClick={() => { setEditing(null); setFormOpen(true) }} data-qa='btn_them_moi'>
            <Plus className='h-4 w-4 mr-2' /> Thêm NCC
          </Button>
        </div>
      </div>

      <div className='mb-4 flex flex-wrap gap-3'>
        <Input placeholder='Tìm theo tên NCC...' value={keyword} onChange={e => setKeyword(e.target.value)} className='min-w-[220px] flex-1' data-qa='i_tim_kiem' />
        <select value={status} onChange={e => setStatus(e.target.value as 'all' | 'active' | 'inactive')} aria-label='Lọc theo trạng thái' className='min-w-[160px] rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none' data-qa='sel_trang_thai'>
          <option value='all'>Tất cả</option>
          <option value='active'>Đang hoạt động</option>
          <option value='inactive'>Ngừng hoạt động</option>
        </select>
      </div>

      {formOpen && (
        <div className='mb-6 rounded-xl border border-white/10 bg-white/5 p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-sm font-semibold text-white'>{editing ? 'Sửa NCC' : 'Thêm NCC'}</h2>
            <button type='button' className='text-white/50 hover:text-white' onClick={() => { setFormOpen(false); setEditing(null) }}><X className='h-4 w-4' /></button>
          </div>
          <div className='space-y-1'>
            <Input placeholder='Tên NCC' value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} onBlur={() => handleBlur('name')} className={cn(touched.name && errors.name && 'border-red-500')} data-qa='i_ten_ncc' />
            {touched.name && errors.name && <p className='text-xs text-red-400'>{errors.name}</p>}
          </div>
          <div className='mt-3 flex flex-wrap gap-3'>
            <select value={formData.apiProtocol} onChange={e => setFormData(p => ({ ...p, apiProtocol: e.target.value as ApiProtocol }))} aria-label='Giao thức API' className='min-w-[140px] flex-1 rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none' data-qa='sel_giao_thuc'>
              <option value='REST'>REST</option><option value='SOAP'>SOAP</option><option value='XML'>XML</option><option value='OTHER'>Khác</option>
            </select>
            <select value={formData.authMethod} onChange={e => setFormData(p => ({ ...p, authMethod: e.target.value as AuthMethod }))} aria-label='Cơ chế xác thực' className='min-w-[160px] flex-1 rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none' data-qa='sel_xac_thuc'>
              <option value='API_KEY'>API Key</option><option value='OAUTH2'>OAuth2</option><option value='HMAC'>HMAC Signature</option><option value='OTHER'>Khác</option>
            </select>
            <Input placeholder='Thứ tự ưu tiên' inputMode='numeric' value={String(formData.priorityDefault)} onChange={e => setFormData(p => ({ ...p, priorityDefault: Number(e.target.value.replace(/\D/g, '')) || 1 }))} className='min-w-[120px] flex-1' data-qa='i_thu_tu_uu_tien' />
            <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as 'active' | 'inactive' }))} aria-label='Trạng thái' className='min-w-[160px] flex-1 rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none' data-qa='sel_trang_thai_form'>
              <option value='active'>Đang hoạt động</option><option value='inactive'>Ngừng hoạt động</option>
            </select>
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

      {loading ? (
        <div className='py-12 text-center text-white/50'>Đang tải...</div>
      ) : items.length === 0 ? (
        <div className='py-12 text-center text-white/50'>Không có dữ liệu</div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-white/10'>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Tên NCC</th>
                <th className='px-3 py-2 text-left font-medium'>Giao thức</th>
                <th className='px-3 py-2 text-left font-medium'>Xác thực</th>
                <th className='px-3 py-2 text-center font-medium'>Ưu tiên</th>
                <th className='px-3 py-2 text-center font-medium'>Trạng thái</th>
                <th className='w-[100px] px-3 py-2 text-center font-medium'>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className='border-t border-white/10 text-white/80'>
                  <td className='px-3 py-2 font-medium text-white'>{item.name}</td>
                  <td className='px-3 py-2'>{item.apiProtocol}</td>
                  <td className='px-3 py-2'>{item.authMethod}</td>
                  <td className='px-3 py-2 text-center'>{item.priorityDefault}</td>
                  <td className='px-3 py-2 text-center'>
                    <Badge className={cn('border-none', item.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300')}>
                      {item.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                    </Badge>
                  </td>
                  <td className='px-3 py-2'>
                    <div className='flex items-center justify-center gap-1'>
                      <Button variant='ghost' size='sm' className='icon-warning border rounded-lg bg-white' title='Sửa' data-qa={`btn_sua_${item.id}`} onClick={() => { setEditing(item); setFormOpen(true) }}><Pencil className='h-4 w-4' /></Button>
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
