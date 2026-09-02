/**
 * Mock in-memory store cho Chợ vé giờ chơi Cybergame (Giai đoạn 2 — URD mục 7):
 * gian hàng (CybergameShop) + khu vực (PlaytimeZone) + vé giờ chơi (PlaytimeTicket).
 *
 * "Sôi động": 1 setInterval mô phỏng người khác đang đặt vé — giảm dần availableSlots
 * của vài vé đang active mỗi 4-6s. Toàn bộ reset khi reload trang (mock GĐ2, không phải BE thật).
 */
import type {
  CybergameShop, PlaytimeZone, PlaytimeTicket, PlaytimeTicketView,
  RegisterShopPayload, UpsertZonePayload, UpsertTicketPayload, ShopListParams, ZoneType,
} from '../features/Public/playtime/types/playtime.types'
import spartacus1 from '../assets/cho-ve/image-1787970001327.webp'
import spartacus2 from '../assets/cho-ve/image-1787970010199.png'
import spartacus3 from '../assets/cho-ve/image-1787970015173.png'
import spartacus4 from '../assets/cho-ve/image-1787970018766.png'
import spartacus5 from '../assets/cho-ve/image-1787970022120.png'

let seq = 1
function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`
}

// Ảnh thật từ kho ảnh miễn phí (Pexels) — minh hoạ đúng không khí phòng gaming/cyber center,
// không dùng ảnh của bất kỳ thương hiệu/cá nhân có thật nào (tránh vấn đề bản quyền/gán nhầm thương hiệu).
const shops: CybergameShop[] = [
  {
    id: 'shop-alpha', ownerId: 'demo-shop-owner-1', name: 'Alpha Cyber Center', city: 'Hà Nội',
    address: '12 Trần Duy Hưng, Cầu Giấy', description: 'Phòng máy cấu hình cao, 100+ chỗ, ghế gaming DXRacer.',
    imageUrl: 'https://images.pexels.com/photos/9072216/pexels-photo-9072216.jpeg', art: { gradient: ['#7C3AED', '#EC4899'], icon: 'Cpu' },
    status: 'active', syncMode: 'netbarbox', rating: 4.8, reviewCount: 0, totalSold: 3520, createdAt: new Date(Date.now() - 200 * 86400000).toISOString(),
  },
  {
    id: 'shop-nova', ownerId: 'demo-shop-owner-2', name: 'Nova Gaming House', city: 'TP. Hồ Chí Minh',
    address: '88 Nguyễn Văn Cừ, Quận 5', description: 'Chuỗi phòng game lớn nhất khu vực, hỗ trợ thi đấu giải.',
    imageUrl: 'https://images.pexels.com/photos/9072388/pexels-photo-9072388.jpeg', art: { gradient: ['#22D3EE', '#7C3AED'], icon: 'Zap' },
    status: 'active', syncMode: 'dodonew', rating: 4.6, reviewCount: 0, totalSold: 5180, createdAt: new Date(Date.now() - 400 * 86400000).toISOString(),
  },
  {
    id: 'shop-phoenix', ownerId: 'demo-shop-owner-3', name: 'Phoenix Esports Zone', city: 'Đà Nẵng',
    address: '45 Nguyễn Văn Linh, Hải Châu', description: 'Không gian thi đấu chuyên nghiệp, màn hình 240Hz.',
    imageUrl: 'https://images.pexels.com/photos/6125337/pexels-photo-6125337.jpeg', art: { gradient: ['#F97316', '#EF4444'], icon: 'Trophy' },
    status: 'active', syncMode: 'manual', rating: 4.9, reviewCount: 0, totalSold: 2140, createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
  },
  {
    id: 'shop-titan', ownerId: 'demo-shop-owner-4', name: 'Titan NetHub', city: 'Hà Nội',
    address: '200 Xã Đàn, Đống Đa', description: 'Giá rẻ, gần trường học, mở cửa 24/7.',
    imageUrl: 'https://images.pexels.com/photos/7849510/pexels-photo-7849510.jpeg', art: { gradient: ['#22C55E', '#0EA5E9'], icon: 'Monitor' },
    status: 'active', syncMode: 'netbarbox', rating: 4.3, reviewCount: 0, totalSold: 4310, createdAt: new Date(Date.now() - 300 * 86400000).toISOString(),
  },
  {
    id: 'shop-vortex', ownerId: 'demo-shop-owner-5', name: 'Vortex Gaming', city: 'TP. Hồ Chí Minh',
    address: '15 Cách Mạng Tháng 8, Quận 3', description: 'Setup RGB, ghế massage, phòng VIP riêng biệt.',
    imageUrl: 'https://images.pexels.com/photos/4317157/pexels-photo-4317157.jpeg', art: { gradient: ['#EC4899', '#F97316'], icon: 'Gamepad2' },
    status: 'active', syncMode: 'manual', rating: 4.7, reviewCount: 0, totalSold: 1890, createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'shop-spartacus', ownerId: 'demo-shop-owner-6', name: 'Spartacus Gaming', city: 'Hà Nội',
    address: '25 Láng Hạ, Ba Đình', description: 'The Gateway To The Heaven — không gian thi đấu phong cách đấu trường, khu Couple Zone, khu hút thuốc riêng biệt.',
    imageUrl: spartacus1, galleryImages: [spartacus1, spartacus2, spartacus3, spartacus4, spartacus5],
    art: { gradient: ['#DC2626', '#111827'], icon: 'Swords' },
    status: 'active', syncMode: 'netbarbox', rating: 4.9, reviewCount: 0, totalSold: 6240, createdAt: new Date(Date.now() - 500 * 86400000).toISOString(),
  },
]

const zones: PlaytimeZone[] = [
  { id: 'zone-alpha-std', shopId: 'shop-alpha', name: 'Khu Thường', zoneType: 'standard', specs: 'i5-12400F · RTX 3060 · 144Hz', totalSeats: 40 },
  { id: 'zone-alpha-vip', shopId: 'shop-alpha', name: 'Khu VIP', zoneType: 'vip', specs: 'i7-13700F · RTX 4070 · 165Hz', totalSeats: 20 },
  { id: 'zone-alpha-high', shopId: 'shop-alpha', name: 'Khu Cấu Hình Cao', zoneType: 'highend', specs: 'i9-14900K · RTX 4090 · 240Hz', totalSeats: 10 },

  { id: 'zone-nova-std', shopId: 'shop-nova', name: 'Khu Thường', zoneType: 'standard', specs: 'i5-12400F · RTX 3060', totalSeats: 60 },
  { id: 'zone-nova-vip', shopId: 'shop-nova', name: 'Khu VIP', zoneType: 'vip', specs: 'i7-13700F · RTX 4070 Ti', totalSeats: 25 },

  { id: 'zone-phoenix-high', shopId: 'shop-phoenix', name: 'Khu Thi Đấu', zoneType: 'highend', specs: 'i9-13900K · RTX 4080 · 240Hz', totalSeats: 15 },
  { id: 'zone-phoenix-std', shopId: 'shop-phoenix', name: 'Khu Thường', zoneType: 'standard', specs: 'i5-13400F · RTX 4060', totalSeats: 30 },

  { id: 'zone-titan-std', shopId: 'shop-titan', name: 'Khu Thường', zoneType: 'standard', specs: 'i3-12100F · GTX 1660', totalSeats: 50 },
  { id: 'zone-titan-vip', shopId: 'shop-titan', name: 'Khu VIP', zoneType: 'vip', specs: 'i5-13400F · RTX 3070', totalSeats: 15 },

  { id: 'zone-vortex-vip', shopId: 'shop-vortex', name: 'Khu VIP', zoneType: 'vip', specs: 'i7-13700F · RTX 4070', totalSeats: 20 },
  { id: 'zone-vortex-high', shopId: 'shop-vortex', name: 'Khu Cấu Hình Cao', zoneType: 'highend', specs: 'i9-14900K · RTX 4090', totalSeats: 8 },

  { id: 'zone-spartacus-std', shopId: 'shop-spartacus', name: 'Khu AMG Zone', zoneType: 'standard', specs: 'i5-13400F · RTX 4060 · 165Hz', totalSeats: 45 },
  { id: 'zone-spartacus-couple', shopId: 'shop-spartacus', name: 'Couple Zone', zoneType: 'vip', specs: 'i7-13700F · RTX 4070 Ti · Ghế đôi', totalSeats: 12 },
  { id: 'zone-spartacus-high', shopId: 'shop-spartacus', name: 'Khu Thi Đấu', zoneType: 'highend', specs: 'i9-14900K · RTX 4090 · 240Hz', totalSeats: 16 },
]

function ticket(
  id: string, shopId: string, zoneId: string, hours: number, originalPrice: number, sellPrice: number,
  totalSlots: number, availableSlots: number, isFlashSale = false
): PlaytimeTicket {
  const discountPercent = originalPrice > 0 ? Math.round((1 - sellPrice / originalPrice) * 100) : 0
  return {
    id, shopId, zoneId, hours, originalPrice, sellPrice, discountPercent, totalSlots, availableSlots,
    isFlashSale, flashSaleEndsAt: isFlashSale ? new Date(Date.now() + 45 * 60 * 1000).toISOString() : undefined,
    status: 'active',
  }
}

const tickets: PlaytimeTicket[] = [
  ticket('tk-alpha-std-2h', 'shop-alpha', 'zone-alpha-std', 2, 20000, 20000, 40, 32),
  ticket('tk-alpha-vip-3h', 'shop-alpha', 'zone-alpha-vip', 3, 45000, 45000, 20, 14),
  ticket('tk-alpha-high-free', 'shop-alpha', 'zone-alpha-high', 1, 60000, 0, 5, 5, true),
  ticket('tk-alpha-high-5h', 'shop-alpha', 'zone-alpha-high', 5, 150000, 99000, 10, 6),

  ticket('tk-nova-std-4h', 'shop-nova', 'zone-nova-std', 4, 40000, 12000, 60, 41, true),
  ticket('tk-nova-vip-2h', 'shop-nova', 'zone-nova-vip', 2, 30000, 30000, 25, 19),
  ticket('tk-nova-vip-free', 'shop-nova', 'zone-nova-vip', 1, 35000, 0, 3, 3, true),

  ticket('tk-phoenix-high-3h', 'shop-phoenix', 'zone-phoenix-high', 3, 90000, 27000, 15, 9, true),
  ticket('tk-phoenix-std-2h', 'shop-phoenix', 'zone-phoenix-std', 2, 18000, 18000, 30, 24),

  ticket('tk-titan-std-3h', 'shop-titan', 'zone-titan-std', 3, 15000, 15000, 50, 38),
  ticket('tk-titan-std-free', 'shop-titan', 'zone-titan-std', 1, 15000, 0, 4, 4, true),
  ticket('tk-titan-vip-4h', 'shop-titan', 'zone-titan-vip', 4, 60000, 45000, 15, 8),

  ticket('tk-vortex-vip-2h', 'shop-vortex', 'zone-vortex-vip', 2, 40000, 40000, 20, 16),
  ticket('tk-vortex-high-6h', 'shop-vortex', 'zone-vortex-high', 6, 240000, 168000, 8, 5, true),

  ticket('tk-spartacus-std-3h', 'shop-spartacus', 'zone-spartacus-std', 3, 30000, 25000, 45, 33),
  ticket('tk-spartacus-couple-2h', 'shop-spartacus', 'zone-spartacus-couple', 2, 70000, 70000, 12, 7),
  ticket('tk-spartacus-high-4h', 'shop-spartacus', 'zone-spartacus-high', 4, 160000, 112000, 16, 10, true),
]

function toView(t: PlaytimeTicket): PlaytimeTicketView | undefined {
  const zone = zones.find(z => z.id === t.zoneId)
  const shop = zone ? shops.find(s => s.id === zone.shopId) : undefined
  if (!zone || !shop) return undefined
  return {
    ...t, shopName: shop.name, shopCity: shop.city, shopImageUrl: shop.imageUrl,
    // shop.art là optional trong CybergameShop nhưng shopArt bắt buộc ở PlaytimeTicketView — mọi
    // shop mock đều khai báo art thật, fallback chỉ để khớp type (giống PlaytimeApiService.mapTicketView).
    shopArt: shop.art ?? { gradient: ['#7C3AED', '#EC4899'], icon: 'Gamepad2' },
    shopRating: shop.rating, zoneName: zone.name, zoneType: zone.zoneType,
  }
}

export function listShops(params?: ShopListParams): CybergameShop[] {
  const keyword = params?.keyword?.trim().toLowerCase()
  return shops.filter(s => {
    if (s.status !== 'active') return false
    if (params?.city && params.city !== 'all' && s.city !== params.city) return false
    if (keyword && !s.name.toLowerCase().includes(keyword) && !s.city.toLowerCase().includes(keyword)) return false
    return true
  })
}

export function listCities(): string[] {
  return Array.from(new Set(shops.map(s => s.city))).sort()
}

export function getShopById(shopId: string): CybergameShop | undefined {
  return shops.find(s => s.id === shopId)
}

export function getShopByOwnerId(ownerId: string): CybergameShop | undefined {
  return shops.find(s => s.ownerId === ownerId)
}

export function listZonesByShop(shopId: string): PlaytimeZone[] {
  return zones.filter(z => z.shopId === shopId)
}

export function listTicketViewsByShop(shopId: string, zoneType?: ZoneType | 'all'): PlaytimeTicketView[] {
  return tickets
    .filter(t => t.shopId === shopId && t.status === 'active')
    .filter(t => !zoneType || zoneType === 'all' || zones.find(z => z.id === t.zoneId)?.zoneType === zoneType)
    .map(toView)
    .filter((v): v is PlaytimeTicketView => Boolean(v))
}

export function listAllActiveTicketViews(): PlaytimeTicketView[] {
  return tickets.filter(t => t.status === 'active').map(toView).filter((v): v is PlaytimeTicketView => Boolean(v))
}

export function listFlashSaleTicketViews(): PlaytimeTicketView[] {
  return listAllActiveTicketViews().filter(t => t.isFlashSale && t.availableSlots > 0)
}

export function listFeaturedShops(limit = 6): CybergameShop[] {
  return [...shops].filter(s => s.status === 'active').sort((a, b) => b.totalSold - a.totalSold).slice(0, limit)
}

export function getTicketById(ticketId: string): PlaytimeTicket | undefined {
  return tickets.find(t => t.id === ticketId)
}

export function getTicketViewById(ticketId: string): PlaytimeTicketView | undefined {
  const t = getTicketById(ticketId)
  return t ? toView(t) : undefined
}

/** Giữ chỗ ngay khi tạo đơn (FR-7.2.4) — trả về false nếu hết chỗ. */
export function reserveTicketSlot(ticketId: string): boolean {
  const t = getTicketById(ticketId)
  if (!t || t.availableSlots <= 0) return false
  t.availableSlots -= 1
  return true
}

/** Hoàn lại chỗ khi đơn hết hạn/hủy trước khi thanh toán. */
export function releaseTicketSlot(ticketId: string): void {
  const t = getTicketById(ticketId)
  if (t) t.availableSlots += 1
}

// ── Chủ Cybergame — CRUD gian hàng/zone/vé ─────────────────────────────────

export function registerShop(ownerId: string, payload: RegisterShopPayload): CybergameShop {
  const shop: CybergameShop = {
    id: genId('shop'), ownerId, name: payload.name, city: payload.city, address: payload.address,
    description: payload.description, imageUrl: 'https://images.pexels.com/photos/6125337/pexels-photo-6125337.jpeg',
    art: { gradient: ['#7C3AED', '#EC4899'], icon: 'Gamepad2' }, status: 'active', syncMode: 'manual',
    rating: 5, reviewCount: 0, totalSold: 0, createdAt: new Date().toISOString(),
  }
  shops.push(shop)
  return shop
}

export function updateShopSyncMode(shopId: string, syncMode: CybergameShop['syncMode']): CybergameShop | undefined {
  const shop = getShopById(shopId)
  if (!shop) return undefined
  shop.syncMode = syncMode
  return shop
}

export function updateShopProfile(shopId: string, payload: { name: string; city: string; address: string; description: string }): CybergameShop | undefined {
  const shop = getShopById(shopId)
  if (!shop) return undefined
  shop.name = payload.name
  shop.city = payload.city
  shop.address = payload.address
  shop.description = payload.description
  return shop
}

/** Đồng bộ mock từ NetBarBox/DoDoNew — cập nhật ngẫu nhiên availableSlots các vé của gian hàng. */
export function syncShopNow(shopId: string): PlaytimeTicketView[] {
  tickets
    .filter(t => t.shopId === shopId)
    .forEach(t => {
      t.availableSlots = Math.max(0, Math.min(t.totalSlots, t.availableSlots + Math.floor(Math.random() * 7) - 3))
    })
  return listTicketViewsByShop(shopId)
}

export function upsertZone(shopId: string, payload: UpsertZonePayload): PlaytimeZone {
  if (payload.id) {
    const existing = zones.find(z => z.id === payload.id && z.shopId === shopId)
    if (existing) {
      existing.name = payload.name
      existing.zoneType = payload.zoneType
      existing.specs = payload.specs
      existing.totalSeats = payload.totalSeats
      return existing
    }
  }
  const zone: PlaytimeZone = { id: genId('zone'), shopId, name: payload.name, zoneType: payload.zoneType, specs: payload.specs, totalSeats: payload.totalSeats }
  zones.push(zone)
  return zone
}

export function deleteZone(shopId: string, zoneId: string): void {
  const idx = zones.findIndex(z => z.id === zoneId && z.shopId === shopId)
  if (idx !== -1) zones.splice(idx, 1)
  for (let i = tickets.length - 1; i >= 0; i--) {
    if (tickets[i].zoneId === zoneId) tickets.splice(i, 1)
  }
}

export function upsertTicket(shopId: string, payload: UpsertTicketPayload): PlaytimeTicket {
  const discountPercent = payload.originalPrice > 0 ? Math.round((1 - payload.sellPrice / payload.originalPrice) * 100) : 0
  if (payload.id) {
    const existing = tickets.find(t => t.id === payload.id && t.shopId === shopId)
    if (existing) {
      existing.zoneId = payload.zoneId
      existing.hours = payload.hours
      existing.originalPrice = payload.originalPrice
      existing.sellPrice = payload.sellPrice
      existing.discountPercent = discountPercent
      existing.totalSlots = payload.totalSlots
      existing.availableSlots = payload.availableSlots
      existing.isFlashSale = payload.isFlashSale
      if (payload.status) existing.status = payload.status
      return existing
    }
  }
  const t: PlaytimeTicket = {
    id: genId('tk'), shopId, zoneId: payload.zoneId, hours: payload.hours, originalPrice: payload.originalPrice,
    sellPrice: payload.sellPrice, discountPercent, totalSlots: payload.totalSlots, availableSlots: payload.availableSlots,
    isFlashSale: payload.isFlashSale, flashSaleEndsAt: payload.isFlashSale ? new Date(Date.now() + 60 * 60 * 1000).toISOString() : undefined,
    status: 'active',
  }
  tickets.push(t)
  return t
}

export function deleteTicket(shopId: string, ticketId: string): void {
  const idx = tickets.findIndex(t => t.id === ticketId && t.shopId === shopId)
  if (idx !== -1) tickets.splice(idx, 1)
}

export function listTicketsByShopRaw(shopId: string): PlaytimeTicket[] {
  return tickets.filter(t => t.shopId === shopId)
}

export function incrementShopSold(shopId: string, quantity: number): void {
  const shop = getShopById(shopId)
  if (shop) shop.totalSold += quantity
}
