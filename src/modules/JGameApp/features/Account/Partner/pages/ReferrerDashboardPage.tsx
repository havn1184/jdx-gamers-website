/**
 * ReferrerDashboardPage — Dashboard Đối tác Referrer (SC-10).
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Copy, Users, Wallet, Clock3, Inbox, Megaphone } from 'lucide-react'
import { Badge } from '../../../../shared/components/ui/badge'
import { Button } from '../../../../shared/components/ui/button'
import { formatCurrency, formatDateTime } from '../../../../shared/utils/FormatUtils'
import { useReferrerDashboardFetchData } from '../hooks/useReferrerDashboard.page.fetchData'
import { cn } from '../../../../shared/components/ui/utils'
import { PartnerLayout } from '../components/PartnerLayout'

export const PAGE_ID = 'jgame-referrer'
export const PAGE_FEATURES = [{ label: 'Sao chép link giới thiệu', code: 'btn-copy-link' }]

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: 'Chờ đối soát', className: 'bg-amber-500/20 text-amber-300' },
  confirmed: { label: 'Đã xác nhận', className: 'bg-emerald-500/20 text-emerald-300' },
  reversed: { label: 'Đã đảo', className: 'bg-red-500/20 text-red-300' },
}

export function ReferrerDashboardPage() {
  const { summary, transactions, loading } = useReferrerDashboardFetchData()
  const [copied, setCopied] = useState(false)

  if (loading) {
    return <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
  }

  if (!summary) {
    return (
      <PartnerLayout>
        <div className='mx-auto max-w-lg px-4 py-24 text-center text-white/60'>
          <Megaphone className='mx-auto mb-3 h-10 w-10' />
          Bạn chưa đăng ký làm đối tác tiếp thị liên kết.
          <div className='mt-4'>
            <Link to='/jgame/doi-tac/dang-ky' className='jgame-gradient-text font-semibold'>Đăng ký ngay</Link>
          </div>
        </div>
      </PartnerLayout>
    )
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary.shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <PartnerLayout referralCode={summary.referralCode}>
      <h1 className='mb-1 text-xl font-bold text-white'>Dashboard Đối tác</h1>
      <p className='mb-6 text-sm text-white/60'>Mã giới thiệu: <span className='font-semibold text-white'>{summary.referralCode}</span></p>

      <div className='mb-6 flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between'>
        <span className='truncate text-sm text-white/70'>{summary.shareUrl}</span>
        <Button size='sm' className='jgame-btn-primary text-white flex-shrink-0' onClick={handleCopy} data-qa='btn_copy_link'>
          <Copy className='h-4 w-4 mr-1.5' /> {copied ? 'Đã sao chép!' : 'Sao chép link'}
        </Button>
      </div>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
        <StatTile icon={<Users className='h-5 w-5' />} label='Tổng đơn hàng' value={String(summary.totalOrders)} />
        <StatTile icon={<Wallet className='h-5 w-5' />} label='Tổng hoa hồng' value={formatCurrency(summary.totalCommission)} />
        <StatTile icon={<Clock3 className='h-5 w-5' />} label='Chờ đối soát' value={formatCurrency(summary.pendingCommission)} />
      </div>

      <h2 className='mb-3 mt-8 text-base font-semibold text-white'>Giao dịch gần đây</h2>
      {transactions.length === 0 ? (
        <div className='flex flex-col items-center gap-2 py-16 text-white/60'>
          <Inbox className='h-8 w-8' /> Chưa có giao dịch nào
        </div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-white/10'>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Mã đơn</th>
                <th className='px-3 py-2 text-right font-medium'>Giá trị</th>
                <th className='px-3 py-2 text-right font-medium'>Hoa hồng</th>
                <th className='px-3 py-2 text-center font-medium'>Trạng thái</th>
                <th className='px-3 py-2 text-left font-medium'>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => {
                const meta = STATUS_META[tx.status]
                return (
                  <tr key={tx.id} className='border-t border-white/10 text-white/80'>
                    <td className='px-3 py-2'>{tx.orderIdMasked}</td>
                    <td className='px-3 py-2 text-right'>{formatCurrency(tx.amount)}</td>
                    <td className='px-3 py-2 text-right'>{formatCurrency(tx.commissionAmount)}</td>
                    <td className='px-3 py-2 text-center'><Badge className={cn('border-none', meta.className)}>{meta.label}</Badge></td>
                    <td className='px-3 py-2 text-white/50'>{formatDateTime(tx.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </PartnerLayout>
  )
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
      <div className='jgame-gradient-text mb-2'>{icon}</div>
      <p className='text-lg font-bold text-white'>{value}</p>
      <p className='text-xs text-white/50'>{label}</p>
    </div>
  )
}
