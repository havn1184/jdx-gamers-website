/**
 * TaskApiService — Phân hệ "Kiếm tiền": nhiệm vụ trải nghiệm/test game.
 * Ví (VND + JCoin) đã tách sang `WalletApiService` (nc_vi-2-loai-tien-thanh-toan.md).
 *
 * Gọi `JGameApi` — path/field theo App (quyet-dinh-hop-nhat-api.md #10/#11/#13):
 * - GET  /api/tasks              -> GameTaskResponse[] (title/rewardJcoin/requirementType số/publisherFundStatus bool)
 * - GET  /api/tasks/{id}         -> GameTaskResponse
 * - GET  /api/tasks/my           -> GameTaskResponse[] (CHỈ danh sách task đã đăng ký, KHÔNG kèm progress)
 * - GET  /api/tasks/{id}/progress -> UserTaskProgressResponse
 * - POST /api/tasks/{id}/register -> { registrationCode } (KHÔNG trả progress đầy đủ)
 */
import { apiCall, buildJGameUrl, type ApiResponse } from '../../../../shared/services/api'
import type { GameTask, UserTaskProgress, TaskListParams } from '../types/task.types'

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
    galleryImages: raw.galleryImages,
  }
}

export class TaskApiService {
  private static readonly BASE_PATH = '/api/tasks'

  // params: BE hiện chưa hỗ trợ filter querystring cho /api/tasks — giữ tham số để UI gọi không đổi
  // chữ ký khi BE bổ sung sau, tạm chưa dùng (khác getShops/getCardProducts đã build query thật).
  static async getTasks(_params?: TaskListParams): Promise<ApiResponse<GameTask[]>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}`), { method: 'GET' })
    const result: ApiResponse<any[]> = await response.json()
    return { ...result, data: result.data ? result.data.map(normalizeApiTask) : result.data }
  }

  static async getTaskDetail(taskId: string): Promise<ApiResponse<GameTask>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/${taskId}`), { method: 'GET' })
    const result: ApiResponse<any> = await response.json()
    return { ...result, data: result.data ? normalizeApiTask(result.data) : result.data }
  }

  static async getMyProgress(taskId: string): Promise<ApiResponse<UserTaskProgress | null>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/${taskId}/progress`), { method: 'GET' })
    return response.json()
  }

  /** BE trả `{registrationCode}` (KHÔNG phải progress đầy đủ như trước) — nơi gọi (hook) cần tự
   * gọi lại `getMyProgress` sau khi đăng ký thành công để cập nhật tiến độ mới nhất lên UI. */
  static async registerTask(taskId: string): Promise<ApiResponse<{ registrationCode: string }>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/${taskId}/register`), { method: 'POST' })
    return response.json()
  }

  static async getMyTasks(): Promise<ApiResponse<{ task: GameTask; progress: UserTaskProgress }[]>> {
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
}
