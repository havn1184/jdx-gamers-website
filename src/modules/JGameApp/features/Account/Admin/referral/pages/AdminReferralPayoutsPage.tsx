/**
 * AdminReferralPayoutsPage — Duyệt yêu cầu rút hoa hồng của đối tác (SC-A-payout).
 * 20260901-nc_doi-tac-tiep-thi-nang-cap.md mục 4 bước 19.
 */
import { useState } from 'react'
import { Check, X, Banknote, AlertCircle } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { Badge } from '../../../../../shared/components/ui/badge'
import { formatCurrency, formatDateTime } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { AdminLayout } from '../../components/AdminLayout'
import { useAdminReferralPayoutsFetchData } from '../hooks/useAdminReferralPayouts.page.fetchData'
import { REFERRAL_PAYOUT_STATUS_ADMIN_LABELS, type ReferralPayoutStatusAdmin } from '../../types/jgame.types'

export const PAGE_ID = 'jgame-admin-referral-payouts'
export const PAGE_FEATURES = [
  { label: 'Duyệt yêu cầu', code: 'btn-duyet' },
  { label: 'Từ chối yêu cầu', code: 'btn-tu-choi' },
  { label: 'Đánh dấu đã trả', code: 'btn-da-tra' },
]

const STATUS_CLASS: Record<ReferralPayoutStatusAdmin, string> = {
  pending: 'bg-amber-500/20 text-amber-300',
  approved: 'bg-sky-500/20 text-sky-300',
  paid: 'bg-emerald-500/20 text-emerald-300',
  rejected: 'bg-red-500/20 text-red-300',
}

export function AdminReferralPayoutsPage() {
  const { items, loading, status, setStatus, processingId, errorMessage, handleApprove, handleReject, handleMarkPaid } = useAdminReferralPayoutsFetchData()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const submitReject = (id: string) => {
    if (!reason.trim()) return
    void handleReject(id, reason.trim())
    setRejectingId(null)
    setReason('')
  }

  return (
    <AdminLayout>
      <div className='mb-6'>
        <h1 className='text-xl font-bold text-white'>Duyệt thanh toán hoa hồng</h1>
        <p className='text-sm text-white/60'>Duyệt/từ chối yêu cầu rút hoa hồng, đánh dấu đã chuyển khoản</p>
      </div>

      <div className='mb-4 flex flex-wrap gap-3'>
        <select
          value={status} onChange={e => setStatus(e.target.value as ReferralPayoutStatusAdmin | 'all')}
          aria-label='Lọc theo trạng thái'
          className='min-w-[180px] rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
          data-qa='sel_trang_thai'
        >
          <option value='all'>Tất cả trạng thái</option>
          {Object.entries(REFERRAL_PAYOUT_STATUS_ADMIN_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {errorMessage && (
        <div className='mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
          <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className='py-12 text-center text-white/50'>Đang tải...</div>
      ) : items.length === 0 ? (
        <div className='py-12 text-center text-white/50'>Không có yêu cầu nào</div>
      ) : (
        <div className={cn('overflow-x-auto rounded-xl border border-white/10 transition-opacity duration-150', loading && 'pointer-events-none opacity-50')}>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Đối tác</th>
                <th className='px-3 py-2 text-right font-medium'>Số tiền</th>
                <th className='px-3 py-2 text-center font-medium'>Trạng thái</th>
                <th className='px-3 py-2 text-left font-medium'>Ngày yêu cầu</th>
                <th className='w-[220px] px-3 py-2 text-center font-medium'>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className='border-t border-white/10 text-white/80'>
                  <td className='px-3 py-2 font-medium text-white'>{item.partnerName}</td>
                  <td className='px-3 py-2 text-right'>{formatCurrency(item.amount)}</td>
                  <td className='px-3 py-2 text-center'><Badge className={cn('border-none', STATUS_CLASS[item.status])}>{REFERRAL_PAYOUT_STATUS_ADMIN_LABELS[item.status]}</Badge></td>
                  <td className='px-3 py-2 text-white/50'>{formatDateTime(item.requestedAt)}</td>
                  <td className='px-3 py-2'>
                    {item.status === 'pending' && rejectingId !== item.id && (
                      <div className='flex items-center justify-center gap-1'>
                        <Button size='sm' className='icon-success border rounded-lg bg-white' disabled={processingId === item.id} onClick={() => handleApprove(item.id)} data-qa={`btn_duyet_${item.id}`}><Check className='h-4 w-4' /></Button>
                        <Button size='sm' className='icon-danger border rounded-lg bg-white' disabled={processingId === item.id} onClick={() => setRejectingId(item.id)} data-qa={`btn_tu_choi_${item.id}`}><X className='h-4 w-4' /></Button>
                      </div>
                    )}
                    {item.status === 'pending' && rejectingId === item.id && (
                      <div className='flex items-center gap-1'>
                        <input
                          autoFocus value={reason} onChange={e => setReason(e.target.value)} placeholder='Lý do từ chối'
                          className='min-w-0 flex-1 rounded-lg border border-white/20 bg-[#1a0d33] px-2 py-1 text-xs text-white focus:border-white/40 focus:outline-none'
                          data-qa={`i_ly_do_${item.id}`}
                        />
                        <Button size='sm' className='icon-danger border rounded-lg bg-white' disabled={!reason.trim()} onClick={() => submitReject(item.id)} data-qa={`btn_xac_nhan_tu_choi_${item.id}`}><Check className='h-4 w-4' /></Button>
                        <Button size='sm' variant='ghost' className='text-white/60' onClick={() => { setRejectingId(null); setReason('') }}><X className='h-4 w-4' /></Button>
                      </div>
                    )}
                    {item.status === 'approved' && (
                      <Button size='sm' className='jgame-btn-primary text-white' disabled={processingId === item.id} onClick={() => handleMarkPaid(item.id)} data-qa={`btn_da_tra_${item.id}`}>
                        <Banknote className='h-4 w-4 mr-1.5' /> Đánh dấu đã trả
                      </Button>
                    )}
                    {(item.status === 'paid' || item.status === 'rejected') && (
                      <span className='text-xs text-white/40'>{item.status === 'rejected' ? item.rejectReason : '-'}</span>
                    )}
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
