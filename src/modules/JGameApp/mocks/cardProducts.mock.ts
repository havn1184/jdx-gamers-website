/**
 * Mock danh mục thẻ game (thay BE thật — xem shared/services/api/mockGate.ts).
 * Danh sách 12 nhà phát hành + logo thật (thu thập từ trang bán thẻ game thực tế),
 * mệnh giá chuẩn hoá 10k–1tr theo đúng quy ước ngành — không dùng gradient/icon giả cho nhóm này.
 */
import zingLogo from '../assets/card-logos/zing.png'
import vcoinLogo from '../assets/card-logos/vcoin.png'
import garenaLogo from '../assets/card-logos/garena.png'
import oncashLogo from '../assets/card-logos/oncash.png'
import funcardLogo from '../assets/card-logos/funcard.png'
import appotacardLogo from '../assets/card-logos/appotacard.png'
import bitLogo from '../assets/card-logos/bit.png'
import sohacoinLogo from '../assets/card-logos/sohacoin.png'
import gosuLogo from '../assets/card-logos/gosu.png'
import scoinLogo from '../assets/card-logos/scoin.png'
import kulgameLogo from '../assets/card-logos/kulgame.png'
import vgplayLogo from '../assets/card-logos/vgplay.png'
import type { CardProduct } from '../features/Public/catalog/types/card.types'

const STANDARD_FACE_VALUES = [10000, 20000, 50000, 100000, 200000, 500000, 1000000]

function denom(productId: string, faceValue: number, stock: number | null = 999) {
  return {
    id: `${productId}-${faceValue}`,
    productId,
    faceValue,
    sellPrice: faceValue,
    supplierSku: `${productId.toUpperCase()}-${faceValue}`,
    stockQuantity: stock,
    status: 'active' as const,
  }
}

function standardDenoms(productId: string) {
  return STANDARD_FACE_VALUES.map(v => denom(productId, v))
}

export const MOCK_CARD_PRODUCTS: CardProduct[] = [
  {
    id: 'zing', name: 'Thẻ Zing', category: 'game', supplierName: 'VNG',
    description: 'Nạp ZingXu cho các sản phẩm game và dịch vụ giải trí của VNG.',
    policyText: 'Mã thẻ có hiệu lực vĩnh viễn. Không hỗ trợ đổi trả sau khi đã hiển thị mã.',
    status: 'active', art: { gradient: ['#f97316', '#ef4444'], icon: 'Sparkles' }, imageUrl: zingLogo,
    denominations: standardDenoms('zing'),
  },
  {
    id: 'vcoin', name: 'Thẻ VTC (Vcoin)', category: 'game', supplierName: 'VTC',
    description: 'Thẻ đa năng nạp game và thanh toán dịch vụ nội dung số của VTC.',
    policyText: 'Mã thẻ có hiệu lực vĩnh viễn. Kiểm tra kỹ mệnh giá trước khi thanh toán.',
    status: 'active', art: { gradient: ['#f59e0b', '#78350f'], icon: 'Wallet' }, imageUrl: vcoinLogo,
    denominations: standardDenoms('vcoin'),
  },
  {
    id: 'garena', name: 'Thẻ Garena', category: 'game', supplierName: 'Garena',
    description: 'Nạp trực tiếp cho Liên Quân Mobile, Free Fire và các tựa game Garena khác.',
    policyText: 'Mã thẻ có hiệu lực vĩnh viễn. Liên hệ hỗ trợ nếu mã không sử dụng được trong vòng 24h.',
    status: 'active', art: { gradient: ['#dc2626', '#7f1d1d'], icon: 'Gamepad2' }, imageUrl: garenaLogo,
    denominations: standardDenoms('garena'),
  },
  {
    id: 'oncash', name: 'Thẻ OnCash', category: 'game', supplierName: 'Net2E',
    description: 'Nạp Liên Quân Mobile, PUBG Mobile, Free Fire, Đấu Trường Chân Lý, Tam Quốc Chí.',
    policyText: 'Mã thẻ có hiệu lực vĩnh viễn. Không hỗ trợ đổi trả sau khi đã hiển thị mã.',
    status: 'active', art: { gradient: ['#fbbf24', '#f59e0b'], icon: 'Sparkles' }, imageUrl: oncashLogo,
    denominations: standardDenoms('oncash'),
  },
  {
    id: 'funcard', name: 'Thẻ Funcard', category: 'game', supplierName: 'Funtap',
    description: 'Thẻ nạp độc quyền cho các tựa game phát hành bởi Funtap.',
    policyText: 'Mã thẻ có hiệu lực vĩnh viễn. Không hỗ trợ đổi trả sau khi đã hiển thị mã.',
    status: 'active', art: { gradient: ['#f97316', '#ea580c'], icon: 'Sparkles' }, imageUrl: funcardLogo,
    denominations: standardDenoms('funcard'),
  },
  {
    id: 'appota-card', name: 'Thẻ Appota', category: 'game', supplierName: 'Appota',
    description: 'Thẻ nạp game và ví điện tử phục vụ cộng đồng game thủ của Appota.',
    policyText: 'Mã thẻ có hiệu lực vĩnh viễn. Không hỗ trợ đổi trả sau khi đã hiển thị mã.',
    status: 'active', art: { gradient: ['#2563eb', '#1e3a8a'], icon: 'Wallet' }, imageUrl: appotacardLogo,
    denominations: standardDenoms('appota-card'),
  },
  {
    id: 'bit', name: 'Thẻ BIT', category: 'game', supplierName: 'BIT',
    description: 'Thẻ nạp game phổ biến với nhiều tựa game online tại Việt Nam.',
    policyText: 'Mã thẻ có hiệu lực vĩnh viễn. Không hỗ trợ đổi trả sau khi đã hiển thị mã.',
    status: 'active', art: { gradient: ['#312e81', '#1e1b4b'], icon: 'Gamepad2' }, imageUrl: bitLogo,
    denominations: standardDenoms('bit'),
  },
  {
    id: 'sohacoin', name: 'Thẻ SohaCoin', category: 'game', supplierName: 'SohaGame',
    description: 'Nạp SohaCoin cho các tựa game do SohaGame phát hành.',
    policyText: 'Mã thẻ có hiệu lực vĩnh viễn. Không hỗ trợ đổi trả sau khi đã hiển thị mã.',
    status: 'active', art: { gradient: ['#065f46', '#022c22'], icon: 'Wallet' }, imageUrl: sohacoinLogo,
    denominations: standardDenoms('sohacoin'),
  },
  {
    id: 'gosu', name: 'Thẻ Gosu', category: 'game', supplierName: 'Gosu',
    description: 'Nạp thẻ cho các tựa game do Gosu phát hành: Tru Tiên H5, Siêu Thần Mobile...',
    policyText: 'Mã thẻ có hiệu lực vĩnh viễn. Không hỗ trợ đổi trả sau khi đã hiển thị mã.',
    status: 'active', art: { gradient: ['#ea580c', '#c2410c'], icon: 'Sparkles' }, imageUrl: gosuLogo,
    denominations: standardDenoms('gosu'),
  },
  {
    id: 'scoin', name: 'Thẻ Scoin', category: 'game', supplierName: 'Scoin',
    description: 'Thẻ nạp game phổ thông, hỗ trợ nhiều tựa game online.',
    policyText: 'Mã thẻ có hiệu lực vĩnh viễn. Không hỗ trợ đổi trả sau khi đã hiển thị mã.',
    status: 'active', art: { gradient: ['#f59e0b', '#78350f'], icon: 'Wallet' }, imageUrl: scoinLogo,
    denominations: standardDenoms('scoin'),
  },
  {
    id: 'kulgame', name: 'Thẻ KulGame', category: 'game', supplierName: 'KulGame',
    description: 'Thẻ nạp game phổ thông, hỗ trợ nhiều tựa game online.',
    policyText: 'Mã thẻ có hiệu lực vĩnh viễn. Không hỗ trợ đổi trả sau khi đã hiển thị mã.',
    status: 'active', art: { gradient: ['#f97316', '#ea580c'], icon: 'Gamepad2' }, imageUrl: kulgameLogo,
    denominations: standardDenoms('kulgame'),
  },
  {
    id: 'vgplay', name: 'Thẻ VGPlay', category: 'game', supplierName: 'VGPlay',
    description: 'Thẻ nạp game phổ thông, hỗ trợ nhiều tựa game online.',
    policyText: 'Mã thẻ có hiệu lực vĩnh viễn. Không hỗ trợ đổi trả sau khi đã hiển thị mã.',
    status: 'active', art: { gradient: ['#f97316', '#fb923c'], icon: 'Sparkles' }, imageUrl: vgplayLogo,
    denominations: standardDenoms('vgplay'),
  },
]

export function findProductById(id: string): CardProduct | undefined {
  return MOCK_CARD_PRODUCTS.find(p => p.id === id)
}

export function findDenominationById(id: string) {
  for (const product of MOCK_CARD_PRODUCTS) {
    const d = product.denominations.find(x => x.id === id)
    if (d) return { product, denomination: d }
  }
  return undefined
}
