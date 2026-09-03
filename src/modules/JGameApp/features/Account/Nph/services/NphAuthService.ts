/**
 * NphAuthService — Đăng nhập NPH, tách biệt hoàn toàn khỏi AuthApiService của Customer/Admin
 * (20260903-nc_quan-tri-nha-phat-hanh-game.md mục 2.1). Gọi thẳng `POST /api/auth/publisher/login`.
 */
import { buildJGameUrl, type ApiResponse } from '../../../../shared/services/api'
import { nphApiCall } from './nphApiCall'
import { NphTokenManager } from './NphTokenManager'
import type { NphProfile } from '../types'

interface PublisherLoginResponseDto {
  accessToken: string
  publisherId: string
  name: string
  email: string
}

export class NphAuthService {
  private static readonly BASE_PATH = '/api/auth/publisher'

  /** Đăng nhập NPH — lưu token + hồ sơ vào NphTokenManager khi thành công. */
  static async login(email: string, password: string): Promise<ApiResponse<NphProfile>> {
    const result = await nphApiCall<PublisherLoginResponseDto>(buildJGameUrl(`${this.BASE_PATH}/login`), {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    })

    if (!result.success || !result.data) {
      return { success: false, data: null, message: result.message ?? 'Đăng nhập thất bại', errorCode: result.errorCode }
    }

    const profile: NphProfile = { publisherId: result.data.publisherId, name: result.data.name, email: result.data.email }
    NphTokenManager.setSession(result.data.accessToken, profile)
    return { success: true, data: profile, message: result.message ?? null }
  }

  static logout(): void {
    NphTokenManager.clearSession()
  }
}
