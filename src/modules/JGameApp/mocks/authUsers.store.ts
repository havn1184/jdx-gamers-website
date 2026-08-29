/**
 * Mock "cơ sở dữ liệu" người dùng JGame — lưu localStorage để tài khoản đăng ký
 * còn tồn tại sau khi tải lại trang (khác các mock khác chỉ lưu in-memory).
 *
 * ⚠️ CHỈ DÙNG CHO DEMO — mật khẩu chỉ obfuscate (base64), KHÔNG PHẢI mã hoá bảo
 * mật thật. Khi có BE thật, toàn bộ logic đăng ký/đăng nhập/băm mật khẩu PHẢI
 * chuyển sang server (bcrypt/argon2), FE chỉ còn gọi API.
 */
import type { AuthUser } from '../features/Public/auth/types/auth.types'

const STORAGE_KEY = 'jgame_auth_users_db'
const RESET_TOKENS_KEY = 'jgame_auth_reset_tokens'
const EMAIL_TOKENS_KEY = 'jgame_auth_email_tokens'

interface StoredUser extends AuthUser {
  passwordObfuscated: string
  twoFactorSecret?: string
  phoneOtp?: string
  phoneOtpExpiresAt?: number
}

function obfuscate(password: string): string {
  const bytes = new TextEncoder().encode(password)
  return btoa(String.fromCharCode(...bytes))
}

/** Sinh chuỗi ngẫu nhiên bằng crypto API (an toàn hơn Math.random) — dùng cho token reset/verify. */
function generateSecureToken(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

function readAll(): StoredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredUser[]) : []
  } catch {
    return []
  }
}

function writeAll(users: StoredUser[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

export function findUserByIdentifier(identifier: string): StoredUser | undefined {
  const lower = identifier.trim().toLowerCase()
  return readAll().find(u => u.email.toLowerCase() === lower || u.phone === identifier.trim())
}

export function findUserById(id: string): StoredUser | undefined {
  return readAll().find(u => u.id === id)
}

export function isIdentifierTaken(email: string, phone: string): boolean {
  const users = readAll()
  return users.some(u => u.email.toLowerCase() === email.toLowerCase() || u.phone === phone)
}

export function createUser(email: string, phone: string, password: string): StoredUser {
  const user: StoredUser = {
    id: `user-${Date.now().toString(36)}`,
    email,
    phone,
    name: email.split('@')[0] || 'Người dùng mới',
    role: 'customer',
    emailVerified: false,
    phoneVerified: false,
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    passwordObfuscated: obfuscate(password),
  }
  const users = readAll()
  users.push(user)
  writeAll(users)
  return user
}

/** 4 tài khoản demo cố định (khách hàng/chủ gian hàng/đối tác/admin) — hiển thị ở màn Đăng nhập.
 * Chạy 1 lần khi module load, bỏ qua nếu đã seed trước đó (persist qua reload cùng localStorage users). */
export const DEMO_ACCOUNT_PASSWORD = 'Demo@123'
export const DEMO_ACCOUNTS = {
  customer: { id: 'demo-customer-1', email: 'khachhang@jgame.vn', phone: '0900000001', name: 'Khách hàng Demo' },
  /** Trùng id với ownerId 'demo-shop-owner-1' đã gán sẵn cho gian hàng Alpha Cyber Center (mocks/playtimeShops.store.ts) */
  shopOwner: { id: 'demo-shop-owner-1', email: 'chugianhang@jgame.vn', phone: '0900000002', name: 'Chủ gian hàng Demo' },
  affiliate: { id: 'demo-affiliate-1', email: 'doitac@jgame.vn', phone: '0900000003', name: 'Đối tác Demo' },
  admin: { id: 'demo-admin-1', email: 'admin@jgame.vn', phone: '0900000004', name: 'Quản trị viên Demo' },
} as const

function seedDemoAccountsIfNeeded(): void {
  const users = readAll()
  const now = new Date().toISOString()
  const passwordObfuscated = obfuscate(DEMO_ACCOUNT_PASSWORD)
  const specs: { id: string; email: string; phone: string; name: string; role: AuthUser['role'] }[] = [
    { ...DEMO_ACCOUNTS.customer, role: 'customer' },
    { ...DEMO_ACCOUNTS.shopOwner, role: 'customer' },
    { ...DEMO_ACCOUNTS.affiliate, role: 'customer' },
    { ...DEMO_ACCOUNTS.admin, role: 'admin' },
  ]
  let changed = false
  specs.forEach(spec => {
    if (users.some(u => u.id === spec.id)) return
    users.push({
      id: spec.id, email: spec.email, phone: spec.phone, name: spec.name, role: spec.role,
      emailVerified: true, phoneVerified: true, twoFactorEnabled: false, createdAt: now, passwordObfuscated,
    })
    changed = true
  })
  if (changed) writeAll(users)
}
seedDemoAccountsIfNeeded()

export function verifyPassword(user: StoredUser, password: string): boolean {
  return user.passwordObfuscated === obfuscate(password)
}

function updateUser(id: string, patch: Partial<StoredUser>): StoredUser | undefined {
  const users = readAll()
  const idx = users.findIndex(u => u.id === id)
  if (idx === -1) return undefined
  users[idx] = { ...users[idx], ...patch }
  writeAll(users)
  return users[idx]
}

export function updatePassword(id: string, newPassword: string): void {
  updateUser(id, { passwordObfuscated: obfuscate(newPassword) })
}

export function updateProfile(id: string, patch: Partial<Pick<AuthUser, 'name' | 'avatarUrl' | 'dob'>>): StoredUser | undefined {
  return updateUser(id, patch)
}

export function setEmailVerified(id: string): void {
  updateUser(id, { emailVerified: true })
}

export function setPhoneOtp(id: string, otp: string, ttlMs = 5 * 60 * 1000): void {
  updateUser(id, { phoneOtp: otp, phoneOtpExpiresAt: Date.now() + ttlMs })
}

export function verifyPhoneOtp(id: string, otp: string): boolean {
  const user = findUserById(id)
  if (!user?.phoneOtp || !user.phoneOtpExpiresAt) return false
  if (Date.now() > user.phoneOtpExpiresAt) return false
  if (user.phoneOtp !== otp) return false
  updateUser(id, { phoneVerified: true, phoneOtp: undefined, phoneOtpExpiresAt: undefined })
  return true
}

/** Mock bật 2FA — secret hiển thị dạng text (không dựng QR thật). */
export function enableTwoFactor(id: string): string {
  const secret = Math.random().toString(36).slice(2, 10).toUpperCase()
  updateUser(id, { twoFactorEnabled: true, twoFactorSecret: secret })
  return secret
}

export function disableTwoFactor(id: string): void {
  updateUser(id, { twoFactorEnabled: false, twoFactorSecret: undefined })
}

export function toAuthUser(stored: StoredUser): AuthUser {
  const { passwordObfuscated: _p, twoFactorSecret: _s, phoneOtp: _o, phoneOtpExpiresAt: _e, ...rest } = stored
  return rest
}

// ── Reset-password token (mock) ─────────────────────────────────────────────
interface ResetToken { token: string; userId: string; expiresAt: number }

function readResetTokens(): ResetToken[] {
  try { return JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '[]') } catch { return [] }
}
function writeResetTokens(tokens: ResetToken[]): void {
  localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens))
}

export function createResetToken(userId: string): string {
  const token = `rst-${generateSecureToken()}`
  const tokens = readResetTokens().filter(t => t.userId !== userId)
  tokens.push({ token, userId, expiresAt: Date.now() + 30 * 60 * 1000 })
  writeResetTokens(tokens)
  return token
}

export function consumeResetToken(token: string): string | null {
  const tokens = readResetTokens()
  const found = tokens.find(t => t.token === token)
  if (!found || Date.now() > found.expiresAt) return null
  writeResetTokens(tokens.filter(t => t.token !== token))
  return found.userId
}

// ── Email-verify token (mock) ────────────────────────────────────────────────
interface EmailToken { token: string; userId: string; expiresAt: number }

function readEmailTokens(): EmailToken[] {
  try { return JSON.parse(localStorage.getItem(EMAIL_TOKENS_KEY) || '[]') } catch { return [] }
}
function writeEmailTokens(tokens: EmailToken[]): void {
  localStorage.setItem(EMAIL_TOKENS_KEY, JSON.stringify(tokens))
}

export function createEmailToken(userId: string): string {
  const token = `evf-${generateSecureToken()}`
  const tokens = readEmailTokens().filter(t => t.userId !== userId)
  tokens.push({ token, userId, expiresAt: Date.now() + 24 * 60 * 60 * 1000 })
  writeEmailTokens(tokens)
  return token
}

export function consumeEmailToken(token: string): string | null {
  const tokens = readEmailTokens()
  const found = tokens.find(t => t.token === token)
  if (!found || Date.now() > found.expiresAt) return null
  writeEmailTokens(tokens.filter(t => t.token !== token))
  return found.userId
}
