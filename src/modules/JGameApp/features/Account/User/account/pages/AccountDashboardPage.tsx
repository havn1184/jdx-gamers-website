/**
 * AccountDashboardPage — Tổng quan tài khoản: landing sau khi khách hàng đăng nhập (SC-Account-Dashboard).
 */
import { Link } from 'react-router-dom'
import { Loader2, Coins, Wallet, ListChecks, Package, Inbox, ChevronRight, Store, Megaphone } from 'lucide-react'
import { formatCurrency, formatDateTime, formatNumber } from '../../../../../shared/utils/FormatUtils'
import { CustomerLayout } from '../components/CustomerLayout'
import { useAccountDashboard } from '../hooks/useAccountDashboard.page.fetchData'

export const PAGE_ID = 'jgame-account-dashboard'
export const PAGE_FEATURES = [{ label: 'Xem đơn hàng gần đây', code: 'row-view' }]

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
      <div className='jgame-gradient-text mb-2'>{icon}</div>
      <p className='text-lg font-bold text-white'>{value}</p>
      <p className='text-xs text-white/50'>{label}</p>
    </div>
  )
}

export function AccountDashboardPage() {
  const { vndBalance, jcoinBalance, inProgressTasksCount, totalOrdersCount, recentOrders, hasShop, isAffiliate, loading } = useAccountDashboard()

  return (
    <CustomerLayout>
      <h1 className='mb-6 text-xl font-bold text-white'>Tổng quan</h1>

      {loading ? (
        <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
      ) : (
        <>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
            <StatTile icon={<Wallet className='h-5 w-5' />} label='Số dư ví VND' value={formatCurrency(vndBalance)} />
            <StatTile icon={<Coins className='h-5 w-5' />} label='Số dư JCoin' value={formatNumber(jcoinBalance)} />
            <StatTile icon={<ListChecks className='h-5 w-5' />} label='Nhiệm vụ đang làm' value={formatNumber(inProgressTasksCount)} />
            <StatTile icon={<Package className='h-5 w-5' />} label='Tổng đơn hàng' value={formatNumber(totalOrdersCount)} />
          </div>

          {(!hasShop || !isAffiliate) && (
            <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {!hasShop && (
                <Link to='/jgame/kenh-nguoi-ban/dang-ky' className='jgame-card-hover flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4'>
                  <span className='jgame-gradient-brand flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white'><Store className='h-5 w-5' /></span>
                  <div>
                    <p className='font-semibold text-white'>Trở thành chủ Cybergame</p>
                    <p className='text-xs text-white/50'>Đăng ký Kênh Người Bán, bán vé giờ chơi cybergame</p>
                  </div>
                </Link>
              )}
              {!isAffiliate && (
                <Link to='/jgame/doi-tac/dang-ky' className='jgame-card-hover flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4'>
                  <span className='jgame-gradient-brand flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white'><Megaphone className='h-5 w-5' /></span>
                  <div>
                    <p className='font-semibold text-white'>Trở thành đối tác tiếp thị</p>
                    <p className='text-xs text-white/50'>Nhận hoa hồng khi giới thiệu khách hàng mới</p>
                  </div>
                </Link>
              )}
            </div>
          )}

          <div className='mt-8 flex items-center justify-between'>
            <h2 className='text-base font-semibold text-white'>Đơn hàng gần đây</h2>
            <Link to='/jgame/lich-su' className='jgame-gradient-text text-sm font-semibold'>Xem tất cả</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className='flex flex-col items-center gap-2 py-16 text-white/60'><Inbox className='h-8 w-8' /> Chưa có đơn hàng nào</div>
          ) : (
            <div className='mt-3 space-y-2'>
              {recentOrders.map(o => (
                <Link key={o.id} to={o.to} className='flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10' data-qa={`row_view_${o.id}`}>
                  <div>
                    <p className='font-semibold text-white'>{o.title}</p>
                    <p className='mt-1 text-xs text-white/50'>{formatDateTime(o.createdAt)}</p>
                  </div>
                  <div className='flex items-center gap-2 text-right'>
                    <span className='font-semibold text-white'>{o.amount === 0 ? 'Miễn phí' : formatCurrency(o.amount)}</span>
                    <ChevronRight className='h-4 w-4 text-white/40' />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </CustomerLayout>
  )
}
