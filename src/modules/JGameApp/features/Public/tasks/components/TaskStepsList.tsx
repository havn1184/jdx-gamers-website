/**
 * TaskStepsList — Stepper dọc "Các bước thực hiện" từ `task.steps` (BE), tô trạng thái done/current/upcoming
 * theo tiến độ (quy tắc `getStepState`, giống App). `steps` rỗng (BE cũ) -> 4 bước chung fallback duy nhất được phép.
 */
import { Check, ListChecks } from 'lucide-react'
import { cn } from '../../../../shared/components/ui/utils'
import type { GameTask, TaskStep, UserTaskProgress } from '../types/task.types'
import { getStepState } from '../utils/formatRequirement'

const FALLBACK_STEPS: TaskStep[] = [
  { order: 1, title: 'Đăng ký nhiệm vụ', detail: 'Bấm "Đăng ký nhiệm vụ" để nhận mã đăng ký JGM-XXXX-XXXX' },
  { order: 2, title: 'Tải và mở game', detail: 'Cài game của nhà phát hành trên thiết bị của bạn' },
  { order: 3, title: 'Nhập mã liên kết JGame', detail: 'Vào mục "Liên kết JGame" trong game và dán mã đăng ký' },
  { order: 4, title: 'Hoàn thành yêu cầu và nhận thưởng', detail: 'Game tự đồng bộ tiến độ về JGame; đủ mục tiêu JCoin tự cộng vào ví' },
]

interface TaskStepsListProps {
  task: GameTask
  progress: UserTaskProgress | null
}

export function TaskStepsList({ task, progress }: TaskStepsListProps) {
  const steps = task.steps.length > 0 ? task.steps : FALLBACK_STEPS

  return (
    <section className='rounded-xl border border-white/10 bg-white/5 p-4' data-qa='card_cac_buoc'>
      <h2 className='flex items-center gap-1.5 text-sm font-semibold text-white'><ListChecks className='h-4 w-4 text-purple-300' /> Các bước thực hiện</h2>
      <ol className='mt-3'>
        {steps.map((step, idx) => {
          const state = getStepState(idx, steps.length, progress)
          const isLast = idx === steps.length - 1
          return (
            <li key={step.order} className='flex gap-3'>
              <div className='flex flex-col items-center'>
                <span
                  className={cn(
                    'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                    state === 'done' && 'border-emerald-400 bg-emerald-500/20 text-emerald-300',
                    state === 'current' && 'border-purple-400 border-2 bg-purple-500/20 text-purple-200',
                    state === 'upcoming' && 'border-white/20 bg-white/5 text-white/40'
                  )}
                >
                  {state === 'done' ? <Check className='h-4 w-4' /> : idx + 1}
                </span>
                {!isLast && <span className='my-1 w-px flex-1 bg-white/10' />}
              </div>
              <div className={cn('min-w-0 flex-1', !isLast && 'pb-4')}>
                <div className='flex items-center gap-2'>
                  <p className={cn('text-sm font-semibold', state === 'upcoming' ? 'text-white/60' : 'text-white')}>{step.title}</p>
                  {state === 'current' && <span className='rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-purple-200'>Bước hiện tại</span>}
                </div>
                <p className='mt-0.5 text-sm text-white/60'>{step.detail}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
