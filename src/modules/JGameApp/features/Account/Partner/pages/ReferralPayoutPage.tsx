/**
 * ReferralPayoutPage — Yêu cầu rút hoa hồng + lịch sử yêu cầu.
 * 20260901-nc_doi-tac-tiep-thi-nang-cap.md mục 4 bước 15.
 */
import { Loader2, Wallet, AlertCircle, Inbox } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { Input } from '../../../../shared/components/ui/input'
import { Badge } from '../../../../shared/components/ui/badge'
import { formatCurrency, formatDateTime } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { PartnerLayout } from '../components/PartnerLayout'
import { useReferralPayout } from '../hooks/useReferralPayout.page'
import { REFERRAL_PAYOUT_STATUS_LABELS } from '../types/referrer.types'

export const PAGE_ID = 'jgame-referral-payout'
export const PAGE_FEATURES = [{ label: 'Yêu cầu rút hoa hồng', code: 'btn-yeu-cau-rut' }]

const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-300',
  approved: 'bg-sky-500/20 text-sky-300',
  paid: 'bg-emerald-500/20 text-emerald-300',
  rejected: 'bg-red-500/20 text-red-300',
}

export function ReferralPayoutPage() {
  const { summary, payouts, loading, amount, setAmount, availableToWithdraw, isValid, submitting, errorMessage, handleSubmit } = useReferralPayout()

  if (loading) {
    return <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
  }

  return (
    <PartnerLayout referralCode={summary?.referralCode}>
      <h1 className='mb-1 text-xl font-bold text-white'>Thanh toán</h1>
      <p className='mb-6 text-sm text-white/60'>Yêu cầu rút hoa hồng đã được đối soát (Confirmed) — quản trị viên duyệt và chuyển khoản ngoài hệ thống</p>

      <div className='mb-6 rounded-xl border border-white/10 bg-white/5 p-4'>
        <div className='mb-3 flex items-center gap-2 text-white/70'>
          <Wallet className='h-5 w-5' />
          <span className='text-sm'>Có thể rút</span>
        </div>
        <p className='mb-4 text-2xl font-bold text-white'>{formatCurrency(availableToWithdraw)}</p>
        <div className='flex flex-col gap-3 sm:flex-row'>
          <Input
            inputMode='numeric' placeholder='Số tiền muốn rút'
            value={amount} onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
            data-qa='i_so_tien_rut'
          />
          <Button className='jgame-btn-primary flex-shrink-0 text-white' disabled={!isValid || submitting} onClick={handleSubmit} data-qa='btn_yeu_cau_rut'>
            {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Gửi yêu cầu
          </Button>
        </div>
        {errorMessage && (
          <div className='mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
          </div>
        )}
      </div>

      <h2 className='mb-3 text-base font-semibold text-white'>Lịch sử yêu cầu</h2>
      {payouts.length === 0 ? (
        <div className='flex flex-col items-center gap-2 py-16 text-white/60'>
          <Inbox className='h-8 w-8' /> Chưa có yêu cầu nào
        </div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-white/10'>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-right font-medium'>Số tiền</th>
                <th className='px-3 py-2 text-center font-medium'>Trạng thái</th>
                <th className='px-3 py-2 text-left font-medium'>Ngày yêu cầu</th>
                <th className='px-3 py-2 text-left font-medium'>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map(p => (
                <tr key={p.id} className='border-t border-white/10 text-white/80'>
                  <td className='px-3 py-2 text-right font-medium text-white'>{formatCurrency(p.amount)}</td>
                  <td className='px-3 py-2 text-center'>
                    <Badge className={cn('border-none', STATUS_CLASS[p.status])}>{REFERRAL_PAYOUT_STATUS_LABELS[p.status]}</Badge>
                  </td>
                  <td className='px-3 py-2 text-white/50'>{formatDateTime(p.requestedAt)}</td>
                  <td className='px-3 py-2 text-white/50'>{p.status === 'rejected' ? p.rejectReason : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PartnerLayout>
  )
}
