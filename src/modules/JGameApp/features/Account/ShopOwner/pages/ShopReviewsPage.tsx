/**
 * ShopReviewsPage — "Đánh giá khách hàng" (Chủ Cybergame): thống kê 4 tiêu chí + tổng thể,
 * danh sách phân trang đánh giá của ĐÚNG gian hàng đang đăng nhập (20260902-nc_danh-gia-phong-game-da-tieu-chi.md).
 * KHÔNG có thao tác sửa/xoá — chỉ xem để biết và khắc phục.
 */
import { Loader2, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { cn } from '../../../../shared/components/ui/utils'
import { ShopOwnerLayout } from '../components/ShopOwnerLayout'
import { useMyShop } from '../hooks/useMyShop'
import { useShopReviewsFetchData } from '../hooks/useShopReviews.page.fetchData'
import { ReviewCriteriaBreakdown } from '../../../Public/playtime/components/ReviewCriteriaBreakdown'

export const PAGE_ID = 'jgame-shop-reviews'

const SUMMARY_TILES: { key: 'hygiene' | 'food' | 'service' | 'equipment'; label: string }[] = [
  { key: 'hygiene', label: 'Vệ sinh' },
  { key: 'food', label: 'Đồ ăn' },
  { key: 'service', label: 'Thái độ phục vụ' },
  { key: 'equipment', label: 'Cấu hình máy tính' },
]

export function ShopReviewsPage() {
  const { shop } = useMyShop()
  const { items, total, totalPages, page, setPage, summary, loading } = useShopReviewsFetchData()

  return (
    <ShopOwnerLayout shopName={shop?.name}>
      <div className='mb-6'>
        <h1 className='text-xl font-bold text-white'>Đánh giá khách hàng</h1>
        <p className='text-sm text-white/60'>Xem đánh giá chất lượng từ khách hàng để biết và khắc phục các vấn đề</p>
      </div>

      {summary && (
        <div className='mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
          <SummaryTile label='Tổng thể' value={summary.overall} />
          {SUMMARY_TILES.map(t => <SummaryTile key={t.key} label={t.label} value={summary[t.key]} />)}
        </div>
      )}
      {summary && <p className='mb-6 text-sm text-white/50'>Tổng {summary.reviewCount} đánh giá</p>}

      {loading && items.length === 0 ? (
        <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
      ) : items.length === 0 ? (
        <p className='py-16 text-center text-white/50'>Chưa có đánh giá nào</p>
      ) : (
        <div className={cn('divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5 px-4 transition-opacity duration-150', loading && 'pointer-events-none opacity-50')}>
          {items.map(review => (
            <div key={review.id} className='py-4 first:pt-4 last:pb-4'>
              <div className='flex items-center justify-between gap-2'>
                <span className='text-sm font-semibold text-white'>{review.reviewerName}</span>
                <span className='shrink-0 text-xs text-white/40'>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <p className='text-xs text-white/50'>{review.zoneName}</p>
              <div className='mt-1 flex gap-0.5'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn('h-3.5 w-3.5', i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20')} />
                ))}
              </div>
              <ReviewCriteriaBreakdown review={review} />
              {review.comment && <p className='mt-1.5 text-sm text-white/70'>{review.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className='mt-4 flex items-center justify-between text-sm text-white/60'>
          <span>Trang {page}/{totalPages} · Tổng {total} đánh giá</span>
          <div className='flex gap-2'>
            <Button variant='ghost' size='sm' className='border border-white/20 text-white hover:bg-white/10' disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className='h-4 w-4' /> Trước
            </Button>
            <Button variant='ghost' size='sm' className='border border-white/20 text-white hover:bg-white/10' disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Sau <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </ShopOwnerLayout>
  )
}

function SummaryTile({ label, value }: { label: string; value: number | null }) {
  return (
    <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
      <p className='text-lg font-bold text-white'>{value == null ? '-' : value.toFixed(1)}</p>
      <p className='text-xs text-white/50'>{label}</p>
    </div>
  )
}
