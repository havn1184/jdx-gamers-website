/**
 * JcoinPayToggle — Tuỳ chọn "Thanh toán bằng JCoin" dùng chung ở 3 luồng thanh toán
 * (Nạp thẻ/Vé giờ chơi/Phụ kiện). Chỉ cho bật khi số dư đủ trả toàn bộ đơn hàng.
 */
import { Coins } from 'lucide-react'
import { formatNumber } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'

interface JcoinPayToggleProps {
  balance: number
  total: number
  checked: boolean
  onChange: (checked: boolean) => void
}

export function JcoinPayToggle({ balance, total, checked, onChange }: JcoinPayToggleProps) {
  const sufficient = balance >= total && total > 0

  return (
    <label className={cn('mt-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm', sufficient ? 'cursor-pointer border-amber-400/30 bg-amber-500/5 text-white/80' : 'cursor-not-allowed border-white/10 text-white/40')}>
      <input
        type='checkbox'
        className='mt-0.5'
        checked={checked && sufficient}
        disabled={!sufficient}
        onChange={e => onChange(e.target.checked)}
        data-qa='chk_dung_jcoin'
      />
      <span className='flex-1'>
        <span className='flex items-center gap-1.5 font-medium text-amber-300'><Coins className='h-4 w-4' /> Thanh toán bằng JCoin</span>
        <span className='block text-xs'>Số dư: {formatNumber(balance)} JCoin{!sufficient && ' — không đủ để thanh toán toàn bộ đơn này'}</span>
      </span>
    </label>
  )
}
