/**
 * PaymentQrPage — Thanh toán mã QR (SC-05). QR là hình mô phỏng (mock), không quét thật được.
 */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, Loader2, QrCode, Timer } from 'lucide-react'
import { usePaymentStatus } from '../hooks/usePaymentStatus.page'

export const PAGE_ID = 'jgame-payment'

/** Sinh lưới ô vuông giả QR từ 1 chuỗi — chỉ để trang trí, không phải QR thật. */
function MockQrGrid({ seed }: { seed: string }) {
  const size = 12
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0

  const cells = Array.from({ length: size * size }, () => {
    hash = (hash * 1103515245 + 12345) >>> 0
    return (hash >> 16) % 3 !== 0
  })

  return (
    <div className='grid gap-[2px] rounded-lg bg-white p-3' style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, width: 220, height: 220 }}>
      {cells.map((filled, i) => (
        <div key={i} className={filled ? 'bg-[#150829]' : 'bg-white'} />
      ))}
    </div>
  )
}

function useCountdown(expiredAt: string | undefined) {
  const [remaining, setRemaining] = useState(0)
  useEffect(() => {
    if (!expiredAt) return
    const tick = () => setRemaining(Math.max(0, Math.floor((new Date(expiredAt).getTime() - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiredAt])
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  return { remaining, label: `${mm}:${ss}` }
}

export function PaymentQrPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { payment, status, loading, errorMessage } = usePaymentStatus(orderId)
  const { remaining, label } = useCountdown(payment?.expiredAt)

  if (loading) {
    return <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang khởi tạo thanh toán...</div>
  }
  if (errorMessage || !payment) {
    return <div className='py-24 text-center text-white/60'>{errorMessage || 'Không tìm thấy đơn hàng'}</div>
  }

  if (status === 'PAID') {
    return (
      <div className='mx-auto max-w-md px-4 py-10 text-center sm:px-6'>
        <h1 className='mb-1 text-xl font-bold text-white'>Đã nhận thanh toán</h1>
        <p className='mb-6 text-sm text-white/60'>Đơn hàng của bạn đang được xử lý</p>
        <div className='flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-8'>
          <CheckCircle2 className='h-12 w-12 text-emerald-400' />
          <div className='flex items-center gap-2 text-sm text-white/70'>
            <Loader2 className='h-4 w-4 animate-spin' /> Đang cấp mã thẻ...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-md px-4 py-10 text-center sm:px-6'>
      <h1 className='mb-1 text-xl font-bold text-white'>Quét mã để thanh toán</h1>
      <p className='mb-6 text-sm text-white/60'>Sử dụng app ngân hàng hoặc ví điện tử</p>

      <div className='flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6'>
        <MockQrGrid seed={payment.qrCode} />
        <p className='text-xs text-white/40'>(Mã QR mô phỏng — chưa kết nối jPay thật)</p>

        <div className='flex items-center gap-1.5 text-sm text-amber-300'>
          <Timer className='h-4 w-4' /> Hết hạn sau {label}
        </div>

        <div className='flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm text-white/70'>
          <QrCode className='h-4 w-4' />
          {remaining > 0 ? 'Đang chờ thanh toán...' : 'Đã hết hạn'}
        </div>
      </div>
    </div>
  )
}
