/**
 * MyTasksPage — Nhiệm vụ đã đăng ký + tiến độ đồng bộ từ game (SC-TASK-03).
 * 1 request `GET /api/tasks/my`; thẻ tổng quan 3 số + tab lọc trạng thái + card có câu yêu cầu, percent từ BE.
 */
import { Link } from 'react-router-dom'
import { Loader2, Inbox, ChevronRight, RefreshCw, Coins, AlertCircle, Hourglass, CheckCircle2, Flag } from 'lucide-react'
import { Badge } from '../../../../../shared/components/ui/badge'
import { formatDateTime, formatNumber } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { useMyTasksFetchData, type MyTaskFilter } from '../hooks/useMyTasks.page.fetchData'
import { formatProgressSummary, formatRequirementSummary, getProgressPercent, getUserStatusMeta } from '../../../../Public/tasks/utils/formatRequirement'
import { TaskArt } from '../../../../Public/tasks/components/TaskArt'
import { CustomerLayout } from '../../account/components/CustomerLayout'

export const PAGE_ID = 'jgame-my-tasks'
export const PAGE_FEATURES = [
  { label: 'Xem chi tiết nhiệm vụ', code: 'row-view' },
  { label: 'Lọc theo trạng thái', code: 'tab-loc-trang-thai' },
]

export function MyTasksPage() {
  const { items, visibleItems, summary, loading, errorMessage, filter, setFilter, refetch } = useMyTasksFetchData()

  const tabs: { key: MyTaskFilter; label: string; count: number; icon?: typeof Hourglass }[] = [
    { key: 'all', label: 'Tất cả', count: items.length },
    { key: 'inProgress', label: 'Đang làm', count: summary.inProgressCount, icon: Hourglass },
    { key: 'completed', label: 'Hoàn thành', count: summary.completedCount, icon: CheckCircle2 },
  ]

  return (
    <CustomerLayout>
      <h1 className='mb-6 text-xl font-bold text-white'>Nhiệm vụ của tôi</h1>

      {loading && <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>}

      {!loading && errorMessage && (
        <div className='flex flex-col items-center gap-3 py-16 text-white/60'>
          <AlertCircle className='h-8 w-8 text-red-300' /> {errorMessage}
          <button type='button' onClick={() => void refetch()} className='rounded-full border border-white/20 px-4 py-1.5 text-sm text-white/80 hover:bg-white/10' data-qa='btn_thu_lai'>Thử lại</button>
        </div>
      )}

      {!loading && !errorMessage && items.length === 0 && (
        <div className='flex flex-col items-center gap-2 py-16 text-white/60'>
          <Inbox className='h-8 w-8' /> Bạn chưa đăng ký nhiệm vụ nào
          <p className='text-sm text-white/40'>Chọn 1 nhiệm vụ ở mục Kiếm tiền, đăng ký và nhập mã vào game để bắt đầu</p>
          <Link to='/jgame/kiem-tien' className='mt-2 jgame-gradient-text text-sm font-semibold'>Khám phá nhiệm vụ ngay</Link>
        </div>
      )}

      {!loading && !errorMessage && items.length > 0 && (
        <>
          {/* Thẻ tổng quan */}
          <div className='jgame-gradient-brand mb-5 grid grid-cols-3 gap-4 rounded-2xl p-5 text-white' data-qa='card_tong_quan'>
            <div>
              <p className='text-2xl font-extrabold'>{summary.inProgressCount}</p>
              <p className='text-xs text-white/80'>Đang làm</p>
            </div>
            <div>
              <p className='text-2xl font-extrabold'>{summary.completedCount}</p>
              <p className='text-xs text-white/80'>Hoàn thành</p>
            </div>
            <div>
              <p className='flex items-center gap-1 text-2xl font-extrabold'><Coins className='h-5 w-5' /> {formatNumber(summary.earnedJcoin)}</p>
              <p className='text-xs text-white/80'>JCoin đã nhận</p>
            </div>
          </div>

          <div className='mb-4 flex flex-wrap gap-2' data-qa='tab_loc_trang_thai'>
            {tabs.map(tab => (
              <button
                key={tab.key}
                type='button'
                onClick={() => setFilter(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  filter === tab.key ? 'jgame-gradient-brand border-transparent text-white' : 'border-white/20 text-white/70 hover:bg-white/10'
                )}
              >
                {tab.icon && <tab.icon className='h-3.5 w-3.5' />} {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {visibleItems.length === 0 && (
            <div className='flex flex-col items-center gap-2 py-12 text-white/60'><Inbox className='h-8 w-8' /> Không có nhiệm vụ trong nhóm này</div>
          )}

          <div className='space-y-3'>
            {visibleItems.map(({ task, progress }) => {
              const meta = getUserStatusMeta(progress.status)
              const percent = getProgressPercent(progress)
              return (
                <Link key={task.id} to={`/jgame/kiem-tien/${task.id}`} className='flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10' data-qa={`row_view_${task.id}`}>
                  <TaskArt art={task.art} imageUrl={task.galleryImages?.[0]} label={task.title} className='h-16 w-16 flex-shrink-0 rounded-xl' />
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <span className='truncate font-semibold text-white'>{task.title}</span>
                      <Badge className={cn('flex-shrink-0 border-none', meta.className)}>{meta.label}</Badge>
                    </div>
                    <p className='mt-1 flex items-start gap-1.5 text-xs text-white/50'><Flag className='mt-0.5 h-3 w-3 flex-shrink-0 text-purple-300' /> <span className='line-clamp-1'>{formatRequirementSummary(task)}</span></p>
                    <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-white/10'>
                      <div className={cn('h-full', progress.isCompleted ? 'bg-emerald-400' : 'jgame-gradient-brand')} style={{ width: `${percent}%` }} />
                    </div>
                    <div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs'>
                      <span className='font-semibold text-white/80'>{formatProgressSummary(task, progress)}</span>
                      {progress.lastSyncedAt && (
                        <span className='flex items-center gap-1 text-white/40'><RefreshCw className='h-3 w-3' /> Đồng bộ: {formatDateTime(progress.lastSyncedAt)}</span>
                      )}
                    </div>
                  </div>
                  <div className='flex flex-shrink-0 items-center gap-2 text-right'>
                    <span className='flex items-center gap-1 font-semibold text-amber-300'><Coins className='h-4 w-4' /> {formatNumber(task.rewardJcoin)}</span>
                    <ChevronRight className='h-4 w-4 text-white/40' />
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </CustomerLayout>
  )
}
