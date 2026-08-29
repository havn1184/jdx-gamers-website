/**
 * CardArt — Logo thật của nhà cung cấp thẻ (nền sáng để logo rõ, đúng màu thương hiệu gốc);
 * nếu không có ảnh hoặc ảnh lỗi → fallback gradient CSS + icon (không dùng logo giả).
 */
import { useState } from 'react'
import { Gamepad2, Sparkles, Smartphone, PlayCircle, Wallet, Apple, ShoppingBag } from 'lucide-react'
import type { MockCardArt } from '../../features/Public/catalog/types/card.types'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Gamepad2, Sparkles, Smartphone, PlayCircle, Wallet, Apple,
}

interface CardArtProps {
  art: MockCardArt
  imageUrl?: string
  label: string
  className?: string
}

export function CardArt({ art, imageUrl, label, className }: CardArtProps) {
  const [imgError, setImgError] = useState(false)
  const Icon = ICON_MAP[art.icon] || ShoppingBag

  if (imageUrl && !imgError) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-white p-4 ${className ?? ''}`}>
        <img src={imageUrl} alt={label} loading='lazy' className='h-full w-full object-contain' onError={() => setImgError(true)} />
      </div>
    )
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className ?? ''}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${art.gradient[0]}, ${art.gradient[1]})` }}
    >
      <Icon className='h-1/3 w-1/3 text-white/90 drop-shadow-lg' />
      <span className='absolute bottom-2 left-2 right-2 truncate text-center text-xs font-semibold text-white/95 drop-shadow'>
        {label}
      </span>
    </div>
  )
}
