/**
 * TaskApiService — Phân hệ "Kiếm tiền": nhiệm vụ trải nghiệm/test game.
 * Ví (VND + JCoin) đã tách sang `WalletApiService` (nc_vi-2-loai-tien-thanh-toan.md).
 *
 * Gọi `JGameApi` (quyet-dinh-hop-nhat-api.md #10/#11/#12/#13, nâng cấp 20260902-nc_nhiem-vu-mo-ta-tien-do.md):
 * - GET  /api/tasks?requirementType=&keyword= -> GameTaskResponse[] (lọc server-side)
 * - GET  /api/tasks/{id}                       -> GameTaskResponse (description/steps/requirementSummary/...)
 * - GET  /api/tasks/my                         -> MyTaskResponse[] = { task, progress }[] (1 request)
 * - GET  /api/tasks/{id}/progress              -> UserTaskProgressResponse (status/percent/milestones/events)
 * - POST /api/tasks/{id}/progress/sync         -> UserTaskProgressResponse (lỗi TASK_SYNC_TOO_FREQUENT khi bấm quá nhanh)
 * - POST /api/tasks/{id}/register              -> { registrationCode }
 */
import { apiCall, buildJGameUrl, buildJGameUrlWithParams, type ApiResponse } from '../../../../shared/services/api'
import type {
  GameTask, GameTaskStatus, MyTaskItem, TaskListParams, TaskMilestone, TaskProgressEvent, TaskProgressEventSource,
  TaskRequirementType, TaskRanking, TaskRankingPeriod, TaskStep, UserTaskProgress, UserTaskStatus,
} from '../types/task.types'

/* ============ Adapter BE (enum int -> string, default an toàn cho BE cũ) ============ */

/** BE trả `requirementType` dạng số (enum TaskRequirementType: Level=0/Playtime=1/Collection=2). */
const REQUIREMENT_TYPE_BY_INT: TaskRequirementType[] = ['level', 'playtime', 'collection']
const STATUS_BY_INT: GameTaskStatus[] = ['active', 'closed']
const USER_STATUS_BY_INT: UserTaskStatus[] = ['notRegistered', 'inProgress', 'completed']
const SOURCE_BY_INT: TaskProgressEventSource[] = ['simulation', 'publisher', 'manualSync', 'registration']

type RawRecord = Record<string, unknown>

function asRecord(value: unknown): RawRecord {
  return typeof value === 'object' && value !== null ? (value as RawRecord) : {}
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
}

function enumFromInt<T extends string>(value: unknown, table: T[], fallback: T): T {
  if (typeof value === 'number') return table[value] ?? fallback
  if (typeof value === 'string' && (table as string[]).includes(value)) return value as T
  return fallback
}

function normalizeStep(raw: unknown): TaskStep {
  const r = asRecord(raw)
  return { order: asNumber(r.order), title: asString(r.title), detail: asString(r.detail) }
}

export function normalizeApiTask(raw: unknown): GameTask {
  const r = asRecord(raw)
  const slotLimit = asNumber(r.slotLimit)
  const slotUsed = asNumber(r.slotUsed)
  return {
    id: asString(r.id),
    title: asString(r.title),
    publisherName: asString(r.publisherName),
    requirementType: enumFromInt(r.requirementType, REQUIREMENT_TYPE_BY_INT, 'level'),
    requirementTargetValue: asNumber(r.requirementTargetValue),
    requirementHoursPerDay: typeof r.requirementHoursPerDay === 'number' ? r.requirementHoursPerDay : null,
    requirementItemNames: asStringArray(r.requirementItemNames),
    requirementSummary: asString(r.requirementSummary),
    description: asString(r.description),
    steps: Array.isArray(r.steps) ? r.steps.map(normalizeStep).sort((a, b) => a.order - b.order) : [],
    rewardJcoin: asNumber(r.rewardJcoin),
    slotLimit,
    slotUsed,
    slotsLeft: typeof r.slotsLeft === 'number' ? r.slotsLeft : Math.max(0, slotLimit - slotUsed),
    publisherFundStatus: Boolean(r.publisherFundStatus),
    status: enumFromInt(r.status, STATUS_BY_INT, 'active'),
    endAt: asNullableString(r.endAt),
    gameAndroidUrl: asNullableString(r.gameAndroidUrl),
    gameIosUrl: asNullableString(r.gameIosUrl),
    galleryImages: asStringArray(r.galleryImages),
  }
}

function normalizeMilestone(raw: unknown): TaskMilestone {
  const r = asRecord(raw)
  return { value: asNumber(r.value), label: asString(r.label), reached: Boolean(r.reached), reachedAt: asNullableString(r.reachedAt) }
}

function normalizeEvent(raw: unknown): TaskProgressEvent {
  const r = asRecord(raw)
  return {
    at: asString(r.at),
    value: asNumber(r.value),
    delta: asNumber(r.delta),
    source: enumFromInt(r.source, SOURCE_BY_INT, 'simulation'),
    note: asString(r.note),
  }
}

export function normalizeApiProgress(raw: unknown): UserTaskProgress {
  const r = asRecord(raw)
  const isRegistered = Boolean(r.isRegistered)
  const isCompleted = Boolean(r.isCompleted)
  const currentValue = asNumber(r.currentValue)
  const targetValue = asNumber(r.targetValue)
  // Fallback khi BE cũ chưa trả status/percent: suy từ 2 cờ + tỉ lệ.
  const fallbackStatus: UserTaskStatus = !isRegistered ? 'notRegistered' : isCompleted ? 'completed' : 'inProgress'
  const fallbackPercent = targetValue <= 0 ? 0 : Math.min(100, Math.round((currentValue / targetValue) * 100))
  return {
    taskId: asString(r.taskId),
    status: enumFromInt(r.status, USER_STATUS_BY_INT, fallbackStatus),
    currentValue,
    targetValue,
    percent: Math.max(0, Math.min(100, asNumber(r.percent, fallbackPercent))),
    isRegistered,
    isCompleted,
    registrationCode: asNullableString(r.registrationCode),
    registeredAt: asNullableString(r.registeredAt),
    lastSyncedAt: asNullableString(r.lastSyncedAt),
    rewardClaimedAt: asNullableString(r.rewardClaimedAt),
    milestones: Array.isArray(r.milestones) ? r.milestones.map(normalizeMilestone) : [],
    events: Array.isArray(r.events) ? r.events.map(normalizeEvent) : [],
  }
}

/** Progress rỗng (khách / chưa có bản ghi) — targetValue lấy từ nhiệm vụ để UI không hiển thị "0/0". */
export function emptyProgress(taskId: string, targetValue = 0): UserTaskProgress {
  return {
    taskId,
    status: 'notRegistered',
    currentValue: 0,
    targetValue,
    percent: 0,
    isRegistered: false,
    isCompleted: false,
    milestones: [],
    events: [],
  }
}

export class TaskApiService {
  private static readonly BASE_PATH = '/api/tasks'

  /** Danh sách nhiệm vụ đang mở — lọc server-side. Sentinel 'all' chỉ có ý nghĩa ở UI, không gửi lên BE
   * (BE nhận `requirementType` dạng enum số, gửi 'all' sẽ bị 400). */
  static async getTasks(params?: TaskListParams): Promise<ApiResponse<GameTask[]>> {
    const realParams: Record<string, unknown> = {}
    if (params?.keyword?.trim()) realParams.keyword = params.keyword.trim()
    if (params?.requirementType && params.requirementType !== 'all') {
      realParams.requirementType = REQUIREMENT_TYPE_BY_INT.indexOf(params.requirementType)
    }
    const response = await apiCall(buildJGameUrlWithParams(this.BASE_PATH, realParams), { method: 'GET' })
    const result: ApiResponse<unknown[]> = await response.json()
    return { ...result, data: result.data ? result.data.map(normalizeApiTask) : null }
  }

  static async getTaskDetail(taskId: string): Promise<ApiResponse<GameTask>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/${taskId}`), { method: 'GET' })
    const result: ApiResponse<unknown> = await response.json()
    return { ...result, data: result.data ? normalizeApiTask(result.data) : null }
  }

  static async getMyProgress(taskId: string): Promise<ApiResponse<UserTaskProgress>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/${taskId}/progress`), { method: 'GET' })
    const result: ApiResponse<unknown> = await response.json()
    return { ...result, data: result.data ? normalizeApiProgress(result.data) : null }
  }

  /** "Đồng bộ ngay" — BE giới hạn tần suất (`TASK_SYNC_TOO_FREQUENT`, mặc định 60s). */
  static async syncProgress(taskId: string): Promise<ApiResponse<UserTaskProgress>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/${taskId}/progress/sync`), { method: 'POST' })
    const result: ApiResponse<unknown> = await response.json()
    return { ...result, data: result.data ? normalizeApiProgress(result.data) : null }
  }

  /** BE trả `{registrationCode}` (KHÔNG phải progress đầy đủ) — hook gọi lại `getMyProgress` sau khi thành công. */
  static async registerTask(taskId: string): Promise<ApiResponse<{ registrationCode: string }>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/${taskId}/register`), { method: 'POST' })
    return response.json()
  }

  /** Nhiệm vụ đã đăng ký KÈM tiến độ — BE trả `{ task, progress }[]` trong 1 request (không còn N+1).
   * Guard shape cũ (mảng GameTaskResponse phẳng, không có key `task`) -> trả lỗi rõ nghĩa thay vì crash. */
  static async getMyTasks(): Promise<ApiResponse<MyTaskItem[]>> {
    const response = await apiCall(buildJGameUrl(`${this.BASE_PATH}/my`), { method: 'GET' })
    const result: ApiResponse<unknown[]> = await response.json()
    if (!result.success || !result.data) return { ...result, data: null }

    const items: MyTaskItem[] = []
    for (const raw of result.data) {
      const r = asRecord(raw)
      if (typeof r.task !== 'object' || r.task === null || typeof r.progress !== 'object' || r.progress === null) {
        return {
          ...result,
          success: false,
          data: null,
          message: 'Backend chưa cập nhật phân hệ nhiệm vụ (thiếu task/progress). Vui lòng thử lại sau.',
        }
      }
      items.push({ task: normalizeApiTask(r.task), progress: normalizeApiProgress(r.progress) })
    }
    return { ...result, data: items }
  }

  /** Top 50 JCoin kiếm được trong kỳ hiện tại - công khai (20260902-nc_xep-hang-jcoin.md). BE trả nguyên
   * field camelCase khớp `TaskRanking` (period đã là chuỗi "week"|"month"|"year") - không cần adapter. */
  static async getRanking(period: TaskRankingPeriod): Promise<ApiResponse<TaskRanking>> {
    const response = await apiCall(buildJGameUrlWithParams(`${this.BASE_PATH}/ranking`, { period }), { method: 'GET' })
    return response.json()
  }
}
