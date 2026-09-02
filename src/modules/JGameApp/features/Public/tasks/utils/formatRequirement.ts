/**
 * formatRequirement — Nhãn/diễn giải dùng chung cho phân hệ Nhiệm vụ.
 *
 * Nguyên tắc (nc_nhiem-vu-web-dong-bo.md): câu chữ yêu cầu lấy từ `task.requirementSummary` do BE dựng,
 * `percent`/`status` từ BE — FE chỉ format nhãn phụ (đơn vị, tên loại, nguồn event, trạng thái bước).
 * Đồng bộ 1:1 với App (`App/lib/features/tasks/presentation/tasks_ui_helpers.dart`).
 */
import type { GameTask, TaskProgressEventSource, TaskRequirementType, UserTaskProgress, UserTaskStatus } from '../types/task.types'

const REQUIREMENT_LABEL: Record<TaskRequirementType, string> = {
  level: 'Cấp độ',
  playtime: 'Giờ chơi',
  collection: 'Sưu tập',
}

/** Đơn vị đếm tiến độ theo loại ("3/7 ngày", "12/30 cấp", "2/5 vật phẩm"). */
const REQUIREMENT_UNIT: Record<TaskRequirementType, string> = {
  level: 'cấp',
  playtime: 'ngày',
  collection: 'vật phẩm',
}

const EVENT_SOURCE_LABEL: Record<TaskProgressEventSource, string> = {
  registration: 'Đăng ký',
  manualSync: 'Đồng bộ thủ công',
  publisher: 'Từ nhà phát hành',
  simulation: 'Tự động đồng bộ',
}

export function formatRequirementTypeLabel(type: TaskRequirementType): string {
  return REQUIREMENT_LABEL[type] ?? 'Nhiệm vụ'
}

export function formatRequirementUnit(type: TaskRequirementType): string {
  return REQUIREMENT_UNIT[type] ?? ''
}

/** Câu yêu cầu: ưu tiên `requirementSummary` từ BE; fallback ngắn khi BE cũ chưa trả. */
export function formatRequirementSummary(task: GameTask): string {
  if (task.requirementSummary) return task.requirementSummary
  return `${formatRequirementTypeLabel(task.requirementType)} · mục tiêu ${task.requirementTargetValue} ${formatRequirementUnit(task.requirementType)}`
}

/** "3/7 ngày · 43%" — dùng `percent` từ BE. */
export function formatProgressSummary(task: GameTask, progress: UserTaskProgress | null): string {
  if (!progress || !progress.isRegistered) return 'Chưa đăng ký'
  const target = progress.targetValue > 0 ? progress.targetValue : task.requirementTargetValue
  return `${progress.currentValue}/${target} ${formatRequirementUnit(task.requirementType)} · ${progress.percent}%`
}

export function getProgressPercent(progress: UserTaskProgress | null): number {
  if (!progress || !progress.isRegistered) return 0
  return Math.max(0, Math.min(100, progress.percent))
}

export function formatEventSource(source: TaskProgressEventSource): string {
  return EVENT_SOURCE_LABEL[source] ?? 'Đồng bộ'
}

export interface UserStatusMeta {
  label: string
  className: string
}

/** Badge trạng thái theo nhóm ngữ nghĩa — cùng chữ với App. */
export function getUserStatusMeta(status: UserTaskStatus): UserStatusMeta {
  switch (status) {
    case 'completed':
      return { label: 'Đã hoàn thành', className: 'bg-emerald-500/20 text-emerald-300' }
    case 'inProgress':
      return { label: 'Đang thực hiện', className: 'bg-amber-500/20 text-amber-300' }
    default:
      return { label: 'Chưa đăng ký', className: 'bg-white/10 text-white/70' }
  }
}

export type TaskStepState = 'done' | 'current' | 'upcoming'

/**
 * Trạng thái từng bước trong stepper theo tiến độ — quy tắc giống App (`stepStateFor`):
 * notRegistered -> bước 1 current; inProgress & percent == 0 -> bước 1 done, bước 2-3 current;
 * percent > 0 -> bước 1-3 done, bước 4 current; completed -> tất cả done.
 */
export function getStepState(stepIndex: number, stepCount: number, progress: UserTaskProgress | null): TaskStepState {
  if (!progress || progress.status === 'notRegistered') return stepIndex === 0 ? 'current' : 'upcoming'
  if (progress.status === 'completed') return 'done'
  const requirementStep = stepCount >= 5 ? 3 : Math.min(Math.max(stepCount - 2, 1), stepCount - 1)
  if (progress.percent > 0) {
    if (stepIndex < requirementStep) return 'done'
    return stepIndex === requirementStep ? 'current' : 'upcoming'
  }
  if (stepIndex === 0) return 'done'
  return stepIndex < requirementStep ? 'current' : 'upcoming'
}

/** Nhiệm vụ còn đăng ký được (chưa đóng, chưa hết hạn, còn suất). */
export function isTaskExpired(task: GameTask): boolean {
  return Boolean(task.endAt) && new Date(task.endAt as string).getTime() < Date.now()
}

export function canRegisterTask(task: GameTask): boolean {
  return task.status === 'active' && !isTaskExpired(task) && task.slotsLeft > 0
}
