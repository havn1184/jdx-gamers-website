/**
 * Ví JCoin — tiền ảo nội bộ JGame (KHÔNG rút được tiền mặt), chỉ dùng để mua thẻ nạp/
 * vé giờ chơi/phụ kiện trong hệ sinh thái JGame. Lưu localStorage để số dư còn sau reload.
 */
import { DEMO_ACCOUNTS } from './authUsers.store'

const BALANCE_KEY = 'jgame_jcoin_balances'
const TX_KEY = 'jgame_jcoin_transactions'

export type JcoinTxType = 'EARN_TASK' | 'SPEND_CARD' | 'SPEND_TICKET' | 'SPEND_ACCESSORY'

export interface JcoinTransaction {
  id: string
  userId: string
  type: JcoinTxType
  amount: number
  reason: string
  createdAt: string
}

function readBalances(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(BALANCE_KEY) || '{}') as Record<string, number>
  } catch {
    return {}
  }
}
function writeBalances(balances: Record<string, number>): void {
  localStorage.setItem(BALANCE_KEY, JSON.stringify(balances))
}
function readTx(): JcoinTransaction[] {
  try {
    return JSON.parse(localStorage.getItem(TX_KEY) || '[]') as JcoinTransaction[]
  } catch {
    return []
  }
}
function writeTx(tx: JcoinTransaction[]): void {
  localStorage.setItem(TX_KEY, JSON.stringify(tx))
}

let seq = 1
function genId(): string {
  return `JTX-${Date.now().toString(36)}-${(seq++).toString(36)}`
}

/** Seed số dư demo cho tài khoản khách hàng demo — để có dữ liệu minh hoạ ngay khi đăng nhập lần đầu.
 * Tổng 1.200.000 JCoin (tích lũy nhiều đợt nhiệm vụ) — đủ để minh hoạ thanh toán JCoin ở cả 3 luồng
 * (thẻ nạp, vé giờ chơi, và phụ kiện giá thấp), vẫn còn phụ kiện cao cấp cần thanh toán QR như thường. */
function seedDemoWalletIfNeeded(): void {
  const balances = readBalances()
  if (balances[DEMO_ACCOUNTS.customer.id] !== undefined) return
  balances[DEMO_ACCOUNTS.customer.id] = 1200000
  writeBalances(balances)
  const tx = readTx()
  tx.push(
    {
      id: genId(), userId: DEMO_ACCOUNTS.customer.id, type: 'EARN_TASK', amount: 1115000,
      reason: 'Tích lũy từ các đợt nhiệm vụ Kiếm tiền đã hoàn thành trước đó', createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
      id: genId(), userId: DEMO_ACCOUNTS.customer.id, type: 'EARN_TASK', amount: 85000,
      reason: 'Hoàn thành nhiệm vụ "Đạt cấp độ 30 — Vũ Trụ Thần Thoại"', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    }
  )
  writeTx(tx)
}
seedDemoWalletIfNeeded()

export function getBalance(userId: string): number {
  return readBalances()[userId] || 0
}

export function earn(userId: string, amount: number, reason: string): void {
  const balances = readBalances()
  balances[userId] = (balances[userId] || 0) + amount
  writeBalances(balances)
  const tx = readTx()
  tx.push({ id: genId(), userId, type: 'EARN_TASK', amount, reason, createdAt: new Date().toISOString() })
  writeTx(tx)
}

/** Trừ JCoin khi dùng để thanh toán — trả về số tiền thực trừ được (không âm số dư). */
export function spend(userId: string, amount: number, type: Exclude<JcoinTxType, 'EARN_TASK'>, reason: string): number {
  const balances = readBalances()
  const current = balances[userId] || 0
  const actual = Math.min(current, Math.max(0, Math.floor(amount)))
  if (actual <= 0) return 0
  balances[userId] = current - actual
  writeBalances(balances)
  const tx = readTx()
  tx.push({ id: genId(), userId, type, amount: -actual, reason, createdAt: new Date().toISOString() })
  writeTx(tx)
  return actual
}

export function listTransactions(userId: string): JcoinTransaction[] {
  return readTx().filter(t => t.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
