/**
 * Types cho Kho phụ kiện Gamer (Giai đoạn 3 — URD mục 8).
 */

export type AccessoryCategory = 'mouse' | 'keyboard' | 'headset' | 'gpu' | 'pc' | 'monitor' | 'chair'

export interface MockAccessoryArt {
  gradient: [string, string]
  icon: string
}

export interface AccessoryProduct {
  id: string
  name: string
  category: AccessoryCategory
  /** Hãng sản xuất — dùng để lọc theo hãng (VD: Logitech, Razer, ASUS ROG...) */
  brand: string
  specs: string
  price: number
  stockQuantity: number
  status: 'active' | 'inactive'
  /** Ảnh thật từ kho ảnh miễn phí (Pexels) — sưu tầm theo danh mục, không phải ảnh chụp đúng sản phẩm */
  imageUrl: string
  /** Fallback khi ảnh lỗi/không tải được — gradient + icon */
  art: MockAccessoryArt
}

export interface AccessoryListParams {
  keyword?: string
  category?: AccessoryCategory | 'all'
  brand?: string | 'all'
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface ShippingMethod {
  id: string
  name: string
  fee: number
  etaDays: string
}

export interface ShippingAddress {
  fullName: string
  phone: string
  address: string
}

export type AccessoryOrderStatus = 'PENDING' | 'PAID' | 'PACKING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURNED'

export interface AccessoryOrderItem {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
}

export interface AccessoryOrder {
  id: string
  userId: string
  items: AccessoryOrderItem[]
  shippingAddress: ShippingAddress
  shippingMethodId: string
  shippingFee: number
  itemsTotal: number
  totalAmount: number
  status: AccessoryOrderStatus
  trackingCode?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAccessoryOrderPayload {
  items: CartItem[]
  shippingAddress: ShippingAddress
  shippingMethodId: string
  /** true khi đã trừ đủ JCoin cho đơn này — bỏ qua bước chờ QR (xem phân hệ Kiếm tiền) */
  payWithJcoin?: boolean
}
