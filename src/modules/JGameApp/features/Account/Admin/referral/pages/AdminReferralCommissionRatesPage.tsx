/**
 * AdminReferralCommissionRatesPage — Cấu hình tỷ lệ hoa hồng theo 2 loại (Thẻ nạp/Vé giờ chơi) + lịch sử thay đổi.
 * 20260901-nc_doi-tac-tiep-thi-nang-cap.md mục 4 bước 20.
 */
import { Pencil, Check, X, AlertCircle, Percent } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { formatPercent, formatDateTime } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { AdminLayout } from '../../components/AdminLayout'
import { useAdminReferralCommissionRates } from '../hooks/useAdminReferralCommissionRates.page'
import { REFERRAL_COMMISSION_CATEGORY_LABELS } from '../../types/jgame.types'

export const PAGE_ID = 'jgame-admin-referral-commission-rates'
export const PAGE_FEATURES = [{ label: 'Lưu tỷ lệ hoa hồng', code: 'btn-luu-ty-le' }]

export function AdminReferralCommissionRatesPage() {
  const { rates, history, loading, editingCategory, editValue, setEditValue, saving, errorMessage, startEdit, cancelEdit, handleSave } = useAdminReferralCommissionRates()

  return (
    <AdminLayout>
      <div className='mb-6'>
        <h1 className='text-xl font-bold text-white'>Cấu hình hoa hồng</h1>
        <p className='text-sm text-white/60'>Tỷ lệ hoa hồng hiện hành theo từng loại phát sinh giá trị — đổi tỷ lệ KHÔNG tính lại giao dịch cũ</p>
      </div>

      {errorMessage && (
        <div className='mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
          <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
        </div>
      )}

      {loading ? (
        <div className='py-12 text-center text-white/50'>Đang tải...</div>
      ) : (
        <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {rates.map(rate => (
            <div key={rate.category} className='rounded-xl border border-white/10 bg-white/5 p-4'>
              <div className='mb-2 flex items-center gap-2 text-white/70'>
                <Percent className='h-4 w-4' /> {REFERRAL_COMMISSION_CATEGORY_LABELS[rate.category]}
              </div>
              {editingCategory === rate.category ? (
                <div className='flex items-center gap-2'>
                  <input
                    autoFocus inputMode='numeric' value={editValue} onChange={e => setEditValue(e.target.value.replace(/\D/g, ''))}
                    className='w-24 rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-lg font-bold text-white focus:border-white/40 focus:outline-none'
                    data-qa={`i_ty_le_${rate.category}`}
                  />
                  <span className='text-white/60'>%</span>
                  <Button size='sm' className='icon-success border rounded-lg bg-white' disabled={saving} onClick={handleSave} data-qa={`btn_luu_${rate.category}`}><Check className='h-4 w-4' /></Button>
                  <Button size='sm' variant='ghost' className='text-white/60' onClick={cancelEdit}><X className='h-4 w-4' /></Button>
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <p className='text-2xl font-bold text-white'>{formatPercent(rate.ratePercent * 100, 0)}</p>
                  <Button size='sm' variant='ghost' className='icon-warning border rounded-lg bg-white' onClick={() => startEdit(rate.category, rate.ratePercent)} data-qa={`btn_sua_${rate.category}`}><Pencil className='h-4 w-4' /></Button>
                </div>
              )}
              <p className='mt-2 text-xs text-white/40'>Cập nhật gần nhất: {formatDateTime(rate.updatedAt)}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className='mb-3 text-base font-semibold text-white'>Lịch sử thay đổi</h2>
      {history.length === 0 ? (
        <div className='py-10 text-center text-white/50'>Chưa có thay đổi nào</div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-white/10'>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Loại</th>
                <th className='px-3 py-2 text-right font-medium'>Tỷ lệ cũ</th>
                <th className='px-3 py-2 text-right font-medium'>Tỷ lệ mới</th>
                <th className='px-3 py-2 text-left font-medium'>Người sửa</th>
                <th className='px-3 py-2 text-left font-medium'>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, idx) => (
                <tr key={`${h.category}-${h.changedAt}-${idx}`} className={cn('border-t border-white/10 text-white/80')}>
                  <td className='px-3 py-2'>{REFERRAL_COMMISSION_CATEGORY_LABELS[h.category]}</td>
                  <td className='px-3 py-2 text-right'>{formatPercent(h.oldRatePercent * 100, 0)}</td>
                  <td className='px-3 py-2 text-right font-medium text-white'>{formatPercent(h.newRatePercent * 100, 0)}</td>
                  <td className='px-3 py-2'>{h.changedBy}</td>
                  <td className='px-3 py-2 text-white/50'>{formatDateTime(h.changedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
