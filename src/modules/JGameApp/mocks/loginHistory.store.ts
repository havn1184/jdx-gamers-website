/**
 * Mock log lịch sử đăng nhập & hoạt động bảo mật — lưu localStorage theo userId.
 */
import type { LoginActivityAction, LoginHistoryEntry } from '../features/Public/auth/types/auth.types'

const STORAGE_KEY = 'jgame_login_history'
const MAX_ENTRIES_PER_USER = 50

function readAll(): LoginHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as LoginHistoryEntry[]
  } catch {
    return []
  }
}

function writeAll(entries: LoginHistoryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

/** Sinh IP giả lập ổn định theo phiên trình duyệt (không gọi API thật để lấy IP). */
function mockIp(): string {
  return '203.113.' + (Math.abs(hashCode(navigator.userAgent)) % 255) + '.' + (Date.now() % 255)
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i)
  return hash
}

export function logActivity(userId: string, action: LoginActivityAction): void {
  const entry: LoginHistoryEntry = {
    id: `log-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    action,
    deviceInfo: navigator.userAgent,
    ipMock: mockIp(),
    createdAt: new Date().toISOString(),
  }
  const all = readAll()
  all.unshift(entry)
  const trimmed = all.filter(e => e.userId === userId).slice(0, MAX_ENTRIES_PER_USER)
  const others = all.filter(e => e.userId !== userId)
  writeAll([...trimmed, ...others])
}

export function getActivityHistory(userId: string): LoginHistoryEntry[] {
  return readAll()
    .filter(e => e.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
