/**
 * JcoinWalletPage — Ví JCoin: số dư + lịch sử giao dịch (SC-TASK-04).
 */
import { Link } from 'react-router-dom'
import { Loader2, Coins, Inbox, ArrowUpRight, ArrowDownRight, CreditCard, Timer, PackageOpen } from 'lucide-react'
import { formatNumber, formatDateTime } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { useJcoinWalletFetchData } from '../hooks/useJcoinWallet.page.fetchData'
import { CustomerLayout } from '../../account/components/CustomerLayout'

export const PAGE_ID = 'jgame-jcoin-wallet'

const TX_LABEL: Record<string, string> = {
  EARN_TASK: 'Thưởng nhiệm vụ',
  SPEND_CARD: 'Thanh toán thẻ nạp',
  SPEND_TICKET: 'Thanh toán vé giờ chơi',
  SPEND_ACCESSORY: 'Thanh toán phụ kiện',
}

export function JcoinWalletPage() {
  const { balance, transactions, loading } = useJcoinWalletFetchData()

  return (
    <CustomerLayout>
      <h1 className='mb-6 text-xl font-bold text-white'>Ví JCoin</h1>

      <div className='jgame-gradient-brand rounded-2xl p-6 text-white'>
        <p className='flex items-center gap-1.5 text-sm text-white/80'><Coins className='h-4 w-4' /> Số dư khả dụng</p>
        <p className='mt-1 text-3xl font-extrabold'>{loading ? '...' : formatNumber(balance)} JCoin</p>
        <p className='mt-2 text-xs text-white/70'>JCoin không quy đổi được ra tiền mặt — chỉ dùng để thanh toán trong JGame.</p>
      </div>

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

      <h2 className='mb-3 mt-8 text-base font-semibold text-white'>Lịch sử giao dịch</h2>
      {loading ? (
        <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
      ) : transactions.length === 0 ? (
        <div className='flex flex-col items-center gap-2 py-16 text-white/60'><Inbox className='h-8 w-8' /> Chưa có giao dịch nào</div>
      ) : (
        <div className='space-y-2'>
          {transactions.map(tx => {
            const isEarn = tx.amount > 0
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
                  <p className={cn('font-semibold', isEarn ? 'text-emerald-300' : 'text-red-300')}>{isEarn ? '+' : ''}{formatNumber(tx.amount)}</p>
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
