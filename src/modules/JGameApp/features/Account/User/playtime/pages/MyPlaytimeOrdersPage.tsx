/**
 * MyPlaytimeOrdersPage — "Vé đã mua": danh sách đơn vé giờ chơi của user hiện tại, có thể đánh
 * giá chất lượng trong vòng 3 ngày kể từ lúc thanh toán (canReview do BE tính sẵn).
 */
import { useCallback, useEffect, useState } from 'react'
import { Loader2, Star, QrCode } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { formatCurrency } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { PlaytimeApiService } from '../../../../Public/playtime/services/PlaytimeApiService'
import type { PlaytimeOrder, PlaytimeOrderStatus } from '../../../../Public/playtime/types/playtime.types'

export const PAGE_ID = 'jgame-playtime-my-orders'
export const PAGE_FEATURES = [{ label: 'Đánh giá chất lượng', code: 'btn-danh-gia' }]

const STATUS_META: Record<PlaytimeOrderStatus, { label: string; tone: string }> = {
  PENDING: { label: 'Chờ thanh toán', tone: 'text-amber-300 bg-amber-500/10' },
  PAID: { label: 'Đã thanh toán', tone: 'text-amber-300 bg-amber-500/10' },
  CONFIRMED: { label: 'Đã xác nhận', tone: 'text-emerald-300 bg-emerald-500/10' },
  USED: { label: 'Đã sử dụng', tone: 'text-emerald-300 bg-emerald-500/10' },
  SUPPLY_FAILED: { label: 'Cung cấp thất bại', tone: 'text-red-300 bg-red-500/10' },
  REFUND_PROCESSING: { label: 'Đang hoàn tiền', tone: 'text-amber-300 bg-amber-500/10' },
  REFUNDED: { label: 'Đã hoàn tiền', tone: 'text-white/50 bg-white/5' },
  EXPIRED: { label: 'Đã hết hạn', tone: 'text-white/50 bg-white/5' },
}

const REVIEW_CRITERIA = [
  { key: 'ratingHygiene', label: 'Vệ sinh' },
  { key: 'ratingFood', label: 'Đồ ăn' },
  { key: 'ratingService', label: 'Thái độ phục vụ' },
  { key: 'ratingEquipment', label: 'Cấu hình máy tính' },
] as const

function CriteriaStarPicker({ label, value, onChange, dataQaPrefix }: { label: string; value: number; onChange: (v: number) => void; dataQaPrefix: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-white/70">{label}</span>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} type="button" onClick={() => onChange(i + 1)} data-qa={`${dataQaPrefix}_${i + 1}`}>
            <Star className={cn('h-5 w-5', i < value ? 'fill-amber-400 text-amber-400' : 'text-white/20')} />
          </button>
        ))}
      </div>
    </div>
  )
}

function ReviewForm({ order, onDone }: { order: PlaytimeOrder; onDone: () => void }) {
  const [ratings, setRatings] = useState<Record<(typeof REVIEW_CRITERIA)[number]['key'], number>>({
    ratingHygiene: 5, ratingFood: 5, ratingService: 5, ratingEquipment: 5,
  })
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    const r = await PlaytimeApiService.createReview(order.id, { ...ratings, comment: comment.trim() || undefined })
    setSubmitting(false)
    if (r.success) onDone()
    else setError(r.message || 'Gửi đánh giá thất bại')
  }

  return (
    <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="mb-2 text-sm font-semibold text-white">Đánh giá chất lượng</p>
      <div className="space-y-2">
        {REVIEW_CRITERIA.map(c => (
          <CriteriaStarPicker
            key={c.key} label={c.label} value={ratings[c.key]}
            onChange={v => setRatings(prev => ({ ...prev, [c.key]: v }))}
            dataQaPrefix={`btn_star_${c.key}`}
          />
        ))}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Chia sẻ trải nghiệm của bạn (không bắt buộc)..."
        rows={3}
        className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-sm text-white placeholder:text-white/30 focus:border-purple-400 focus:outline-none"
      />
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <Button className="jgame-btn-primary mt-3 text-white" disabled={submitting} onClick={handleSubmit} data-qa="btn_gui_danh_gia">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gửi đánh giá'}
      </Button>
    </div>
  )
}

function OrderCard({ order, onReviewed }: { order: PlaytimeOrder; onReviewed: () => void }) {
  const [reviewing, setReviewing] = useState(false)
  const meta = STATUS_META[order.status]

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-white">{order.shopName}</p>
          <p className="text-sm text-white/60">{order.zoneName} · {order.hours} giờ</p>
        </div>
        <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-medium', meta.tone)}>{meta.label}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="font-bold text-purple-300">{formatCurrency(order.totalAmount)}</span>
        <span className="text-white/40">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
      </div>
      {order.redeemCode && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-2 text-sm">
          <QrCode className="h-4 w-4 text-purple-300" />
          <span className="text-white/60">Mã đổi vé:</span>
          <span className="font-mono font-semibold tracking-wide text-purple-300">{order.redeemCode}</span>
        </div>
      )}

      {order.hasReviewed && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-white/50">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> Bạn đã đánh giá đơn này
        </p>
      )}
      {!order.hasReviewed && order.canReview && !reviewing && (
        <Button
          variant="outline"
          className="mt-3 border-white/20 bg-transparent text-white hover:bg-white/10"
          onClick={() => setReviewing(true)}
          data-qa="btn_mo_danh_gia"
        >
          <Star className="mr-1.5 h-4 w-4" /> Đánh giá chất lượng
        </Button>
      )}
      {reviewing && <ReviewForm order={order} onDone={() => { setReviewing(false); onReviewed() }} />}
    </div>
  )
}

export function MyPlaytimeOrdersPage() {
  const [orders, setOrders] = useState<PlaytimeOrder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    const r = await PlaytimeApiService.getMyOrders()
    if (r.success && r.data) setOrders(r.data)
    setLoading(false)
  }, [])

  useEffect(() => { void fetchOrders() }, [fetchOrders])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-white">Vé đã mua</h1>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-white/60"><Loader2 className="h-5 w-5 animate-spin" /> Đang tải...</div>
      ) : orders.length === 0 ? (
        <p className="py-24 text-center text-white/50">Bạn chưa mua vé nào</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => <OrderCard key={order.id} order={order} onReviewed={fetchOrders} />)}
        </div>
      )}
    </div>
  )
}
