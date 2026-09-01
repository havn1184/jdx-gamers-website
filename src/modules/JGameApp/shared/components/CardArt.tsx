/**
 * CardArt — Logo thật của nhà cung cấp thẻ nếu có (nền trắng để logo rõ, đúng màu thương hiệu
 * gốc); mặc định (chưa sourcing logo thật) → card thương hiệu nền trắng sạch kiểu "logo card"
 * (napthengay.vn tham khảo): khối biểu tượng màu thương hiệu + tên NCC bên dưới, KHÔNG phủ
 * gradient toàn card như trước (nhìn giống ảnh minh hoạ chung chung hơn là logo thương hiệu).
 */
import { useState } from 'react'
import { Gamepad2, Sparkles, Smartphone, PlayCircle, Wallet, Apple, ShoppingBag } from 'lucide-react'
import type { MockCardArt } from '../../features/Public/catalog/types/card.types'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Gamepad2, Sparkles, Smartphone, PlayCircle, Wallet, Apple,
}

/** Gradient/icon mặc định khi không có `art` (BE không trả brandColor cho record đó). */
const DEFAULT_ART: MockCardArt = { gradient: ['#7C3AED', '#EC4899'], icon: 'Gamepad2' }

interface CardArtProps {
  art?: MockCardArt
  imageUrl?: string
  label: string
  className?: string
}

export function CardArt({ art, imageUrl, label, className }: CardArtProps) {
  const [imgError, setImgError] = useState(false)
  const resolvedArt = art ?? DEFAULT_ART
  const Icon = ICON_MAP[resolvedArt.icon] || ShoppingBag

  if (imageUrl && !imgError) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-white p-4 ${className ?? ''}`}>
        <img src={imageUrl} alt={label} loading='lazy' className='h-full w-full object-contain' onError={() => setImgError(true)} />
      </div>
    )
  }

  return (
    <div className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden bg-white p-3 ${className ?? ''}`}>
      <div
        className='flex aspect-square w-2/5 min-w-9 items-center justify-center rounded-xl'
        style={{ backgroundImage: `linear-gradient(135deg, ${resolvedArt.gradient[0]}, ${resolvedArt.gradient[1]})` }}
      >
        <Icon className='h-1/2 w-1/2 text-white' />
      </div>
      <span className='w-full truncate text-center text-xs font-semibold text-[#150829]'>{label}</span>
    </div>
  )
}
