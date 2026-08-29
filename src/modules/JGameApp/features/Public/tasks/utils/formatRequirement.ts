/**
 * formatRequirement — Diễn giải yêu cầu nhiệm vụ theo từng dạng (level/playtime/collection).
 */
import type { GameTask, UserTaskProgress } from '../types/task.types'

export function formatRequirementSummary(task: GameTask): string {
  const r = task.requirement
  if (r.type === 'level') return `Đạt cấp độ ${r.targetLevel}`
  if (r.type === 'playtime') return `Chơi ≥${r.hoursPerDay} giờ/ngày, đủ ${r.totalDays} ngày`
  return `Sưu tập đủ ${r.itemNames?.length ?? 0} vật phẩm`
}

export function formatProgressSummary(task: GameTask, progress: UserTaskProgress | null): string {
  if (!progress) return 'Chưa đăng ký'
  const r = task.requirement
  if (r.type === 'level') return `Cấp độ hiện tại: ${progress.currentLevel ?? 0}/${r.targetLevel}`
  if (r.type === 'playtime') return `Ngày ${progress.daysCompleted ?? 0}/${r.totalDays} · Hôm nay ${(progress.todayHours ?? 0).toFixed(1)}/${r.hoursPerDay} giờ`
  return `Đã thu thập ${progress.itemsCollected?.length ?? 0}/${r.itemNames?.length ?? 0} vật phẩm`
}

export function getProgressPercent(task: GameTask, progress: UserTaskProgress | null): number {
  if (!progress) return 0
  const r = task.requirement
  if (r.type === 'level') return Math.min(100, Math.round(((progress.currentLevel ?? 0) / (r.targetLevel ?? 1)) * 100))
  if (r.type === 'playtime') return Math.min(100, Math.round(((progress.daysCompleted ?? 0) / (r.totalDays ?? 1)) * 100))
  return Math.min(100, Math.round(((progress.itemsCollected?.length ?? 0) / (r.itemNames?.length ?? 1)) * 100))
}
