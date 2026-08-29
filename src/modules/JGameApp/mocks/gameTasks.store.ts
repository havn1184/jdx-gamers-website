/**
 * Mock nhiệm vụ trải nghiệm/test game (phân hệ "Kiếm tiền") + tiến độ người dùng.
 * Mô phỏng "game tự đồng bộ trạng thái về JGame": 1 timer nền tự cập nhật số người tham gia,
 * tiến độ của từng người đã đăng ký, và trạng thái cấp quỹ của nhà phát hành — theo đúng
 * cơ chế đã dùng cho slot Chợ vé (GĐ2), tái áp dụng cho phân hệ này.
 *
 * Danh sách nhiệm vụ (`tasks`) và tiến độ người dùng (`userProgress`) là in-memory,
 * reset khi tải lại trang — giống `orders.store.ts`/`accessoryOrders.store.ts` (mock GĐ1/GĐ3).
 * Riêng số dư JCoin đã kiếm được (`jcoinWallet.store.ts`) vẫn lưu localStorage nên không mất.
 */
import { earn } from './jcoinWallet.store'
import { DEMO_ACCOUNTS } from './authUsers.store'
import shot1 from '../assets/game-task/Screenshot 2026-08-29 092613.png'
import shot2 from '../assets/game-task/Screenshot 2026-08-29 092640.png'
import shot3 from '../assets/game-task/Screenshot 2026-08-29 092704.png'
import shot4 from '../assets/game-task/Screenshot 2026-08-29 092721.png'
import shot5 from '../assets/game-task/Screenshot 2026-08-29 092804.png'
import shot6 from '../assets/game-task/Screenshot 2026-08-29 092818.png'
import shot7 from '../assets/game-task/Screenshot 2026-08-29 092834.png'
import shot8 from '../assets/game-task/Screenshot 2026-08-29 092848.png'
import shot9 from '../assets/game-task/Screenshot 2026-08-29 092910.png'
import shot10 from '../assets/game-task/Screenshot 2026-08-29 092932.png'
import shot11 from '../assets/game-task/Screenshot 2026-08-29 092943.png'
import shot12 from '../assets/game-task/Screenshot 2026-08-29 092958.png'
import type { GameTask, UserTaskProgress, TaskListParams } from '../features/Public/tasks/types/task.types'

/** Ảnh gameplay minh hoạ nhiệm vụ, lấy từ bộ ảnh chụp thật trong assets/game-task
 * (RPG hành động, chiến thuật lượt, thẻ bài, chiến thuật lâu đài...) — không gắn với
 * nhà phát hành thật nào, chỉ dùng để mock cho gần với trải nghiệm thật hơn ảnh stock chung chung. */
const GALLERY_POOL = [shot1, shot2, shot3, shot4, shot5, shot6, shot7, shot8, shot9, shot10, shot11, shot12]
function gallery(...indexes: number[]): string[] {
  return indexes.map(i => GALLERY_POOL[i])
}

let seq = 1
function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`
}

const now = Date.now()
function daysFromNow(d: number): string {
  return new Date(now + d * 86400000).toISOString()
}

const tasks: GameTask[] = [
  {
    id: 'task-level-1', gameName: 'Vũ Trụ Thần Thoại', publisherName: 'Nebula Studio', publisherFundStatus: 'funded',
    art: { gradient: ['#7C3AED', '#EC4899'], icon: 'Trophy' }, galleryImages: gallery(0, 1, 3),
    description: 'Trải nghiệm chế độ chiến dịch, đạt cấp độ nhân vật yêu cầu để nhận thưởng.',
    requirement: { type: 'level', targetLevel: 30 }, jcoinReward: 50000, slotLimit: 200, slotUsed: 142,
    deadline: daysFromNow(20), status: 'active', createdAt: daysFromNow(-10),
  },
  {
    id: 'task-level-2', gameName: 'Đế Chế Loạn Chiến', publisherName: 'Ironclad Games', publisherFundStatus: 'funded',
    art: { gradient: ['#dc2626', '#7f1d1d'], icon: 'Swords' }, galleryImages: gallery(4, 7, 6),
    description: 'Xây dựng đế chế và đạt cấp độ thành trì mục tiêu.',
    requirement: { type: 'level', targetLevel: 15 }, jcoinReward: 30000, slotLimit: 300, slotUsed: 288,
    deadline: daysFromNow(15), status: 'active', createdAt: daysFromNow(-5),
  },
  {
    id: 'task-level-3', gameName: 'Huyền Thoại Vô Cực', publisherName: 'Skyfall Interactive', publisherFundStatus: 'pending',
    art: { gradient: ['#0ea5e9', '#0369a1'], icon: 'Trophy' }, galleryImages: gallery(2, 3, 1),
    description: 'Vượt qua 50 màn chơi đầu và đạt cấp độ tướng yêu cầu.',
    requirement: { type: 'level', targetLevel: 50 }, jcoinReward: 80000, slotLimit: 100, slotUsed: 31,
    deadline: daysFromNow(30), status: 'active', createdAt: daysFromNow(-2),
  },
  {
    id: 'task-playtime-1', gameName: 'Săn Rồng Đại Chiến', publisherName: 'Dragonforge', publisherFundStatus: 'funded',
    art: { gradient: ['#f97316', '#ef4444'], icon: 'Timer' }, galleryImages: gallery(10, 11, 6),
    description: 'Duy trì thói quen chơi hàng ngày để trải nghiệm đầy đủ nội dung game.',
    requirement: { type: 'playtime', hoursPerDay: 2, totalDays: 7 }, jcoinReward: 40000, slotLimit: 150, slotUsed: 96,
    deadline: daysFromNow(14), status: 'active', createdAt: daysFromNow(-7),
  },
  {
    id: 'task-playtime-2', gameName: 'Nông Trại Vui Vẻ 3D', publisherName: 'Sunny Farm Studio', publisherFundStatus: 'funded',
    art: { gradient: ['#22c55e', '#15803d'], icon: 'Timer' }, galleryImages: gallery(8, 5, 7),
    description: 'Chơi tối thiểu 1 giờ/ngày trong 5 ngày liên tiếp để đánh giá độ mượt game.',
    requirement: { type: 'playtime', hoursPerDay: 1, totalDays: 5 }, jcoinReward: 20000, slotLimit: 500, slotUsed: 410,
    deadline: daysFromNow(10), status: 'active', createdAt: daysFromNow(-8),
  },
  {
    id: 'task-playtime-3', gameName: 'Chiến Binh Bóng Đêm', publisherName: 'Shadow Peak', publisherFundStatus: 'pending',
    art: { gradient: ['#312e81', '#1e1b4b'], icon: 'Timer' }, galleryImages: gallery(2, 0, 8),
    description: 'Chơi 3 giờ/ngày trong 10 ngày để trải nghiệm trọn vẹn cốt truyện.',
    requirement: { type: 'playtime', hoursPerDay: 3, totalDays: 10 }, jcoinReward: 100000, slotLimit: 80, slotUsed: 12,
    deadline: daysFromNow(25), status: 'active', createdAt: daysFromNow(-1),
  },
  {
    id: 'task-collection-1', gameName: 'Đảo Kho Báu Kỳ Bí', publisherName: 'Treasure Isle', publisherFundStatus: 'funded',
    art: { gradient: ['#f59e0b', '#78350f'], icon: 'Gem' }, galleryImages: gallery(5, 9, 10),
    description: 'Khám phá bản đồ và sưu tập đủ bộ vật phẩm huyền thoại.',
    requirement: { type: 'collection', itemNames: ['Chìa khoá vàng', 'Bản đồ cổ', 'Rương báu', 'Ngọc bích', 'Vương miện'] },
    jcoinReward: 60000, slotLimit: 120, slotUsed: 77, deadline: daysFromNow(18), status: 'active', createdAt: daysFromNow(-6),
  },
  {
    id: 'task-collection-2', gameName: 'Thế Giới Thú Cưng', publisherName: 'Petverse', publisherFundStatus: 'funded',
    art: { gradient: ['#ec4899', '#f97316'], icon: 'Gem' }, galleryImages: gallery(8, 11, 9),
    description: 'Thu thập đủ bộ trang phục sự kiện cho thú cưng.',
    requirement: { type: 'collection', itemNames: ['Mũ phù thuỷ', 'Áo choàng', 'Đôi cánh', 'Vòng cổ ma thuật'] },
    jcoinReward: 25000, slotLimit: 250, slotUsed: 190, deadline: daysFromNow(12), status: 'active', createdAt: daysFromNow(-9),
  },
  {
    id: 'task-collection-3', gameName: 'Vương Quốc Ma Pháp', publisherName: 'Arcane Circle', publisherFundStatus: 'pending',
    art: { gradient: ['#7C3AED', '#0ea5e9'], icon: 'Gem' }, galleryImages: gallery(9, 10, 8),
    description: 'Sưu tập đủ 6 mảnh ghép Ấn Ma Pháp rải rác trong game.',
    requirement: { type: 'collection', itemNames: ['Mảnh Lửa', 'Mảnh Nước', 'Mảnh Gió', 'Mảnh Đất', 'Mảnh Sáng', 'Mảnh Tối'] },
    jcoinReward: 70000, slotLimit: 90, slotUsed: 24, deadline: daysFromNow(22), status: 'active', createdAt: daysFromNow(-3),
  },
]

/** Seed tiến độ nhiệm vụ demo cho tài khoản khách hàng demo — đủ cả 3 trạng thái
 * (đã đăng ký/đang thực hiện/đã nhận thưởng) để trang "Nhiệm vụ của tôi" có dữ liệu
 * minh hoạ ngay. `task-level-1` khớp đúng giao dịch "+85.000 JCoin" đã seed sẵn trong
 * `jcoinWallet.store.ts` (không earn() lại ở đây để tránh cộng JCoin trùng lặp). */
const userProgress: UserTaskProgress[] = [
  {
    id: genId('UTP'), userId: DEMO_ACCOUNTS.customer.id, taskId: 'task-level-1', status: 'rewarded',
    currentLevel: 30, registeredAt: daysFromNow(-10), lastSyncedAt: daysFromNow(-2), rewardedAt: daysFromNow(-2),
    milestoneLog: [
      { label: 'Đạt cấp độ 10 (mốc 1/3)', reward: 16667, completedAt: daysFromNow(-8) },
      { label: 'Đạt cấp độ 20 (mốc 2/3)', reward: 16667, completedAt: daysFromNow(-5) },
      { label: 'Đạt cấp độ 30 (mốc 3/3)', reward: 16666, completedAt: daysFromNow(-2) },
    ],
  },
  {
    id: genId('UTP'), userId: DEMO_ACCOUNTS.customer.id, taskId: 'task-playtime-2', status: 'in_progress',
    daysCompleted: 2, todayHours: 0.4, registeredAt: daysFromNow(-4), lastSyncedAt: daysFromNow(0),
    milestoneLog: [
      { label: 'Hoàn thành ngày 1/5', reward: 4000, completedAt: daysFromNow(-3) },
      { label: 'Hoàn thành ngày 2/5', reward: 4000, completedAt: daysFromNow(-1) },
    ],
  },
  {
    id: genId('UTP'), userId: DEMO_ACCOUNTS.customer.id, taskId: 'task-collection-1', status: 'registered',
    itemsCollected: ['Chìa khoá vàng'], registeredAt: daysFromNow(-1), lastSyncedAt: daysFromNow(-1),
    milestoneLog: [
      { label: 'Thu thập "Chìa khoá vàng"', reward: 12000, completedAt: daysFromNow(-1) },
    ],
  },
]

function initialProgressFields(task: GameTask): Partial<UserTaskProgress> {
  if (task.requirement.type === 'level') return { currentLevel: 1 }
  if (task.requirement.type === 'playtime') return { daysCompleted: 0, todayHours: 0 }
  return { itemsCollected: [] }
}

function isTaskComplete(task: GameTask, progress: UserTaskProgress): boolean {
  if (task.requirement.type === 'level') return (progress.currentLevel ?? 0) >= (task.requirement.targetLevel ?? Infinity)
  if (task.requirement.type === 'playtime') return (progress.daysCompleted ?? 0) >= (task.requirement.totalDays ?? Infinity)
  return (progress.itemsCollected?.length ?? 0) >= (task.requirement.itemNames?.length ?? Infinity)
}

/** Tổng số mốc (đầu việc) của 1 nhiệm vụ theo dạng yêu cầu — dùng chia đều phần thưởng cho `milestoneLog`. */
function totalMilestones(task: GameTask): number {
  if (task.requirement.type === 'level') return 3
  if (task.requirement.type === 'playtime') return task.requirement.totalDays ?? 1
  return task.requirement.itemNames?.length ?? 1
}

function pushMilestone(task: GameTask, p: UserTaskProgress, label: string): void {
  const reward = Math.round(task.jcoinReward / totalMilestones(task))
  p.milestoneLog = [...(p.milestoneLog ?? []), { label, reward, completedAt: new Date().toISOString() }]
}

/** Mô phỏng game tự đồng bộ tiến độ + cấp quỹ NPH + số người tham gia mới. */
if (typeof window !== 'undefined') {
  setInterval(() => {
    // Số người tham gia mới (giống mô phỏng slot Chợ vé)
    tasks.forEach(t => {
      if (t.status === 'active' && t.slotUsed < t.slotLimit && Math.random() < 0.4) {
        t.slotUsed = Math.min(t.slotLimit, t.slotUsed + 1)
      }
    })

    // Cấp quỹ NPH — ngẫu nhiên chuyển pending -> funded theo thời gian
    tasks.forEach(t => {
      if (t.publisherFundStatus === 'pending' && Math.random() < 0.05) t.publisherFundStatus = 'funded'
    })

    // Tiến độ người dùng đã đăng ký
    userProgress.forEach(p => {
      if (p.status === 'rewarded') return
      const task = tasks.find(t => t.id === p.taskId)
      if (!task) return

      if (task.requirement.type === 'level' && Math.random() < 0.5) {
        const targetLevel = task.requirement.targetLevel ?? 0
        const oldLevel = p.currentLevel ?? 1
        const newLevel = Math.min(targetLevel, oldLevel + Math.ceil(Math.random() * 2))
        p.currentLevel = newLevel
        const checkpoints = [Math.round(targetLevel / 3), Math.round((targetLevel * 2) / 3), targetLevel]
        checkpoints.forEach((cp, idx) => {
          if (oldLevel < cp && newLevel >= cp) pushMilestone(task, p, `Đạt cấp độ ${cp} (mốc ${idx + 1}/3)`)
        })
      } else if (task.requirement.type === 'playtime') {
        p.todayHours = Math.min(task.requirement.hoursPerDay ?? 0, (p.todayHours ?? 0) + Math.random() * 0.4)
        if ((p.todayHours ?? 0) >= (task.requirement.hoursPerDay ?? 0) && (p.daysCompleted ?? 0) < (task.requirement.totalDays ?? 0)) {
          p.daysCompleted = (p.daysCompleted ?? 0) + 1
          p.todayHours = 0
          pushMilestone(task, p, `Hoàn thành ngày ${p.daysCompleted}/${task.requirement.totalDays}`)
        }
      } else if (task.requirement.type === 'collection' && Math.random() < 0.35) {
        const remaining = (task.requirement.itemNames ?? []).filter(n => !(p.itemsCollected ?? []).includes(n))
        if (remaining.length > 0) {
          p.itemsCollected = [...(p.itemsCollected ?? []), remaining[0]]
          pushMilestone(task, p, `Thu thập "${remaining[0]}"`)
        }
      }

      p.lastSyncedAt = new Date().toISOString()
      p.status = p.status === 'registered' ? 'in_progress' : p.status

      if (isTaskComplete(task, p)) {
        p.status = 'rewarded'
        p.rewardedAt = new Date().toISOString()
        earn(p.userId, task.jcoinReward, `Hoàn thành nhiệm vụ "${task.gameName}"`)
      }
    })
  }, 3500)
}

export function listTasks(params?: TaskListParams): GameTask[] {
  const keyword = params?.keyword?.trim().toLowerCase()
  return tasks.filter(t => {
    if (t.status !== 'active') return false
    if (params?.requirementType && params.requirementType !== 'all' && t.requirement.type !== params.requirementType) return false
    if (keyword && !t.gameName.toLowerCase().includes(keyword) && !t.publisherName.toLowerCase().includes(keyword)) return false
    return true
  })
}

export function getTaskById(taskId: string): GameTask | undefined {
  return tasks.find(t => t.id === taskId)
}

export function getUserProgress(userId: string, taskId: string): UserTaskProgress | undefined {
  return userProgress.find(p => p.userId === userId && p.taskId === taskId)
}

export function listUserProgress(userId: string): { task: GameTask; progress: UserTaskProgress }[] {
  return userProgress
    .filter(p => p.userId === userId)
    .map(p => ({ task: tasks.find(t => t.id === p.taskId)!, progress: p }))
    .filter(x => Boolean(x.task))
    .sort((a, b) => b.progress.registeredAt.localeCompare(a.progress.registeredAt))
}

export function registerForTask(userId: string, taskId: string): UserTaskProgress {
  const task = getTaskById(taskId)
  if (!task) throw new Error('Không tìm thấy nhiệm vụ')
  if (task.slotUsed >= task.slotLimit) throw new Error('Nhiệm vụ đã đủ số lượng người tham gia')
  if (getUserProgress(userId, taskId)) throw new Error('Bạn đã đăng ký nhiệm vụ này rồi')

  task.slotUsed += 1
  const now2 = new Date().toISOString()
  const progress: UserTaskProgress = {
    id: genId('UTP'), userId, taskId, status: 'registered', lastSyncedAt: now2, registeredAt: now2,
    ...initialProgressFields(task),
  }
  userProgress.push(progress)
  return progress
}
