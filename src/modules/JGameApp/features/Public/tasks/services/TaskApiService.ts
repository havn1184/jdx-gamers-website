/**
 * TaskApiService — Phân hệ "Kiếm tiền": nhiệm vụ trải nghiệm/test game + ví JCoin (URD bổ sung).
 * Qua gate mock (JGAME_USE_MOCK). Khi có BE thật: xoá nhánh mock, giữ nhánh apiCall.
 */
import { apiCall, buildJGameUrl, JGAME_USE_MOCK, mockApiCall, mockApiError, TokenManager, type ApiResponse } from '../../../../shared/services/api'
import { listTasks, getTaskById, listUserProgress, getUserProgress, registerForTask } from '../../../../mocks/gameTasks.store'
import { getBalance, listTransactions, spend, type JcoinTxType } from '../../../../mocks/jcoinWallet.store'
import type { GameTask, UserTaskProgress, TaskListParams } from '../types/task.types'
import type { JcoinTransaction } from '../../../../mocks/jcoinWallet.store'

function getMockUserId(): string {
  return TokenManager.getUserId() || 'demo-user'
}

export class TaskApiService {
  private static readonly BASE_PATH = '/api/tasks'

  static async getTasks(params?: TaskListParams): Promise<ApiResponse<GameTask[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => listTasks(params), 300)
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}`), { method: 'GET' })
    return response.json()
  }

  static async getTaskDetail(taskId: string): Promise<ApiResponse<GameTask>> {
    if (JGAME_USE_MOCK) {
      const task = getTaskById(taskId)
      if (!task) return mockApiError('Không tìm thấy nhiệm vụ')
      return mockApiCall(() => task, 200)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/${taskId}`), { method: 'GET' })
    return response.json()
  }

  static async getMyProgress(taskId: string): Promise<ApiResponse<UserTaskProgress | null>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => getUserProgress(getMockUserId(), taskId) || null, 150)
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/${taskId}/my-progress`), { method: 'GET' })
    return response.json()
  }

  static async registerTask(taskId: string): Promise<ApiResponse<UserTaskProgress>> {
    if (JGAME_USE_MOCK) {
      try {
        const progress = registerForTask(getMockUserId(), taskId)
        return mockApiCall(() => progress, 300)
      } catch (e) {
        return mockApiError((e as Error).message)
      }
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/${taskId}/register`), { method: 'POST' })
    return response.json()
  }

  static async getMyTasks(): Promise<ApiResponse<{ task: GameTask; progress: UserTaskProgress }[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => listUserProgress(getMockUserId()), 300)
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/me`), { method: 'GET' })
    return response.json()
  }

  static async getWalletBalance(): Promise<ApiResponse<number>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => getBalance(getMockUserId()), 150)
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/wallet/balance`), { method: 'GET' })
    return response.json()
  }

  static async getWalletTransactions(): Promise<ApiResponse<JcoinTransaction[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => listTransactions(getMockUserId()), 300)
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/wallet/transactions`), { method: 'GET' })
    return response.json()
  }

  /** Dùng JCoin để giảm trừ khi thanh toán ở Nạp thẻ/Chợ vé/Phụ kiện — trả về số JCoin thực trừ được. */
  static async spendWallet(amount: number, type: Exclude<JcoinTxType, 'EARN_TASK'>, reason: string): Promise<ApiResponse<number>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => spend(getMockUserId(), amount, type, reason), 150)
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/wallet/spend`), { method: 'POST', body: JSON.stringify({ amount, type, reason }) })
    return response.json()
  }
}
