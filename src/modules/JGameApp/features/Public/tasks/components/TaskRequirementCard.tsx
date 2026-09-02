/**
 * TaskRequirementCard — Khối "Bạn cần đạt gì?": câu yêu cầu từ BE + chip mục tiêu / giờ mỗi ngày / hạn
 * + danh sách vật phẩm (collection). Thuần hiển thị, cùng nội dung với App `TaskRequirementCard`.
 */
import { Flag, Target, Timer, CalendarDays, Gem } from 'lucide-react'
import { formatDate } from '../../../../shared/utils/FormatUtils'
import type { GameTask } from '../types/task.types'
import { formatRequirementSummary, formatRequirementUnit } from '../utils/formatRequirement'

interface TaskRequirementCardProps {
  task: GameTask
}

export function TaskRequirementCard({ task }: TaskRequirementCardProps) {
  const unit = formatRequirementUnit(task.requirementType)
  const chips: { icon: typeof Target; label: string }[] = [
    { icon: Target, label: `Mục tiêu ${task.requirementTargetValue} ${unit}` },
  ]
  if (task.requirementHoursPerDay) chips.push({ icon: Timer, label: `${task.requirementHoursPerDay} giờ/ngày` })
  if (task.endAt) chips.push({ icon: CalendarDays, label: `Hạn ${formatDate(task.endAt)}` })

  return (
    <section className='rounded-xl border border-white/10 bg-white/5 p-4' data-qa='card_yeu_cau'>
      <h2 className='flex items-center gap-1.5 text-sm font-semibold text-white'><Flag className='h-4 w-4 text-purple-300' /> Bạn cần đạt gì?</h2>
      <p className='mt-2 text-sm font-medium text-white'>{formatRequirementSummary(task)}</p>
      <div className='mt-3 flex flex-wrap gap-2'>
        {chips.map(chip => (
          <span key={chip.label} className='flex items-center gap-1 rounded-md bg-purple-500/15 px-2 py-1 text-xs font-semibold text-purple-200'>
            <chip.icon className='h-3.5 w-3.5' /> {chip.label}
          </span>
        ))}
      </div>
      {task.requirementItemNames.length > 0 && (
        <div className='mt-3'>
          <p className='text-xs font-semibold uppercase tracking-wide text-white/50'>Vật phẩm cần sưu tập</p>
          <ul className='mt-1.5 space-y-1'>
            {task.requirementItemNames.map(item => (
              <li key={item} className='flex items-center gap-2 text-sm text-white/80'><Gem className='h-3.5 w-3.5 text-amber-300' /> {item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
