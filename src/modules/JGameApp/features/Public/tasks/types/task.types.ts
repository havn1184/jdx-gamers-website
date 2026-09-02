/**
 * Types cho phân hệ "Kiếm tiền" — nhiệm vụ trải nghiệm/test game, trả thưởng JCoin.
 *
 * Field đặt theo ĐÚNG contract BE thật `JGameApi` (GameTaskResponse/UserTaskProgressResponse/MyTaskResponse,
 * xem `Backend/JGameApi/Docs/Nang-cap/20260902-nc_nhiem-vu-mo-ta-tien-do.md` và quyet-dinh-hop-nhat-api.md #10/#11/#12).
 * Ví (VND + JCoin) đã tách sang types/wallet.types.ts (nc_vi-2-loai-tien-thanh-toan.md).
 *
 * Nguyên tắc (nc_nhiem-vu-web-dong-bo.md): mọi câu chữ diễn giải yêu cầu (`requirementSummary`), `percent`,
 * `status`, `milestones`, `events` đều do Backend tính — Website và App chỉ hiển thị, KHÔNG tự dựng câu/ước lượng.
 */

export type TaskRequirementType = 'level' | 'playtime' | 'collection'

/** BE `TaskStatus`: Active=0 / Closed=1 (adapter int -> string trong TaskApiService). */
export type GameTaskStatus = 'active' | 'closed'

export interface MockTaskArt {
  gradient: [string, string]
  icon: string
}

/** 1 bước hướng dẫn thực hiện nhiệm vụ (BE `TaskStepResponse`). */
export interface TaskStep {
  order: number
  title: string
  detail: string
}

export interface GameTask {
  id: string
  /** BE field `title` (Website cũ gọi là `gameName`). */
  title: string
  publisherName: string
  requirementType: TaskRequirementType
  /** Mục tiêu: cấp cần đạt / số ngày / số vật phẩm. */
  requirementTargetValue: number
  /** Chỉ playtime: số giờ tối thiểu mỗi ngày. */
  requirementHoursPerDay?: number | null
  /** Chỉ collection: tên vật phẩm cần sưu tập. */
  requirementItemNames: string[]
  /** Câu diễn giải yêu cầu do BE dựng — nguồn duy nhất, FE không tự ghép câu. */
  requirementSummary: string
  /** Mô tả nhiệm vụ + game (rỗng nếu BE chưa có). */
  description: string
  steps: TaskStep[]
  /** BE field `rewardJcoin` (Website cũ gọi là `jcoinReward`). */
  rewardJcoin: number
  slotLimit: number
  slotUsed: number
  slotsLeft: number
  /** BE trả boolean thẳng (Website cũ dùng chuỗi 'funded'|'pending'). */
  publisherFundStatus: boolean
  status: GameTaskStatus
  endAt?: string | null
  gameAndroidUrl?: string | null
  gameIosUrl?: string | null
  /** Ảnh gameplay minh hoạ (phục vụ tĩnh từ wwwroot/task-images trên JGameApi) — có thể rỗng. */
  galleryImages?: string[]
  /** Trang trí UI fallback khi galleryImages rỗng — BE không trả field này. */
  art?: MockTaskArt
}

/** BE `UserTaskStatus`: NotRegistered=0 / InProgress=1 / Completed=2. */
export type UserTaskStatus = 'notRegistered' | 'inProgress' | 'completed'

/** BE `TaskProgressEventSource`: Simulation=0 / Publisher=1 / ManualSync=2 / Registration=3. */
export type TaskProgressEventSource = 'simulation' | 'publisher' | 'manualSync' | 'registration'

export interface TaskMilestone {
  value: number
  label: string
  reached: boolean
  reachedAt?: string | null
}

/** 1 dòng nhật ký tiến độ (BE trả mới nhất trước, tối đa 50). */
export interface TaskProgressEvent {
  at: string
  value: number
  delta: number
  source: TaskProgressEventSource
  note: string
}

export interface UserTaskProgress {
  taskId: string
  status: UserTaskStatus
  currentValue: number
  targetValue: number
  /** 0-100 do BE tính. */
  percent: number
  isRegistered: boolean
  isCompleted: boolean
  /** Mã đăng ký dùng trong game — BE sinh khi đăng ký thành công (dạng "JGM-XXXX-XXXX"). */
  registrationCode?: string | null
  registeredAt?: string | null
  lastSyncedAt?: string | null
  rewardClaimedAt?: string | null
  milestones: TaskMilestone[]
  events: TaskProgressEvent[]
}

/** Item của `GET /api/tasks/my` — nhiệm vụ đã đăng ký KÈM tiến độ (1 request, thay N+1). */
export interface MyTaskItem {
  task: GameTask
  progress: UserTaskProgress
}

export interface TaskListParams {
  requirementType?: TaskRequirementType | 'all'
  keyword?: string
}

/** Xếp hạng JCoin kiếm được (20260902-nc_xep-hang-jcoin.md) - chỉ xem kỳ HIỆN TẠI. */
export type TaskRankingPeriod = 'week' | 'month' | 'year'

/** 1 dòng bảng xếp hạng (BE `TaskRankingEntryResponse`) - dùng chung cho `items` và `myEntry`. */
export interface TaskRankingEntry {
  /** null nếu chưa xếp hạng (0 JCoin trong kỳ) - không phải lỗi. */
  rank: number | null
  userId: string
  name: string
  avatarUrl: string | null
  jcoinEarned: number
  isCurrentUser: boolean
}

/** BE `TaskRankingResponse` - GET /api/tasks/ranking?period=. */
export interface TaskRanking {
  period: TaskRankingPeriod
  periodStart: string
  periodEnd: string
  /** Top 50, giảm dần theo jcoinEarned. */
  items: TaskRankingEntry[]
  /** null nếu khách chưa đăng nhập. */
  myEntry: TaskRankingEntry | null
}
