/**
 * NphDashboardPage — Tổng quan cổng NPH: số dư quỹ, tổng nhiệm vụ, tổng JCoin đã trả (Khả dụng/Chờ xác
 * nhận tách riêng), 5-10 lượt hoàn thành gần nhất (20260903-nc_quan-tri-nha-phat-hanh-game.md mục 2.3).
 */
import { Link } from 'react-router-dom'
import { Loader2, Wallet, ClipboardList, Coins, Clock, AlertCircle, Inbox } from 'lucide-react'
import { Badge } from '../../../../../shared/components/ui/badge'
import { Button } from '../../../../../shared/components/ui/button'
import { formatDateTime } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { NphLayout } from '../../components'
import { NPH_HOLD_STATUS_LABELS } from '../../types'
import { useNphDashboardFetchData } from '../hooks/useNphDashboard.page.fetchData'

export const PAGE_ID = 'jgame-nph-dashboard'
export const PAGE_FEATURES = [{ label: 'Nạp thêm quỹ', code: 'btn-nap-them' }]

const HOLD_BADGE_CLASS: Record<string, string> = {
  confirmed: 'bg-emerald-500/20 text-emerald-300',
  pending: 'bg-amber-500/20 text-amber-300',
  flagged: 'bg-red-500/20 text-red-300',
  reversed: 'bg-slate-500/20 text-slate-300',
}

export function NphDashboardPage() {
  const { dashboard, loading, errorMessage } = useNphDashboardFetchData()

  if (loading) {
    return <NphLayout><div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div></NphLayout>
  }

  if (errorMessage || !dashboard) {
    return (
      <NphLayout>
        <div className='flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
          <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage || 'Không có dữ liệu'}
        </div>
      </NphLayout>
    )
  }

  return (
    <NphLayout>
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <h1 className='text-xl font-bold text-white'>Tổng quan</h1>
        <Link to='/jgame/nph/vi'>
          <Button className='jgame-btn-primary text-white' data-qa='btn_nap_them'>Nạp thêm quỹ</Button>
        </Link>
      </div>

      <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
          <div className='mb-2 flex items-center gap-2 text-white/60'><Wallet className='h-4 w-4' /> Số dư quỹ JCoin</div>
          <p className='text-2xl font-bold text-white'>{dashboard.jcoinBalance.toLocaleString('vi-VN')}</p>
        </div>
        <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
          <div className='mb-2 flex items-center gap-2 text-white/60'><ClipboardList className='h-4 w-4' /> Nhiệm vụ đang cấu hình</div>
          <p className='text-2xl font-bold text-white'>{dashboard.taskCount}</p>
        </div>
        <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
          <div className='mb-2 flex items-center gap-2 text-white/60'><Coins className='h-4 w-4' /> Đã trả — Khả dụng</div>
          <p className='text-2xl font-bold text-emerald-300'>{dashboard.totalPaidAvailable.toLocaleString('vi-VN')}</p>
        </div>
        <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
          <div className='mb-2 flex items-center gap-2 text-white/60'><Clock className='h-4 w-4' /> Đã trả — Chờ xác nhận</div>
          <p className='text-2xl font-bold text-amber-300'>{dashboard.totalPaidPending.toLocaleString('vi-VN')}</p>
        </div>
      </div>

      <h2 className='mb-3 text-base font-semibold text-white'>Lượt hoàn thành gần đây</h2>
      {dashboard.recentCompletions.length === 0 ? (
        <div className='flex flex-col items-center gap-2 py-16 text-white/60'>
          <Inbox className='h-8 w-8' /> Chưa có lượt hoàn thành nào
        </div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-white/10'>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Nội dung</th>
                <th className='px-3 py-2 text-right font-medium'>JCoin</th>
                <th className='px-3 py-2 text-center font-medium'>Trạng thái</th>
                <th className='px-3 py-2 text-left font-medium'>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recentCompletions.map(tx => (
                <tr key={tx.id} className='border-t border-white/10 text-white/80'>
                  <td className='px-3 py-2'>{tx.reason}</td>
                  <td className='px-3 py-2 text-right font-medium text-white'>{tx.amount.toLocaleString('vi-VN')}</td>
                  <td className='px-3 py-2 text-center'>
                    <Badge className={cn('border-none', HOLD_BADGE_CLASS[tx.holdStatus])}>{NPH_HOLD_STATUS_LABELS[tx.holdStatus]}</Badge>
                  </td>
                  <td className='px-3 py-2 text-white/50'>{formatDateTime(tx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </NphLayout>
  )
}
