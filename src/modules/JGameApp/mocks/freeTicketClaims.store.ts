/**
 * Giới hạn 1 vé 0đ / người dùng / tuần (URD FR-7.2.5) — chống lạm dụng flash-sale.
 * Lưu localStorage (persist qua reload) theo khoá `${userId}:${isoWeekKey}`.
 */
const STORAGE_KEY = 'jgame_free_ticket_claims'

function getIsoWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function readClaims(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[]
  } catch {
    return []
  }
}

export function hasClaimedFreeTicketThisWeek(userId: string): boolean {
  const key = `${userId}:${getIsoWeekKey()}`
  return readClaims().includes(key)
}

export function recordFreeTicketClaim(userId: string): void {
  const key = `${userId}:${getIsoWeekKey()}`
  const claims = readClaims()
  if (!claims.includes(key)) {
    claims.push(key)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(claims))
  }
}
