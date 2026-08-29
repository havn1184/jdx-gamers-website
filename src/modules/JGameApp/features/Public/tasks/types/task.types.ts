/**
 * Types cho phân hệ "Kiếm tiền" — nhiệm vụ trải nghiệm/test game, trả thưởng JCoin.
 */

export type TaskRequirementType = 'level' | 'playtime' | 'collection'
export type TaskStatus = 'active' | 'closed'
export type PublisherFundStatus = 'funded' | 'pending'

export interface MockTaskArt {
  gradient: [string, string]
  icon: string
}

/** Chi tiết yêu cầu — khác nhau theo `type`, chỉ field tương ứng có giá trị. */
export interface TaskRequirement {
  type: TaskRequirementType
  /** Dạng 'level': cấp độ mục tiêu */
  targetLevel?: number
  /** Dạng 'playtime': số giờ tối thiểu mỗi ngày */
  hoursPerDay?: number
  /** Dạng 'playtime': số ngày liên tục cần đạt */
  totalDays?: number
  /** Dạng 'collection': danh sách tên vật phẩm cần sưu tập */
  itemNames?: string[]
}

export interface GameTask {
  id: string
  gameName: string
  publisherName: string
  publisherFundStatus: PublisherFundStatus
  art: MockTaskArt
  /** 3 ảnh giới thiệu game (stock ảnh gameplay chung, không phải screenshot game thật) */
  galleryImages: string[]
  description: string
  requirement: TaskRequirement
  jcoinReward: number
  slotLimit: number
  slotUsed: number
  deadline: string
  status: TaskStatus
  createdAt: string
}

export type UserTaskStatus = 'registered' | 'in_progress' | 'rewarded'

export interface UserTaskProgress {
  id: string
  userId: string
  taskId: string
  status: UserTaskStatus
  /** Dạng 'level': cấp độ hiện tại */
  currentLevel?: number
  /** Dạng 'playtime': số ngày đã đạt đủ giờ yêu cầu */
  daysCompleted?: number
  /** Dạng 'playtime': số giờ đã chơi TRONG NGÀY hôm nay */
  todayHours?: number
  /** Dạng 'collection': tên các vật phẩm đã thu thập được */
  itemsCollected?: string[]
  lastSyncedAt: string
  registeredAt: string
  rewardedAt?: string
}

export interface TaskListParams {
  requirementType?: TaskRequirementType | 'all'
  keyword?: string
}
