/**
 * Types cho phân hệ "Kiếm tiền" — nhiệm vụ trải nghiệm/test game, trả thưởng JCoin.
 *
 * Field đặt theo ĐÚNG contract BE thật `JGameApi` (GameTaskResponse/UserTaskProgressResponse/
 * JcoinWalletResponse/JcoinTransactionResponse — theo App, xem quyet-dinh-hop-nhat-api.md
 * #10/#11/#13), KHÔNG theo model cũ của Website nữa (`gameName`/`jcoinReward`/`requirement`
 * object/`status` enum). Đây là nc_ "Tích hợp Website + App gọi API thật JGameApi".
 *
 * TỰ QUYẾT (BE không có, Website mock cũ có) — xem báo cáo nc_ để biết chi tiết:
 * - `requirement` chi tiết (targetLevel/hoursPerDay/totalDays/itemNames) bị bỏ, BE chỉ trả
 *   `requirementType` phẳng ('level'|'playtime'|'collection') — UI chỉ hiển thị được tên loại
 *   yêu cầu chung chung, không hiển thị được số cụ thể/tên vật phẩm nữa.
 * - `art`/`galleryImages`/`description`/`deadline` là phần Website tự thêm để trang trí UI,
 *   BE KHÔNG có — giữ optional, chỉ có giá trị ở nhánh mock (xem TaskApiService.ts).
 * - `UserTaskProgress.milestoneLog` (nhật ký từng mốc) không còn — BE chỉ trả
 *   `currentValue`/`targetValue` tổng quát.
 */

export type TaskRequirementType = 'level' | 'playtime' | 'collection'

export interface MockTaskArt {
  gradient: [string, string]
  icon: string
}

export interface GameTask {
  id: string
  /** BE field `title` (Website cũ gọi là `gameName`). */
  title: string
  publisherName: string
  /** BE chỉ trả loại yêu cầu phẳng — không có targetLevel/hoursPerDay/totalDays/itemNames. */
  requirementType: TaskRequirementType
  /** BE field `rewardJcoin` (Website cũ gọi là `jcoinReward`). */
  rewardJcoin: number
  slotLimit: number
  slotUsed: number
  /** BE trả boolean thẳng (Website cũ dùng chuỗi 'funded'|'pending'). */
  publisherFundStatus: boolean
  /** Trang trí UI — chỉ có giá trị ở nhánh mock, BE thật không trả field này. */
  art?: MockTaskArt
  galleryImages?: string[]
  description?: string
  deadline?: string
}

/** UserTaskProgress — model theo BE thật (App đã dùng sẵn shape này). Thay hẳn model cũ
 * Website (status: 'registered'|'in_progress'|'rewarded', currentLevel/daysCompleted/
 * todayHours/itemsCollected/milestoneLog) — BE không có các field chi tiết đó. */
export interface UserTaskProgress {
  taskId: string
  currentValue: number
  targetValue: number
  isRegistered: boolean
  isCompleted: boolean
  lastSyncedAt?: string | null
  /** Mã đăng ký dùng trong game — BE sinh khi đăng ký thành công (dạng "JGM-XXXX-XXXX"). */
  registrationCode?: string | null
}

export interface TaskListParams {
  requirementType?: TaskRequirementType | 'all'
  keyword?: string
}

/** JCoin — ví + giao dịch. BE dùng enum int (EarnTask=0/SpendCard=1/SpendTicket=2/
 * SpendAccessory=3) cho `type`; Website vẫn dùng chuỗi để hiển thị UI (giữ nguyên tên hiển
 * thị cũ) — TaskApiService chịu trách nhiệm map int -> chuỗi khi đọc response thật. */
export type JcoinTxType = 'EARN_TASK' | 'SPEND_CARD' | 'SPEND_TICKET' | 'SPEND_ACCESSORY'

export interface JcoinTransaction {
  id: string
  userId: string
  type: JcoinTxType
  amount: number
  reason: string
  createdAt: string
}
