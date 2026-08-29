/**
 * CardDetailPage — Chi tiết loại thẻ & chọn mệnh giá (SC-02).
 */
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronDown, Loader2, AlertCircle, Minus, Plus } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { CardArt } from '../../../../shared/components/CardArt'
import { formatCurrency } from '../../../../shared/utils/FormatUtils'
import { useCardDetailFetchData } from '../hooks/useCardDetail.page.fetchData'
import { cn } from '../../../../shared/components/ui/utils'

export const PAGE_ID = 'jgame-card-detail'
export const PAGE_FEATURES = [
  { label: 'Chọn mệnh giá', code: 'btn-chon-menh-gia' },
  { label: 'Xem điều khoản', code: 'btn-xem-dieu-khoan' },
  { label: 'Mua ngay', code: 'btn-mua-ngay' },
]

export function CardDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const [policyOpen, setPolicyOpen] = useState(false)
  const {
    product, loading, errorMessage,
    selectedDenomination, setSelectedDenomination,
    quantity, setQuantity,
    agreedPolicy, setAgreedPolicy,
    handleBuyNow,
  } = useCardDetailFetchData(productId)

  if (loading) {
    return <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
  }
  if (errorMessage || !product) {
    return (
      <div className='flex flex-col items-center gap-2 py-24 text-white/60'>
        <AlertCircle className='h-8 w-8 text-red-400' />
        {errorMessage || 'Không tìm thấy loại thẻ'}
      </div>
    )
  }

  const total = (selectedDenomination?.sellPrice ?? 0) * quantity
  const canBuy = Boolean(selectedDenomination) && agreedPolicy && (selectedDenomination?.stockQuantity ?? 1) !== 0

  return (
    <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6'>
      <Link to='/jgame/nap-the' className='mb-6 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white'>
        <ChevronLeft className='h-4 w-4' /> Quay lại danh mục
      </Link>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <CardArt art={product.art} imageUrl={product.imageUrl} label={product.supplierName} className='aspect-square w-full rounded-2xl' />

        <div>
          <h1 className='text-2xl font-bold text-white'>{product.name}</h1>
          <p className='mt-2 text-sm text-white/60'>{product.description}</p>

          <div className='mt-6 space-y-1.5'>
            <label className='text-sm font-medium text-white/80'>Chọn mệnh giá</label>
            <div className='grid grid-cols-3 gap-2 sm:grid-cols-4' data-qa='btn_chon_menh_gia'>
              {product.denominations.map(d => {
                const outOfStock = d.stockQuantity === 0
                return (
                  <button
                    key={d.id}
                    type='button'
                    disabled={outOfStock}
                    data-selected={selectedDenomination?.id === d.id}
                    data-disabled={outOfStock}
                    className={cn(
                      'jgame-chip flex flex-col items-center justify-center gap-0.5 bg-white/5 px-2 py-3',
                      selectedDenomination?.id === d.id ? 'text-[#150829]' : 'text-white'
                    )}
                    onClick={() => setSelectedDenomination(d)}
                  >
                    <span className='text-sm font-semibold'>{formatCurrency(d.faceValue)}</span>
                    {outOfStock && <span className='text-[10px] text-red-300'>Tạm hết</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div className='mt-5 flex items-center gap-3'>
            <label className='text-sm font-medium text-white/80'>Số lượng</label>
            <div className='flex items-center rounded-lg border border-white/20'>
              <button type='button' className='p-2 text-white/70 hover:text-white' onClick={() => setQuantity(q => Math.max(1, q - 1))} data-qa='btn_giam_so_luong'>
                <Minus className='h-4 w-4' />
              </button>
              <span className='w-10 text-center text-sm font-semibold text-white'>{quantity}</span>
              <button type='button' className='p-2 text-white/70 hover:text-white' onClick={() => setQuantity(q => Math.min(10, q + 1))} data-qa='btn_tang_so_luong'>
                <Plus className='h-4 w-4' />
              </button>
            </div>
          </div>

          <div className='mt-6 rounded-xl border border-white/10'>
            <button
              type='button'
              className='flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-white/80'
              onClick={() => setPolicyOpen(v => !v)}
              data-qa='btn_xem_dieu_khoan'
            >
              Điều khoản sử dụng & chính sách đổi trả
              <ChevronDown className={cn('h-4 w-4 transition-transform', policyOpen && 'rotate-180')} />
            </button>
            {policyOpen && (
              <div className='border-t border-white/10 px-4 py-3 text-sm leading-relaxed text-white/60'>
                {product.policyText}
              </div>
            )}
          </div>

          <label className='mt-4 flex cursor-pointer items-start gap-2 text-sm text-white/70'>
            <input
              type='checkbox'
              className='mt-0.5'
              checked={agreedPolicy}
              onChange={e => setAgreedPolicy(e.target.checked)}
              data-qa='chk_dong_y_dieu_khoan'
            />
            Tôi đã đọc và đồng ý với điều khoản sử dụng thẻ
          </label>

          <div className='mt-6 flex items-center justify-between rounded-xl bg-white/5 p-4'>
            <span className='text-sm text-white/60'>Tổng tiền</span>
            <span className='text-xl font-bold text-white'>{formatCurrency(total)}</span>
          </div>

          <Button
            className='jgame-btn-primary mt-4 w-full text-white'
            size='lg'
            disabled={!canBuy}
            onClick={handleBuyNow}
            data-qa='btn_mua_ngay'
          >
            Mua ngay
          </Button>
        </div>
      </div>
    </div>
  )
}
