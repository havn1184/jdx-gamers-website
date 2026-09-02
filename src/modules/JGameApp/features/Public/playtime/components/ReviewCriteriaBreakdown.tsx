/**
 * ReviewCriteriaBreakdown — hiển thị 4 tiêu chí (Vệ sinh/Đồ ăn/Thái độ phục vụ/Cấu hình máy tính)
 * của 1 đánh giá (20260902-nc_danh-gia-phong-game-da-tieu-chi.md). Ẩn hẳn nếu đánh giá tạo TRƯỚC
 * nâng cấp (cả 4 field null) — không hiển thị "N/A" gây rối UI.
 */
import type { PlaytimeReview } from '../types/playtime.types'

const CRITERIA: { key: keyof Pick<PlaytimeReview, 'ratingHygiene' | 'ratingFood' | 'ratingService' | 'ratingEquipment'>; label: string }[] = [
  { key: 'ratingHygiene', label: 'Vệ sinh' },
  { key: 'ratingFood', label: 'Đồ ăn' },
  { key: 'ratingService', label: 'Thái độ phục vụ' },
  { key: 'ratingEquipment', label: 'Cấu hình máy tính' },
]

export function ReviewCriteriaBreakdown({ review }: { review: PlaytimeReview }) {
  const hasBreakdown = CRITERIA.some(c => review[c.key] != null)
  if (!hasBreakdown) return null

  return (
    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/60">
      {CRITERIA.map(c => {
        const value = review[c.key]
        if (value == null) return null
        return (
          <div key={c.key} className="flex items-center gap-1">
            <span>{c.label}:</span>
            <span className="font-medium text-amber-300">{value} sao</span>
          </div>
        )
      })}
    </div>
  )
}
