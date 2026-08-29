/**
 * AccessoriesCatalogPage — Danh mục phụ kiện Gamer (SC-26, Giai đoạn 3).
 */
import { Link } from 'react-router-dom'
import { Loader2, PackageOpen } from 'lucide-react'
import { AccessoryArt } from '../components/AccessoryArt'
import { formatCurrency } from '../../../../shared/utils/FormatUtils'
import { useAccessoryCatalogFetchData, type AccessoryCategoryFilter } from '../hooks/useAccessoryCatalog.page.fetchData'
import { cn } from '../../../../shared/components/ui/utils'
import { Input } from '../../../../shared/components/ui/input'

export const PAGE_ID = 'jgame-accessories-catalog'
export const PAGE_FEATURES = [{ label: 'Tìm kiếm phụ kiện', code: 'i-tim-kiem' }, { label: 'Lọc theo loại', code: 'btn-loc-danh-muc' }, { label: 'Xem chi tiết', code: 'row-view' }]

const CATEGORY_TABS: { key: AccessoryCategoryFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'mouse', label: 'Chuột' },
  { key: 'keyboard', label: 'Bàn phím' },
  { key: 'headset', label: 'Tai nghe' },
  { key: 'gpu', label: 'Card đồ họa' },
  { key: 'pc', label: 'PC Gaming' },
  { key: 'monitor', label: 'Màn hình' },
  { key: 'chair', label: 'Ghế' },
]

export function AccessoriesCatalogPage() {
  const { items, loading, keyword, setKeyword, category, setCategory, brand, setBrand, brands } = useAccessoryCatalogFetchData()

  return (
    <div className='mx-auto max-w-7xl px-4 py-10 sm:px-6'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Kho phụ kiện Gamer</h1>
          <p className='text-sm text-white/60'>Chuột, bàn phím, tai nghe, card đồ họa, PC gaming, màn hình, ghế...</p>
        </div>
        <Input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder='Tìm phụ kiện...' className='max-w-xs' data-qa='i_tim_kiem' />
      </div>

      <div className='mb-4 flex flex-wrap gap-2' data-qa='btn_loc_danh_muc'>
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.key}
            type='button'
            onClick={() => setCategory(tab.key)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              category === tab.key ? 'jgame-gradient-brand border-transparent text-white' : 'border-white/20 text-white/70 hover:bg-white/10'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className='mb-6 flex items-center gap-2'>
        <label htmlFor='accessory-brand-filter' className='text-sm text-white/60'>Hãng sản xuất:</label>
        <select
          id='accessory-brand-filter'
          value={brand}
          onChange={e => setBrand(e.target.value)}
          className='rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-1.5 text-sm text-white focus:border-white/40 focus:outline-none'
          data-qa='sel_hang_san_xuat'
        >
          <option value='all'>Tất cả hãng</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {loading && <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>}

      {!loading && items.length === 0 && (
        <div className='flex flex-col items-center gap-2 py-16 text-white/60'><PackageOpen className='h-8 w-8' /> Không tìm thấy sản phẩm phù hợp</div>
      )}

      {!loading && items.length > 0 && (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
          {items.map(product => (
            <Link
              key={product.id}
              to={`/jgame/phu-kien/${product.id}`}
              className='jgame-card-hover overflow-hidden rounded-2xl border border-white/10 bg-white/5'
              data-qa={`row_view_${product.id}`}
            >
              <AccessoryArt art={product.art} imageUrl={product.imageUrl} label={product.brand} className='aspect-[4/3] w-full' />
              <div className='p-3'>
                <p className='jgame-gradient-text text-[11px] font-bold uppercase tracking-wide'>{product.brand}</p>
                <p className='truncate text-sm font-semibold text-white'>{product.name}</p>
                <p className='mt-1 text-xs text-white/60'>{product.specs}</p>
                <div className='mt-2 flex items-center justify-between'>
                  <span className='font-semibold text-white'>{formatCurrency(product.price)}</span>
                  {product.stockQuantity === 0 && <span className='text-[10px] text-red-300'>Hết hàng</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
