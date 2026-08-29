/**
 * PlaytimeMarketplacePage — Trang tổng quan Chợ vé giờ chơi Cybergame (SC-P2-01).
 * Nhiều vùng hiển thị kiểu Shopee: Flash Sale, lọc nhanh, gian hàng nổi bật, toàn bộ vé.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, MapPin, Star, Timer, Users, Loader2, Ticket } from 'lucide-react'
import { ShopArt } from '../../../../shared/components/ShopArt'
import { formatCurrency, formatNumber } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { useMarketplaceHomeFetchData } from '../hooks/useMarketplaceHome.page.fetchData'
import type { PlaytimeTicketView } from '../types/playtime.types'

export const PAGE_ID = 'jgame-playtime-marketplace'
export const PAGE_FEATURES = [
  { label: 'Lọc theo thành phố', code: 'sel-thanh-pho' },
  { label: 'Lọc theo khu vực', code: 'btn-loc-khu-vuc' },
  { label: 'Xem gian hàng', code: 'row-view-shop' },
]

const ZONE_TABS: { key: 'all' | 'standard' | 'vip' | 'highend'; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'standard', label: 'Zone Thường' },
  { key: 'vip', label: 'Zone VIP' },
  { key: 'highend', label: 'Cấu hình cao' },
]

function useCountdown(target: string | undefined) {
  const [remaining, setRemaining] = useState(0)
  useEffect(() => {
    if (!target) return
    const tick = () => setRemaining(Math.max(0, Math.floor((new Date(target).getTime() - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])
  const hh = String(Math.floor(remaining / 3600)).padStart(2, '0')
  const mm = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function TicketCard({ ticket, highlight }: { ticket: PlaytimeTicketView; highlight?: boolean }) {
  const soldPercent = ticket.totalSlots > 0 ? Math.round(((ticket.totalSlots - ticket.availableSlots) / ticket.totalSlots) * 100) : 0
  const lowSlot = ticket.availableSlots > 0 && ticket.availableSlots <= 3

  return (
    <Link
      to={`/jgame/cho-ve/gian-hang/${ticket.shopId}`}
      className={cn(
        'jgame-card-hover flex-shrink-0 overflow-hidden rounded-2xl border bg-white/5',
        highlight ? 'w-56 border-pink-500/40' : 'w-full border-white/10'
      )}
      data-qa={`row_view_shop_${ticket.shopId}`}
    >
      <div className='relative'>
        <ShopArt art={ticket.shopArt} imageUrl={ticket.shopImageUrl} label={ticket.shopName} className='aspect-[4/3] w-full' />
        {ticket.discountPercent > 0 && (
          <span className='absolute left-2 top-2 rounded-md bg-red-600 px-1.5 py-0.5 text-[11px] font-extrabold text-white shadow'>
            -{ticket.discountPercent}%
          </span>
        )}
        {ticket.sellPrice === 0 && (
          <span className='jgame-badge-soon absolute right-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold'>0đ</span>
        )}
      </div>
      <div className='p-3'>
        <p className='truncate text-xs font-semibold uppercase tracking-wide text-white/50'>{ticket.shopName} · {ticket.shopCity}</p>
        <p className='mt-0.5 truncate text-sm font-semibold text-white'>{ticket.zoneName} — {ticket.hours}h chơi</p>
        <div className='mt-1.5 flex items-baseline gap-2'>
          <span className='font-bold text-white'>{ticket.sellPrice === 0 ? 'Miễn phí' : formatCurrency(ticket.sellPrice)}</span>
          {ticket.discountPercent > 0 && <span className='text-xs text-white/40 line-through'>{formatCurrency(ticket.originalPrice)}</span>}
        </div>
        <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-white/10'>
          <div className='jgame-gradient-brand h-full' style={{ width: `${soldPercent}%` }} />
        </div>
        <p className={cn('mt-1 text-[11px]', lowSlot ? 'animate-pulse font-semibold text-red-400' : 'text-white/50')}>
          {ticket.availableSlots > 0 ? `Còn ${ticket.availableSlots} chỗ · Đã bán ${soldPercent}%` : 'Đã hết chỗ'}
        </p>
      </div>
    </Link>
  )
}

export function PlaytimeMarketplacePage() {
  const { sections, filteredTickets, loading, city, setCity, zoneType, setZoneType } = useMarketplaceHomeFetchData()
  const nearestFlashSaleEnd = sections?.flashSale[0]?.flashSaleEndsAt
  const countdownLabel = useCountdown(nearestFlashSaleEnd)

  if (loading || !sections) {
    return <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải chợ vé...</div>
  }

  return (
    <div>
      {/* Hero Flash Sale */}
      <section className='jgame-hero-bg relative overflow-hidden'>
        <div className='relative mx-auto max-w-7xl px-4 py-10 sm:px-6'>
          <div className='mb-4 flex flex-wrap items-center gap-3'>
            <div className='flex items-center gap-2 rounded-full bg-red-600/90 px-4 py-1.5 text-white shadow-lg'>
              <Flame className='h-4 w-4' />
              <span className='text-sm font-extrabold uppercase tracking-wide'>Flash Sale Vé Giờ Chơi</span>
            </div>
            {nearestFlashSaleEnd && (
              <div className='flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-sm font-mono font-bold text-amber-300'>
                <Timer className='h-4 w-4' /> {countdownLabel}
              </div>
            )}
            <p className='text-sm text-white/70'>Săn vé <span className='font-semibold text-white'>0đ</span> hoặc giảm tới <span className='font-semibold text-white'>90%</span> — nhanh tay kẻo hết chỗ!</p>
          </div>

          {sections.flashSale.length === 0 ? (
            <p className='py-6 text-sm text-white/50'>Hiện chưa có vé flash sale — quay lại sau nhé.</p>
          ) : (
            <div className='flex gap-3 overflow-x-auto pb-2'>
              {sections.flashSale.map(t => <TicketCard key={t.id} ticket={t} highlight />)}
            </div>
          )}
        </div>
      </section>

      <div className='mx-auto max-w-7xl px-4 py-10 sm:px-6'>
        {/* Filter */}
        <div className='mb-6 flex flex-wrap items-center gap-3'>
          <div className='flex items-center gap-1.5 text-sm text-white/60'>
            <MapPin className='h-4 w-4' />
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              aria-label='Lọc theo thành phố'
              className='rounded-lg border border-white/20 bg-[#1a0d33] px-2.5 py-1.5 text-sm text-white focus:border-white/40 focus:outline-none'
              data-qa='sel_thanh_pho'
            >
              <option value='all'>Tất cả thành phố</option>
              {sections.cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className='flex flex-wrap gap-2' data-qa='btn_loc_khu_vuc'>
            {ZONE_TABS.map(tab => (
              <button
                key={tab.key}
                type='button'
                onClick={() => setZoneType(tab.key)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                  zoneType === tab.key ? 'jgame-gradient-brand border-transparent text-white' : 'border-white/20 text-white/70 hover:bg-white/10'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gian hàng nổi bật */}
        <h2 className='mb-4 flex items-center gap-2 text-lg font-bold text-white'>
          <Star className='h-5 w-5 text-amber-400' /> Gian hàng nổi bật
        </h2>
        <div className='mb-12 flex gap-4 overflow-x-auto pb-2'>
          {sections.featuredShops.map(shop => (
            <Link
              key={shop.id}
              to={`/jgame/cho-ve/gian-hang/${shop.id}`}
              className='jgame-card-hover w-64 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5'
              data-qa={`row_view_shop_${shop.id}`}
            >
              <ShopArt art={shop.art} imageUrl={shop.imageUrl} label={shop.name} className='aspect-video w-full' />
              <div className='p-3'>
                <p className='truncate font-semibold text-white'>{shop.name}</p>
                <p className='text-xs text-white/50'>{shop.city}</p>
                <div className='mt-2 flex items-center justify-between text-xs text-white/60'>
                  <span className='flex items-center gap-1'><Star className='h-3.5 w-3.5 text-amber-400' /> {shop.rating.toFixed(1)}</span>
                  <span className='flex items-center gap-1'><Users className='h-3.5 w-3.5' /> Đã bán {formatNumber(shop.totalSold)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Toàn bộ vé */}
        <h2 className='mb-4 flex items-center gap-2 text-lg font-bold text-white'>
          <Ticket className='h-5 w-5' /> Tất cả vé đang bán
        </h2>
        {filteredTickets.length === 0 ? (
          <p className='py-10 text-center text-sm text-white/50'>Không có vé phù hợp bộ lọc hiện tại</p>
        ) : (
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
            {filteredTickets.map(t => <TicketCard key={t.id} ticket={t} />)}
          </div>
        )}
      </div>
    </div>
  )
}
