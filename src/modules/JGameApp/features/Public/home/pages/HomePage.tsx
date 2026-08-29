/**
 * HomePage — Trang chủ tổng hợp 3 phân hệ: Nạp thẻ game / Chợ vé giờ chơi / Kho phụ kiện Gamer (SC-01).
 * Lấy dữ liệu thật từ API từng phân hệ, không tạo mock riêng — luôn đồng bộ với dữ liệu thật.
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Loader2, Flame, Timer, CreditCard, PackageOpen, ArrowRight, Star, Users, ShoppingCart, Zap,
} from 'lucide-react'
import { CardArt } from '../../../../shared/components/CardArt'
import { ShopArt } from '../../../../shared/components/ShopArt'
import { formatCurrency, formatNumber } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { useHomeFetchData } from '../hooks/useHome.page.fetchData'

export const PAGE_ID = 'jgame-home'
export const PAGE_FEATURES = [
  { label: 'Vào Nạp thẻ game', code: 'btn-vao-nap-the' },
  { label: 'Vào Chợ vé giờ chơi', code: 'btn-vao-cho-ve' },
  { label: 'Vào Kho phụ kiện', code: 'btn-vao-phu-kien' },
]

export function HomePage() {
  const { cardProviders, cardProviderCount, playtimeSections, accessories, accessoryCount, loading } = useHomeFetchData()
  const flashSale = playtimeSections?.flashSale.slice(0, 4) || []
  const featuredShops = playtimeSections?.featuredShops.slice(0, 4) || []
  const totalTicketsSold = useMemo(() => featuredShops.reduce((s, x) => s + x.totalSold, 0), [featuredShops])

  if (loading) {
    return <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
  }

  return (
    <div>
      {/* Hero — 3 lối vào chính */}
      <section className='jgame-hero-bg relative overflow-hidden'>
        <div className='relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20'>
          <div className='text-center'>
            <h1 className='text-3xl font-extrabold text-white sm:text-5xl'>
              Chào mừng đến với <span className='jgame-gradient-text'>JGame Store</span>
            </h1>
            <p className='mx-auto mt-3 max-w-2xl text-sm text-white/70 sm:text-base'>
              Nạp thẻ game siêu tốc, săn vé giờ chơi 0đ, sắm phụ kiện gamer chính hãng — tất cả trong một nền tảng.
            </p>
          </div>

          <div className='mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3'>
            <Link to='/jgame/nap-the' className='jgame-card-hover flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-6 text-center' data-qa='btn_vao_nap_the'>
              <span className='jgame-gradient-brand flex h-14 w-14 items-center justify-center rounded-2xl text-white'><CreditCard className='h-7 w-7' /></span>
              <h2 className='mt-1 font-bold text-white'>Nạp thẻ game</h2>
              <p className='text-xs text-white/60'>12 nhà phát hành, nhận mã tức thì</p>
            </Link>
            <Link to='/jgame/cho-ve' className='jgame-card-hover flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-6 text-center' data-qa='btn_vao_cho_ve'>
              <span className='jgame-gradient-brand flex h-14 w-14 items-center justify-center rounded-2xl text-white'><Timer className='h-7 w-7' /></span>
              <h2 className='mt-1 font-bold text-white'>Chợ vé giờ chơi</h2>
              <p className='text-xs text-white/60'>Săn vé 0đ, giảm tới 90%</p>
            </Link>
            <Link to='/jgame/phu-kien' className='jgame-card-hover flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-6 text-center' data-qa='btn_vao_phu_kien'>
              <span className='jgame-gradient-brand flex h-14 w-14 items-center justify-center rounded-2xl text-white'><PackageOpen className='h-7 w-7' /></span>
              <h2 className='mt-1 font-bold text-white'>Kho phụ kiện Gamer</h2>
              <p className='text-xs text-white/60'>Chuột, bàn phím, PC gaming...</p>
            </Link>
          </div>
        </div>
      </section>

      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6'>
        {/* Chợ vé giờ chơi — nội dung sôi động nhất, đặt lên đầu để lôi kéo tương tác */}
        {flashSale.length > 0 && (
          <section className='mb-14'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='flex items-center gap-2 text-lg font-bold text-white'>
                <Flame className='h-5 w-5 text-red-400' /> Flash Sale Vé Giờ Chơi
              </h2>
              <Link to='/jgame/cho-ve' className='flex items-center gap-1 text-sm font-semibold text-white/70 hover:text-white' data-qa='btn_xem_tat_ca_cho_ve'>
                Xem tất cả <ArrowRight className='h-3.5 w-3.5' />
              </Link>
            </div>
            <div className='flex gap-4 overflow-x-auto pb-2'>
              {flashSale.map(ticket => {
                const soldPercent = ticket.totalSlots > 0 ? Math.round(((ticket.totalSlots - ticket.availableSlots) / ticket.totalSlots) * 100) : 0
                const lowSlot = ticket.availableSlots > 0 && ticket.availableSlots <= 3
                return (
                  <Link key={ticket.id} to={`/jgame/cho-ve/gian-hang/${ticket.shopId}`} className='jgame-card-hover w-56 flex-shrink-0 overflow-hidden rounded-2xl border border-pink-500/30 bg-white/5' data-qa={`row_flash_sale_${ticket.id}`}>
                    <div className='relative'>
                      <ShopArt art={ticket.shopArt} imageUrl={ticket.shopImageUrl} label={ticket.shopName} className='aspect-[4/3] w-full' />
                      {ticket.discountPercent > 0 && (
                        <span className='absolute left-2 top-2 rounded-md bg-red-600 px-1.5 py-0.5 text-[11px] font-extrabold text-white shadow'>-{ticket.discountPercent}%</span>
                      )}
                    </div>
                    <div className='p-3'>
                      <p className='truncate text-xs font-semibold uppercase tracking-wide text-white/50'>{ticket.shopName}</p>
                      <p className='mt-0.5 truncate text-sm font-semibold text-white'>{ticket.zoneName} — {ticket.hours}h</p>
                      <p className='mt-1 font-bold text-white'>{ticket.sellPrice === 0 ? 'Miễn phí' : formatCurrency(ticket.sellPrice)}</p>
                      <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-white/10'>
                        <div className='jgame-gradient-brand h-full' style={{ width: `${soldPercent}%` }} />
                      </div>
                      <p className={cn('mt-1 text-[11px]', lowSlot ? 'animate-pulse font-semibold text-red-400' : 'text-white/50')}>
                        {ticket.availableSlots > 0 ? `Còn ${ticket.availableSlots} chỗ` : 'Đã hết chỗ'}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>

            {featuredShops.length > 0 && (
              <div className='mt-5 flex flex-wrap gap-3'>
                {featuredShops.map(shop => (
                  <Link key={shop.id} to={`/jgame/cho-ve/gian-hang/${shop.id}`} className='flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4 hover:bg-white/10'>
                    <ShopArt art={shop.art} imageUrl={shop.imageUrl} label={shop.name} className='h-8 w-8 flex-shrink-0 rounded-full' />
                    <span className='text-sm font-medium text-white'>{shop.name}</span>
                    <span className='flex items-center gap-1 text-xs text-white/50'><Star className='h-3 w-3 text-amber-400' /> {shop.rating.toFixed(1)}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Nạp thẻ game */}
        <section className='mb-14'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='flex items-center gap-2 text-lg font-bold text-white'>
              <CreditCard className='h-5 w-5' /> Nạp thẻ game siêu tốc
            </h2>
            <Link to='/jgame/nap-the' className='flex items-center gap-1 text-sm font-semibold text-white/70 hover:text-white' data-qa='btn_xem_tat_ca_nap_the'>
              Xem tất cả <ArrowRight className='h-3.5 w-3.5' />
            </Link>
          </div>
          <div className='grid grid-cols-3 gap-4 sm:grid-cols-6'>
            {cardProviders.map(product => (
              <Link key={product.id} to={`/jgame/the/${product.id}`} className='jgame-card-hover overflow-hidden rounded-2xl border border-white/10 bg-white/5' data-qa={`row_home_card_${product.id}`}>
                <CardArt art={product.art} imageUrl={product.imageUrl} label={product.supplierName} className='aspect-square w-full' />
              </Link>
            ))}
          </div>
        </section>

        {/* Kho phụ kiện Gamer */}
        {accessories.length > 0 && (
          <section className='mb-4'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='flex items-center gap-2 text-lg font-bold text-white'>
                <PackageOpen className='h-5 w-5' /> Kho phụ kiện Gamer
              </h2>
              <Link to='/jgame/phu-kien' className='flex items-center gap-1 text-sm font-semibold text-white/70 hover:text-white' data-qa='btn_xem_tat_ca_phu_kien'>
                Xem tất cả <ArrowRight className='h-3.5 w-3.5' />
              </Link>
            </div>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
              {accessories.map(product => (
                <Link key={product.id} to={`/jgame/phu-kien/${product.id}`} className='jgame-card-hover overflow-hidden rounded-2xl border border-white/10 bg-white/5' data-qa={`row_home_accessory_${product.id}`}>
                  <ShopArt art={product.art} imageUrl={product.imageUrl} label={product.brand} className='aspect-[4/3] w-full' />
                  <div className='p-3'>
                    <p className='jgame-gradient-text text-[11px] font-bold uppercase tracking-wide'>{product.brand}</p>
                    <p className='truncate text-sm font-semibold text-white'>{product.name}</p>
                    <p className='mt-1 flex items-center gap-1 font-semibold text-white'><ShoppingCart className='h-3.5 w-3.5 text-white/50' /> {formatCurrency(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Dải thống kê tin cậy */}
        <section className='mt-14 grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 sm:grid-cols-3'>
          <div className='flex items-center gap-3'>
            <span className='jgame-gradient-brand flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white'><Zap className='h-5 w-5' /></span>
            <div><p className='font-bold text-white'>{formatNumber(cardProviderCount)}+ nhà phát hành</p><p className='text-xs text-white/50'>Đối tác nạp thẻ uy tín</p></div>
          </div>
          <div className='flex items-center gap-3'>
            <span className='jgame-gradient-brand flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white'><Users className='h-5 w-5' /></span>
            <div><p className='font-bold text-white'>{formatNumber(totalTicketsSold)}+ vé đã bán</p><p className='text-xs text-white/50'>Từ các gian hàng nổi bật</p></div>
          </div>
          <div className='flex items-center gap-3'>
            <span className='jgame-gradient-brand flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white'><PackageOpen className='h-5 w-5' /></span>
            <div><p className='font-bold text-white'>{formatNumber(accessoryCount)}+ phụ kiện</p><p className='text-xs text-white/50'>Chính hãng, giao nhanh</p></div>
          </div>
        </section>
      </div>
    </div>
  )
}
