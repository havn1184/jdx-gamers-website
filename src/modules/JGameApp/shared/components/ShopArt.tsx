/**
 * ShopArt — Ảnh bìa gian hàng cybergame: ảnh thật (picsum theo seed) minh hoạ;
 * nếu ảnh lỗi/không tải được → fallback gradient + icon (đồng bộ pattern CardArt/AccessoryArt).
 */
import { memo, useState } from 'react'
import { Cpu, Zap, Trophy, Monitor, Gamepad2, Swords, ShoppingBag } from 'lucide-react'
import type { MockShopArt } from '../../features/Public/playtime/types/playtime.types'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu, Zap, Trophy, Monitor, Gamepad2, Swords,
}

interface ShopArtProps {
  art: MockShopArt
  imageUrl?: string
  label: string
  className?: string
}

export const ShopArt = memo(function ShopArt({ art, imageUrl, label, className }: ShopArtProps) {
  const [imgError, setImgError] = useState(false)
  const Icon = ICON_MAP[art.icon] || ShoppingBag

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
      style={{ backgroundImage: `linear-gradient(135deg, ${art.gradient[0]}, ${art.gradient[1]})` }}
    >
      <Icon className='h-1/3 w-1/3 text-white/90 drop-shadow-lg' />
      <span className='absolute bottom-2 left-2 right-2 truncate text-center text-xs font-semibold text-white/95 drop-shadow'>{label}</span>
    </div>
  )
})
