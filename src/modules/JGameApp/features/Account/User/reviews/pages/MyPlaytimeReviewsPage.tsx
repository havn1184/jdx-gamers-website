/**
 * MyPlaytimeReviewsPage — "Đánh giá của tôi": toàn bộ đánh giá vé giờ chơi user đã gửi, mới
 * nhất trước.
 */
import { useEffect, useState } from 'react'
import { Loader2, Star } from 'lucide-react'
import { cn } from '../../../../../shared/components/ui/utils'
import { PlaytimeApiService } from '../../../../Public/playtime/services/PlaytimeApiService'
import type { PlaytimeReview } from '../../../../Public/playtime/types/playtime.types'

export const PAGE_ID = 'jgame-playtime-my-reviews'

export function MyPlaytimeReviewsPage() {
  const [reviews, setReviews] = useState<PlaytimeReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      const r = await PlaytimeApiService.getMyReviews()
      if (r.success && r.data) setReviews(r.data)
      setLoading(false)
    })()
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-white">Đánh giá của tôi</h1>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-white/60"><Loader2 className="h-5 w-5 animate-spin" /> Đang tải...</div>
      ) : reviews.length === 0 ? (
        <p className="py-24 text-center text-white/50">Bạn chưa có đánh giá nào</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-white">{review.shopName}</p>
                <span className="shrink-0 text-xs text-white/40">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <p className="text-sm text-white/60">{review.zoneName}</p>
              <div className="mt-1 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn('h-4 w-4', i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20')} />
                ))}
              </div>
              {review.comment && <p className="mt-2 text-sm text-white/70">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
