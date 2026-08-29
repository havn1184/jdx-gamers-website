/**
 * AdminDashboardPage — Tổng quan hệ thống, trang mặc định khu Quản trị (/jgame/quan-tri).
 */
import { Link } from 'react-router-dom'
import { Loader2, Wallet, ShoppingCart, AlertTriangle, Building2, Users, Ticket, ArrowRight } from 'lucide-react'
import { AdminLayout } from '../../components/AdminLayout'
import { formatCurrency, formatNumber, formatDate } from '../../../../../shared/utils/FormatUtils'
import { useAdminDashboard } from '../hooks/useAdminDashboard.page.fetchData'

export const PAGE_ID = 'jgame-admin-dashboard'

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
      <div className='jgame-gradient-text mb-2'>{icon}</div>
      <p className='text-lg font-bold text-white'>{value}</p>
      <p className='text-xs text-white/50'>{label}</p>
    </div>
  )
}

export function AdminDashboardPage() {
  const {
    totalGmv, totalOrders, avgFailRate, activeSupplierCount,
    pendingIssueOrders, alertPartners, runningPromotions, loading,
  } = useAdminDashboard()

  return (
    <AdminLayout>
      <h1 className='mb-6 text-xl font-bold text-white'>Tổng quan hệ thống</h1>

      {loading ? (
        <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
      ) : (
        <>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
            <StatTile icon={<Wallet className='h-5 w-5' />} label='Tổng GMV' value={formatCurrency(totalGmv)} />
            <StatTile icon={<ShoppingCart className='h-5 w-5' />} label='Tổng đơn' value={formatNumber(totalOrders)} />
            <StatTile icon={<AlertTriangle className='h-5 w-5' />} label='Tỷ lệ lỗi TB' value={`${avgFailRate}%`} />
            <StatTile icon={<Building2 className='h-5 w-5' />} label='NCC đang hoạt động' value={formatNumber(activeSupplierCount)} />
          </div>

          {pendingIssueOrders.length > 0 && (
            <div className='mt-8'>
              <h2 className='mb-3 flex items-center gap-2 text-base font-semibold text-white'>
                <AlertTriangle className='h-4 w-4 text-red-400' /> Đơn lỗi cấp mã cần xử lý ({pendingIssueOrders.length})
              </h2>
              <div className='space-y-2'>
                {pendingIssueOrders.slice(0, 5).map(o => (
                  <div key={o.id} className='flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm'>
                    <span className='text-white/80'>{o.id} · {o.productName} · {o.supplierName}</span>
                    <span className='font-semibold text-red-300'>{formatCurrency(o.totalAmount)}</span>
                  </div>
                ))}
              </div>
              <Link to='/jgame/quan-tri/giao-dich' className='mt-3 inline-flex items-center gap-1 jgame-gradient-text text-sm font-semibold'>
                Xử lý ngay <ArrowRight className='h-3.5 w-3.5' />
              </Link>
            </div>
          )}

          {alertPartners.length > 0 && (
            <div className='mt-8'>
              <h2 className='mb-3 flex items-center gap-2 text-base font-semibold text-white'>
                <Users className='h-4 w-4 text-amber-400' /> Đối tác Referral tỷ lệ hoàn tiền cao
              </h2>
              <div className='space-y-2'>
                {alertPartners.map(p => (
                  <div key={p.id} className='flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm'>
                    <span className='text-white/80'>{p.referralCode} · {p.name} · {p.totalOrders} đơn</span>
                    <span className='animate-pulse font-semibold text-amber-300'>{p.refundRatePercent.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
              <Link to='/jgame/quan-tri/doi-tac-referral' className='mt-3 inline-flex items-center gap-1 jgame-gradient-text text-sm font-semibold'>
                Xem chi tiết <ArrowRight className='h-3.5 w-3.5' />
              </Link>
            </div>
          )}

          <div className='mt-8'>
            <h2 className='mb-3 flex items-center gap-2 text-base font-semibold text-white'>
              <Ticket className='h-4 w-4 text-emerald-400' /> Khuyến mãi đang chạy ({runningPromotions.length})
            </h2>
            {runningPromotions.length === 0 ? (
              <p className='text-sm text-white/50'>Không có chương trình khuyến mãi nào đang chạy.</p>
            ) : (
              <div className='space-y-2'>
                {runningPromotions.slice(0, 3).map(p => (
                  <div key={p.id} className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm'>
                    <span className='font-mono font-semibold text-white'>{p.code}</span>
                    <span className='text-white/60'>{formatDate(p.startAt)} → {formatDate(p.endAt)}</span>
                  </div>
                ))}
              </div>
            )}
            <Link to='/jgame/quan-tri/khuyen-mai' className='mt-3 inline-flex items-center gap-1 jgame-gradient-text text-sm font-semibold'>
              Xem tất cả <ArrowRight className='h-3.5 w-3.5' />
            </Link>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
