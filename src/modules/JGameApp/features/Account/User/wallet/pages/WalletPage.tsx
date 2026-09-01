/**
 * WalletPage — Ví (VND + JCoin): 2 số dư + lịch sử giao dịch lọc theo loại tiền.
 */
import { Link } from 'react-router-dom'
import { Loader2, Wallet, Coins, Inbox, ArrowUpRight, ArrowDownRight, CreditCard, Timer, PackageOpen, PlusCircle } from 'lucide-react'
import { formatNumber, formatCurrency, formatDateTime } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { Button } from '../../../../../shared/components/ui/button'
import { useWalletFetchData } from '../hooks/useWallet.page.fetchData'
import { CustomerLayout } from '../../account/components/CustomerLayout'
import { PaymentMethod } from '../../../../Public/wallet/types/wallet.types'

export const PAGE_ID = 'jgame-wallet'

const TX_LABEL: Record<string, string> = {
  TOPUP: 'Nạp tiền vào ví',
  EARN_TASK: 'Thưởng nhiệm vụ',
  SPEND_CARD: 'Thanh toán thẻ nạp',
  SPEND_TICKET: 'Thanh toán vé giờ chơi',
  SPEND_ACCESSORY: 'Thanh toán phụ kiện',
}

export function WalletPage() {
  const { balance, transactions, currencyFilter, setCurrencyFilter, loading } = useWalletFetchData()

  return (
    <CustomerLayout>
      <h1 className='mb-6 text-xl font-bold text-white'>Ví của tôi</h1>

      <div className='jgame-gradient-brand rounded-2xl p-6 text-white'>
        <div className='flex items-center justify-between'>
          <p className='flex items-center gap-1.5 text-sm text-white/80'><Wallet className='h-4 w-4' /> Ví VND</p>
          <p className='text-2xl font-extrabold'>{loading ? '...' : formatCurrency(balance.vndBalance)}</p>
        </div>
        <div className='my-3 border-t border-white/20' />
        <div className='flex items-center justify-between'>
          <p className='flex items-center gap-1.5 text-sm text-white/80'><Coins className='h-4 w-4' /> Ví JCoin</p>
          <p className='text-xl font-bold'>{loading ? '...' : `${formatNumber(balance.jcoinBalance)} JCoin`}</p>
        </div>
        <p className='mt-2 text-xs text-white/70'>JCoin kiếm được từ nhiệm vụ, không quy đổi ra tiền mặt.</p>
      </div>

      <Link to='/jgame/vi/nap-tien'>
        <Button className='jgame-btn-primary mt-4 w-full text-white' size='lg' data-qa='btn_nap_tien'>
          <PlusCircle className='mr-1.5 h-4 w-4' /> Nạp tiền vào ví VND
        </Button>
      </Link>

      <div className='mt-4 grid grid-cols-3 gap-3'>
        <Link to='/jgame/nap-the' className='jgame-card-hover flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-4 text-center'>
          <CreditCard className='h-5 w-5 text-white/70' /><span className='text-xs text-white/70'>Nạp thẻ game</span>
        </Link>
        <Link to='/jgame/cho-ve' className='jgame-card-hover flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-4 text-center'>
          <Timer className='h-5 w-5 text-white/70' /><span className='text-xs text-white/70'>Vé giờ chơi</span>
        </Link>
        <Link to='/jgame/phu-kien' className='jgame-card-hover flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-4 text-center'>
          <PackageOpen className='h-5 w-5 text-white/70' /><span className='text-xs text-white/70'>Phụ kiện</span>
        </Link>
      </div>

      <div className='mb-3 mt-8 flex items-center justify-between'>
        <h2 className='text-base font-semibold text-white'>Lịch sử giao dịch</h2>
        <div className='flex gap-1.5'>
          {(['all', PaymentMethod.Vnd, PaymentMethod.Jcoin] as const).map(v => (
            <button
              key={String(v)}
              type='button'
              className={cn('rounded-full border px-3 py-1 text-xs', currencyFilter === v ? 'border-white bg-white/10 text-white' : 'border-white/10 text-white/50')}
              onClick={() => setCurrencyFilter(v)}
            >
              {v === 'all' ? 'Tất cả' : v === PaymentMethod.Vnd ? 'VND' : 'JCoin'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
      ) : transactions.length === 0 ? (
        <div className='flex flex-col items-center gap-2 py-16 text-white/60'><Inbox className='h-8 w-8' /> Chưa có giao dịch nào</div>
      ) : (
        <div className='space-y-2'>
          {transactions.map(tx => {
            const isEarn = tx.amount > 0
            const isVnd = tx.currency === PaymentMethod.Vnd
            return (
              <div key={tx.id} className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm'>
                <div className='flex items-center gap-2.5'>
                  <span className={cn('flex h-8 w-8 items-center justify-center rounded-full', isEarn ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300')}>
                    {isEarn ? <ArrowDownRight className='h-4 w-4' /> : <ArrowUpRight className='h-4 w-4' />}
                  </span>
                  <div>
                    <p className='font-medium text-white'>{TX_LABEL[tx.type] || tx.type}</p>
                    <p className='text-xs text-white/50'>{tx.reason}</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className={cn('font-semibold', isEarn ? 'text-emerald-300' : 'text-red-300')}>
                    {isEarn ? '+' : ''}{isVnd ? formatCurrency(tx.amount) : `${formatNumber(tx.amount)} JCoin`}
                  </p>
                  <p className='text-xs text-white/40'>{formatDateTime(tx.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </CustomerLayout>
  )
}
