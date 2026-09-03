/**
 * NphWalletPage — Số dư quỹ + nạp tiền (redirect cổng thanh toán) + lịch sử nạp
 * (20260903-nc_quan-tri-nha-phat-hanh-game.md mục 2.6).
 */
import { Loader2, Wallet, AlertCircle, Inbox } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { Input } from '../../../../../shared/components/ui/input'
import { Badge } from '../../../../../shared/components/ui/badge'
import { formatCurrency, formatDateTime } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { NphLayout } from '../../components'
import { NPH_TOPUP_STATUS_LABELS } from '../../types'
import { useNphWalletFetchData } from '../hooks/useNphWallet.page.fetchData'

export const PAGE_ID = 'jgame-nph-wallet'
export const PAGE_FEATURES = [{ label: 'Nạp tiền', code: 'btn-nap-tien' }]

const TOPUP_BADGE_CLASS: Record<string, string> = {
  Pending: 'bg-amber-500/20 text-amber-300',
  Paid: 'bg-emerald-500/20 text-emerald-300',
  Expired: 'bg-slate-500/20 text-slate-300',
}

export function NphWalletPage() {
  const { wallet, topups, loading, amount, setAmount, submitting, errorMessage, handleTopup, handleConfirm } = useNphWalletFetchData()

  if (loading) {
    return <NphLayout><div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div></NphLayout>
  }

  return (
    <NphLayout>
      <h1 className='mb-6 text-xl font-bold text-white'>Ví & Nạp tiền</h1>

      <div className='mb-6 rounded-xl border border-white/10 bg-white/5 p-4'>
        <div className='mb-3 flex items-center gap-2 text-white/70'><Wallet className='h-5 w-5' /> Số dư quỹ JCoin</div>
        <p className='mb-4 text-2xl font-bold text-white'>{(wallet?.jcoinBalance ?? 0).toLocaleString('vi-VN')}</p>

        <p className='mb-1.5 text-sm font-medium text-white/80'>Nạp thêm quỹ (VND, tỷ giá 1:1 sang JCoin)</p>
        <div className='flex flex-col gap-3 sm:flex-row'>
          <Input
            type='number' min={1000} placeholder='Số tiền nạp (VND)'
            value={amount || ''} onChange={e => setAmount(Number(e.target.value) || 0)}
            data-qa='i_so_tien_nap'
          />
          <Button className='jgame-btn-primary flex-shrink-0 text-white' disabled={amount < 1000 || submitting} onClick={handleTopup} data-qa='btn_nap_tien'>
            {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Nạp tiền
          </Button>
        </div>
        {errorMessage && (
          <div className='mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
          </div>
        )}
      </div>

      <h2 className='mb-3 text-base font-semibold text-white'>Lịch sử nạp</h2>
      {topups.length === 0 ? (
        <div className='flex flex-col items-center gap-2 py-16 text-white/60'><Inbox className='h-8 w-8' /> Chưa có yêu cầu nạp nào</div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-white/10'>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-right font-medium'>Số tiền</th>
                <th className='px-3 py-2 text-center font-medium'>Trạng thái</th>
                <th className='px-3 py-2 text-left font-medium'>Hết hạn</th>
                <th className='w-[120px] px-3 py-2 text-center font-medium'>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {topups.map(t => (
                <tr key={t.id} className='border-t border-white/10 text-white/80'>
                  <td className='px-3 py-2 text-right font-medium text-white'>{formatCurrency(t.amount)}</td>
                  <td className='px-3 py-2 text-center'>
                    <Badge className={cn('border-none', TOPUP_BADGE_CLASS[t.status])}>{NPH_TOPUP_STATUS_LABELS[t.status]}</Badge>
                  </td>
                  <td className='px-3 py-2 text-white/50'>{formatDateTime(t.expiredAt)}</td>
                  <td className='px-3 py-2 text-center'>
                    {t.status === 'Pending' && (
                      <Button variant='ghost' size='sm' className='border rounded-lg bg-white text-xs' data-qa={`btn_xac_nhan_${t.id}`} onClick={() => void handleConfirm(t.id)}>
                        Xác nhận
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </NphLayout>
  )
}
