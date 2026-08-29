/**
 * ContactApiService — Gửi liên hệ từ trang public (SC-22).
 */
import { apiCall, buildJGameUrl, JGAME_USE_MOCK, mockApiCall, type ApiResponse } from '../../../../shared/services/api'

export interface ContactPayload {
  name: string
  email: string
  message: string
}

export class ContactApiService {
  static async sendMessage(payload: ContactPayload): Promise<ApiResponse<boolean>> {
    if (JGAME_USE_MOCK) {
      // eslint-disable-next-line no-console
      console.info('[MOCK] Liên hệ mới:', payload)
      return mockApiCall(() => true, 400)
    }
    const response = await apiCall(buildJGameUrl('/api/contact'), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }
}
