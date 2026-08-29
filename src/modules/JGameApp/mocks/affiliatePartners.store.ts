/**
 * Mock hồ sơ Đối tác Tiếp thị liên kết (Affiliate), gắn đúng theo `userId` đăng nhập —
 * thay thế `mocks/referral.mock.ts` cũ (dữ liệu tĩnh, không đổi theo ai đăng nhập).
 * Lưu localStorage để hồ sơ đăng ký còn tồn tại sau khi tải lại trang (giống authUsers.store).
 */
import { DEMO_ACCOUNTS } from './authUsers.store'
import type { ReferrerSummary, ReferralTransactionItem, RegisterAffiliatePayload } from '../features/Account/Partner/types/referrer.types'

const STORAGE_KEY = 'jgame_affiliate_partners'

interface AffiliatePartnerRecord {
  userId: string
  referralCode: string
  displayName: string
  channel: string
  commissionRateDefault: number
  createdAt: string
}

function readAll(): AffiliatePartnerRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as AffiliatePartnerRecord[]
  } catch {
    return []
  }
}

function writeAll(items: AffiliatePartnerRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function genReferralCode(userId: string): string {
  const hash = userId.replace(/\D/g, '').slice(-4) || Math.floor(1000 + Math.random() * 9000).toString()
  return `CTV${hash.padStart(4, '0')}`
}

/** Seed sẵn 1 hồ sơ đối tác demo, gắn với tài khoản `doitac@jgame.vn` (mục 3.3 tài liệu). */
function seedDemoAffiliateIfNeeded(): void {
  const items = readAll()
  if (items.some(i => i.userId === DEMO_ACCOUNTS.affiliate.id)) return
  items.push({
    userId: DEMO_ACCOUNTS.affiliate.id, referralCode: 'CTV0001', displayName: DEMO_ACCOUNTS.affiliate.name,
    channel: 'Kênh TikTok/Facebook cá nhân', commissionRateDefault: 0.05, createdAt: new Date().toISOString(),
  })
  writeAll(items)
}
seedDemoAffiliateIfNeeded()

export function getAffiliateByUserId(userId: string): AffiliatePartnerRecord | undefined {
  return readAll().find(i => i.userId === userId)
}

export function registerAffiliate(userId: string, payload: RegisterAffiliatePayload): AffiliatePartnerRecord {
  const items = readAll()
  if (items.some(i => i.userId === userId)) throw new Error('Bạn đã là đối tác tiếp thị liên kết')
  const record: AffiliatePartnerRecord = {
    userId, referralCode: genReferralCode(userId), displayName: payload.displayName, channel: payload.channel,
    commissionRateDefault: 0.05, createdAt: new Date().toISOString(),
  }
  items.push(record)
  writeAll(items)
  return record
}

export function buildSummaryForUser(userId: string): ReferrerSummary | null {
  const affiliate = getAffiliateByUserId(userId)
  if (!affiliate) return null
  const transactions = listTransactionsByUserId(userId)
  const totalCommission = transactions.filter(t => t.status === 'confirmed').reduce((s, t) => s + t.commissionAmount, 0)
  const pendingCommission = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.commissionAmount, 0)
  return {
    referralCode: affiliate.referralCode,
    shareUrl: `https://jgame.vn/?ref=${affiliate.referralCode}`,
    commissionRateDefault: affiliate.commissionRateDefault,
    totalOrders: transactions.length,
    totalCommission,
    pendingCommission,
  }
}

/** Mock lịch sử giao dịch quy đổi hoa hồng — sinh xác định (deterministic) theo userId để không đổi giữa các lần tải lại. */
export function listTransactionsByUserId(userId: string): ReferralTransactionItem[] {
  const affiliate = getAffiliateByUserId(userId)
  if (!affiliate) return []
  let seed = 0
  for (let i = 0; i < userId.length; i++) seed = (seed * 31 + userId.charCodeAt(i)) >>> 0
  const count = 4 + (seed % 9)
  return Array.from({ length: count }).map((_, i) => {
    const amount = [50000, 100000, 200000, 500000][(seed + i) % 4]
    const commission = Math.round(amount * affiliate.commissionRateDefault)
    const statuses: ReferralTransactionItem['status'][] = ['confirmed', 'confirmed', 'pending', 'reversed']
    const date = new Date(Date.now() - i * 20 * 60 * 60 * 1000)
    return {
      id: `RTX-${userId}-${i}`,
      orderId: `ORD-${2000 + i}`,
      orderIdMasked: `ORD-**${(2000 + i).toString().slice(-2)}`,
      amount,
      commissionAmount: commission,
      status: statuses[(seed + i) % statuses.length],
      createdAt: date.toISOString(),
    }
  })
}
