/**
 * ContactApiService — Gửi liên hệ từ trang public (SC-22).
 */
import { apiCall, buildJGameUrl, type ApiResponse } from '../../../../shared/services/api'

export interface ContactPayload {
  name: string
  email: string
  message: string
}

export class ContactApiService {
  static async sendMessage(payload: ContactPayload): Promise<ApiResponse<boolean>> {
    const response = await apiCall(buildJGameUrl('/api/contact'), { method: 'POST', body: JSON.stringify(payload) })
    return response.json()
  }
}
