/**
 * PlaytimeOrderResultPage — Kết quả đặt vé: Thành công (CONFIRMED) hoặc Thất bại/Hết hạn (SC-P2-05).
 */
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, Copy, Clock3 } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { formatCurrency, formatDateTime } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { usePlaytimeOrderResult } from '../hooks/usePlaytimeOrderResult.page'

export const PAGE_ID = 'jgame-playtime-result'
export const PAGE_FEATURES = [{ label: 'Sao chép mã đổi vé', code: 'btn-copy-ma-ve' }]

export function PlaytimeOrderResultPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { order, loading } = usePlaytimeOrderResult(orderId)
  const [copied, setCopied] = useState(false)

  if (loading || !order) {
    return <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải kết quả...</div>
  }

  const handleCopy = async () => {
    if (!order.redeemCode) return
    await navigator.clipboard.writeText(order.redeemCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const isSuccess = order.status === 'CONFIRMED' || order.status === 'USED'

  return (
    <div className='mx-auto max-w-lg px-4 py-12 text-center sm:px-6'>
      {isSuccess ? (
        <>
          <CheckCircle2 className='mx-auto mb-4 h-14 w-14 text-emerald-400' />
          <h1 className='text-xl font-bold text-white'>{order.status === 'USED' ? 'Vé đã được sử dụng' : 'Đặt vé thành công!'}</h1>
          <p className='mt-1 text-sm text-white/60'>{order.shopName} — {order.zoneName} · {order.hours}h chơi — {order.totalAmount === 0 ? 'Miễn phí' : formatCurrency(order.totalAmount)}</p>
          <p className='mt-1 text-xs text-white/40'>Mã đơn {order.id} · Đặt lúc {formatDateTime(order.createdAt)}</p>

          {order.redeemCode && (
            <div className='mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-left'>
              <p className='text-sm text-white/60'>{order.status === 'USED' ? 'Mã đổi vé (đã dùng)' : 'Mã đổi vé — xuất trình tại quầy để nhận chỗ'}</p>
              <p className={cn('mt-2 text-center font-mono text-2xl font-bold tracking-widest', order.status === 'USED' ? 'text-white/40 line-through' : 'text-white')}>{order.redeemCode}</p>
              <Button variant='ghost' size='sm' className='mt-3 w-full text-white/70 hover:bg-white/10 hover:text-white' onClick={handleCopy} data-qa='btn_copy_ma_ve'>
                <Copy className='h-4 w-4 mr-1.5' /> {copied ? 'Đã sao chép!' : 'Sao chép mã đổi vé'}
              </Button>
              <p className='mt-2 text-center text-xs text-white/40'>Cấp lúc {formatDateTime(order.updatedAt)}</p>
            </div>
          )}

          <Link to='/jgame/lich-su' className='mt-6 inline-block jgame-gradient-text text-sm font-semibold'>Xem trong lịch sử giao dịch</Link>
        </>
      ) : (
        <>
          {order.status === 'EXPIRED' ? <Clock3 className='mx-auto mb-4 h-14 w-14 text-amber-400' /> : <XCircle className='mx-auto mb-4 h-14 w-14 text-red-400' />}
          <h1 className='text-xl font-bold text-white'>{order.status === 'EXPIRED' ? 'Đã hết hạn giữ chỗ' : 'Không thể xác nhận vé'}</h1>
          <p className='mt-1 text-sm text-white/60'>
            {order.status === 'EXPIRED'
              ? 'Bạn chưa thanh toán trong thời gian giữ chỗ — chỗ đã được hoàn lại cho gian hàng.'
              : 'Đã có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại hoặc liên hệ hỗ trợ.'}
          </p>
          <Link to={`/jgame/cho-ve/gian-hang/${order.shopId}`} className='mt-6 inline-block jgame-gradient-text text-sm font-semibold'>Quay lại gian hàng để đặt vé khác</Link>
        </>
      )}
    </div>
  )
}
