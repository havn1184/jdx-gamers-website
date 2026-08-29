/**
 * TaskDetailPage — Chi tiết nhiệm vụ, đăng ký & theo dõi tiến độ đồng bộ từ game (SC-TASK-02).
 */
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Loader2, AlertCircle, Coins, Users, Clock3, CheckCircle2, PartyPopper, RefreshCw, ListChecks,
} from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { Badge } from '../../../../shared/components/ui/badge'
import { TaskArt } from '../components/TaskArt'
import { formatNumber, formatDate, formatDateTime } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { useAuth } from '../../../../contexts/AuthContext'
import { useTaskDetailFetchData } from '../hooks/useTaskDetail.page.fetchData'
import { formatRequirementSummary, formatProgressSummary, getProgressPercent } from '../utils/formatRequirement'

export const PAGE_ID = 'jgame-task-detail'
export const PAGE_FEATURES = [{ label: 'Đăng ký nhiệm vụ', code: 'btn-dang-ky-nhiem-vu' }]

const STATUS_META: Record<string, { label: string; className: string }> = {
  registered: { label: 'Đã đăng ký', className: 'bg-blue-500/20 text-blue-300' },
  in_progress: { label: 'Đang thực hiện', className: 'bg-amber-500/20 text-amber-300' },
  rewarded: { label: 'Đã nhận thưởng', className: 'bg-emerald-500/20 text-emerald-300' },
}

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const { isAuthenticated } = useAuth()
  const { task, progress, loading, notFound, registering, errorMessage, handleRegister } = useTaskDetailFetchData(taskId)
  const [activeImage, setActiveImage] = useState(0)

  if (loading) return <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
  if (notFound || !task) return <div className='py-24 text-center text-white/60'>Không tìm thấy nhiệm vụ</div>

  const remaining = task.slotLimit - task.slotUsed
  const percentFull = Math.round((task.slotUsed / task.slotLimit) * 100)
  const canRegister = isAuthenticated && !progress && remaining > 0

  return (
    <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6'>
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <div>
          <TaskArt art={task.art} imageUrl={task.galleryImages[activeImage]} label={task.gameName} className='aspect-square w-full rounded-2xl' />
          {task.galleryImages.length > 1 && (
            <div className='mt-3 grid grid-cols-3 gap-2'>
              {task.galleryImages.map((img, idx) => (
                <button
                  key={img}
                  type='button'
                  onClick={() => setActiveImage(idx)}
                  className={cn('overflow-hidden rounded-lg border-2', activeImage === idx ? 'border-purple-400' : 'border-transparent opacity-70 hover:opacity-100')}
                  data-qa={`btn_gallery_${idx}`}
                >
                  <img src={img} alt={`${task.gameName} ${idx + 1}`} loading='lazy' className='aspect-square w-full object-cover' />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className='mb-2 flex items-center gap-2'>
            <p className='text-xs font-semibold uppercase tracking-wide text-white/50'>{task.publisherName}</p>
            {task.publisherFundStatus === 'funded' ? (
              <Badge className='flex items-center gap-1 border-none bg-emerald-500/20 text-[10px] text-emerald-300'><CheckCircle2 className='h-3 w-3' /> NPH đã cấp quỹ nhiệm vụ này</Badge>
            ) : (
              <Badge className='flex items-center gap-1 border-none bg-amber-500/20 text-[10px] text-amber-300'><Clock3 className='h-3 w-3' /> NPH chưa cấp quỹ</Badge>
            )}
          </div>
          <h1 className='text-2xl font-bold text-white'>{task.gameName}</h1>
          <p className='mt-2 text-sm text-white/60'>{task.description}</p>

          <div className='mt-5 rounded-xl border border-white/10 bg-white/5 p-4'>
            <div className='flex items-center justify-between'>
              <span className='flex items-center gap-1.5 text-sm text-white/70'><ListChecks className='h-4 w-4' /> Yêu cầu nhiệm vụ</span>
              <span className='flex items-center gap-1 font-bold text-amber-300'><Coins className='h-4 w-4' /> {formatNumber(task.jcoinReward)} JCoin</span>
            </div>
            <p className='mt-2 text-sm font-medium text-white'>{formatRequirementSummary(task)}</p>
            {task.requirement.type === 'collection' && (
              <div className='mt-2 flex flex-wrap gap-1.5'>
                {task.requirement.itemNames?.map(name => {
                  const got = progress?.itemsCollected?.includes(name)
                  return (
                    <span key={name} className={cn('rounded-full border px-2 py-0.5 text-[11px]', got ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300' : 'border-white/15 text-white/50')}>
                      {got && <CheckCircle2 className='mr-1 inline h-3 w-3' />}{name}
                    </span>
                  )
                })}
              </div>
            )}

            <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-white/10'>
              <div className='jgame-gradient-brand h-full' style={{ width: `${percentFull}%` }} />
            </div>
            <div className='mt-1.5 flex items-center justify-between text-xs text-white/50'>
              <span className='flex items-center gap-1'><Users className='h-3.5 w-3.5' /> {remaining > 0 ? `Còn ${formatNumber(remaining)}/${formatNumber(task.slotLimit)} suất` : 'Đã đủ số lượng đăng ký'}</span>
              <span>Hạn đăng ký: {formatDate(task.deadline)}</span>
            </div>
          </div>

          {progress ? (
            <div className='mt-5 rounded-xl border border-white/10 bg-white/5 p-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-semibold text-white'>Tiến độ của bạn</span>
                <Badge className={cn('border-none', STATUS_META[progress.status].className)}>{STATUS_META[progress.status].label}</Badge>
              </div>
              <div className='mt-3 h-2 overflow-hidden rounded-full bg-white/10'>
                <div className='jgame-gradient-brand h-full transition-all' style={{ width: `${getProgressPercent(task, progress)}%` }} />
              </div>
              <p className='mt-2 text-sm text-white/70'>{formatProgressSummary(task, progress)}</p>
              <p className='mt-2 flex items-center gap-1 text-xs text-white/40'><RefreshCw className='h-3 w-3' /> Đồng bộ lần cuối: {formatDateTime(progress.lastSyncedAt)}</p>

              {progress.status === 'rewarded' && (
                <div className='mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300'>
                  <PartyPopper className='h-4 w-4 flex-shrink-0' /> Chúc mừng! Bạn đã nhận {formatNumber(task.jcoinReward)} JCoin vào ví lúc {progress.rewardedAt && formatDateTime(progress.rewardedAt)}.
                </div>
              )}
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className='mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
                  <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
                </div>
              )}
              <Button
                className='jgame-btn-primary mt-5 w-full text-white'
                size='lg'
                disabled={!canRegister || registering}
                onClick={isAuthenticated ? handleRegister : () => { window.location.hash = '#/jgame/dang-nhap' }}
                data-qa='btn_dang_ky_nhiem_vu'
              >
                {registering && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />}
                {!isAuthenticated ? 'Đăng nhập để đăng ký' : remaining <= 0 ? 'Đã đủ số lượng' : 'Đăng ký nhiệm vụ'}
              </Button>
            </>
          )}

          <Link to='/jgame/kiem-tien' className='mt-4 inline-block jgame-gradient-text text-sm font-semibold'>← Xem các nhiệm vụ khác</Link>
        </div>
      </div>
    </div>
  )
}
