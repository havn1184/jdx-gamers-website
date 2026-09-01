/**
 * TicketDetailPage — Chi tiết 1 vé giờ chơi kiểu Shopee: mua vé, thông tin chi tiết, đánh giá
 * sao, sản phẩm khác của cùng gian hàng, sản phẩm tương tự của gian hàng khác.
 */
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Loader2, AlertCircle, Star, MapPin, ChevronRight } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { ShopArt } from '../../../../shared/components/ShopArt'
import { formatCurrency } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { useTicketDetailFetchData } from '../hooks/useTicketDetail.page.fetchData'
import { saveTicketSelection } from '../../../Account/User/playtime/hooks/useTicketReserve.page'
import type { PlaytimeTicketView } from '../types/playtime.types'

export const PAGE_ID = 'jgame-playtime-ticket-detail'
export const PAGE_FEATURES = [{ label: 'Đặt vé ngay', code: 'btn-dat-ve-ngay' }]

const ZONE_LABEL: Record<string, string> = { standard: 'Zone Thường', vip: 'Zone VIP', highend: 'Cấu hình cao' }

function TicketMiniCard({ ticket }: { ticket: PlaytimeTicketView }) {
  return (
    <Link
      to={`/jgame/cho-ve/ve/${ticket.id}`}
      className="block w-40 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:border-purple-400/50"
    >
      <ShopArt art={ticket.shopArt} imageUrl={ticket.shopImageUrl} label={ticket.shopName} className="aspect-video w-full" />
      <div className="p-3">
        <p className="truncate text-xs text-white/50">{ticket.shopName}</p>
        <p className="truncate text-sm font-semibold text-white">{ticket.zoneName} · {ticket.hours}h</p>
        <p className="mt-1 text-sm font-bold text-purple-300">
          {ticket.sellPrice === 0 ? 'Miễn phí' : formatCurrency(ticket.sellPrice)}
        </p>
      </div>
    </Link>
  )
}

export function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const navigate = useNavigate()
  const { data, loading, notFound } = useTicketDetailFetchData(ticketId)

  if (loading) return <div className="flex items-center justify-center gap-2 py-24 text-white/60"><Loader2 className="h-5 w-5 animate-spin" /> Đang tải...</div>
  if (notFound || !data) {
    return <div className="flex flex-col items-center gap-2 py-24 text-white/60"><AlertCircle className="h-8 w-8 text-red-400" />Không tìm thấy vé</div>
  }

  const { ticket, otherShopTickets, similarTickets, reviews } = data
  const soldOut = ticket.availableSlots <= 0
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : ticket.shopRating

  const handleBuyNow = () => {
    saveTicketSelection(ticket.id, 1)
    navigate('/jgame/cho-ve/xac-nhan-dat-ve')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link to={`/jgame/cho-ve/gian-hang/${ticket.shopId}`} className="mb-6 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white">
        <ChevronLeft className="h-4 w-4" /> Quay lại gian hàng
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="relative">
          <ShopArt art={ticket.shopArt} imageUrl={ticket.shopImageUrl} label={ticket.zoneName} className="aspect-square w-full rounded-2xl" />
          {ticket.discountPercent > 0 && (
            <span className="absolute left-3 top-3 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">-{ticket.discountPercent}%</span>
          )}
        </div>

        <div>
          <p className="text-sm text-white/50">{ZONE_LABEL[ticket.zoneType]}</p>
          <h1 className="mt-1 text-2xl font-bold text-white">{ticket.zoneName} · {ticket.hours} giờ</h1>

          <div className="mt-2 flex items-center gap-2 text-sm text-white/70">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-white">{avgRating.toFixed(1)}</span>
              {reviews.length > 0 && <span>({reviews.length} đánh giá)</span>}
            </span>
          </div>

          <div className="mt-4 flex items-end gap-3">
            <p className="text-2xl font-bold text-white">
              {ticket.sellPrice === 0 ? 'Miễn phí' : formatCurrency(ticket.sellPrice)}
            </p>
            {ticket.discountPercent > 0 && (
              <p className="pb-0.5 text-sm text-white/40 line-through">{formatCurrency(ticket.originalPrice)}</p>
            )}
          </div>

          <p className={cn('mt-2 text-sm', soldOut ? 'text-red-400' : 'text-emerald-400')}>
            {soldOut ? 'Đã hết chỗ' : `Còn ${ticket.availableSlots}/${ticket.totalSlots} chỗ`}
          </p>

          <Link
            to={`/jgame/cho-ve/gian-hang/${ticket.shopId}`}
            className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-purple-400/50"
          >
            <ShopArt art={ticket.shopArt} imageUrl={ticket.shopImageUrl} label={ticket.shopName} className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{ticket.shopName}</p>
              <p className="flex items-center gap-1 text-xs text-white/50"><MapPin className="h-3 w-3" /> {ticket.shopCity}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-white/40" />
          </Link>

          <Button className="jgame-btn-primary mt-6 w-full text-white" disabled={soldOut} onClick={handleBuyNow} data-qa="btn_dat_ve_ngay">
            {soldOut ? 'Hết chỗ' : 'Đặt vé ngay'}
          </Button>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Đánh giá gian hàng</h2>
            <span className="flex items-center gap-1 text-sm text-white/70">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-white">{avgRating.toFixed(1)}</span> ({reviews.length})
            </span>
          </div>
          <div className="mt-4 divide-y divide-white/10">
            {reviews.map(review => (
              <div key={review.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white">
                  {review.reviewerName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-white">{review.reviewerName}</span>
                    <span className="shrink-0 text-xs text-white/40">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="mt-0.5 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn('h-3.5 w-3.5', i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20')} />
                    ))}
                  </div>
                  {review.comment && <p className="mt-1.5 text-sm text-white/70">{review.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {otherShopTickets.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-white">Sản phẩm khác của gian hàng</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {otherShopTickets.map(t => <TicketMiniCard key={t.id} ticket={t} />)}
          </div>
        </div>
      )}

      {similarTickets.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-white">Sản phẩm tương tự của gian hàng khác</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {similarTickets.map(t => <TicketMiniCard key={t.id} ticket={t} />)}
          </div>
        </div>
      )}
    </div>
  )
}
