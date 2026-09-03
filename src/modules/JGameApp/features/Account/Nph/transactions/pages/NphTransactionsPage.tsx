/**
 * NphTransactionsPage — Lịch sử JCoin đã trả người chơi qua nhiệm vụ của NPH
 * (20260903-nc_quan-tri-nha-phat-hanh-game.md mục 2.5). BE (`WalletTransactionResponse`) KHÔNG enrich
 * tên/nhiệm vụ — chỉ có `userId` + `reason` (chuỗi mô tả) + `referenceId` — khác thiết kế ban đầu của
 * doc (kỳ vọng cột "Tên người chơi"/"Nhiệm vụ" tách riêng); FE rút gọn `userId` làm định danh hiển thị.
 */
import { Loader2, AlertCircle, Inbox } from 'lucide-react'
import { Badge } from '../../../../../shared/components/ui/badge'
import { formatDateTime } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { NphLayout } from '../../components'
import { NPH_HOLD_STATUS_LABELS } from '../../types'
import { useNphTransactionsFetchData } from '../hooks/useNphTransactions.page.fetchData'

export const PAGE_ID = 'jgame-nph-transactions'
export const PAGE_FEATURES: { label: string; code: string }[] = []

const HOLD_BADGE_CLASS: Record<string, string> = {
  confirmed: 'bg-emerald-500/20 text-emerald-300',
  pending: 'bg-amber-500/20 text-amber-300',
  flagged: 'bg-red-500/20 text-red-300',
  reversed: 'bg-slate-500/20 text-slate-300',
}

function maskUserId(userId: string): string {
  if (userId.length <= 8) return userId
  return `${userId.slice(0, 4)}...${userId.slice(-4)}`
}

export function NphTransactionsPage() {
  const { transactions, loading, errorMessage } = useNphTransactionsFetchData()

  return (
    <NphLayout>
      <h1 className='mb-1 text-xl font-bold text-white'>Giao dịch</h1>
      <p className='mb-6 text-sm text-white/60'>Lịch sử JCoin đã trả cho người chơi qua nhiệm vụ của bạn</p>

      {errorMessage && (
        <div className='mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
          <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
        </div>
      )}

      {loading ? (
        <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
      ) : transactions.length === 0 ? (
        <div className='flex flex-col items-center gap-2 py-16 text-white/60'><Inbox className='h-8 w-8' /> Chưa có giao dịch nào</div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-white/10'>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Người chơi</th>
                <th className='px-3 py-2 text-left font-medium'>Nội dung</th>
                <th className='px-3 py-2 text-right font-medium'>JCoin</th>
                <th className='px-3 py-2 text-center font-medium'>Trạng thái</th>
                <th className='px-3 py-2 text-left font-medium'>Ngày hoàn thành</th>
                <th className='px-3 py-2 text-left font-medium'>Dự kiến khả dụng</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className='border-t border-white/10 text-white/80'>
                  <td className='px-3 py-2 font-mono text-xs'>{maskUserId(tx.userId)}</td>
                  <td className='px-3 py-2'>{tx.reason}</td>
                  <td className='px-3 py-2 text-right font-medium text-white'>{tx.amount.toLocaleString('vi-VN')}</td>
                  <td className='px-3 py-2 text-center'>
                    <Badge className={cn('border-none', HOLD_BADGE_CLASS[tx.holdStatus])}>{NPH_HOLD_STATUS_LABELS[tx.holdStatus]}</Badge>
                  </td>
                  <td className='px-3 py-2 text-white/50'>{formatDateTime(tx.createdAt)}</td>
                  <td className='px-3 py-2 text-white/50'>{tx.holdStatus === 'pending' && tx.availableAt ? formatDateTime(tx.availableAt) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </NphLayout>
  )
}
