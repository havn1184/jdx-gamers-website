/**
 * OrderConfirmPage — Xác nhận đơn hàng trước khi thanh toán (SC-03).
 */
import { Link } from 'react-router-dom'
import { AlertCircle, Loader2, ShoppingBag } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { CardArt } from '../../../../../shared/components/CardArt'
import { JcoinPayToggle } from '../../tasks/components/JcoinPayToggle'
import { formatCurrency } from '../../../../../shared/utils/FormatUtils'
import { useOrderConfirm } from '../hooks/useOrderConfirm.page'

export const PAGE_ID = 'jgame-order-confirm'
export const PAGE_FEATURES = [{ label: 'Xác nhận điều khoản', code: 'chk-dong-y-dieu-khoan' }, { label: 'Thanh toán', code: 'btn-thanh-toan' }]

export function OrderConfirmPage() {
  const { selection, agreedPolicy, setAgreedPolicy, useJcoin, setUseJcoin, jcoinBalance, submitting, errorMessage, handlePay } = useOrderConfirm()

  if (!selection) {
    return (
      <div className='mx-auto max-w-lg px-4 py-24 text-center text-white/60'>
        <ShoppingBag className='mx-auto mb-3 h-10 w-10' />
        Chưa có lựa chọn nào. Vui lòng chọn thẻ từ trang danh mục.
        <div className='mt-4'>
          <Link to='/jgame/nap-the' className='jgame-gradient-text font-semibold'>Đến trang Nạp thẻ game</Link>
        </div>
      </div>
    )
  }

  const total = selection.denomination.sellPrice * selection.quantity

  return (
    <div className='mx-auto max-w-lg px-4 py-10 sm:px-6'>
      <h1 className='mb-6 text-xl font-bold text-white'>Xác nhận đơn hàng</h1>

      <div className='rounded-2xl border border-white/10 bg-white/5 p-5'>
        <div className='flex items-center gap-4'>
          <CardArt art={selection.product.art} imageUrl={selection.product.imageUrl} label={selection.product.supplierName} className='h-16 w-16 flex-shrink-0 rounded-xl' />
          <div className='flex-1'>
            <h2 className='font-semibold text-white'>{selection.product.name}</h2>
            <p className='text-sm text-white/60'>Mệnh giá {formatCurrency(selection.denomination.faceValue)} × {selection.quantity}</p>
          </div>
        </div>

        <div className='mt-5 space-y-2 border-t border-white/10 pt-4 text-sm'>
          <div className='flex justify-between text-white/60'><span>Đơn giá</span><span>{formatCurrency(selection.denomination.sellPrice)}</span></div>
          <div className='flex justify-between text-white/60'><span>Số lượng</span><span>{selection.quantity}</span></div>
          <div className='flex justify-between text-base font-bold text-white'><span>Tổng tiền</span><span>{formatCurrency(total)}</span></div>
        </div>

        <JcoinPayToggle balance={jcoinBalance} total={total} checked={useJcoin} onChange={setUseJcoin} />

        <label className='mt-5 flex cursor-pointer items-start gap-2 text-sm text-white/70'>
          <input
            type='checkbox'
            className='mt-0.5'
            checked={agreedPolicy}
            onChange={e => setAgreedPolicy(e.target.checked)}
            data-qa='chk_dong_y_dieu_khoan'
          />
          Tôi đồng ý với điều khoản giao dịch và chính sách đổi trả của {selection.product.supplierName}
        </label>

        {errorMessage && (
          <div className='mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
          </div>
        )}

        <Button
          className='jgame-btn-primary mt-5 w-full text-white'
          size='lg'
          disabled={!agreedPolicy || submitting}
          onClick={handlePay}
          data-qa='btn_thanh_toan'
        >
          {submitting ? <Loader2 className='h-4 w-4 animate-spin mr-1.5' /> : null}
          Thanh toán
        </Button>
      </div>
    </div>
  )
}
