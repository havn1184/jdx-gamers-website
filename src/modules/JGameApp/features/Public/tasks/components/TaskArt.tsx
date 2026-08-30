/**
 * TaskArt — Ảnh minh hoạ game trong nhiệm vụ: ưu tiên ảnh thật (gameplay stock ảnh miễn phí),
 * fallback gradient CSS + icon theo dạng yêu cầu khi không có/lỗi ảnh.
 */
import { useState } from 'react'
import { Trophy, Timer, Gem, Swords, ShoppingBag } from 'lucide-react'
import type { MockTaskArt } from '../types/task.types'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = { Trophy, Timer, Gem, Swords }

/** Gradient/icon mặc định khi không có `art` (BE thật không trả field này — chỉ nhánh mock
 * Website có sẵn `art` trang trí). Xem ghi chú tại `types/task.types.ts`. */
const DEFAULT_ART: MockTaskArt = { gradient: ['#7C3AED', '#0ea5e9'], icon: 'Trophy' }

interface TaskArtProps {
  art?: MockTaskArt
  imageUrl?: string
  label: string
  className?: string
}

export function TaskArt({ art, imageUrl, label, className }: TaskArtProps) {
  const [imgError, setImgError] = useState(false)
  const resolvedArt = art ?? DEFAULT_ART
  const Icon = ICON_MAP[resolvedArt.icon] || ShoppingBag

  if (imageUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden bg-[#1a0d33] ${className ?? ''}`}>
        <img src={imageUrl} alt={label} loading='lazy' className='h-full w-full object-cover' onError={() => setImgError(true)} />
      </div>
    )
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className ?? ''}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${resolvedArt.gradient[0]}, ${resolvedArt.gradient[1]})` }}
    >
      <Icon className='h-1/3 w-1/3 text-white/90 drop-shadow-lg' />
      <span className='absolute bottom-2 left-2 right-2 truncate text-center text-xs font-semibold text-white/95 drop-shadow'>{label}</span>
    </div>
  )
}
