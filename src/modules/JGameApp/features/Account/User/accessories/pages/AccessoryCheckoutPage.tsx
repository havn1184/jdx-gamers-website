/**
 * AccessoryCheckoutPage — Checkout phụ kiện: địa chỉ + vận chuyển + thanh toán (SC-29).
 */
import { AlertCircle, Loader2, Truck } from 'lucide-react'
import { Input } from '../../../../../shared/components/ui/input'
import { Button } from '../../../../../shared/components/ui/button'
import { formatCurrency } from '../../../../../shared/utils/FormatUtils'
import { useAccessoryCheckout } from '../hooks/useAccessoryCheckout.page'
import { JcoinPayToggle } from '../../tasks/components/JcoinPayToggle'
import { cn } from '../../../../../shared/components/ui/utils'

export const PAGE_ID = 'jgame-accessory-checkout'
export const PAGE_FEATURES = [{ label: 'Chọn vận chuyển', code: 'btn-chon-van-chuyen' }, { label: 'Đặt hàng', code: 'btn-dat-hang' }]

export function AccessoryCheckoutPage() {
  const {
    items, totalAmount, shippingMethods, shippingMethodId, setShippingMethodId,
    address, setAddress, shippingFee, grandTotal, useJcoin, setUseJcoin, jcoinBalance, submitting, errorMessage, handleSubmit,
  } = useAccessoryCheckout()

  return (
    <div className='mx-auto max-w-2xl px-4 py-10 sm:px-6'>
      <h1 className='mb-6 text-xl font-bold text-white'>Thanh toán ({items.length} sản phẩm)</h1>

      <div className='space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5'>
        <h2 className='text-sm font-semibold text-white'>Địa chỉ giao hàng</h2>
        <div className='grid grid-cols-2 gap-3'>
          <Input placeholder='Họ tên người nhận' value={address.fullName} onChange={e => setAddress(p => ({ ...p, fullName: e.target.value }))} data-qa='i_ho_ten' />
          <Input placeholder='Số điện thoại' value={address.phone} onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))} data-qa='i_sdt' />
        </div>
        <Input placeholder='Địa chỉ chi tiết' value={address.address} onChange={e => setAddress(p => ({ ...p, address: e.target.value }))} data-qa='i_dia_chi' />
      </div>

      <div className='mt-5 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-5' data-qa='btn_chon_van_chuyen'>
        <h2 className='mb-1 flex items-center gap-1.5 text-sm font-semibold text-white'><Truck className='h-4 w-4' /> Đơn vị vận chuyển</h2>
        {shippingMethods.map(m => (
          <label
            key={m.id}
            className={cn('flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm', shippingMethodId === m.id ? 'border-white bg-white/10' : 'border-white/10')}
          >
            <span className='flex items-center gap-2 text-white/80'>
              <input type='radio' checked={shippingMethodId === m.id} onChange={() => setShippingMethodId(m.id)} />
              {m.name} <span className='text-white/40'>({m.etaDays})</span>
            </span>
            <span className='font-medium text-white'>{m.fee === 0 ? 'Miễn phí' : formatCurrency(m.fee)}</span>
          </label>
        ))}
      </div>

      <div className='mt-5 space-y-1.5 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm'>
        <div className='flex justify-between text-white/60'><span>Tiền hàng</span><span>{formatCurrency(totalAmount)}</span></div>
        <div className='flex justify-between text-white/60'><span>Phí vận chuyển</span><span>{formatCurrency(shippingFee)}</span></div>
        <div className='flex justify-between border-t border-white/10 pt-2 text-base font-bold text-white'><span>Tổng cộng</span><span>{formatCurrency(grandTotal)}</span></div>
      </div>

      {grandTotal > 0 && <JcoinPayToggle balance={jcoinBalance} total={grandTotal} checked={useJcoin} onChange={setUseJcoin} />}

      {errorMessage && (
        <div className='mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
          <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
        </div>
      )}

      <Button className='jgame-btn-primary mt-5 w-full text-white' size='lg' disabled={submitting} onClick={handleSubmit} data-qa='btn_dat_hang'>
        {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Đặt hàng
      </Button>
    </div>
  )
}
