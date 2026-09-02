/**
 * AccessoryOrderTrackingPage — Theo dõi đơn hàng phụ kiện (SC-30).
 */
import { useParams } from 'react-router-dom'
import { Loader2, CheckCircle2, Package, Truck, Home, Clock3, XCircle } from 'lucide-react'
import { formatCurrency, formatDate, formatDateTime } from '../../../../../shared/utils/FormatUtils'
import { useAccessoryTracking } from '../hooks/useAccessoryTracking.page'
import { cn } from '../../../../../shared/components/ui/utils'
import type { AccessoryOrderStatus } from '../../../../Public/accessories/types/accessory.types'

export const PAGE_ID = 'jgame-accessory-tracking'

const TIMELINE_STEPS: { status: AccessoryOrderStatus; label: string; icon: typeof Clock3 }[] = [
  { status: 'PENDING', label: 'Chờ thanh toán', icon: Clock3 },
  { status: 'PAID', label: 'Đã thanh toán', icon: CheckCircle2 },
  { status: 'PACKING', label: 'Đang đóng gói', icon: Package },
  { status: 'SHIPPING', label: 'Đang giao hàng', icon: Truck },
  { status: 'DELIVERED', label: 'Đã giao hàng', icon: Home },
]

export function AccessoryOrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { order, loading, errorMessage } = useAccessoryTracking(orderId)

  if (loading || !order) {
    return <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> {errorMessage || 'Đang tải...'}</div>
  }

  const isCancelledOrReturned = order.status === 'CANCELLED' || order.status === 'RETURNED'
  const currentIndex = TIMELINE_STEPS.findIndex(s => s.status === order.status)

  return (
    <div className='mx-auto max-w-2xl px-4 py-10 sm:px-6'>
      <h1 className='mb-1 text-xl font-bold text-white'>Đơn hàng #{order.id}</h1>
      <p className='mb-6 text-sm text-white/50'>Đặt lúc {formatDateTime(order.createdAt)}</p>

      {isCancelledOrReturned ? (
        <div className='flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300'>
          <XCircle className='h-5 w-5 flex-shrink-0' /> Đơn hàng đã {order.status === 'CANCELLED' ? 'bị hủy' : 'được trả lại'}
        </div>
      ) : (
        <div className='rounded-2xl border border-white/10 bg-white/5 p-6'>
          <div className='relative flex items-start justify-between'>
            <div className='absolute left-0 right-0 top-[18px] -z-0 h-0.5 bg-white/10' />
            <div
              className='jgame-gradient-brand absolute left-0 top-[18px] -z-0 h-0.5 transition-all'
              style={{ width: `${(currentIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
            />
            {TIMELINE_STEPS.map((step, i) => {
              const done = i <= currentIndex
              const Icon = step.icon
              return (
                <div key={step.status} className='relative z-10 flex flex-1 flex-col items-center text-center'>
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-full', done ? 'jgame-gradient-brand text-white' : 'bg-[#150829] text-white/40 border border-white/10')}>
                    <Icon className='h-4 w-4' />
                  </div>
                  <p className={cn('mt-2 text-xs', done ? 'text-white' : 'text-white/40')}>{step.label}</p>
                </div>
              )
            })}
          </div>
          {order.trackingCode && (
            <p className='mt-6 text-center text-sm text-white/60'>Mã vận đơn: <span className='font-mono text-white'>{order.trackingCode}</span></p>
          )}
          {order.estimatedDeliveryAt && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'RETURNED' && (
            <p className='mt-2 text-center text-sm text-white/60' data-qa='txt_du_kien_giao'>
              Dự kiến giao: <span className='font-semibold text-white'>{formatDate(order.estimatedDeliveryAt)}</span>
              {order.estimatedDeliveryNote ? <span className='text-white/40'> ({order.estimatedDeliveryNote})</span> : null}
            </p>
          )}
        </div>
      )}

      <div className='mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5'>
        <h2 className='text-sm font-semibold text-white'>Sản phẩm</h2>
        {order.items.map(item => (
          <div key={item.productId} className='flex justify-between text-sm text-white/70'>
            <span>{item.productName} × {item.quantity}</span>
            <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className='flex justify-between border-t border-white/10 pt-2 text-sm text-white/60'>
          <span>Phí vận chuyển</span><span>{formatCurrency(order.shippingFee)}</span>
        </div>
        <div className='flex justify-between text-base font-bold text-white'>
          <span>Tổng cộng</span><span>{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      <div className='mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70'>
        <h2 className='mb-2 text-sm font-semibold text-white'>Giao đến</h2>
        <p>{order.shippingAddress.fullName} · {order.shippingAddress.phone}</p>
        <p>{order.shippingAddress.address}</p>
      </div>
    </div>
  )
}
