/**
 * PaymentMethodSelector — chọn ví VND/JCoin để thanh toán, dùng chung ở 3 luồng thanh toán
 * (Nạp thẻ/Vé giờ chơi/Phụ kiện). Disable lựa chọn không đủ số dư cho tổng tiền đơn
 * (nc_vi-2-loai-tien-thanh-toan.md — thay JcoinPayToggle, không còn thanh toán 1 phần).
 */
import { Wallet, Coins } from 'lucide-react'
import { formatCurrency, formatNumber } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { PaymentMethod } from '../../../../Public/wallet/types/wallet.types'

interface PaymentMethodSelectorProps {
  vndBalance: number
  jcoinBalance: number
  total: number
  value: PaymentMethod | null
  onChange: (method: PaymentMethod) => void
}

export function PaymentMethodSelector({ vndBalance, jcoinBalance, total, value, onChange }: PaymentMethodSelectorProps) {
  const options = [
    { method: PaymentMethod.Vnd, label: 'Ví VND', balance: vndBalance, balanceLabel: formatCurrency(vndBalance), icon: Wallet },
    { method: PaymentMethod.Jcoin, label: 'Ví JCoin', balance: jcoinBalance, balanceLabel: `${formatNumber(jcoinBalance)} JCoin`, icon: Coins },
  ]

  return (
    <div className='mt-4 space-y-2'>
      <p className='text-sm font-medium text-white/80'>Phương thức thanh toán</p>
      {options.map(opt => {
        const sufficient = opt.balance >= total && total > 0
        const selected = value === opt.method && sufficient
        const Icon = opt.icon
        return (
          <label
            key={opt.method}
            className={cn(
              'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm',
              sufficient ? 'cursor-pointer' : 'cursor-not-allowed opacity-60',
              selected ? 'border-amber-400/50 bg-amber-500/5' : 'border-white/10'
            )}
          >
            <input
              type='radio'
              name='payment-method'
              className='mt-0.5'
              checked={selected}
              disabled={!sufficient}
              onChange={() => onChange(opt.method)}
              data-qa={`radio_thanh_toan_${opt.method === PaymentMethod.Vnd ? 'vnd' : 'jcoin'}`}
            />
            <span className='flex-1'>
              <span className='flex items-center gap-1.5 font-medium text-white/90'><Icon className='h-4 w-4 text-amber-300' /> {opt.label}</span>
              <span className='block text-xs text-white/50'>Số dư: {opt.balanceLabel}{!sufficient && total > 0 && ' — không đủ để thanh toán đơn này'}</span>
            </span>
          </label>
        )
      })}
    </div>
  )
}
