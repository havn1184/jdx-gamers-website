/**
 * WalletTopupPage — Nạp tiền vào ví VND (mock QR, tự động xác nhận).
 */
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { Input } from '../../../../../shared/components/ui/input'
import { formatCurrency } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { useWalletTopup } from '../hooks/useWalletTopup.page'

export const PAGE_ID = 'jgame-wallet-topup'
export const PAGE_FEATURES = [{ label: 'Nạp tiền', code: 'btn-nap-tien' }]

export function WalletTopupPage() {
  const { amount, setAmount, quickAmounts, submitting, errorMessage, successAmount, handleTopup } = useWalletTopup()

  if (successAmount != null) {
    return (
      <div className='mx-auto max-w-lg px-4 py-24 text-center'>
        <CheckCircle2 className='mx-auto mb-3 h-12 w-12 text-emerald-400' />
        <h1 className='text-xl font-bold text-white'>Nạp tiền thành công</h1>
        <p className='mt-2 text-white/60'>Đã cộng {formatCurrency(successAmount)} vào ví VND của bạn.</p>
        <Link to='/jgame/vi' className='mt-6 inline-block'>
          <Button className='jgame-btn-primary text-white' size='lg'>Về Ví của tôi</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-lg px-4 py-10 sm:px-6'>
      <h1 className='mb-6 text-xl font-bold text-white'>Nạp tiền vào ví VND</h1>

      <div className='rounded-2xl border border-white/10 bg-white/5 p-5'>
        <p className='mb-2 text-sm font-medium text-white/80'>Chọn nhanh số tiền</p>
        <div className='grid grid-cols-3 gap-2'>
          {quickAmounts.map(q => (
            <button
              key={q}
              type='button'
              className={cn('jgame-chip bg-white/5 py-2.5 text-sm text-white', amount === q ? 'border-white bg-white/10' : '')}
              onClick={() => setAmount(q)}
            >
              {formatCurrency(q)}
            </button>
          ))}
        </div>

        <p className='mb-1.5 mt-5 text-sm font-medium text-white/80'>Hoặc nhập số tiền khác</p>
        <Input
          type='number'
          min={1000}
          placeholder='Số tiền nạp (VND)'
          value={amount || ''}
          onChange={e => setAmount(Number(e.target.value) || 0)}
          data-qa='i_so_tien_nap'
        />

        {errorMessage && (
          <div className='mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
          </div>
        )}

        <Button
          className='jgame-btn-primary mt-5 w-full text-white'
          size='lg'
          disabled={amount < 1000 || submitting}
          onClick={handleTopup}
          data-qa='btn_nap_tien'
        >
          {submitting ? <Loader2 className='mr-1.5 h-4 w-4 animate-spin' /> : null}
          Nạp tiền
        </Button>
      </div>
    </div>
  )
}
