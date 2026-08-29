/**
 * ShopPayoutsPage — Công nợ & Lịch sử thanh toán (SC-P2-S6), chỉ xem (read-only).
 */
import { Loader2, Wallet, Clock3 } from 'lucide-react'
import { Badge } from '../../../../shared/components/ui/badge'
import { formatCurrency, formatDateTime, formatPercent } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { ShopOwnerLayout } from '../components/ShopOwnerLayout'
import { useMyShop } from '../hooks/useMyShop'
import { useShopPayoutsFetchData } from '../hooks/useShopPayouts.page.fetchData'

export const PAGE_ID = 'jgame-shop-payouts'

export function ShopPayoutsPage() {
  const { shop } = useMyShop()
  const { current, history, loading } = useShopPayoutsFetchData()

  return (
    <ShopOwnerLayout shopName={shop?.name}>
      <h1 className='mb-6 text-xl font-bold text-white'>Công nợ & Lịch sử thanh toán</h1>

      {loading || !current ? (
        <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
      ) : (
        <>
          <div className='rounded-2xl border border-white/10 bg-white/5 p-5'>
            <div className='flex items-center gap-2 text-sm text-white/60'><Clock3 className='h-4 w-4' /> Kỳ hiện tại — {current.periodLabel}</div>
            <div className='mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3'>
              <div><p className='text-xs text-white/50'>Doanh thu gộp</p><p className='mt-1 font-bold text-white'>{formatCurrency(current.grossRevenue)}</p></div>
              <div><p className='text-xs text-white/50'>Hoa hồng JGame ({formatPercent(current.commissionRate * 100, 0)})</p><p className='mt-1 font-bold text-white'>{formatCurrency(current.commissionAmount)}</p></div>
              <div><p className='text-xs text-white/50'>JGame phải trả</p><p className='jgame-gradient-text mt-1 text-lg font-extrabold'>{formatCurrency(current.payableAmount)}</p></div>
            </div>
          </div>

          <h2 className='mb-3 mt-8 flex items-center gap-2 text-base font-semibold text-white'>
            <Wallet className='h-4 w-4' /> Lịch sử thanh toán
          </h2>
          <div className='overflow-x-auto rounded-xl border border-white/10'>
            <table className='w-full text-sm'>
              <thead className='bg-white/5 text-white/60'>
                <tr>
                  <th className='px-3 py-2 text-left font-medium'>Kỳ</th>
                  <th className='px-3 py-2 text-right font-medium'>Doanh thu gộp</th>
                  <th className='px-3 py-2 text-right font-medium'>Hoa hồng</th>
                  <th className='px-3 py-2 text-right font-medium'>Đã trả</th>
                  <th className='px-3 py-2 text-center font-medium'>Trạng thái</th>
                  <th className='px-3 py-2 text-left font-medium'>Ngày trả</th>
                </tr>
              </thead>
              <tbody>
                {history.map(p => (
                  <tr key={p.id} className='border-t border-white/10 text-white/80'>
                    <td className='px-3 py-2'>{p.periodLabel}</td>
                    <td className='px-3 py-2 text-right'>{formatCurrency(p.grossRevenue)}</td>
                    <td className='px-3 py-2 text-right'>{formatCurrency(p.commissionAmount)}</td>
                    <td className='px-3 py-2 text-right font-semibold text-white'>{formatCurrency(p.payableAmount)}</td>
                    <td className='px-3 py-2 text-center'>
                      <Badge className={cn('border-none', p.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300')}>
                        {p.status === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                      </Badge>
                    </td>
                    <td className='px-3 py-2 text-white/50'>{p.paidAt ? formatDateTime(p.paidAt) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </ShopOwnerLayout>
  )
}
