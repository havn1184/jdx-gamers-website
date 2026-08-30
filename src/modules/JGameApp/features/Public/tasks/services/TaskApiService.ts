/**
 * TaskApiService — Phân hệ "Kiếm tiền": nhiệm vụ trải nghiệm/test game + ví JCoin.
 * Qua gate mock (JGAME_USE_MOCK).
 *
 * Nhánh mock: KHÔNG đổi logic/dữ liệu gốc trong `mocks/gameTasks.store.ts` +
 * `mocks/jcoinWallet.store.ts` — chỉ map kết quả sang shape hợp nhất (theo BE thật) ngay tại
 * đây để UI dùng chung 1 type `GameTask`/`UserTaskProgress` cho cả 2 nhánh.
 *
 * Nhánh thật: gọi `JGameApi` — path/field theo App (quyet-dinh-hop-nhat-api.md #10/#11/#13):
 * - GET  /api/tasks              -> GameTaskResponse[] (title/rewardJcoin/requirementType số/publisherFundStatus bool)
 * - GET  /api/tasks/{id}         -> GameTaskResponse
 * - GET  /api/tasks/my           -> GameTaskResponse[] (CHỈ danh sách task đã đăng ký, KHÔNG kèm progress)
 * - GET  /api/tasks/{id}/progress -> UserTaskProgressResponse
 * - POST /api/tasks/{id}/register -> { registrationCode } (KHÔNG trả progress đầy đủ)
 * - POST /api/tasks/wallet/spend  -> ApiResponse<int> (số dư mới)
 * - GET  /api/jcoin/wallet        -> { balance }
 * - GET  /api/jcoin/transactions  -> JcoinTransactionResponse[] (type là enum int)
 */
import { apiCall, buildJGameUrl, JGAME_USE_MOCK, mockApiCall, mockApiError, TokenManager, type ApiResponse } from '../../../../shared/services/api'
import {
  listTasks as listMockTasks,
  getTaskById as getMockTaskById,
  listUserProgress as listMockUserProgress,
  getUserProgress as getMockUserProgress,
  registerForTask as registerMockTask,
  type GameTask as MockGameTask,
  type UserTaskProgress as MockUserTaskProgress,
} from '../../../../mocks/gameTasks.store'
import { getBalance, listTransactions, spend, type JcoinTxType } from '../../../../mocks/jcoinWallet.store'
import type { GameTask, UserTaskProgress, TaskListParams, JcoinTransaction } from '../types/task.types'

function getMockUserId(): string {
  return TokenManager.getUserId() || 'demo-user'
}

/* ============ Adapter nhánh mock -> shape hợp nhất (theo BE) ============ */

function mapMockTask(t: MockGameTask): GameTask {
  return {
    id: t.id,
    title: t.gameName,
    publisherName: t.publisherName,
    requirementType: t.requirement.type,
    rewardJcoin: t.jcoinReward,
    slotLimit: t.slotLimit,
    slotUsed: t.slotUsed,
    publisherFundStatus: t.publisherFundStatus === 'funded',
    art: t.art,
    galleryImages: t.galleryImages,
    description: t.description,
    deadline: t.deadline,
  }
}

function targetValueOf(t: MockGameTask): number {
  if (t.requirement.type === 'level') return t.requirement.targetLevel ?? 0
  if (t.requirement.type === 'playtime') return t.requirement.totalDays ?? 0
  return t.requirement.itemNames?.length ?? 0
}

function currentValueOf(t: MockGameTask, p: MockUserTaskProgress): number {
  if (t.requirement.type === 'level') return p.currentLevel ?? 0
  if (t.requirement.type === 'playtime') return p.daysCompleted ?? 0
  return p.itemsCollected?.length ?? 0
}

function mapMockProgress(t: MockGameTask, p: MockUserTaskProgress): UserTaskProgress {
  return {
    taskId: p.taskId,
    currentValue: currentValueOf(t, p),
    targetValue: targetValueOf(t),
    isRegistered: true,
    isCompleted: p.status === 'rewarded',
    lastSyncedAt: p.lastSyncedAt,
    registrationCode: `JGM-MOCK-${p.id.slice(-8).toUpperCase()}`,
  }
}

/* ============ Adapter nhánh thật (BE) ============ */

/** BE trả `requirementType` dạng số (enum TaskRequirementType: Level=0/Playtime=1/Collection=2). */
const REQUIREMENT_TYPE_BY_INT: GameTask['requirementType'][] = ['level', 'playtime', 'collection']

function normalizeApiTask(raw: any): GameTask {
  return {
    id: raw.id,
    title: raw.title,
    publisherName: raw.publisherName,
    requirementType: typeof raw.requirementType === 'number' ? REQUIREMENT_TYPE_BY_INT[raw.requirementType] : raw.requirementType,
    rewardJcoin: raw.rewardJcoin,
    slotLimit: raw.slotLimit,
    slotUsed: raw.slotUsed,
    publisherFundStatus: Boolean(raw.publisherFundStatus),
  }
}

/** BE trả `type` giao dịch JCoin dạng số (enum JcoinTransactionType: EarnTask=0/SpendCard=1/
 * SpendTicket=2/SpendAccessory=3) — map sang chuỗi để giữ nguyên tên hiển thị UI cũ. */
const JCOIN_TYPE_BY_INT: JcoinTxType[] = ['EARN_TASK', 'SPEND_CARD', 'SPEND_TICKET', 'SPEND_ACCESSORY']

function normalizeApiTransaction(raw: any): JcoinTransaction {
  return {
    id: raw.id,
    userId: raw.userId,
    type: typeof raw.type === 'number' ? (JCOIN_TYPE_BY_INT[raw.type] ?? 'EARN_TASK') : raw.type,
    amount: raw.amount,
    reason: raw.reason,
    createdAt: raw.createdAt,
  }
}

export class TaskApiService {
  private static readonly BASE_PATH = '/api/tasks'

  static async getTasks(params?: TaskListParams): Promise<ApiResponse<GameTask[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => listMockTasks(params).map(mapMockTask), 300)
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}`), { method: 'GET' })
    const result: ApiResponse<any[]> = await response.json()
    return { ...result, data: result.data ? result.data.map(normalizeApiTask) : result.data }
  }

  static async getTaskDetail(taskId: string): Promise<ApiResponse<GameTask>> {
    if (JGAME_USE_MOCK) {
      const task = getMockTaskById(taskId)
      if (!task) return mockApiError('Không tìm thấy nhiệm vụ')
      return mockApiCall(() => mapMockTask(task), 200)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/${taskId}`), { method: 'GET' })
    const result: ApiResponse<any> = await response.json()
    return { ...result, data: result.data ? normalizeApiTask(result.data) : result.data }
  }

  static async getMyProgress(taskId: string): Promise<ApiResponse<UserTaskProgress | null>> {
    if (JGAME_USE_MOCK) {
      const task = getMockTaskById(taskId)
      const progress = getMockUserProgress(getMockUserId(), taskId)
      return mockApiCall(() => (task && progress ? mapMockProgress(task, progress) : null), 150)
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/${taskId}/progress`), { method: 'GET' })
    return response.json()
  }

  /** BE trả `{registrationCode}` (KHÔNG phải progress đầy đủ như trước) — nơi gọi (hook) cần tự
   * gọi lại `getMyProgress` sau khi đăng ký thành công để cập nhật tiến độ mới nhất lên UI. */
  static async registerTask(taskId: string): Promise<ApiResponse<{ registrationCode: string }>> {
    if (JGAME_USE_MOCK) {
      try {
        const progress = registerMockTask(getMockUserId(), taskId)
        return mockApiCall(() => ({ registrationCode: `JGM-MOCK-${progress.id.slice(-8).toUpperCase()}` }), 300)
      } catch (e) {
        return mockApiError((e as Error).message)
      }
    }
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/${taskId}/register`), { method: 'POST' })
    return response.json()
  }

  static async getMyTasks(): Promise<ApiResponse<{ task: GameTask; progress: UserTaskProgress }[]>> {
    if (JGAME_USE_MOCK) {
      return mockApiCall(
        () => listMockUserProgress(getMockUserId()).map(({ task, progress }) => ({ task: mapMockTask(task), progress: mapMockProgress(task, progress) })),
        300
      )
    }
    // BE /api/tasks/my chỉ trả danh sách task đã đăng ký (không kèm progress) — gọi thêm
    // /api/tasks/{id}/progress cho từng task để có đủ dữ liệu hiển thị (khớp UI cũ MyTasksPage).
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/my`), { method: 'GET' })
    const result: ApiResponse<any[]> = await response.json()
    if (!result.success || !result.data) {
      return { ...result, data: null } as ApiResponse<{ task: GameTask; progress: UserTaskProgress }[]>
    }

    const tasks = result.data.map(normalizeApiTask)
    const items = await Promise.all(
      tasks.map(async task => {
        const progressRes = await this.getMyProgress(task.id)
        const progress: UserTaskProgress = progressRes.data ?? {
          taskId: task.id,
          currentValue: 0,
          targetValue: 0,
          isRegistered: false,
          isCompleted: false,
        }
        return { task, progress }
      })
    )
    return { ...result, data: items }
  }

  static async getWalletBalance(): Promise<ApiResponse<number>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => getBalance(getMockUserId()), 150)
    const response = await apiCall(buildJGameUrl('/api/jcoin/wallet'), { method: 'GET' })
    const result: ApiResponse<{ balance: number } | null> = await response.json()
    return { ...result, data: result.data ? result.data.balance : null }
  }

  static async getWalletTransactions(): Promise<ApiResponse<JcoinTransaction[]>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => listTransactions(getMockUserId()), 300)
    const response = await apiCall(buildJGameUrl('/api/jcoin/transactions'), { method: 'GET' })
    const result: ApiResponse<any[]> = await response.json()
    return { ...result, data: result.data ? result.data.map(normalizeApiTransaction) : result.data }
  }

  /** Dùng JCoin để giảm trừ khi thanh toán ở Nạp thẻ/Chợ vé/Phụ kiện — trả về số JCoin dư mới
   * (BE `POST /api/tasks/wallet/spend` trả thẳng `ApiResponse<int>` là số dư mới, không bọc object). */
  static async spendWallet(amount: number, type: Exclude<JcoinTxType, 'EARN_TASK'>, reason: string): Promise<ApiResponse<number>> {
    if (JGAME_USE_MOCK) return mockApiCall(() => spend(getMockUserId(), amount, type, reason), 150)
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/wallet/spend`), { method: 'POST', body: JSON.stringify({ amount, type, reason }) })
    return response.json()
  }
}
