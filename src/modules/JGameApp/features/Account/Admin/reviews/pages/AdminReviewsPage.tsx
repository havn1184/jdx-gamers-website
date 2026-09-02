/**
 * AdminReviewsPage — Quản trị "Đánh giá phòng game" (20260902-nc_danh-gia-phong-game-da-tieu-chi.md).
 * Bảng tổng hợp từng shop (sắp xếp tăng dần theo điểm tổng thể - BE trả sẵn thứ tự, FE không tự sort
 * lại) + drill-down xem chi tiết đánh giá của 1 shop khi bấm vào dòng.
 */
import { Loader2, Star, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { Badge } from '../../../../../shared/components/ui/badge'
import { cn } from '../../../../../shared/components/ui/utils'
import { AdminLayout } from '../../components/AdminLayout'
import { useAdminReviewsFetchData } from '../hooks/useAdminReviews.page.fetchData'
import { ReviewCriteriaBreakdown } from '../../../../Public/playtime/components/ReviewCriteriaBreakdown'

export const PAGE_ID = 'jgame-admin-reviews'
export const PAGE_FEATURES = [{ label: 'Xem chi tiết theo shop', code: 'row-xem-chi-tiet' }]

const LOW_RATING_THRESHOLD = 3.5

export function AdminReviewsPage() {
  const {
    shopSummaries, summaryLoading, selectedShopId, setSelectedShopId,
    items, total, totalPages, page, setPage, listLoading,
  } = useAdminReviewsFetchData()

  const selectedShop = shopSummaries.find(s => s.shopId === selectedShopId)

  return (
    <AdminLayout>
      <div className='mb-6'>
        <h1 className='text-xl font-bold text-white'>Đánh giá phòng game</h1>
        <p className='text-sm text-white/60'>Trung bình 4 tiêu chí theo từng shop, sắp xếp shop điểm thấp nhất lên đầu</p>
      </div>

      {summaryLoading ? (
        <div className='flex items-center justify-center gap-2 py-12 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
      ) : shopSummaries.length === 0 ? (
        <p className='py-12 text-center text-white/50'>Chưa có gian hàng nào</p>
      ) : (
        <div className='mb-6 overflow-x-auto rounded-xl border border-white/10'>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Gian hàng</th>
                <th className='px-3 py-2 text-right font-medium'>Vệ sinh</th>
                <th className='px-3 py-2 text-right font-medium'>Đồ ăn</th>
                <th className='px-3 py-2 text-right font-medium'>Thái độ</th>
                <th className='px-3 py-2 text-right font-medium'>Cấu hình</th>
                <th className='px-3 py-2 text-right font-medium'>Tổng thể</th>
                <th className='px-3 py-2 text-right font-medium'>Số đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {shopSummaries.map(s => (
                <tr
                  key={s.shopId}
                  onClick={() => setSelectedShopId(s.shopId === selectedShopId ? null : s.shopId)}
                  className={cn('cursor-pointer border-t border-white/10 text-white/80 hover:bg-white/5', s.shopId === selectedShopId && 'bg-white/10')}
                  data-qa={`row_shop_${s.shopId}`}
                >
                  <td className='px-3 py-2 font-medium text-white'>{s.shopName}</td>
                  <td className='px-3 py-2 text-right'>{s.averages.hygiene?.toFixed(1) ?? '-'}</td>
                  <td className='px-3 py-2 text-right'>{s.averages.food?.toFixed(1) ?? '-'}</td>
                  <td className='px-3 py-2 text-right'>{s.averages.service?.toFixed(1) ?? '-'}</td>
                  <td className='px-3 py-2 text-right'>{s.averages.equipment?.toFixed(1) ?? '-'}</td>
                  <td className='px-3 py-2 text-right'>
                    <Badge className={cn('border-none', s.averages.overall < LOW_RATING_THRESHOLD && s.averages.reviewCount > 0 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300')}>
                      {s.averages.overall.toFixed(1)}
                    </Badge>
                  </td>
                  <td className='px-3 py-2 text-right'>{s.averages.reviewCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedShopId && (
        <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-sm font-semibold text-white'>Chi tiết đánh giá — {selectedShop?.shopName}</h2>
            <button type='button' className='text-white/50 hover:text-white' onClick={() => setSelectedShopId(null)}><X className='h-4 w-4' /></button>
          </div>

          {listLoading && items.length === 0 ? (
            <div className='flex items-center justify-center gap-2 py-8 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
          ) : items.length === 0 ? (
            <p className='py-8 text-center text-white/50'>Shop này chưa có đánh giá nào</p>
          ) : (
            <div className='divide-y divide-white/10'>
              {items.map(review => (
                <div key={review.id} className='py-4 first:pt-0 last:pb-0'>
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
        </div>
      )}
    </AdminLayout>
  )
}
