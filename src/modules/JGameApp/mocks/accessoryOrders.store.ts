/**
 * Mock in-memory store cho đơn hàng phụ kiện (Giai đoạn 3) — TÁCH RIÊNG khỏi
 * `orders.store.ts` (đơn thẻ game) vì cấu trúc khác hẳn (nhiều dòng sản phẩm +
 * địa chỉ giao hàng + trạng thái giao vận), tránh ảnh hưởng luồng GĐ1 đang chạy ổn định.
 *
 * State machine (mô phỏng bằng setTimeout — mục 4 tài liệu GĐ3):
 * PENDING → PAID → PACKING → SHIPPING → DELIVERED
 */
import { findAccessoryById, MOCK_SHIPPING_METHODS } from './accessories.mock'
import { DEMO_ACCOUNTS } from './authUsers.store'
import type {
  AccessoryOrder, AccessoryOrderItem, CartItem, ShippingAddress, AccessoryOrderStatus,
} from '../features/Public/accessories/types/accessory.types'

const store = new Map<string, AccessoryOrder>()
let seq = 1

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400000).toISOString()
}

/** Seed lịch sử đơn phụ kiện demo cho tài khoản khách hàng demo — cùng mẫu với
 * `orders.store.ts`. State in-memory, seed thẳng vào `store`, không cần idempotent. */
function seedDemoAccessoryOrders(): void {
  const userId = DEMO_ACCOUNTS.customer.id
  const seeds: { productIds: string[]; shippingMethodId: string; status: AccessoryOrderStatus; daysAgoCreated: number; trackingCode?: string }[] = [
    { productIds: ['mouse-logitech-g502'], shippingMethodId: 'standard', status: 'DELIVERED', daysAgoCreated: 6 },
    { productIds: ['keyboard-corsair-k70', 'headset-hyperx-cloud2'], shippingMethodId: 'express', status: 'SHIPPING', daysAgoCreated: 2, trackingCode: 'JG20260827VN' },
    { productIds: ['chair-dxracer-formula'], shippingMethodId: 'standard', status: 'PACKING', daysAgoCreated: 1 },
  ]

  for (const s of seeds) {
    const shippingMethod = MOCK_SHIPPING_METHODS.find(m => m.id === s.shippingMethodId) || MOCK_SHIPPING_METHODS[0]
    const items: AccessoryOrderItem[] = s.productIds.map(id => {
      const product = findAccessoryById(id)
      if (!product) throw new Error(`Seed lỗi: không tìm thấy sản phẩm ${id}`)
      return { productId: product.id, productName: product.name, unitPrice: product.price, quantity: 1 }
    })
    const itemsTotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    const createdAt = daysAgo(s.daysAgoCreated)
    const shippingAddress: ShippingAddress = {
      fullName: 'Khách hàng Demo', phone: DEMO_ACCOUNTS.customer.phone, address: '123 Đường Láng, Đống Đa, Hà Nội',
    }
    const order: AccessoryOrder = {
      id: genId('ACO'),
      userId,
      items,
      shippingAddress,
      shippingMethodId: s.shippingMethodId,
      shippingFee: shippingMethod.fee,
      itemsTotal,
      totalAmount: itemsTotal + shippingMethod.fee,
      status: s.status,
      createdAt,
      updatedAt: createdAt,
      ...(s.trackingCode ? { trackingCode: s.trackingCode } : {}),
    }
    store.set(order.id, order)
  }
}
seedDemoAccessoryOrders()

function scheduleProgress(orderId: string, from: AccessoryOrderStatus, to: AccessoryOrderStatus, delayMs: number) {
  setTimeout(() => {
    const order = store.get(orderId)
    if (!order || order.status !== from) return
    order.status = to
    order.updatedAt = new Date().toISOString()
    if (to === 'SHIPPING' && !order.trackingCode) {
      order.trackingCode = `JG${Date.now().toString().slice(-8)}VN`
    }
  }, delayMs)
}

export function createMockAccessoryOrder(
  userId: string,
  items: CartItem[],
  shippingAddress: ShippingAddress,
  shippingMethodId: string,
  payWithJcoin?: boolean
): AccessoryOrder {
  const shippingMethod = MOCK_SHIPPING_METHODS.find(m => m.id === shippingMethodId) || MOCK_SHIPPING_METHODS[0]
  const orderItems = items.map(ci => {
    const product = findAccessoryById(ci.productId)
    if (!product) throw new Error('Sản phẩm không tồn tại')
    return { productId: product.id, productName: product.name, unitPrice: product.price, quantity: ci.quantity }
  })
  const itemsTotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

  const now = new Date().toISOString()
  const order: AccessoryOrder = {
    id: genId('ACO'),
    userId,
    items: orderItems,
    shippingAddress,
    shippingMethodId,
    shippingFee: shippingMethod.fee,
    itemsTotal,
    totalAmount: itemsTotal + shippingMethod.fee,
    status: payWithJcoin ? 'PAID' : 'PENDING',
    createdAt: now,
    updatedAt: now,
  }
  store.set(order.id, order)

  if (!payWithJcoin) scheduleProgress(order.id, 'PENDING', 'PAID', 3000)
  scheduleProgress(order.id, 'PAID', 'PACKING', (payWithJcoin ? 0 : 3000) + 2500)
  scheduleProgress(order.id, 'PACKING', 'SHIPPING', (payWithJcoin ? 0 : 3000) + 2500 + 4000)
  scheduleProgress(order.id, 'SHIPPING', 'DELIVERED', (payWithJcoin ? 0 : 3000) + 2500 + 4000 + 5000)

  return order
}

export function getMockAccessoryOrder(orderId: string): AccessoryOrder | undefined {
  return store.get(orderId)
}

export function listMockAccessoryOrdersByUser(userId: string): AccessoryOrder[] {
  return [...store.values()]
    .filter(o => o.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
