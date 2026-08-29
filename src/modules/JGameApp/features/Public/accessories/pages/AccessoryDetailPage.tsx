/**
 * AccessoryDetailPage — Chi tiết sản phẩm phụ kiện (SC-27).
 */
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Loader2, AlertCircle, Minus, Plus, ShoppingCart } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { AccessoryArt } from '../components/AccessoryArt'
import { formatCurrency } from '../../../../shared/utils/FormatUtils'
import { useAccessoryDetailFetchData } from '../hooks/useAccessoryDetail.page.fetchData'

export const PAGE_ID = 'jgame-accessory-detail'
export const PAGE_FEATURES = [{ label: 'Thêm vào giỏ', code: 'btn-them-vao-gio' }, { label: 'Mua ngay', code: 'btn-mua-ngay' }]

export function AccessoryDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const { product, loading, errorMessage, quantity, setQuantity, handleAddToCart, handleBuyNow } = useAccessoryDetailFetchData(productId)

  if (loading) return <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
  if (errorMessage || !product) {
    return <div className='flex flex-col items-center gap-2 py-24 text-white/60'><AlertCircle className='h-8 w-8 text-red-400' />{errorMessage || 'Không tìm thấy sản phẩm'}</div>
  }

  const outOfStock = product.stockQuantity === 0

  return (
    <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6'>
      <Link to='/jgame/phu-kien' className='mb-6 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white'>
        <ChevronLeft className='h-4 w-4' /> Quay lại kho phụ kiện
      </Link>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <AccessoryArt art={product.art} imageUrl={product.imageUrl} label={product.brand} className='aspect-square w-full rounded-2xl' />

        <div>
          <p className='text-sm text-white/50'>{product.brand}</p>
          <h1 className='mt-1 text-2xl font-bold text-white'>{product.name}</h1>
          <p className='mt-2 text-sm text-white/60'>{product.specs}</p>
          <p className='mt-4 text-2xl font-bold text-white'>{formatCurrency(product.price)}</p>

          <p className='mt-2 text-sm'>
            {outOfStock ? <span className='text-red-400'>Tạm hết hàng</span> : <span className='text-emerald-400'>Còn {product.stockQuantity} sản phẩm</span>}
          </p>

          <div className='mt-5 flex items-center gap-3'>
            <label className='text-sm font-medium text-white/80'>Số lượng</label>
            <div className='flex items-center rounded-lg border border-white/20'>
              <button type='button' className='p-2 text-white/70 hover:text-white' onClick={() => setQuantity(q => Math.max(1, q - 1))} data-qa='btn_giam_so_luong'>
                <Minus className='h-4 w-4' />
              </button>
              <span className='w-10 text-center text-sm font-semibold text-white'>{quantity}</span>
              <button type='button' className='p-2 text-white/70 hover:text-white' onClick={() => setQuantity(q => Math.min(product.stockQuantity || 1, q + 1))} data-qa='btn_tang_so_luong'>
                <Plus className='h-4 w-4' />
              </button>
            </div>
          </div>

          <div className='mt-6 flex gap-3'>
            <Button variant='outline' className='flex-1 border-white/20 text-white hover:bg-white/10' disabled={outOfStock} onClick={handleAddToCart} data-qa='btn_them_vao_gio'>
              <ShoppingCart className='h-4 w-4 mr-1.5' /> Thêm vào giỏ
            </Button>
            <Button className='jgame-btn-primary flex-1 text-white' disabled={outOfStock} onClick={handleBuyNow} data-qa='btn_mua_ngay'>
              Mua ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
