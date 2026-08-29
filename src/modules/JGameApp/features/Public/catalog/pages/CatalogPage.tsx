/**
 * CatalogPage — Trang chủ / Danh mục thẻ game (SC-01).
 */
import { Link } from 'react-router-dom'
import { Search, Loader2, AlertCircle, PackageOpen, Clock3 } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/input'
import { Badge } from '../../../../shared/components/ui/badge'
import { CardArt } from '../../../../shared/components/CardArt'
import { formatCurrency } from '../../../../shared/utils/FormatUtils'
import { useCatalogFetchData } from '../hooks/useCatalog.page.fetchData'

export const PAGE_ID = 'jgame-catalog'
export const PAGE_FEATURES = [
  { label: 'Tìm kiếm thẻ game', code: 'i-tim-kiem' },
  { label: 'Xem chi tiết thẻ', code: 'row-view' },
]

export function CatalogPage() {
  const { items, loading, errorMessage, keyword, setKeyword } = useCatalogFetchData()

  return (
    <div>
      {/* Hero banner */}
      <section className='jgame-hero-bg relative overflow-hidden'>
        <img
          src='https://picsum.photos/seed/jgame-hero/1600/500'
          alt=''
          className='absolute inset-0 h-full w-full object-cover opacity-20'
        />
        <div className='relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24'>
          <h1 className='text-3xl font-extrabold text-white sm:text-5xl'>
            Nạp thẻ game <span className='jgame-gradient-text'>siêu tốc</span>, nhận mã ngay lập tức
          </h1>
          <p className='mx-auto mt-4 max-w-2xl text-sm text-white/70 sm:text-base'>
            Garena, Zing, VTC, Appota, Gosu và nhiều nhà phát hành khác — thanh toán QR, tự động giao mã trong vài giây.
          </p>

          <div className='mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl bg-white/10 p-2 backdrop-blur'>
            <Search className='ml-2 h-5 w-5 text-white/60 flex-shrink-0' />
            <Input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder='Tìm loại thẻ, nhà cung cấp...'
              aria-label='Tìm kiếm thẻ game'
              className='border-none bg-transparent text-white placeholder:text-white/50 focus-visible:ring-0'
              data-qa='i_tim_kiem'
            />
          </div>
        </div>
      </section>

      <div className='mx-auto max-w-7xl px-4 py-10 sm:px-6'>
        <h2 className='mb-6 text-lg font-bold text-white'>Chọn nhà cung cấp</h2>

        {/* States */}
        {loading && (
          <div className='flex items-center justify-center gap-2 py-16 text-white/60'>
            <Loader2 className='h-5 w-5 animate-spin' /> Đang tải danh mục...
          </div>
        )}

        {!loading && errorMessage && (
          <div className='flex flex-col items-center gap-2 py-16 text-white/60'>
            <AlertCircle className='h-8 w-8 text-red-400' />
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && items.length === 0 && (
          <div className='flex flex-col items-center gap-2 py-16 text-white/60'>
            <PackageOpen className='h-8 w-8' />
            Không tìm thấy loại thẻ phù hợp
          </div>
        )}

        {!loading && !errorMessage && items.length > 0 && (
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
            {items.map(product => {
              const cheapest = [...product.denominations].sort((a, b) => a.sellPrice - b.sellPrice)[0]
              return (
                <Link
                  key={product.id}
                  to={`/jgame/the/${product.id}`}
                  className='jgame-card-hover overflow-hidden rounded-2xl border border-white/10 bg-white/5'
                  data-qa={`row_view_${product.id}`}
                >
                  <CardArt art={product.art} imageUrl={product.imageUrl} label={product.supplierName} className='aspect-[4/3] w-full' />
                  <div className='p-3'>
                    <p className='truncate text-sm font-semibold text-white'>{product.name}</p>
                    {cheapest && (
                      <p className='mt-1 text-xs text-white/60'>
                        Từ <span className='font-semibold text-white'>{formatCurrency(cheapest.sellPrice)}</span>
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Khám phá thêm — GD2/GD3 */}
        <div className='mt-14'>
          <h2 className='mb-4 text-lg font-bold text-white'>Khám phá thêm</h2>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Link to='/jgame/cho-ve' className='jgame-card-hover flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5'>
              <div className='jgame-gradient-brand flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white'>
                <Clock3 className='h-6 w-6' />
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <h3 className='font-semibold text-white'>Chợ vé giờ chơi Cybergame</h3>
                  <Badge className='jgame-gradient-brand border-none'>Mới</Badge>
                </div>
                <p className='text-sm text-white/60'>Săn vé 0đ, giảm tới 90% tại các phòng game liên kết...</p>
              </div>
            </Link>
            <Link to='/jgame/phu-kien' className='jgame-card-hover flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5'>
              <div className='jgame-gradient-brand flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white'>
                <PackageOpen className='h-6 w-6' />
              </div>
              <div>
                <h3 className='font-semibold text-white'>Kho phụ kiện Gamer</h3>
                <p className='text-sm text-white/60'>Chuột, bàn phím, PC gaming...</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
