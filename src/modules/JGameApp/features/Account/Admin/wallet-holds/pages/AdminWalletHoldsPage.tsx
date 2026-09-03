/**
 * AdminWalletHoldsPage — Giám sát JCoin "Chờ xác nhận"/"Bị gắn cờ" từ nhiệm vụ do NPH tài trợ (chống
 * gian lận webhook — 20260903-nc_quan-tri-nha-phat-hanh-game.md mục 3.2). "Từ chối" (Reverse) là thao
 * tác nặng, không thể hoàn tác — bắt xác nhận rõ ràng bằng ô nhập chữ "TU CHOI" trước khi cho bấm.
 */
import { useState } from 'react'
import { Flag, CheckCircle2, Ban, AlertCircle, X } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { Input } from '../../../../../shared/components/ui/input'
import { Badge } from '../../../../../shared/components/ui/badge'
import { cn } from '../../../../../shared/components/ui/utils'
import { formatDateTime } from '../../../../../shared/utils/FormatUtils'
import { AdminLayout } from '../../components/AdminLayout'
import { WALLET_HOLD_ADMIN_STATUS_LABELS } from '../../types/jgame.types'
import type { WalletHoldAdmin } from '../../types/jgame.types'
import { useWalletHoldsFetchData } from '../hooks/useWalletHolds.page.fetchData'

export const PAGE_ID = 'jgame-admin-wallet-holds'
export const PAGE_FEATURES = [
  { label: 'Gắn cờ nghi ngờ (dòng)', code: 'row-flag' },
  { label: 'Xác nhận sớm (dòng)', code: 'row-confirm' },
  { label: 'Từ chối (dòng)', code: 'row-reverse' },
]

const HOLD_BADGE_CLASS: Record<string, string> = {
  confirmed: 'bg-emerald-500/20 text-emerald-300',
  pending: 'bg-amber-500/20 text-amber-300',
  flagged: 'bg-red-500/20 text-red-300',
  reversed: 'bg-slate-500/20 text-slate-300',
}

const REVERSE_CONFIRM_KEYWORD = 'TU CHOI'

export function AdminWalletHoldsPage() {
  const { items, loading, errorMessage, filters, setFilters, handleFlag, handleConfirm, handleReverse } = useWalletHoldsFetchData()
  const [reversing, setReversing] = useState<WalletHoldAdmin | null>(null)
  const [reverseKeyword, setReverseKeyword] = useState('')
  const [reverseError, setReverseError] = useState<string | null>(null)

  const submitReverse = async () => {
    if (!reversing || reverseKeyword.trim().toUpperCase() !== REVERSE_CONFIRM_KEYWORD) return
    const result = await handleReverse(reversing.id)
    if (!result.success) {
      setReverseError(result.message || 'Từ chối giao dịch thất bại.')
      return
    }
    setReversing(null)
    setReverseKeyword('')
    setReverseError(null)
  }

  return (
    <AdminLayout>
      <h1 className='mb-1 text-xl font-bold text-white'>Giao dịch chờ xác nhận</h1>
      <p className='mb-6 text-sm text-white/60'>JCoin cộng từ nhiệm vụ do NPH tài trợ, giữ tiền 7 ngày trước khi khả dụng — chống gian lận webhook</p>

      <div className='mb-4 flex flex-wrap gap-3'>
        <Input placeholder='Lọc theo mã NPH' value={filters.publisherId ?? ''} onChange={e => setFilters(p => ({ ...p, publisherId: e.target.value || undefined }))} className='min-w-[180px] flex-1' data-qa='i_loc_nph' />
        <Input placeholder='Lọc theo mã người chơi' value={filters.userId ?? ''} onChange={e => setFilters(p => ({ ...p, userId: e.target.value || undefined }))} className='min-w-[180px] flex-1' data-qa='i_loc_nguoi_choi' />
        <Input type='date' aria-label='Từ ngày' value={filters.fromDate ?? ''} onChange={e => setFilters(p => ({ ...p, fromDate: e.target.value || undefined }))} className='min-w-[160px] flex-1' data-qa='i_tu_ngay' />
        <Input type='date' aria-label='Đến ngày' value={filters.toDate ?? ''} onChange={e => setFilters(p => ({ ...p, toDate: e.target.value || undefined }))} className='min-w-[160px] flex-1' data-qa='i_den_ngay' />
      </div>

      {errorMessage && (
        <div className='mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
          <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
        </div>
      )}

      {reversing && (
        <div className='mb-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <p className='text-sm font-semibold text-red-200'>Xác nhận Từ chối giao dịch</p>
            <button type='button' className='text-red-200/70 hover:text-red-100' onClick={() => { setReversing(null); setReverseKeyword(''); setReverseError(null) }}><X className='h-4 w-4' /></button>
          </div>
          <p className='mb-3 text-sm text-red-100'>
            Sẽ trừ lại {reversing.amount.toLocaleString('vi-VN')} JCoin của người chơi và hoàn quỹ cho NPH — KHÔNG THỂ HOÀN TÁC.
            Nhập <code className='rounded bg-black/30 px-1'>{REVERSE_CONFIRM_KEYWORD}</code> để xác nhận.
          </p>
          <div className='flex gap-2'>
            <Input value={reverseKeyword} onChange={e => setReverseKeyword(e.target.value)} placeholder={REVERSE_CONFIRM_KEYWORD} className='max-w-[200px]' data-qa='i_xac_nhan_tu_choi' />
            <Button className='bg-red-600 text-white hover:bg-red-700' disabled={reverseKeyword.trim().toUpperCase() !== REVERSE_CONFIRM_KEYWORD} onClick={submitReverse} data-qa='btn_xac_nhan_tu_choi'>Xác nhận Từ chối</Button>
          </div>
          {reverseError && <p className='mt-2 text-sm text-red-300'>{reverseError}</p>}
        </div>
      )}

      {loading ? (
        <div className='py-12 text-center text-white/50'>Đang tải...</div>
      ) : items.length === 0 ? (
        <div className='py-12 text-center text-white/50'>Không có giao dịch nào</div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-white/10'>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Người chơi</th>
                <th className='px-3 py-2 text-left font-medium'>NPH</th>
                <th className='px-3 py-2 text-left font-medium'>Nội dung</th>
                <th className='px-3 py-2 text-right font-medium'>JCoin</th>
                <th className='px-3 py-2 text-center font-medium'>Trạng thái</th>
                <th className='px-3 py-2 text-left font-medium'>Ngày hoàn thành</th>
                <th className='px-3 py-2 text-left font-medium'>Tự động khả dụng</th>
                <th className='w-[140px] px-3 py-2 text-center font-medium'>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map(h => (
                <tr key={h.id} className='border-t border-white/10 text-white/80'>
                  <td className='px-3 py-2'>{h.userName || h.userId}{h.userPhone ? ` (${h.userPhone})` : ''}</td>
                  <td className='px-3 py-2'>{h.publisherName || '-'}</td>
                  <td className='px-3 py-2'>{h.reason}</td>
                  <td className='px-3 py-2 text-right font-medium text-white'>{h.amount.toLocaleString('vi-VN')}</td>
                  <td className='px-3 py-2 text-center'>
                    <Badge className={cn('border-none', HOLD_BADGE_CLASS[h.holdStatus])}>{WALLET_HOLD_ADMIN_STATUS_LABELS[h.holdStatus]}</Badge>
                  </td>
                  <td className='px-3 py-2 text-white/50'>{formatDateTime(h.createdAt)}</td>
                  <td className='px-3 py-2 text-white/50'>{h.availableAt ? formatDateTime(h.availableAt) : '-'}</td>
                  <td className='px-3 py-2'>
                    <div className='flex items-center justify-center gap-1'>
                      {h.holdStatus === 'pending' && (
                        <Button variant='ghost' size='sm' className='icon-danger border rounded-lg bg-white' title='Gắn cờ nghi ngờ' data-qa={`btn_gan_co_${h.id}`} onClick={() => void handleFlag(h.id)}><Flag className='h-4 w-4' /></Button>
                      )}
                      {(h.holdStatus === 'pending' || h.holdStatus === 'flagged') && (
                        <>
                          <Button variant='ghost' size='sm' className='border rounded-lg bg-white' title='Xác nhận sớm' data-qa={`btn_xac_nhan_som_${h.id}`} onClick={() => void handleConfirm(h.id)}><CheckCircle2 className='h-4 w-4' /></Button>
                          <Button variant='ghost' size='sm' className='icon-danger border rounded-lg bg-white' title='Từ chối' data-qa={`btn_tu_choi_${h.id}`} onClick={() => { setReversing(h); setReverseKeyword(''); setReverseError(null) }}><Ban className='h-4 w-4' /></Button>
                        </>
                      )}
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
