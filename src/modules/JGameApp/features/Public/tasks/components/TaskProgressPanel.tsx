/**
 * TaskProgressPanel — "Tiến độ của bạn" 3 lớp (nc_nhiem-vu-web-dong-bo.md 3.2):
 * tổng quan (badge + "3/7 ngày · 43%" + progress bar có vạch mốc), mốc (tick + thời điểm đạt),
 * nhật ký (3 event mới nhất + "Xem tất cả"). Kèm "Đồng bộ lần cuối" + nút "Đồng bộ ngay" (cooldown).
 * Thuần hiển thị — state/handler từ hook `useTaskDetailFetchData`.
 */
import { useState } from 'react'
import { CheckCircle2, Circle, Loader2, PartyPopper, RefreshCw, History, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../../../../shared/components/ui/badge'
import { Button } from '../../../../shared/components/ui/button'
import { cn } from '../../../../shared/components/ui/utils'
import { formatDateTime, formatNumber } from '../../../../shared/utils/FormatUtils'
import type { GameTask, UserTaskProgress } from '../types/task.types'
import { formatEventSource, formatRequirementUnit, getProgressPercent, getUserStatusMeta } from '../utils/formatRequirement'

interface TaskProgressPanelProps {
  task: GameTask
  progress: UserTaskProgress
  syncing: boolean
  cooldownLeft: number
  onSync: () => void
}

const VISIBLE_EVENTS = 3

export function TaskProgressPanel({ task, progress, syncing, cooldownLeft, onSync }: TaskProgressPanelProps) {
  const [showAllEvents, setShowAllEvents] = useState(false)
  const meta = getUserStatusMeta(progress.status)
  const unit = formatRequirementUnit(task.requirementType)
  const target = progress.targetValue > 0 ? progress.targetValue : task.requirementTargetValue
  const percent = getProgressPercent(progress)
  const canSync = progress.status === 'inProgress' && !syncing && cooldownLeft <= 0
  const events = showAllEvents ? progress.events : progress.events.slice(0, VISIBLE_EVENTS)

  return (
    <section className='rounded-xl border border-white/10 bg-white/5 p-4' data-qa='card_tien_do'>
      <div className='flex items-center justify-between'>
        <h2 className='text-sm font-semibold text-white'>Tiến độ của bạn</h2>
        <Badge className={cn('border-none', meta.className)}>{meta.label}</Badge>
      </div>

      <div className='mt-3 flex items-end gap-2'>
        <span className='text-2xl font-extrabold text-white'>{progress.currentValue}/{target}</span>
        <span className='pb-1 text-sm text-white/60'>{unit} · {percent}%</span>
      </div>

      {/* Progress bar có vạch mốc */}
      <div className='relative mt-2 h-2.5 overflow-hidden rounded-full bg-white/10'>
        <div className={cn('h-full transition-all', progress.isCompleted ? 'bg-emerald-400' : 'jgame-gradient-brand')} style={{ width: `${percent}%` }} />
        {target > 0 && progress.milestones.filter(m => m.value < target).map(m => (
          <span key={m.value} className='absolute inset-y-0 w-px bg-[#1a0d33]' style={{ left: `${(m.value / target) * 100}%` }} />
        ))}
      </div>

      {progress.milestones.length > 0 && (
        <ul className='mt-3 space-y-1.5'>
          {progress.milestones.map(m => (
            <li key={m.value} className='flex items-center gap-2 text-sm'>
              {m.reached ? <CheckCircle2 className='h-4 w-4 flex-shrink-0 text-emerald-300' /> : <Circle className='h-4 w-4 flex-shrink-0 text-white/30' />}
              <span className={cn('flex-1', m.reached ? 'text-white' : 'text-white/60')}>{m.label} · {m.value} {unit}</span>
              {m.reachedAt && <span className='text-xs text-white/40'>{formatDateTime(m.reachedAt)}</span>}
            </li>
          ))}
        </ul>
      )}

      {progress.isCompleted ? (
        <div className='mt-4 flex items-start gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300'>
          <PartyPopper className='mt-0.5 h-4 w-4 flex-shrink-0' />
          <div className='flex-1'>
            Chúc mừng! Bạn đã nhận {formatNumber(task.rewardJcoin)} JCoin vào ví
            {progress.rewardClaimedAt ? ` lúc ${formatDateTime(progress.rewardClaimedAt)}` : ''}.
            <Link to='/jgame/vi' className='ml-2 inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline' data-qa='lnk_xem_vi'><Wallet className='h-3.5 w-3.5' /> Xem ví</Link>
          </div>
        </div>
      ) : (
        <div className='mt-4 flex items-center justify-between gap-3'>
          <p className='flex items-center gap-1 text-xs text-white/40'>
            <RefreshCw className='h-3 w-3' />
            {progress.lastSyncedAt ? `Đồng bộ lần cuối: ${formatDateTime(progress.lastSyncedAt)}` : 'Chưa đồng bộ lần nào'}
          </p>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='border-white/20 bg-transparent text-white hover:bg-white/10'
            disabled={!canSync}
            onClick={onSync}
            data-qa='btn_dong_bo_ngay'
          >
            {syncing ? <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' /> : <RefreshCw className='mr-1.5 h-3.5 w-3.5' />}
            {cooldownLeft > 0 ? `Đồng bộ (${cooldownLeft}s)` : 'Đồng bộ ngay'}
          </Button>
        </div>
      )}

      {progress.events.length > 0 && (
        <div className='mt-4 border-t border-white/10 pt-3'>
          <div className='flex items-center justify-between'>
            <h3 className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/50'><History className='h-3.5 w-3.5' /> Nhật ký tiến độ</h3>
            {progress.events.length > VISIBLE_EVENTS && (
              <button type='button' className='text-xs font-semibold text-purple-300 hover:underline' onClick={() => setShowAllEvents(v => !v)} data-qa='btn_xem_tat_ca_nhat_ky'>
                {showAllEvents ? 'Thu gọn' : `Xem tất cả (${progress.events.length})`}
              </button>
            )}
          </div>
          <ul className='mt-2 space-y-2'>
            {events.map((e, idx) => (
              <li key={`${e.at}-${idx}`} className='text-sm'>
                <p className='text-white/90'>{e.note}</p>
                <p className='text-xs text-white/40'>
                  {formatEventSource(e.source)} · {formatDateTime(e.at)}{e.delta > 0 ? ` · +${e.delta} ${unit}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
