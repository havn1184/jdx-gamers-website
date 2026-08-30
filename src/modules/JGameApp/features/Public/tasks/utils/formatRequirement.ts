/**
 * formatRequirement — Diễn giải yêu cầu/tiến độ nhiệm vụ.
 *
 * TỰ QUYẾT (nc_ tích hợp API thật): BE chỉ trả `requirementType` phẳng (không có
 * targetLevel/hoursPerDay/totalDays/itemNames chi tiết như mock Website cũ), nên các hàm
 * dưới đây chỉ diễn giải được ở mức chung chung (tên loại yêu cầu, currentValue/targetValue
 * tổng quát) — mất đi phần hiển thị chi tiết (VD "Đạt cấp độ 30", "Chơi ≥2 giờ/ngày, đủ 7
 * ngày", danh sách tên vật phẩm). Xem ghi chú tại `types/task.types.ts`.
 */
import type { GameTask, UserTaskProgress } from '../types/task.types'

const REQUIREMENT_LABEL: Record<TaskRequirementTypeKey, string> = {
  level: 'Đạt cấp độ mục tiêu',
  playtime: 'Duy trì thời lượng chơi theo ngày',
  collection: 'Sưu tập đủ vật phẩm',
}

type TaskRequirementTypeKey = GameTask['requirementType']

export function formatRequirementSummary(task: GameTask): string {
  return REQUIREMENT_LABEL[task.requirementType] ?? 'Yêu cầu nhiệm vụ'
}

export function formatProgressSummary(_task: GameTask, progress: UserTaskProgress | null): string {
  if (!progress || !progress.isRegistered) return 'Chưa đăng ký'
  if (progress.isCompleted) return 'Đã hoàn thành đủ tiến độ'
  return `Tiến độ: ${progress.currentValue}/${progress.targetValue}`
}

export function getProgressPercent(_task: GameTask, progress: UserTaskProgress | null): number {
  if (!progress || !progress.isRegistered || progress.targetValue <= 0) return 0
  return Math.min(100, Math.round((progress.currentValue / progress.targetValue) * 100))
}

/** Số JCoin đã tích lũy được tính đến hiện tại — BE không trả `milestoneLog` chi tiết như mock
 * Website cũ nên không thể hiển thị nhật ký từng mốc; ước lượng tuyến tính theo tỉ lệ
 * currentValue/targetValue, trả đủ `rewardJcoin` khi đã hoàn thành (isCompleted). Chỉ mang
 * tính hiển thị (tạm tính) — JCoin thật cộng vào ví do BE quyết định. */
export function getEarnedSoFar(task: GameTask, progress: UserTaskProgress | null): number {
  if (!progress || !progress.isRegistered) return 0
  if (progress.isCompleted) return task.rewardJcoin
  if (progress.targetValue <= 0) return 0
  return Math.round((task.rewardJcoin * progress.currentValue) / progress.targetValue)
}
