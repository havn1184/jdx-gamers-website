/**
 * MyTasksPage — Nhiệm vụ đã đăng ký + tiến độ đồng bộ từ game (SC-TASK-03).
 */
import { Link } from 'react-router-dom'
import { Loader2, Inbox, ChevronRight, RefreshCw, Coins } from 'lucide-react'
import { Badge } from '../../../../../shared/components/ui/badge'
import { TaskArt } from '../../../../Public/tasks/components/TaskArt'
import { formatDateTime, formatNumber } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { useMyTasksFetchData } from '../hooks/useMyTasks.page.fetchData'
import { formatProgressSummary, getProgressPercent } from '../../../../Public/tasks/utils/formatRequirement'
import { CustomerLayout } from '../../account/components/CustomerLayout'

export const PAGE_ID = 'jgame-my-tasks'
export const PAGE_FEATURES = [{ label: 'Xem chi tiết nhiệm vụ', code: 'row-view' }]

const STATUS_META: Record<string, { label: string; className: string }> = {
  registered: { label: 'Đã đăng ký', className: 'bg-blue-500/20 text-blue-300' },
  in_progress: { label: 'Đang thực hiện', className: 'bg-amber-500/20 text-amber-300' },
  rewarded: { label: 'Đã nhận thưởng', className: 'bg-emerald-500/20 text-emerald-300' },
}

export function MyTasksPage() {
  const { items, loading } = useMyTasksFetchData()

  return (
    <CustomerLayout>
      <h1 className='mb-6 text-xl font-bold text-white'>Nhiệm vụ của tôi</h1>

      {loading && <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>}

      {!loading && items.length === 0 && (
        <div className='flex flex-col items-center gap-2 py-16 text-white/60'>
          <Inbox className='h-8 w-8' /> Bạn chưa đăng ký nhiệm vụ nào
          <Link to='/jgame/kiem-tien' className='mt-2 jgame-gradient-text text-sm font-semibold'>Khám phá nhiệm vụ ngay</Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className='space-y-3'>
          {items.map(({ task, progress }) => {
            const meta = STATUS_META[progress.status]
            return (
              <Link key={progress.id} to={`/jgame/kiem-tien/${task.id}`} className='flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10' data-qa={`row_view_${task.id}`}>
                <TaskArt art={task.art} imageUrl={task.galleryImages[0]} label={task.gameName} className='h-16 w-16 flex-shrink-0 rounded-xl' />
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='truncate font-semibold text-white'>{task.gameName}</span>
                    <Badge className={cn('flex-shrink-0 border-none', meta.className)}>{meta.label}</Badge>
                  </div>
                  <p className='mt-1 text-sm text-white/60'>{formatProgressSummary(task, progress)}</p>
                  <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-white/10'>
                    <div className='jgame-gradient-brand h-full' style={{ width: `${getProgressPercent(task, progress)}%` }} />
                  </div>
                  <p className='mt-1.5 flex items-center gap-1 text-xs text-white/40'><RefreshCw className='h-3 w-3' /> Đồng bộ: {formatDateTime(progress.lastSyncedAt)}</p>
                </div>
                <div className='flex flex-shrink-0 items-center gap-2 text-right'>
                  <span className='flex items-center gap-1 font-semibold text-amber-300'><Coins className='h-4 w-4' /> {formatNumber(task.jcoinReward)}</span>
                  <ChevronRight className='h-4 w-4 text-white/40' />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </CustomerLayout>
  )
}
