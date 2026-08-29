/**
 * CybergameShopPage — Trang Gian hàng cybergame (SC-P2-02), phong cách trang Shop Shopee.
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, MapPin, Star, Users, ArrowLeft } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { ShopArt } from '../../../../shared/components/ShopArt'
import { formatCurrency, formatNumber } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { useShopDetailFetchData } from '../hooks/useShopDetail.page.fetchData'
import { saveTicketSelection } from '../../../Account/User/playtime/hooks/useTicketReserve.page'
import type { PlaytimeTicketView, ZoneType } from '../types/playtime.types'

export const PAGE_ID = 'jgame-playtime-shop'
export const PAGE_FEATURES = [{ label: 'Lọc theo khu vực', code: 'btn-loc-zone' }, { label: 'Đặt vé ngay', code: 'btn-dat-ve-ngay' }]

const ZONE_TABS: { key: ZoneType | 'all'; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'standard', label: 'Zone Thường' },
  { key: 'vip', label: 'Zone VIP' },
  { key: 'highend', label: 'Cấu hình cao' },
]

function TicketRow({ ticket }: { ticket: PlaytimeTicketView }) {
  const navigate = useNavigate()
  const lowSlot = ticket.availableSlots > 0 && ticket.availableSlots <= 3
  const soldOut = ticket.availableSlots <= 0

  const handleReserve = () => {
    saveTicketSelection(ticket.id, 1)
    navigate('/jgame/cho-ve/xac-nhan-dat-ve')
  }

  return (
    <div className='flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between'>
      <div>
        <div className='flex items-center gap-2'>
          <span className='font-semibold text-white'>{ticket.zoneName}</span>
          <span className='rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60'>{ticket.hours}h chơi</span>
          {ticket.isFlashSale && <span className='jgame-badge-soon rounded-full px-2 py-0.5 text-[10px] font-bold'>Flash Sale</span>}
        </div>
        <div className='mt-1 flex items-baseline gap-2'>
          <span className='text-lg font-bold text-white'>{ticket.sellPrice === 0 ? 'Miễn phí' : formatCurrency(ticket.sellPrice)}</span>
          {ticket.discountPercent > 0 && <span className='text-sm text-white/40 line-through'>{formatCurrency(ticket.originalPrice)}</span>}
        </div>
        <p className={cn('mt-1 text-xs', lowSlot ? 'animate-pulse font-semibold text-red-400' : 'text-white/50')}>
          {soldOut ? 'Đã hết chỗ' : `Còn ${ticket.availableSlots}/${ticket.totalSlots} chỗ`}
        </p>
      </div>
      <Button className='jgame-btn-primary flex-shrink-0 text-white' disabled={soldOut} onClick={handleReserve} data-qa={`btn_dat_ve_ngay_${ticket.id}`}>
        {soldOut ? 'Hết chỗ' : 'Đặt vé ngay'}
      </Button>
    </div>
  )
}

export function CybergameShopPage() {
  const { shopId } = useParams<{ shopId: string }>()
  const navigate = useNavigate()
  const { detail, loading, notFound, zoneType, setZoneType } = useShopDetailFetchData(shopId)
  const [activeImage, setActiveImage] = useState(0)

  if (loading) return <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải gian hàng...</div>
  if (notFound || !detail) return <div className='py-24 text-center text-white/60'>Không tìm thấy gian hàng</div>

  const { shop, tickets } = detail
  const gallery = shop.galleryImages && shop.galleryImages.length > 0 ? shop.galleryImages : undefined

  return (
    <div>
      <div className='relative h-40 w-full overflow-hidden sm:h-56'>
        <ShopArt art={shop.art} imageUrl={gallery ? gallery[activeImage] : shop.imageUrl} label={shop.name} className='h-full w-full' />
        <div className='absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#150829] to-transparent' />
        <button
          type='button'
          onClick={() => navigate('/jgame/cho-ve')}
          className='absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-sm text-white backdrop-blur hover:bg-black/60'
        >
          <ArrowLeft className='h-4 w-4' /> Chợ vé
        </button>
      </div>

      <div className='mx-auto max-w-5xl px-4 py-6 sm:px-6'>
        <div className='-mt-6 mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#1a0d33] p-5 shadow-xl shadow-black/30 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-xl font-bold text-white'>{shop.name}</h1>
            <p className='mt-1.5 flex items-center gap-1.5 text-sm text-white/60'><MapPin className='h-4 w-4 flex-shrink-0' /> {shop.address}, {shop.city}</p>
            <p className='mt-1.5 text-sm text-white/60'>{shop.description}</p>
          </div>
          <div className='flex flex-shrink-0 gap-4 text-sm text-white/70 sm:border-l sm:border-white/10 sm:pl-4'>
            <span className='flex items-center gap-1.5'><Star className='h-4 w-4 text-amber-400' /> {shop.rating.toFixed(1)}</span>
            <span className='flex items-center gap-1.5'><Users className='h-4 w-4' /> Đã bán {formatNumber(shop.totalSold)}</span>
          </div>
        </div>

        {gallery && gallery.length > 1 && (
          <div className='mb-6 grid grid-cols-5 gap-2'>
            {gallery.map((img, idx) => (
              <button
                key={img}
                type='button'
                onClick={() => setActiveImage(idx)}
                className={cn('overflow-hidden rounded-lg border-2', activeImage === idx ? 'border-purple-400' : 'border-transparent opacity-70 hover:opacity-100')}
                data-qa={`btn_gallery_${idx}`}
              >
                <img src={img} alt={`${shop.name} ${idx + 1}`} loading='lazy' className='aspect-square w-full object-cover' />
              </button>
            ))}
          </div>
        )}

        <div className='mb-5 flex flex-wrap gap-2' data-qa='btn_loc_zone'>
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

        {tickets.length === 0 ? (
          <p className='py-10 text-center text-sm text-white/50'>Gian hàng chưa mở bán vé cho khu vực này</p>
        ) : (
          <div className='space-y-3'>
            {tickets.map(t => <TicketRow key={t.id} ticket={t} />)}
          </div>
        )}
      </div>
    </div>
  )
}
