/**
 * HistoryPage — Lịch sử giao dịch cá nhân (SC-08), gộp 3 loại đơn: Thẻ game / Phụ kiện / Vé giờ chơi.
 */
import { Link } from 'react-router-dom'
import { Loader2, Inbox, ChevronRight } from 'lucide-react'
import { Badge } from '../../../../../shared/components/ui/badge'
import { formatCurrency, formatDateTime } from '../../../../../shared/utils/FormatUtils'
import { useHistoryFetchData, type HistoryTab } from '../hooks/useHistory.page.fetchData'
import { cn } from '../../../../../shared/components/ui/utils'
import { CustomerLayout } from '../../account/components/CustomerLayout'
import type { OrderStatus } from '../../order/types/order.types'
import type { AccessoryOrderStatus } from '../../../../Public/accessories/types/accessory.types'
import type { PlaytimeOrderStatus } from '../../../../Public/playtime/types/playtime.types'

export const PAGE_ID = 'jgame-history'
export const PAGE_FEATURES = [{ label: 'Chuyển tab loại đơn', code: 'tab-loai-don' }, { label: 'Xem chi tiết giao dịch', code: 'row-view' }]

const TABS: { key: HistoryTab; label: string }[] = [
  { key: 'the-game', label: 'Thẻ game' },
  { key: 'phu-kien', label: 'Phụ kiện' },
  { key: 've-gio-choi', label: 'Vé giờ chơi' },
]

const CARD_STATUS: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Chờ thanh toán', className: 'bg-amber-500/20 text-amber-300' },
  PAID: { label: 'Đang xử lý', className: 'bg-blue-500/20 text-blue-300' },
  SUCCESS: { label: 'Thành công', className: 'bg-emerald-500/20 text-emerald-300' },
  SUPPLY_FAILED: { label: 'Lỗi cấp mã', className: 'bg-red-500/20 text-red-300' },
  REFUND_PROCESSING: { label: 'Đang hoàn tiền', className: 'bg-amber-500/20 text-amber-300' },
  REFUNDED: { label: 'Đã hoàn tiền', className: 'bg-slate-500/20 text-slate-300' },
  EXPIRED: { label: 'Đã hết hạn', className: 'bg-slate-500/20 text-slate-300' },
}

const ACCESSORY_STATUS: Record<AccessoryOrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Chờ thanh toán', className: 'bg-amber-500/20 text-amber-300' },
  PAID: { label: 'Đã thanh toán', className: 'bg-blue-500/20 text-blue-300' },
  PACKING: { label: 'Đang đóng gói', className: 'bg-blue-500/20 text-blue-300' },
  SHIPPING: { label: 'Đang giao', className: 'bg-cyan-500/20 text-cyan-300' },
  DELIVERED: { label: 'Đã giao', className: 'bg-emerald-500/20 text-emerald-300' },
  CANCELLED: { label: 'Đã huỷ', className: 'bg-slate-500/20 text-slate-300' },
  RETURNED: { label: 'Đã hoàn trả', className: 'bg-slate-500/20 text-slate-300' },
}

const PLAYTIME_STATUS: Record<PlaytimeOrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Chờ thanh toán', className: 'bg-amber-500/20 text-amber-300' },
  PAID: { label: 'Đang xử lý', className: 'bg-blue-500/20 text-blue-300' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'bg-emerald-500/20 text-emerald-300' },
  USED: { label: 'Đã dùng vé', className: 'bg-slate-500/20 text-slate-300' },
  SUPPLY_FAILED: { label: 'Lỗi cấp vé', className: 'bg-red-500/20 text-red-300' },
  REFUND_PROCESSING: { label: 'Đang hoàn tiền', className: 'bg-amber-500/20 text-amber-300' },
  REFUNDED: { label: 'Đã hoàn tiền', className: 'bg-slate-500/20 text-slate-300' },
  EXPIRED: { label: 'Đã hết hạn', className: 'bg-slate-500/20 text-slate-300' },
}

function EmptyState({ ctaTo, ctaLabel }: { ctaTo: string; ctaLabel: string }) {
  return (
    <div className='flex flex-col items-center gap-2 py-16 text-white/60'>
      <Inbox className='h-8 w-8' /> Chưa có giao dịch nào
      <Link to={ctaTo} className='mt-2 jgame-gradient-text text-sm font-semibold'>{ctaLabel}</Link>
    </div>
  )
}

function OrderRow({ to, title, meta, subtitle, amount }: { to: string; title: string; meta: { label: string; className: string }; subtitle: string; amount: number }) {
  return (
    <Link to={to} className='flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10' data-qa={`row_view_${to.split('/').pop()}`}>
      <div>
        <div className='flex items-center gap-2'>
          <span className='font-semibold text-white'>{title}</span>
          <Badge className={cn('border-none', meta.className)}>{meta.label}</Badge>
        </div>
        <p className='mt-1 text-xs text-white/50'>{subtitle}</p>
      </div>
      <div className='flex items-center gap-2 text-right'>
        <span className='font-semibold text-white'>{amount === 0 ? 'Miễn phí' : formatCurrency(amount)}</span>
        <ChevronRight className='h-4 w-4 text-white/40' />
      </div>
    </Link>
  )
}

export function HistoryPage() {
  const { tab, setTab, cardOrders, accessoryOrders, playtimeOrders, loading } = useHistoryFetchData()

  return (
    <CustomerLayout>
      <h1 className='mb-6 text-xl font-bold text-white'>Lịch sử giao dịch</h1>

      <div className='mb-5 flex flex-wrap gap-2' data-qa='tab_loai_don'>
        {TABS.map(t => (
          <button
            key={t.key}
            type='button'
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium',
              tab === t.key ? 'jgame-gradient-brand border-transparent text-white' : 'border-white/20 text-white/70 hover:bg-white/10'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>}

      {!loading && tab === 'the-game' && (
        cardOrders.length === 0 ? <EmptyState ctaTo='/jgame/nap-the' ctaLabel='Nạp thẻ ngay' /> : (
          <div className='space-y-3'>
            {cardOrders.map(o => (
              <OrderRow key={o.id} to={`/jgame/ket-qua/${o.id}`} title={o.productName} meta={CARD_STATUS[o.status]} subtitle={`Mã đơn ${o.id} · ${formatDateTime(o.createdAt)}`} amount={o.totalAmount} />
            ))}
          </div>
        )
      )}

      {!loading && tab === 'phu-kien' && (
        accessoryOrders.length === 0 ? <EmptyState ctaTo='/jgame/phu-kien' ctaLabel='Khám phá phụ kiện ngay' /> : (
          <div className='space-y-3'>
            {accessoryOrders.map(o => (
              <OrderRow
                key={o.id}
                to={`/jgame/don-hang-phu-kien/${o.id}`}
                title={o.items.length === 1 ? o.items[0].productName : `${o.items[0].productName} +${o.items.length - 1} sản phẩm`}
                meta={ACCESSORY_STATUS[o.status]}
                subtitle={`Mã đơn ${o.id} · ${formatDateTime(o.createdAt)}`}
                amount={o.totalAmount}
              />
            ))}
          </div>
        )
      )}

      {!loading && tab === 've-gio-choi' && (
        playtimeOrders.length === 0 ? <EmptyState ctaTo='/jgame/cho-ve' ctaLabel='Săn vé giờ chơi ngay' /> : (
          <div className='space-y-3'>
            {playtimeOrders.map(o => (
              <OrderRow
                key={o.id}
                to={`/jgame/cho-ve/ket-qua/${o.id}`}
                title={`${o.shopName} — ${o.zoneName} · ${o.hours}h`}
                meta={PLAYTIME_STATUS[o.status]}
                subtitle={`Mã đơn ${o.id} · ${formatDateTime(o.createdAt)}`}
                amount={o.totalAmount}
              />
            ))}
          </div>
        )
      )}
    </CustomerLayout>
  )
}
