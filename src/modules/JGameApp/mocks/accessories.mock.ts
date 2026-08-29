/**
 * Mock danh mục phụ kiện Gamer (Giai đoạn 3).
 * Ảnh: sưu tầm từ kho ảnh miễn phí Pexels (free license, không cần ghi nguồn) —
 * ảnh minh hoạ đúng chủng loại sản phẩm, KHÔNG phải ảnh chụp chính xác từng model.
 * Gradient (`art`) chỉ dùng làm fallback khi ảnh lỗi/không tải được.
 */
import type { AccessoryProduct, ShippingMethod } from '../features/Public/accessories/types/accessory.types'

export const MOCK_ACCESSORY_PRODUCTS: AccessoryProduct[] = [
  {
    id: 'mouse-logitech-g502', name: 'Chuột Logitech G502 HERO', category: 'mouse', brand: 'Logitech',
    specs: '25600 DPI · 11 nút · Hero Sensor · Có dây', price: 990000, stockQuantity: 24, status: 'active',
    imageUrl: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=600',
    art: { gradient: ['#7C3AED', '#EC4899'], icon: 'Mouse' },
  },
  {
    id: 'mouse-razer-deathadder', name: 'Chuột Razer DeathAdder V3', category: 'mouse', brand: 'Razer',
    specs: '30000 DPI · Siêu nhẹ 59g · Wireless', price: 1490000, stockQuantity: 40, status: 'active',
    imageUrl: 'https://images.pexels.com/photos/1486294/pexels-photo-1486294.jpeg?auto=compress&cs=tinysrgb&w=600',
    art: { gradient: ['#22D3EE', '#3B82F6'], icon: 'Mouse' },
  },
  {
    id: 'keyboard-corsair-k70', name: 'Bàn phím cơ Corsair K70 RGB', category: 'keyboard', brand: 'Corsair',
    specs: 'Switch Cherry MX Red · Hotswap · RGB Per-key · Full size', price: 2590000, stockQuantity: 15, status: 'active',
    imageUrl: 'https://images.pexels.com/photos/841228/pexels-photo-841228.jpeg?auto=compress&cs=tinysrgb&w=600',
    art: { gradient: ['#F97316', '#EF4444'], icon: 'Keyboard' },
  },
  {
    id: 'keyboard-razer-huntsman-mini', name: 'Bàn phím cơ Razer Huntsman Mini', category: 'keyboard', brand: 'Razer',
    specs: 'Switch Optical · 60% · Nhỏ gọn · RGB', price: 2190000, stockQuantity: 20, status: 'active',
    imageUrl: 'https://images.pexels.com/photos/920631/pexels-photo-920631.jpeg?auto=compress&cs=tinysrgb&w=600',
    art: { gradient: ['#A78BFA', '#7C3AED'], icon: 'Keyboard' },
  },
  {
    id: 'headset-steelseries-arctis7', name: 'Tai nghe SteelSeries Arctis 7', category: 'headset', brand: 'SteelSeries',
    specs: 'Không dây 2.4GHz · Pin 24h · Mic khử ồn ClearCast', price: 3290000, stockQuantity: 30, status: 'active',
    imageUrl: 'https://images.pexels.com/photos/18441496/pexels-photo-18441496.jpeg?auto=compress&cs=tinysrgb&w=600',
    art: { gradient: ['#10B981', '#22D3EE'], icon: 'Headphones' },
  },
  {
    id: 'headset-hyperx-cloud2', name: 'Tai nghe HyperX Cloud II', category: 'headset', brand: 'HyperX',
    specs: '7.1 Surround ảo · Đệm memory foam · Có dây', price: 1690000, stockQuantity: 12, status: 'active',
    imageUrl: 'https://images.pexels.com/photos/28993111/pexels-photo-28993111.jpeg?auto=compress&cs=tinysrgb&w=600',
    art: { gradient: ['#EC4899', '#7C3AED'], icon: 'Headphones' },
  },
  {
    id: 'gpu-nvidia-rtx4070', name: 'Card đồ họa NVIDIA GeForce RTX 4070', category: 'gpu', brand: 'NVIDIA',
    specs: '12GB GDDR6X · Ray Tracing · DLSS 3', price: 14990000, stockQuantity: 6, status: 'active',
    imageUrl: 'https://images.pexels.com/photos/18338417/pexels-photo-18338417.jpeg?auto=compress&cs=tinysrgb&w=600',
    art: { gradient: ['#76B900', '#1E293B'], icon: 'Cpu' },
  },
  {
    id: 'gpu-amd-rx7800xt', name: 'Card đồ họa AMD Radeon RX 7800 XT', category: 'gpu', brand: 'AMD',
    specs: '16GB GDDR6 · RDNA 3 · FSR 3', price: 12990000, stockQuantity: 4, status: 'active',
    imageUrl: 'https://images.pexels.com/photos/8622911/pexels-photo-8622911.jpeg?auto=compress&cs=tinysrgb&w=600',
    art: { gradient: ['#EF4444', '#1E293B'], icon: 'Cpu' },
  },
  {
    id: 'pc-asus-rog-strix', name: 'PC Gaming ASUS ROG Strix', category: 'pc', brand: 'ASUS ROG',
    specs: 'RTX 4070 · Core i7 · 32GB RAM · 1TB SSD', price: 32900000, stockQuantity: 5, status: 'active',
    imageUrl: 'https://images.pexels.com/photos/13071304/pexels-photo-13071304.jpeg?auto=compress&cs=tinysrgb&w=600',
    art: { gradient: ['#1E293B', '#7C3AED'], icon: 'Cpu' },
  },
  {
    id: 'monitor-samsung-odyssey', name: 'Màn hình Samsung Odyssey G7 27"', category: 'monitor', brand: 'Samsung',
    specs: '27 inch · QHD · 240Hz · 1ms · Cong 1000R', price: 9990000, stockQuantity: 10, status: 'active',
    imageUrl: 'https://images.pexels.com/photos/1383833/pexels-photo-1383833.jpeg?auto=compress&cs=tinysrgb&w=600',
    art: { gradient: ['#3B82F6', '#1E293B'], icon: 'Monitor' },
  },
  {
    id: 'chair-secretlab-titan', name: 'Ghế Gaming Secretlab Titan Evo', category: 'chair', brand: 'Secretlab',
    specs: 'Da PU cao cấp · Tựa lưng ngả 165° · Kê tay 4D', price: 8990000, stockQuantity: 8, status: 'active',
    imageUrl: 'https://images.pexels.com/photos/7862508/pexels-photo-7862508.jpeg?auto=compress&cs=tinysrgb&w=600',
    art: { gradient: ['#EF4444', '#7C3AED'], icon: 'Armchair' },
  },
  {
    id: 'chair-dxracer-formula', name: 'Ghế Gaming DXRacer Formula', category: 'chair', brand: 'DXRacer',
    specs: 'Vải lưới thoáng khí · Điều chỉnh độ cao · Ngả 135°', price: 4290000, stockQuantity: 0, status: 'active',
    imageUrl: 'https://images.pexels.com/photos/4317157/pexels-photo-4317157.jpeg?auto=compress&cs=tinysrgb&w=600',
    art: { gradient: ['#F59E0B', '#EF4444'], icon: 'Armchair' },
  },
]

export const MOCK_SHIPPING_METHODS: ShippingMethod[] = [
  { id: 'standard', name: 'Giao hàng tiêu chuẩn', fee: 30000, etaDays: '3-5 ngày' },
  { id: 'express', name: 'Giao hàng nhanh', fee: 60000, etaDays: '1-2 ngày' },
  { id: 'freeship', name: 'Miễn phí vận chuyển (đơn từ 5.000.000đ)', fee: 0, etaDays: '4-6 ngày' },
]

/** Danh sách hãng — auto-derive từ dữ liệu sản phẩm, dùng cho filter "Hãng sản xuất". */
export const MOCK_ACCESSORY_BRANDS: string[] = Array.from(new Set(MOCK_ACCESSORY_PRODUCTS.map(p => p.brand))).sort()

export function findAccessoryById(id: string): AccessoryProduct | undefined {
  return MOCK_ACCESSORY_PRODUCTS.find(p => p.id === id)
}
