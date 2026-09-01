/**
 * AccessoryDetailPage — Chi tiết sản phẩm phụ kiện (SC-27).
 */
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronLeft, Loader2, AlertCircle, Minus, Plus, ShoppingCart, Star, Truck, ShieldCheck,
  RotateCcw, CheckCircle2,
} from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { AccessoryArt } from '../components/AccessoryArt'
import { formatCurrency } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { useAccessoryDetailFetchData } from '../hooks/useAccessoryDetail.page.fetchData'

function formatSold(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`
}

export const PAGE_ID = 'jgame-accessory-detail'
export const PAGE_FEATURES = [{ label: 'Thêm vào giỏ', code: 'btn-them-vao-gio' }, { label: 'Mua ngay', code: 'btn-mua-ngay' }]

export function AccessoryDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const { product, loading, errorMessage, quantity, setQuantity, handleAddToCart, handleBuyNow } = useAccessoryDetailFetchData(productId)
  const [activeImage, setActiveImage] = useState(0)

  if (loading) return <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
  if (errorMessage || !product) {
    return <div className='flex flex-col items-center gap-2 py-24 text-white/60'><AlertCircle className='h-8 w-8 text-red-400' />{errorMessage || 'Không tìm thấy sản phẩm'}</div>
  }

  const outOfStock = product.stockQuantity === 0
  const gallery = product.galleryImages.length > 0 ? product.galleryImages : [product.imageUrl]

  return (
    <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6'>
      <Link to='/jgame/phu-kien' className='mb-6 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white'>
        <ChevronLeft className='h-4 w-4' /> Quay lại kho phụ kiện
      </Link>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <div>
          <AccessoryArt art={product.art} imageUrl={gallery[activeImage]} label={product.brand} className='aspect-square w-full rounded-2xl' />
          {gallery.length > 1 && (
            <div className='mt-3 grid grid-cols-5 gap-2'>
              {gallery.map((img, idx) => (
                <button
                  key={img + idx}
                  type='button'
                  onClick={() => setActiveImage(idx)}
                  className={cn('overflow-hidden rounded-lg border-2', activeImage === idx ? 'border-purple-400' : 'border-transparent opacity-70 hover:opacity-100')}
                  data-qa={`btn_gallery_${idx}`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} loading='lazy' className='aspect-square w-full object-cover' />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className='text-sm text-white/50'>{product.brand} <span className='text-white/30'>· Mã SP: {product.sku}</span></p>
          <h1 className='mt-1 text-2xl font-bold text-white'>{product.name}</h1>

          {(product.rating > 0 || product.soldCount > 0) && (
            <div className='mt-2 flex items-center gap-2 text-sm text-white/70'>
              {product.rating > 0 && (
                <span className='flex items-center gap-1'>
                  <Star className='h-4 w-4 fill-amber-400 text-amber-400' />
                  <span className='font-semibold text-white'>{product.rating.toFixed(1)}</span>
                  {product.reviewCount > 0 && <span>({product.reviewCount} đánh giá)</span>}
                </span>
              )}
              {product.rating > 0 && product.soldCount > 0 && <span className='h-3 w-px bg-white/20' />}
              {product.soldCount > 0 && <span>Đã bán {formatSold(product.soldCount)}</span>}
            </div>
          )}

          <p className='mt-2 text-sm text-white/60'>{product.specs}</p>

          <div className='mt-4 flex items-end gap-3'>
            <p className='text-2xl font-bold text-white'>{formatCurrency(product.price)}</p>
            {!!product.originalPrice && product.originalPrice > product.price && (
              <>
                <p className='pb-0.5 text-sm text-white/40 line-through'>{formatCurrency(product.originalPrice)}</p>
                <span className='rounded bg-red-500/90 px-1.5 py-0.5 text-xs font-bold text-white'>
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          <p className='mt-2 text-sm'>
            {outOfStock ? <span className='text-red-400'>Tạm hết hàng</span> : <span className='text-emerald-400'>Còn {product.stockQuantity} sản phẩm</span>}
          </p>

          {!!product.highlights?.length && (
            <ul className='mt-4 space-y-1.5 rounded-xl border border-white/10 bg-white/5 p-4'>
              {product.highlights.map((h, idx) => (
                <li key={idx} className='flex items-start gap-2 text-sm text-white/80'>
                  <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-emerald-400' />
                  {h}
                </li>
              ))}
            </ul>
          )}

          <div className='mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-white/5 py-3 text-center'>
            <div className='flex flex-col items-center gap-1 px-2'>
              <ShieldCheck className='h-5 w-5 text-purple-300' />
              <span className='text-xs text-white/50'>Bảo hành</span>
              <span className='text-xs font-semibold text-white'>{product.warrantyMonths ? `${product.warrantyMonths} tháng` : 'Chính hãng'}</span>
            </div>
            <div className='flex flex-col items-center gap-1 px-2'>
              <Truck className='h-5 w-5 text-purple-300' />
              <span className='text-xs text-white/50'>Vận chuyển</span>
              <span className='text-xs font-semibold text-white'>Toàn quốc</span>
            </div>
            <div className='flex flex-col items-center gap-1 px-2'>
              <RotateCcw className='h-5 w-5 text-purple-300' />
              <span className='text-xs text-white/50'>Đổi trả</span>
              <span className='text-xs font-semibold text-white'>Trong 7 ngày</span>
            </div>
          </div>

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
            <Button variant='outline' className='flex-1 border-white/20 bg-transparent text-white hover:bg-white/10' disabled={outOfStock} onClick={handleAddToCart} data-qa='btn_them_vao_gio'>
              <ShoppingCart className='h-4 w-4 mr-1.5' /> Thêm vào giỏ
            </Button>
            <Button className='jgame-btn-primary flex-1 text-white' disabled={outOfStock} onClick={handleBuyNow} data-qa='btn_mua_ngay'>
              Mua ngay
            </Button>
          </div>
        </div>
      </div>

      {!!product.description && (
        <div className='mt-10 rounded-2xl border border-white/10 bg-white/5 p-6'>
          <h2 className='text-lg font-bold text-white'>Mô tả sản phẩm</h2>
          <p className='mt-3 whitespace-pre-line text-sm leading-relaxed text-white/70'>{product.description}</p>
        </div>
      )}

      {!!product.specifications?.length && (
        <div className='mt-6 overflow-hidden rounded-2xl border border-white/10'>
          <h2 className='bg-white/5 px-6 py-4 text-lg font-bold text-white'>Thông số kỹ thuật</h2>
          <table className='w-full text-sm'>
            <tbody>
              {product.specifications.map((spec, idx) => (
                <tr key={spec.label} className={idx % 2 === 0 ? 'bg-white/[0.03]' : 'bg-transparent'}>
                  <td className='w-40 px-6 py-3 text-white/50'>{spec.label}</td>
                  <td className='px-6 py-3 font-medium text-white'>{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!!product.reviews?.length && (
        <div className='mt-6 rounded-2xl border border-white/10 bg-white/5 p-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-bold text-white'>Đánh giá sản phẩm</h2>
            <span className='flex items-center gap-1 text-sm text-white/70'>
              <Star className='h-4 w-4 fill-amber-400 text-amber-400' />
              <span className='font-semibold text-white'>{product.rating.toFixed(1)}</span> ({product.reviewCount})
            </span>
          </div>
          <div className='mt-4 divide-y divide-white/10'>
            {product.reviews.map((review, idx) => (
              <div key={idx} className='flex items-start gap-3 py-4 first:pt-0 last:pb-0'>
                <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white'>
                  {review.reviewerName.charAt(0).toUpperCase()}
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='truncate text-sm font-semibold text-white'>{review.reviewerName}</span>
                    <span className='shrink-0 text-xs text-white/40'>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className='mt-0.5 flex gap-0.5'>
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <Star key={starIdx} className={cn('h-3.5 w-3.5', starIdx < review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20')} />
                    ))}
                  </div>
                  <p className='mt-1.5 text-sm text-white/70'>{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
