/**
 * AccessoryArt — Ảnh sản phẩm phụ kiện: ảnh thật (kho ảnh miễn phí Pexels) minh hoạ
 * đúng chủng loại; nếu ảnh lỗi/không tải được → fallback gradient + icon.
 */
import { memo, useState } from 'react'
import { Mouse, Keyboard, Headphones, Cpu, Monitor, Armchair, ShoppingBag } from 'lucide-react'
import type { MockAccessoryArt } from '../types/accessory.types'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Mouse, Keyboard, Headphones, Cpu, Monitor, Armchair,
}

interface AccessoryArtProps {
  art: MockAccessoryArt
  imageUrl?: string
  label: string
  className?: string
}

export const AccessoryArt = memo(function AccessoryArt({ art, imageUrl, label, className }: AccessoryArtProps) {
  const [imgError, setImgError] = useState(false)
  const Icon = ICON_MAP[art.icon] || ShoppingBag

  if (imageUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden bg-[#1a0d33] ${className ?? ''}`}>
        <img
          src={imageUrl}
          alt={label}
          loading='lazy'
          className='h-full w-full object-cover'
          onError={() => setImgError(true)}
        />
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
})
