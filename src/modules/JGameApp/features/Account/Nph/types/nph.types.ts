/**
 * Types cho Cổng tự phục vụ NPH (20260903-nc_quan-tri-nha-phat-hanh-game.md mục 2) — khớp chính xác
 * DTO Backend thật (JGameApi/DTOs/Tasks + DTOs/Wallet), KHÔNG phải mock. Enum int BE map sang string
 * union FE cho dễ đọc UI, theo đúng thứ tự khai báo trong JGameApi/Enums/*.cs.
 */

/** Hồ sơ NPH lưu kèm token sau khi đăng nhập (PublisherLoginResponse, trừ accessToken). */
export interface NphProfile {
  publisherId: string
  name: string
  email: string
}

// ===== Enum map (khớp thứ tự int Backend — JGameApi/Enums/TaskEnums.cs, WalletEnums.cs) =====

/** TaskRequirementType: Level=0, Playtime=1, Collection=2. */
export type NphTaskRequirementType = 'level' | 'playtime' | 'collection'
export const NPH_TASK_REQUIREMENT_TYPE_MAP: NphTaskRequirementType[] = ['level', 'playtime', 'collection']
export const NPH_TASK_REQUIREMENT_TYPE_LABELS: Record<NphTaskRequirementType, string> = {
  level: 'Đạt cấp độ',
  playtime: 'Thời gian chơi',
  collection: 'Sưu tập vật phẩm',
}

/** TaskStatus: Active=0, Closed=1. */
export type NphTaskStatus = 'active' | 'closed'
export const NPH_TASK_STATUS_MAP: NphTaskStatus[] = ['active', 'closed']

/** WalletTransactionHoldStatus: Confirmed=0, Pending=1, Flagged=2, Reversed=3. */
export type NphHoldStatus = 'confirmed' | 'pending' | 'flagged' | 'reversed'
export const NPH_HOLD_STATUS_MAP: NphHoldStatus[] = ['confirmed', 'pending', 'flagged', 'reversed']
export const NPH_HOLD_STATUS_LABELS: Record<NphHoldStatus, string> = {
  confirmed: 'Khả dụng',
  pending: 'Chờ xác nhận',
  flagged: 'Bị gắn cờ',
  reversed: 'Đã từ chối',
}

/** GET /api/publisher/tasks — mirror GameTaskResponse.cs, chỉ giữ field NPH cần thấy/sửa. */
export interface NphTask {
  id: string
  title: string
  description: string
  requirementType: NphTaskRequirementType
  requirementTargetValue: number
  requirementHoursPerDay: number | null
  requirementItemNames: string[]
  requirementSummary: string
  rewardJcoin: number
  slotLimit: number
  slotUsed: number
  slotsLeft: number
  /** Trạng thái quỹ tính động — true = Đủ quỹ, false = Thiếu quỹ (BE tính, NPH không tự set). */
  publisherFundStatus: boolean
  status: NphTaskStatus
  endAt: string | null
  gameAndroidUrl: string | null
  gameIosUrl: string | null
  galleryImages: string[]
}

/** Body tạo/sửa nhiệm vụ — mirror CreateGameTaskRequest/UpdateGameTaskRequest.cs, giới hạn field NPH được sửa. */
export interface NphTaskFormPayload {
  id?: string
  title: string
  description: string
  requirementType: NphTaskRequirementType
  requirementTargetValue: number
  requirementHoursPerDay?: number | null
  requirementItemNames: string[]
  rewardJcoin: number
  slotLimit: number
  endAt?: string | null
  gameAndroidUrl?: string | null
  gameIosUrl?: string | null
}

/** 1 dòng lịch sử ví — mirror WalletTransactionResponse.cs. BE KHÔNG enrich tên người chơi cho publisher
 * (chỉ AdminWalletHoldsController mới enrich UserName/UserPhone) — FE tự rút gọn userId để hiển thị. */
export interface NphTransaction {
  id: string
  userId: string
  amount: number
  reason: string
  referenceId: string | null
  createdAt: string
  holdStatus: NphHoldStatus
  availableAt: string | null
}

/** GET /api/publisher/dashboard — mirror PublisherDashboardResponse.cs. */
export interface NphDashboard {
  taskCount: number
  jcoinBalance: number
  totalPaidAvailable: number
  totalPaidPending: number
  recentCompletions: NphTransaction[]
}

/** GET /api/publisher/wallet — mirror TaskPublisherWalletResponse.cs. */
export interface NphWallet {
  jcoinBalance: number
}

/** Trạng thái yêu cầu nạp quỹ — BE trả THẲNG string "Pending"|"Paid"|"Expired" (TopupVndResponse.Status
 * là kiểu string, KHÔNG phải enum int — xem PublisherWalletTopupService.MapToResponse). */
export type NphTopupStatus = 'Pending' | 'Paid' | 'Expired'
export const NPH_TOPUP_STATUS_LABELS: Record<NphTopupStatus, string> = {
  Pending: 'Đang chờ',
  Paid: 'Đã nạp',
  Expired: 'Hết hạn',
}

/** POST/GET /api/publisher/wallet/topup(s) — mirror TopupVndResponse.cs. */
export interface NphTopup {
  id: string
  amount: number
  qrCode: string
  expiredAt: string
  status: NphTopupStatus
}

/** POST /api/publisher/webhook-secret/rotate — mirror TaskPublisherResponse.cs, chỉ field NPH cần. */
export interface NphWebhookSecretResult {
  webhookSecret: string | null
  webhookSecretMasked: string
  secretRotatedAt: string | null
}
