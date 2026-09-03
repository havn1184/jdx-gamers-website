/**
 * NphTasksPage — CRUD nhiệm vụ của chính NPH (20260903-nc_quan-tri-nha-phat-hanh-game.md mục 2.4).
 * Trạng thái quỹ ("Đủ quỹ"/"Thiếu quỹ") đọc từ `publisherFundStatus` BE tính động — NPH không tự set.
 */
import { useState } from 'react'
import { Plus, Pencil, Loader2, X, AlertCircle, Inbox, Power } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { Input } from '../../../../../shared/components/ui/input'
import { Badge } from '../../../../../shared/components/ui/badge'
import { cn } from '../../../../../shared/components/ui/utils'
import { NphLayout } from '../../components'
import { NPH_TASK_REQUIREMENT_TYPE_LABELS } from '../../types'
import type { NphTask, NphTaskRequirementType } from '../../types'
import { useNphTasksFetchData } from '../hooks/useNphTasks.page.fetchData'
import { useNphTaskForm } from '../hooks/useNphTask.dlg.form'

export const PAGE_ID = 'jgame-nph-tasks'
export const PAGE_FEATURES = [
  { label: 'Thêm nhiệm vụ', code: 'btn-them-nhiem-vu' },
  { label: 'Sửa (dòng)', code: 'row-edit' },
  { label: 'Bật/Tắt (dòng)', code: 'row-toggle' },
]

const REQUIREMENT_TYPES: NphTaskRequirementType[] = ['level', 'playtime', 'collection']

export function NphTasksPage() {
  const { tasks, loading, errorMessage, refetch, toggleStatus } = useNphTasksFetchData()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<NphTask | null>(null)
  const { formData, setFormData, setRequirementType, isValid, submitting, errorMessage: formError, handleSubmit } =
    useNphTaskForm({ initialData: editing, onSuccess: () => { setFormOpen(false); setEditing(null); void refetch() } })

  return (
    <NphLayout>
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-xl font-bold text-white'>Nhiệm vụ của tôi</h1>
          <p className='text-sm text-white/60'>Cấu hình nhiệm vụ trải nghiệm/test game, thưởng JCoin cho người chơi</p>
        </div>
        <Button className='jgame-btn-primary text-white' onClick={() => { setEditing(null); setFormOpen(true) }} data-qa='btn_them_nhiem_vu'>
          <Plus className='h-4 w-4 mr-2' /> Thêm nhiệm vụ
        </Button>
      </div>

      {errorMessage && (
        <div className='mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
          <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
        </div>
      )}

      {formOpen && (
        <div className='mb-6 rounded-xl border border-white/10 bg-white/5 p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-sm font-semibold text-white'>{editing ? 'Sửa nhiệm vụ' : 'Thêm nhiệm vụ'}</h2>
            <button type='button' className='text-white/50 hover:text-white' onClick={() => { setFormOpen(false); setEditing(null) }}><X className='h-4 w-4' /></button>
          </div>

          <div className='space-y-3'>
            <Input placeholder='Tên nhiệm vụ' value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} data-qa='i_ten_nhiem_vu' />
            <textarea
              placeholder='Mô tả nhiệm vụ'
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              className='min-h-[80px] w-full rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none'
              data-qa='i_mo_ta'
            />
            <div className='flex flex-wrap gap-3'>
              <select
                value={formData.requirementType}
                onChange={e => setRequirementType(e.target.value as NphTaskRequirementType)}
                aria-label='Loại yêu cầu'
                className='min-w-[180px] flex-1 rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
                data-qa='sel_loai_yeu_cau'
              >
                {REQUIREMENT_TYPES.map(t => <option key={t} value={t}>{NPH_TASK_REQUIREMENT_TYPE_LABELS[t]}</option>)}
              </select>
              <Input
                placeholder='Giá trị mục tiêu'
                inputMode='numeric'
                value={String(formData.requirementTargetValue)}
                onChange={e => setFormData(p => ({ ...p, requirementTargetValue: Number(e.target.value.replace(/\D/g, '')) || 0 }))}
                className='min-w-[160px] flex-1'
                data-qa='i_gia_tri_muc_tieu'
              />
              {formData.requirementType === 'playtime' && (
                <Input
                  placeholder='Số giờ/ngày'
                  inputMode='numeric'
                  value={String(formData.requirementHoursPerDay ?? '')}
                  onChange={e => setFormData(p => ({ ...p, requirementHoursPerDay: Number(e.target.value.replace(/\D/g, '')) || null }))}
                  className='min-w-[140px] flex-1'
                  data-qa='i_gio_moi_ngay'
                />
              )}
            </div>
            <div className='flex flex-wrap gap-3'>
              <Input
                placeholder='Thưởng JCoin'
                inputMode='numeric'
                value={String(formData.rewardJcoin)}
                onChange={e => setFormData(p => ({ ...p, rewardJcoin: Number(e.target.value.replace(/\D/g, '')) || 0 }))}
                className='min-w-[160px] flex-1'
                data-qa='i_thuong_jcoin'
              />
              <Input
                placeholder='Số suất tối đa (0 = không giới hạn)'
                inputMode='numeric'
                value={String(formData.slotLimit)}
                onChange={e => setFormData(p => ({ ...p, slotLimit: Number(e.target.value.replace(/\D/g, '')) || 0 }))}
                className='min-w-[220px] flex-1'
                data-qa='i_so_suat'
              />
            </div>
          </div>

          {formError && (
            <div className='mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
              <AlertCircle className='h-4 w-4 flex-shrink-0' /> {formError}
            </div>
          )}

          <div className='mt-4 flex gap-2'>
            <Button className='jgame-btn-primary text-white' disabled={!isValid || submitting} onClick={handleSubmit} data-qa='btn_luu'>
              {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Lưu
            </Button>
            <Button variant='ghost' className='text-white/70 hover:bg-white/10' onClick={() => { setFormOpen(false); setEditing(null) }} data-qa='btn_huy'>Hủy</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className='py-12 text-center text-white/50'>Đang tải...</div>
      ) : tasks.length === 0 ? (
        <div className='flex flex-col items-center gap-2 py-16 text-white/60'><Inbox className='h-8 w-8' /> Chưa có nhiệm vụ nào</div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-white/10'>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Tên nhiệm vụ</th>
                <th className='px-3 py-2 text-left font-medium'>Yêu cầu</th>
                <th className='px-3 py-2 text-right font-medium'>Thưởng</th>
                <th className='px-3 py-2 text-center font-medium'>Quỹ</th>
                <th className='px-3 py-2 text-center font-medium'>Trạng thái</th>
                <th className='w-[100px] px-3 py-2 text-center font-medium'>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} className='border-t border-white/10 text-white/80'>
                  <td className='px-3 py-2 font-medium text-white'>{task.title}</td>
                  <td className='px-3 py-2'>{task.requirementSummary}</td>
                  <td className='px-3 py-2 text-right font-medium text-white'>{task.rewardJcoin.toLocaleString('vi-VN')}</td>
                  <td className='px-3 py-2 text-center'>
                    <Badge className={cn('border-none', task.publisherFundStatus ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300')}>
                      {task.publisherFundStatus ? 'Đủ quỹ' : 'Thiếu quỹ'}
                    </Badge>
                  </td>
                  <td className='px-3 py-2 text-center'>
                    <Badge className={cn('border-none', task.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300')}>
                      {task.status === 'active' ? 'Đang bật' : 'Đã tắt'}
                    </Badge>
                  </td>
                  <td className='px-3 py-2'>
                    <div className='flex items-center justify-center gap-1'>
                      <Button variant='ghost' size='sm' className='icon-warning border rounded-lg bg-white' title='Sửa' data-qa={`btn_sua_${task.id}`} onClick={() => { setEditing(task); setFormOpen(true) }}><Pencil className='h-4 w-4' /></Button>
                      <Button variant='ghost' size='sm' className='border rounded-lg bg-white' title={task.status === 'active' ? 'Tắt' : 'Bật'} data-qa={`btn_toggle_${task.id}`} onClick={() => void toggleStatus(task.id)}><Power className='h-4 w-4' /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </NphLayout>
  )
}
