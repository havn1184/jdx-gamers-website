/**
 * Mock in-memory order store — mô phỏng state machine đơn hàng (URD mục 6.3):
 * PENDING → PAID → SUCCESS | SUPPLY_FAILED → REFUND_PROCESSING → REFUNDED
 * PENDING → EXPIRED (không mô phỏng timeout thật 15 phút, dùng để test UI khi cần)
 *
 * Toàn bộ state reset khi reload trang — đây là mock cho GĐ1, không phải BE thật.
 */
import { findDenominationById } from './cardProducts.mock'
import { DEMO_ACCOUNTS } from './authUsers.store'
import type { OrderStatus, OrderSummary, PaymentInfo, CardCodeResult, RefundInfo } from '../features/Account/User/order/types/order.types'

interface OrderRecord extends OrderSummary {
  qrCode: string
  paidAt?: string
  serialFull?: string
  pinFull?: string
  refundReason?: string
  refundedAt?: string
}

const store = new Map<string, OrderRecord>()
let seq = 1

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400000).toISOString()
}

function randomCode(len: number): string {
  return Math.random().toString(36).slice(2, 2 + len).toUpperCase()
}

/** Seed lịch sử đơn thẻ game demo cho tài khoản khách hàng demo — để trang Lịch sử/Tổng quan
 * có dữ liệu minh hoạ ngay khi đăng nhập, không cần tự mua thử. State in-memory nên seed thẳng
 * vào `store`, không cần cơ chế idempotent như `jcoinWallet.store.ts` (tải lại trang là reset). */
function seedDemoOrders(): void {
  const userId = DEMO_ACCOUNTS.customer.id
  const seeds: { denominationId: string; quantity: number; status: OrderStatus; daysAgoCreated: number }[] = [
    { denominationId: 'garena-100000', quantity: 1, status: 'SUCCESS', daysAgoCreated: 2 },
    { denominationId: 'zing-200000', quantity: 1, status: 'SUCCESS', daysAgoCreated: 5 },
    { denominationId: 'vcoin-50000', quantity: 2, status: 'SUCCESS', daysAgoCreated: 9 },
    { denominationId: 'bit-20000', quantity: 1, status: 'SUCCESS', daysAgoCreated: 16 },
    { denominationId: 'appota-card-100000', quantity: 1, status: 'REFUNDED', daysAgoCreated: 20 },
  ]

  for (const s of seeds) {
    const found = findDenominationById(s.denominationId)
    if (!found) continue
    const { product, denomination } = found
    const createdAt = daysAgo(s.daysAgoCreated)
    const order: OrderRecord = {
      id: genId('ORD'),
      userId,
      denominationId: s.denominationId,
      productName: product.name,
      supplierName: product.supplierName,
      faceValue: denomination.faceValue,
      quantity: s.quantity,
      unitPrice: denomination.sellPrice,
      totalAmount: denomination.sellPrice * s.quantity,
      status: s.status,
      createdAt,
      updatedAt: createdAt,
      qrCode: genId('QR'),
      paidAt: createdAt,
      ...(s.status === 'SUCCESS' ? { serialFull: randomCode(10), pinFull: randomCode(8) } : {}),
      ...(s.status === 'REFUNDED'
        ? { refundReason: 'Nhà cung cấp tạm hết mã thẻ mệnh giá này', refundedAt: createdAt }
        : {}),
    }
    store.set(order.id, order)
  }
}
seedDemoOrders()

function maskSerial(full: string): string {
  return full.slice(0, 4) + '••••••••' + full.slice(-4)
}

/** Tạo đơn hàng mới — mô phỏng luồng mục 6.2 bước 5-11 bằng setTimeout. */
export function createMockOrder(
  userId: string,
  denominationId: string,
  quantity: number,
  referrerCode?: string,
  /** Chỉ dùng để test QA nhánh lỗi — không có trong luồng thật */
  forceOutcome?: 'success' | 'fail',
  /** true khi đã thanh toán đủ bằng JCoin — bỏ qua bước chờ QR, vào thẳng PAID */
  payWithJcoin?: boolean
): OrderRecord {
  const found = findDenominationById(denominationId)
  if (!found) throw new Error('Mệnh giá không tồn tại')
  const { product, denomination } = found

  const now = new Date().toISOString()
  const order: OrderRecord = {
    id: genId('ORD'),
    userId,
    denominationId,
    productName: product.name,
    supplierName: product.supplierName,
    faceValue: denomination.faceValue,
    quantity,
    unitPrice: denomination.sellPrice,
    totalAmount: denomination.sellPrice * quantity,
    status: payWithJcoin ? 'PAID' : 'PENDING',
    referrerCode,
    createdAt: now,
    updatedAt: now,
    qrCode: genId('QR'),
    ...(payWithJcoin ? { paidAt: now } : {}),
  }
  store.set(order.id, order)

  const runSupplyStep = () => {
    setTimeout(() => {
      const o2 = store.get(order.id)
      if (!o2 || o2.status !== 'PAID') return
      const shouldFail = forceOutcome === 'fail' || (forceOutcome !== 'success' && Math.random() < 0.08)

      if (shouldFail) {
        o2.status = 'SUPPLY_FAILED'
        o2.updatedAt = new Date().toISOString()
        // Tự động khởi tạo hoàn tiền (FR-6.3.2)
        setTimeout(() => {
          const o3 = store.get(order.id)
          if (!o3) return
          o3.status = 'REFUND_PROCESSING'
          o3.refundReason = 'Nhà cung cấp tạm hết mã thẻ mệnh giá này'
          o3.updatedAt = new Date().toISOString()
          setTimeout(() => {
            const o4 = store.get(order.id)
            if (!o4) return
            o4.status = 'REFUNDED'
            o4.refundedAt = new Date().toISOString()
            o4.updatedAt = o4.refundedAt
          }, 2500)
        }, 1500)
        return
      }

      const serial = Math.random().toString(36).slice(2, 12).toUpperCase()
      const pin = Math.random().toString(36).slice(2, 10).toUpperCase()
      o2.status = 'SUCCESS'
      o2.serialFull = serial
      o2.pinFull = pin
      o2.updatedAt = new Date().toISOString()
    }, 3000)
  }

  if (payWithJcoin) {
    // Đã thanh toán đủ bằng JCoin — bỏ qua bước chờ QR, cấp mã ngay sau bước xử lý NCC
    runSupplyStep()
  } else {
    // Mô phỏng jPay webhook xác nhận thanh toán sau ~3s
    setTimeout(() => {
      const o = store.get(order.id)
      if (!o || o.status !== 'PENDING') return
      o.status = 'PAID'
      o.paidAt = new Date().toISOString()
      o.updatedAt = o.paidAt
      runSupplyStep()
    }, 3000)
  }

  return order
}

export function getMockOrder(orderId: string): OrderRecord | undefined {
  return store.get(orderId)
}

export function getMockPayment(orderId: string): PaymentInfo | undefined {
  const o = store.get(orderId)
  if (!o) return undefined
  const expiredAt = new Date(new Date(o.createdAt).getTime() + 15 * 60 * 1000).toISOString()
  return { orderId, qrCode: o.qrCode, expiredAt, paidAt: o.paidAt }
}

export function getMockCardCode(orderId: string): CardCodeResult | undefined {
  const o = store.get(orderId)
  if (!o || o.status !== 'SUCCESS' || !o.serialFull || !o.pinFull) return undefined
  return {
    orderId,
    serialMasked: maskSerial(o.serialFull),
    pinMasked: '••••' + o.pinFull.slice(-2),
    issuedAt: o.updatedAt,
  }
}

/** Mô phỏng "xác thực lại" để xem đầy đủ mã thẻ (FR-6.5.1) — mock luôn cho phép. */
export function revealMockCardCode(orderId: string): CardCodeResult | undefined {
  const o = store.get(orderId)
  if (!o || o.status !== 'SUCCESS' || !o.serialFull || !o.pinFull) return undefined
  return {
    orderId,
    serialMasked: maskSerial(o.serialFull),
    pinMasked: '••••' + o.pinFull.slice(-2),
    serialFull: o.serialFull,
    pinFull: o.pinFull,
    issuedAt: o.updatedAt,
  }
}

export function getMockRefund(orderId: string): RefundInfo | undefined {
  const o = store.get(orderId)
  if (!o || (o.status !== 'REFUND_PROCESSING' && o.status !== 'REFUNDED')) return undefined
  return {
    orderId,
    reason: o.refundReason || '',
    status: o.status === 'REFUNDED' ? 'DONE' : 'PROCESSING',
    refundedAt: o.refundedAt,
  }
}

export function listMockOrdersByUser(userId: string, status?: OrderStatus | 'all'): OrderSummary[] {
  const all = [...store.values()].filter(o => o.userId === userId)
  const filtered = !status || status === 'all' ? all : all.filter(o => o.status === status)
  return filtered
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ qrCode: _qr, serialFull: _sf, pinFull: _pf, refundReason: _rr, refundedAt: _ra, ...rest }) => rest)
}
