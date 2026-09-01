/**
 * AdminReferralPartnersPage — Quản trị TOÀN BỘ đối tác Referral (SC-A5).
 * Khác với dashboard 1 đối tác ở `features/referrer` (đó là góc nhìn của chính đối tác đang đăng nhập).
 */
import { useState } from 'react'
import { Plus, Pencil, Trash2, RefreshCw, X, AlertCircle, AlertTriangle } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { Input } from '../../../../../shared/components/ui/input'
import { Badge } from '../../../../../shared/components/ui/badge'
import { formatPercent, formatCurrency, formatDateTime } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { AdminLayout } from '../../components/AdminLayout'
import { useReferralPartnersFetchData } from '../hooks/useReferralPartners.page.fetchData'
import { useReferralPartnerForm } from '../hooks/useReferralPartner.dlg.form'
import { useAdminReferralTransactionsFetchData } from '../hooks/useAdminReferralTransactions.page.fetchData'
import {
  REFERRAL_COMMISSION_CATEGORY_LABELS, type ReferralPartnerAdmin,
  type ReferralCommissionCategory, type ReferralReconcileStatusAdmin,
} from '../../types/jgame.types'

export const PAGE_ID = 'jgame-admin-referral'
export const PAGE_FEATURES = [
  { label: 'Làm mới', code: 'btn-lam-moi' },
  { label: 'Thêm đối tác', code: 'btn-them-moi' },
  { label: 'Sửa (dòng)', code: 'row-edit' },
  { label: 'Xóa (dòng)', code: 'row-delete' },
  { label: 'Lọc giao dịch', code: 'btn-loc-giao-dich' },
]

const RECONCILE_STATUS_LABELS: Record<ReferralReconcileStatusAdmin, string> = {
  pending: 'Chờ đối soát', confirmed: 'Đã xác nhận', reversed: 'Đã đảo',
}

/** Ngưỡng cảnh báo gian lận (tỷ lệ hoàn tiền/giao dịch cao bất thường — mục 12) */
const FRAUD_THRESHOLD_PERCENT = 20

export function AdminReferralPartnersPage() {
  const { items, loading, refreshing, keyword, setKeyword, status, setStatus, refetch, handleDelete } = useReferralPartnersFetchData()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ReferralPartnerAdmin | null>(null)
  const [tab, setTab] = useState<'partners' | 'transactions'>('partners')
  const { formData, setFormData, errors, touched, submitting, serverError, serverErrorOpen, setServerErrorOpen, handleBlur, handleSubmit } =
    useReferralPartnerForm({ initialData: editing, onSuccess: refetch, onClose: () => { setFormOpen(false); setEditing(null) } })
  const tx = useAdminReferralTransactionsFetchData()

  return (
    <AdminLayout>
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-xl font-bold text-white'>Đối tác Referral</h1>
          <p className='text-sm text-white/60'>Quản lý mã giới thiệu, % hoa hồng, cảnh báo gian lận</p>
        </div>
        <div className='flex flex-shrink-0 gap-2'>
          {tab === 'partners' && (
            <>
              <Button variant='ghost' className='border border-white/20 text-white hover:bg-white/10' disabled={refreshing} onClick={() => refetch(true)} data-qa='btn_lam_moi'>
                <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} /> Làm mới
              </Button>
              <Button className='jgame-btn-primary text-white' onClick={() => { setEditing(null); setFormOpen(true) }} data-qa='btn_them_moi'>
                <Plus className='h-4 w-4 mr-2' /> Thêm đối tác
              </Button>
            </>
          )}
        </div>
      </div>

      <div className='mb-4 flex gap-1 border-b border-white/10'>
        <button
          type='button' onClick={() => setTab('partners')}
          className={cn('px-3 py-2 text-sm font-medium', tab === 'partners' ? 'border-b-2 border-purple-400 text-white' : 'text-white/50 hover:text-white')}
          data-qa='tab_doi_tac'
        >
          Đối tác
        </button>
        <button
          type='button' onClick={() => setTab('transactions')}
          className={cn('px-3 py-2 text-sm font-medium', tab === 'transactions' ? 'border-b-2 border-purple-400 text-white' : 'text-white/50 hover:text-white')}
          data-qa='tab_giao_dich'
        >
          Giao dịch
        </button>
      </div>

      {tab === 'transactions' && (
        <>
          <div className='mb-4 flex flex-wrap gap-3'>
            <Input type='date' aria-label='Từ ngày' value={tx.from} onChange={e => tx.setFrom(e.target.value)} className='min-w-[150px]' data-qa='dt_tu_ngay' />
            <Input type='date' aria-label='Đến ngày' value={tx.to} onChange={e => tx.setTo(e.target.value)} className='min-w-[150px]' data-qa='dt_den_ngay' />
            <Input placeholder='Mã đối tác' value={tx.partnerId} onChange={e => tx.setPartnerId(e.target.value)} className='min-w-[160px]' data-qa='i_doi_tac' />
            <select
              value={tx.category} onChange={e => tx.setCategory(e.target.value as ReferralCommissionCategory | 'all')}
              aria-label='Lọc theo loại'
              className='min-w-[150px] rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
              data-qa='sel_loai'
            >
              <option value='all'>Tất cả loại</option>
              {Object.entries(REFERRAL_COMMISSION_CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select
              value={tx.status} onChange={e => tx.setStatus(e.target.value as ReferralReconcileStatusAdmin | 'all')}
              aria-label='Lọc theo trạng thái'
              className='min-w-[160px] rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
              data-qa='sel_trang_thai_giao_dich'
            >
              <option value='all'>Tất cả trạng thái</option>
              {Object.entries(RECONCILE_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          {tx.loading && tx.items.length === 0 ? (
            <div className='py-12 text-center text-white/50'>Đang tải...</div>
          ) : tx.items.length === 0 ? (
            <div className='py-12 text-center text-white/50'>Không có giao dịch nào</div>
          ) : (
            <div className={cn('overflow-x-auto rounded-xl border border-white/10 transition-opacity duration-150', tx.loading && 'pointer-events-none opacity-50')}>
              <table className='w-full text-sm'>
                <thead className='bg-white/5 text-white/60'>
                  <tr>
                    <th className='px-3 py-2 text-left font-medium'>Mã đơn</th>
                    <th className='px-3 py-2 text-left font-medium'>Đối tác</th>
                    <th className='px-3 py-2 text-left font-medium'>Loại</th>
                    <th className='px-3 py-2 text-right font-medium'>Giá trị</th>
                    <th className='px-3 py-2 text-right font-medium'>Hoa hồng</th>
                    <th className='px-3 py-2 text-center font-medium'>Trạng thái</th>
                    <th className='px-3 py-2 text-left font-medium'>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {tx.items.map(item => (
                    <tr key={item.id} className='border-t border-white/10 text-white/80'>
                      <td className='px-3 py-2'>{item.orderId}</td>
                      <td className='px-3 py-2 font-medium text-white'>{item.partnerName}</td>
                      <td className='px-3 py-2'>{REFERRAL_COMMISSION_CATEGORY_LABELS[item.category]}</td>
                      <td className='px-3 py-2 text-right'>{formatCurrency(item.amount)}</td>
                      <td className='px-3 py-2 text-right'>{formatCurrency(item.commissionAmount)}</td>
                      <td className='px-3 py-2 text-center'>{RECONCILE_STATUS_LABELS[item.status]}</td>
                      <td className='px-3 py-2 text-white/50'>{formatDateTime(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'partners' && (
      <>
      <div className='mb-4 flex flex-wrap gap-3'>
        <Input placeholder='Tìm theo tên, mã giới thiệu...' value={keyword} onChange={e => setKeyword(e.target.value)} className='min-w-[220px] flex-1' data-qa='i_tim_kiem' />
        <select value={status} onChange={e => setStatus(e.target.value as 'all' | 'active' | 'inactive')} aria-label='Lọc theo trạng thái' className='min-w-[160px] rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none' data-qa='sel_trang_thai'>
          <option value='all'>Tất cả</option>
          <option value='active'>Đang hoạt động</option>
          <option value='inactive'>Ngừng hoạt động</option>
        </select>
      </div>

      {formOpen && (
        <div className='mb-6 rounded-xl border border-white/10 bg-white/5 p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-sm font-semibold text-white'>{editing ? 'Sửa đối tác' : 'Thêm đối tác'}</h2>
            <button type='button' className='text-white/50 hover:text-white' onClick={() => { setFormOpen(false); setEditing(null) }}><X className='h-4 w-4' /></button>
          </div>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='space-y-1'>
              <Input placeholder='Mã giới thiệu' value={formData.referralCode} disabled={!!formData.id} onChange={e => setFormData(p => ({ ...p, referralCode: e.target.value.toUpperCase() }))} onBlur={() => handleBlur('referralCode')} className={cn(touched.referralCode && errors.referralCode && 'border-red-500')} data-qa='i_ma_gioi_thieu' />
              {touched.referralCode && errors.referralCode && <p className='text-xs text-red-400'>{errors.referralCode}</p>}
            </div>
            <div className='space-y-1'>
              <Input placeholder='Tên đối tác' value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} onBlur={() => handleBlur('name')} className={cn(touched.name && errors.name && 'border-red-500')} data-qa='i_ten_doi_tac' />
              {touched.name && errors.name && <p className='text-xs text-red-400'>{errors.name}</p>}
            </div>
            <Input placeholder='% Hoa hồng mặc định' inputMode='numeric' value={String(Math.round(formData.commissionRateDefault * 100))} onChange={e => setFormData(p => ({ ...p, commissionRateDefault: (Number(e.target.value.replace(/\D/g, '')) || 0) / 100 }))} data-qa='i_hoa_hong' />
            <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as 'active' | 'inactive' }))} aria-label='Trạng thái' className='rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none' data-qa='sel_trang_thai_form'>
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

      {loading && items.length === 0 ? (
        <div className='py-12 text-center text-white/50'>Đang tải...</div>
      ) : items.length === 0 ? (
        <div className='py-12 text-center text-white/50'>Không có dữ liệu</div>
      ) : (
        <div className={cn('overflow-x-auto rounded-xl border border-white/10 transition-opacity duration-150', loading && 'pointer-events-none opacity-50')}>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Mã giới thiệu</th>
                <th className='px-3 py-2 text-left font-medium'>Tên đối tác</th>
                <th className='px-3 py-2 text-right font-medium'>% Hoa hồng</th>
                <th className='px-3 py-2 text-right font-medium'>Tổng đơn</th>
                <th className='px-3 py-2 text-right font-medium'>Tỷ lệ hoàn tiền</th>
                <th className='px-3 py-2 text-center font-medium'>Trạng thái</th>
                <th className='w-[100px] px-3 py-2 text-center font-medium'>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className='border-t border-white/10 text-white/80'>
                  <td className='px-3 py-2 font-medium text-white'>{item.referralCode}</td>
                  <td className='px-3 py-2'>{item.name}</td>
                  <td className='px-3 py-2 text-right'>{formatPercent(item.commissionRateDefault * 100)}</td>
                  <td className='px-3 py-2 text-right'>{item.totalOrders}</td>
                  <td className='px-3 py-2 text-right'>
                    <span className={cn('inline-flex items-center gap-1', item.refundRatePercent >= FRAUD_THRESHOLD_PERCENT ? 'font-medium text-red-400' : '')}>
                      {item.refundRatePercent >= FRAUD_THRESHOLD_PERCENT && <AlertTriangle className='h-3.5 w-3.5' />}
                      {formatPercent(item.refundRatePercent)}
                    </span>
                  </td>
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
      </>
      )}
    </AdminLayout>
  )
}
