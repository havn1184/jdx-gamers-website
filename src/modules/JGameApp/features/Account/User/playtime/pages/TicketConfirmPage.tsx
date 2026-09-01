/**
 * TicketConfirmPage — Xác nhận đặt vé trước khi thanh toán (SC-P2-03).
 */
import { Link } from 'react-router-dom'
import { AlertCircle, Loader2, Ticket, Timer } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { ShopArt } from '../../../../../shared/components/ShopArt'
import { formatCurrency } from '../../../../../shared/utils/FormatUtils'
import { useTicketReserve } from '../hooks/useTicketReserve.page'
import { PaymentMethodSelector } from '../../wallet/components/PaymentMethodSelector'

export const PAGE_ID = 'jgame-playtime-confirm'
export const PAGE_FEATURES = [{ label: 'Xác nhận điều khoản', code: 'chk-dong-y-dieu-khoan' }, { label: 'Đặt vé ngay', code: 'btn-dat-ve-ngay' }]

export function TicketConfirmPage() {
  const { selection, agreedPolicy, setAgreedPolicy, paymentMethod, setPaymentMethod, wallet, submitting, errorMessage, handleReserve } = useTicketReserve()

  if (!selection) {
    return (
      <div className='mx-auto max-w-lg px-4 py-24 text-center text-white/60'>
        <Ticket className='mx-auto mb-3 h-10 w-10' />
        Chưa có vé nào được chọn. Vui lòng chọn vé từ Chợ vé.
        <div className='mt-4'>
          <Link to='/jgame/cho-ve' className='jgame-gradient-text font-semibold'>Về Chợ vé</Link>
        </div>
      </div>
    )
  }

  const { ticket, quantity } = selection
  const total = ticket.sellPrice * quantity

  return (
    <div className='mx-auto max-w-lg px-4 py-10 sm:px-6'>
      <h1 className='mb-6 text-xl font-bold text-white'>Xác nhận đặt vé</h1>

      <div className='rounded-2xl border border-white/10 bg-white/5 p-5'>
        <div className='flex items-center gap-4'>
          <ShopArt art={ticket.shopArt} imageUrl={ticket.shopImageUrl} label={ticket.shopName} className='h-16 w-16 flex-shrink-0 rounded-xl' />
          <div className='flex-1'>
            <h2 className='font-semibold text-white'>{ticket.shopName}</h2>
            <p className='text-sm text-white/60'>{ticket.zoneName} · {ticket.hours}h chơi</p>
          </div>
        </div>

        <div className='mt-4 flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300'>
          <Timer className='h-3.5 w-3.5' /> Chỗ được giữ trong 5 phút — vui lòng thanh toán trước khi hết hạn.
        </div>

        <div className='mt-5 space-y-2 border-t border-white/10 pt-4 text-sm'>
          <div className='flex justify-between text-white/60'><span>Đơn giá</span><span>{ticket.sellPrice === 0 ? 'Miễn phí' : formatCurrency(ticket.sellPrice)}</span></div>
          <div className='flex justify-between text-white/60'><span>Số lượng</span><span>{quantity}</span></div>
          <div className='flex justify-between text-base font-bold text-white'><span>Tổng tiền</span><span>{total === 0 ? 'Miễn phí' : formatCurrency(total)}</span></div>
        </div>

        {total > 0 && <PaymentMethodSelector vndBalance={wallet.vndBalance} jcoinBalance={wallet.jcoinBalance} total={total} value={paymentMethod} onChange={setPaymentMethod} />}

        <label className='mt-5 flex cursor-pointer items-start gap-2 text-sm text-white/70'>
          <input type='checkbox' className='mt-0.5' checked={agreedPolicy} onChange={e => setAgreedPolicy(e.target.checked)} data-qa='chk_dong_y_dieu_khoan' />
          Tôi đồng ý với điều khoản đặt vé và chính sách sử dụng của {ticket.shopName}
        </label>

        {errorMessage && (
          <div className='mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
          </div>
        )}

        <Button className='jgame-btn-primary mt-5 w-full text-white' size='lg' disabled={!agreedPolicy || paymentMethod === null || submitting} onClick={handleReserve} data-qa='btn_dat_ve_ngay'>
          {submitting ? <Loader2 className='h-4 w-4 animate-spin mr-1.5' /> : null}
          {total === 0 ? 'Nhận vé miễn phí' : 'Thanh toán'}
        </Button>
      </div>
    </div>
  )
}
