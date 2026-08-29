/**
 * ShopOrdersPage — Đơn hàng đã bán, xác nhận khách đã dùng vé (SC-P2-S5).
 */
import { Loader2, Inbox, CheckCircle2 } from 'lucide-react'
import { Badge } from '../../../../shared/components/ui/badge'
import { Button } from '../../../../shared/components/ui/button'
import { formatCurrency, formatDateTime } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { ShopOwnerLayout } from '../components/ShopOwnerLayout'
import { useMyShop } from '../hooks/useMyShop'
import { useShopOrdersFetchData } from '../hooks/useShopOrders.page.fetchData'
import type { PlaytimeOrderStatus } from '../types/shop-owner.types'

export const PAGE_ID = 'jgame-shop-orders'
export const PAGE_FEATURES = [{ label: 'Lọc theo trạng thái', code: 'sel-trang-thai' }, { label: 'Xác nhận đã dùng vé', code: 'row-confirm-used' }]

const STATUS_META: Record<PlaytimeOrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Chờ thanh toán', className: 'bg-amber-500/20 text-amber-300' },
  PAID: { label: 'Đang xử lý', className: 'bg-blue-500/20 text-blue-300' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'bg-emerald-500/20 text-emerald-300' },
  USED: { label: 'Đã dùng vé', className: 'bg-slate-500/20 text-slate-300' },
  SUPPLY_FAILED: { label: 'Lỗi cấp vé', className: 'bg-red-500/20 text-red-300' },
  REFUND_PROCESSING: { label: 'Đang hoàn tiền', className: 'bg-amber-500/20 text-amber-300' },
  REFUNDED: { label: 'Đã hoàn tiền', className: 'bg-slate-500/20 text-slate-300' },
  EXPIRED: { label: 'Đã hết hạn', className: 'bg-slate-500/20 text-slate-300' },
}

const STATUS_TABS: { key: PlaytimeOrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'CONFIRMED', label: 'Chờ dùng vé' },
  { key: 'USED', label: 'Đã dùng vé' },
  { key: 'EXPIRED', label: 'Hết hạn' },
]

export function ShopOrdersPage() {
  const { shop } = useMyShop()
  const { items, loading, status, setStatus, confirmingId, confirmUsed } = useShopOrdersFetchData()

  return (
    <ShopOwnerLayout shopName={shop?.name}>
      <h1 className='mb-6 text-xl font-bold text-white'>Đơn hàng đã bán</h1>

      <div className='mb-5 flex flex-wrap gap-2' data-qa='sel_trang_thai'>
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            type='button'
            onClick={() => setStatus(tab.key)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium',
              status === tab.key ? 'jgame-gradient-brand border-transparent text-white' : 'border-white/20 text-white/70 hover:bg-white/10'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>}

      {!loading && items.length === 0 && (
        <div className='flex flex-col items-center gap-2 py-16 text-white/60'><Inbox className='h-8 w-8' /> Chưa có đơn hàng nào</div>
      )}

      {!loading && items.length > 0 && (
        <div className='space-y-3'>
          {items.map(order => {
            const meta = STATUS_META[order.status]
            return (
              <div key={order.id} className='flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold text-white'>{order.zoneName} · {order.hours}h chơi</span>
                    <Badge className={cn('border-none', meta.className)}>{meta.label}</Badge>
                  </div>
                  <p className='mt-1 text-xs text-white/50'>Mã đơn {order.id} · {formatDateTime(order.createdAt)}</p>
                </div>
                <div className='flex items-center gap-3'>
                  <span className='font-semibold text-white'>{order.totalAmount === 0 ? 'Miễn phí' : formatCurrency(order.totalAmount)}</span>
                  {order.status === 'CONFIRMED' && (
                    <Button size='sm' className='jgame-btn-primary text-white' disabled={confirmingId === order.id} onClick={() => confirmUsed(order.id)} data-qa={`row_confirm_used_${order.id}`}>
                      {confirmingId === order.id ? <Loader2 className='h-4 w-4 animate-spin mr-1' /> : <CheckCircle2 className='h-4 w-4 mr-1' />} Xác nhận đã dùng
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ShopOwnerLayout>
  )
}
