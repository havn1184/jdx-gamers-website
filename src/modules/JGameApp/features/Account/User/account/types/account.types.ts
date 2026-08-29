/**
 * Types cho Hồ sơ/Bảo mật/Lịch sử hoạt động.
 */
export interface UpdateProfilePayload {
  name: string
  avatarUrl?: string
  dob?: string
}

export type { LoginHistoryEntry, LoginActivityAction } from '../../../../Public/auth/types/auth.types'
