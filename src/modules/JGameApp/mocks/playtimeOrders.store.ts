/**
 * Mock in-memory order store cho vé giờ chơi Cybergame — TÁCH RIÊNG khỏi `orders.store.ts`
 * (đơn thẻ game) vì đặt vé cần giữ chỗ (reservation lock — FR-7.2.4) và có bước
 * "Xác nhận khách đã dùng vé" phía chủ gian hàng (không có ở luồng thẻ game).
 *
 * State machine: PENDING → PAID → CONFIRMED → USED (chủ gian hàng xác nhận thủ công)
 *                PENDING → EXPIRED (hết hạn giữ chỗ 5 phút, hoàn lại slot)
 */
import { getTicketById, reserveTicketSlot, releaseTicketSlot, getShopById, listZonesByShop, incrementShopSold } from './playtimeShops.store'
import { hasClaimedFreeTicketThisWeek, recordFreeTicketClaim } from './freeTicketClaims.store'
import { DEMO_ACCOUNTS } from './authUsers.store'
import type { PlaytimeOrder, PlaytimeOrderStatus } from '../features/Public/playtime/types/playtime.types'

const store = new Map<string, PlaytimeOrder>()
let seq = 1

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400000).toISOString()
}

/** Seed lịch sử đơn vé giờ chơi demo cho tài khoản khách hàng demo — cùng mẫu với
 * `orders.store.ts`. State in-memory, seed thẳng vào `store`, không cần idempotent. */
function seedDemoPlaytimeOrders(): void {
  const userId = DEMO_ACCOUNTS.customer.id
  const seeds: { ticketId: string; quantity: number; status: PlaytimeOrderStatus; daysAgoCreated: number }[] = [
    { ticketId: 'tk-alpha-std-2h', quantity: 1, status: 'USED', daysAgoCreated: 8 },
    { ticketId: 'tk-nova-vip-2h', quantity: 2, status: 'CONFIRMED', daysAgoCreated: 3 },
    { ticketId: 'tk-phoenix-std-2h', quantity: 1, status: 'CONFIRMED', daysAgoCreated: 1 },
    // Bổ sung đơn gần đây cho Alpha Cyber Center — để Tổng quan gian hàng (doanh thu hôm nay/7 ngày,
    // đơn mới, vé bán chạy) có dữ liệu minh hoạ thay vì toàn 0đ (đơn USED cách đây 8 ngày ở trên
    // đã ngoài khung "7 ngày" nên không đủ).
    { ticketId: 'tk-alpha-vip-3h', quantity: 1, status: 'CONFIRMED', daysAgoCreated: 0 },
    { ticketId: 'tk-alpha-std-2h', quantity: 2, status: 'CONFIRMED', daysAgoCreated: 3 },
    { ticketId: 'tk-alpha-high-5h', quantity: 1, status: 'USED', daysAgoCreated: 5 },
  ]

  for (const s of seeds) {
    const ticket = getTicketById(s.ticketId)
    if (!ticket) continue
    const shop = getShopById(ticket.shopId)
    const zone = listZonesByShop(ticket.shopId).find(z => z.id === ticket.zoneId)
    if (!shop || !zone) continue
    const createdAt = daysAgo(s.daysAgoCreated)
    const order: PlaytimeOrder = {
      id: genId('PTK'),
      userId,
      shopId: shop.id,
      shopName: shop.name,
      ticketId: s.ticketId,
      zoneName: zone.name,
      zoneType: zone.zoneType,
      hours: ticket.hours,
      quantity: s.quantity,
      unitPrice: ticket.sellPrice,
      totalAmount: ticket.sellPrice * s.quantity,
      status: s.status,
      redeemCode: Math.random().toString(36).slice(2, 10).toUpperCase(),
      qrCode: genId('QR'),
      createdAt,
      updatedAt: createdAt,
    }
    store.set(order.id, order)
  }
}
seedDemoPlaytimeOrders()

export function createMockPlaytimeOrder(userId: string, ticketId: string, quantity: number, payWithJcoin?: boolean): PlaytimeOrder {
  const ticket = getTicketById(ticketId)
  if (!ticket) throw new Error('Vé không tồn tại')
  if (ticket.sellPrice === 0 && hasClaimedFreeTicketThisWeek(userId)) {
    throw new Error('Bạn đã nhận 1 vé 0đ trong tuần này — vui lòng quay lại vào tuần sau.')
  }
  const shop = getShopById(ticket.shopId)
  const zone = listZonesByShop(ticket.shopId).find(z => z.id === ticket.zoneId)
  if (!shop || !zone) throw new Error('Gian hàng không tồn tại')

  for (let i = 0; i < quantity; i++) {
    if (!reserveTicketSlot(ticketId)) {
      for (let j = 0; j < i; j++) releaseTicketSlot(ticketId)
      throw new Error('Rất tiếc, vé vừa hết chỗ. Vui lòng chọn vé khác.')
    }
  }

  const now = new Date().toISOString()
  const order: PlaytimeOrder = {
    id: genId('PTK'), userId, shopId: shop.id, shopName: shop.name, ticketId, zoneName: zone.name,
    zoneType: zone.zoneType, hours: ticket.hours, quantity, unitPrice: ticket.sellPrice,
    totalAmount: ticket.sellPrice * quantity, status: payWithJcoin ? 'PAID' : 'PENDING', qrCode: genId('QR'), createdAt: now, updatedAt: now,
  }
  store.set(order.id, order)

  const runRedeemStep = () => {
    setTimeout(() => {
      const o2 = store.get(order.id)
      if (!o2 || o2.status !== 'PAID') return
      o2.status = 'CONFIRMED'
      o2.redeemCode = Math.random().toString(36).slice(2, 10).toUpperCase()
      o2.updatedAt = new Date().toISOString()
      if (ticket.sellPrice === 0) recordFreeTicketClaim(userId)
      incrementShopSold(shop.id, quantity)
    }, 2000)
  }

  if (payWithJcoin) {
    // Đã thanh toán đủ bằng JCoin — bỏ qua bước chờ QR, cấp mã đổi vé ngay
    runRedeemStep()
  } else {
    // Mô phỏng thanh toán jPay thành công sau ~3s
    setTimeout(() => {
      const o = store.get(order.id)
      if (!o || o.status !== 'PENDING') return
      o.status = 'PAID'
      o.updatedAt = new Date().toISOString()
      runRedeemStep()
    }, 3000)
  }

  return order
}

/** Gọi khi countdown QR về 0 mà đơn vẫn PENDING — hoàn lại slot đã giữ chỗ. */
export function expireMockPlaytimeOrder(orderId: string): void {
  const o = store.get(orderId)
  if (!o || o.status !== 'PENDING') return
  o.status = 'EXPIRED'
  o.updatedAt = new Date().toISOString()
  for (let i = 0; i < o.quantity; i++) releaseTicketSlot(o.ticketId)
}

export function getMockPlaytimeOrder(orderId: string): PlaytimeOrder | undefined {
  return store.get(orderId)
}

export function getMockPlaytimePayment(orderId: string): { orderId: string; qrCode: string; expiredAt: string } | undefined {
  const o = store.get(orderId)
  if (!o) return undefined
  const expiredAt = new Date(new Date(o.createdAt).getTime() + 5 * 60 * 1000).toISOString()
  return { orderId, qrCode: o.qrCode, expiredAt }
}

export function listMockPlaytimeOrdersByUser(userId: string, status?: PlaytimeOrderStatus | 'all'): PlaytimeOrder[] {
  const all = [...store.values()].filter(o => o.userId === userId)
  const filtered = !status || status === 'all' ? all : all.filter(o => o.status === status)
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function listMockPlaytimeOrdersByShop(shopId: string, status?: PlaytimeOrderStatus | 'all'): PlaytimeOrder[] {
  const all = [...store.values()].filter(o => o.shopId === shopId)
  const filtered = !status || status === 'all' ? all : all.filter(o => o.status === status)
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Chủ gian hàng xác nhận khách đã dùng vé tại quầy — CONFIRMED → USED. */
export function confirmMockPlaytimeOrderUsed(orderId: string, shopId: string): PlaytimeOrder | undefined {
  const o = store.get(orderId)
  if (!o || o.shopId !== shopId || o.status !== 'CONFIRMED') return undefined
  o.status = 'USED'
  o.updatedAt = new Date().toISOString()
  return o
}
