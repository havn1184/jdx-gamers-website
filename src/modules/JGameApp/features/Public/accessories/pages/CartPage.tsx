/**
 * CartPage — Giỏ hàng phụ kiện (SC-28).
 */
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { AccessoryArt } from '../components/AccessoryArt'
import { formatCurrency } from '../../../../shared/utils/FormatUtils'
import { useCartPage } from '../hooks/useCartPage'

export const PAGE_ID = 'jgame-cart'
export const PAGE_FEATURES = [{ label: 'Cập nhật số lượng', code: 'btn-cap-nhat-so-luong' }, { label: 'Xóa sản phẩm', code: 'btn-xoa-san-pham' }, { label: 'Thanh toán', code: 'btn-thanh-toan' }]

export function CartPage() {
  const navigate = useNavigate()
  const { detailedItems, totalAmount, updateQuantity, removeItem, isEmpty } = useCartPage()

  if (isEmpty) {
    return (
      <div className='mx-auto max-w-lg px-4 py-24 text-center text-white/60'>
        <ShoppingBag className='mx-auto mb-3 h-10 w-10' />
        Giỏ hàng trống.
        <div className='mt-4'><Link to='/jgame/phu-kien' className='jgame-gradient-text font-semibold'>Xem kho phụ kiện</Link></div>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-3xl px-4 py-10 sm:px-6'>
      <h1 className='mb-6 text-xl font-bold text-white'>Giỏ hàng ({detailedItems.length} sản phẩm)</h1>

      <div className='space-y-3'>
        {detailedItems.map(({ product, quantity, lineTotal }) => (
          <div key={product.id} className='flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4'>
            <AccessoryArt art={product.art} imageUrl={product.imageUrl} label='' className='h-16 w-16 flex-shrink-0 rounded-lg' />
            <div className='min-w-0 flex-1'>
              <p className='truncate font-medium text-white'>{product.name}</p>
              <p className='text-sm text-white/50'>{formatCurrency(product.price)}</p>
            </div>
            <div className='flex items-center rounded-lg border border-white/20'>
              <button type='button' className='p-1.5 text-white/70 hover:text-white' onClick={() => updateQuantity(product.id, quantity - 1)} data-qa={`btn_giam_${product.id}`}>
                <Minus className='h-3.5 w-3.5' />
              </button>
              <span className='w-8 text-center text-sm text-white'>{quantity}</span>
              <button type='button' className='p-1.5 text-white/70 hover:text-white' onClick={() => updateQuantity(product.id, quantity + 1)} data-qa={`btn_tang_${product.id}`}>
                <Plus className='h-3.5 w-3.5' />
              </button>
            </div>
            <p className='w-28 flex-shrink-0 text-right font-semibold text-white'>{formatCurrency(lineTotal)}</p>
            <button type='button' className='flex-shrink-0 text-white/40 hover:text-red-400' onClick={() => removeItem(product.id)} data-qa={`btn_xoa_${product.id}`}>
              <Trash2 className='h-4 w-4' />
            </button>
          </div>
        ))}
      </div>

      <div className='mt-6 flex items-center justify-between rounded-xl bg-white/5 p-4'>
        <span className='text-white/60'>Tạm tính</span>
        <span className='text-xl font-bold text-white'>{formatCurrency(totalAmount)}</span>
      </div>

      <Button className='jgame-btn-primary mt-4 w-full text-white' size='lg' onClick={() => navigate('/jgame/thanh-toan-phu-kien')} data-qa='btn_thanh_toan'>
        Tiến hành thanh toán
      </Button>
    </div>
  )
}
