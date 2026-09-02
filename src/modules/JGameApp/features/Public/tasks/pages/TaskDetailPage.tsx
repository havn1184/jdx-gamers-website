/**
 * TaskDetailPage — Chi tiết nhiệm vụ, đăng ký & theo dõi tiến độ đồng bộ từ game (SC-TASK-02).
 * Thứ tự khối theo câu hỏi của người dùng, đồng bộ App (nc_nhiem-vu-web-dong-bo.md 3.2):
 * là gì -> cần đạt gì -> các bước -> tiến độ -> mã đăng ký -> CTA.
 */
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Loader2, AlertCircle, Coins, Users, Clock3, CheckCircle2, KeyRound, Copy, Info, CalendarDays, Smartphone, Apple, Lock,
} from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { Badge } from '../../../../shared/components/ui/badge'
import { formatNumber, formatDate } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { useAuth } from '../../../../contexts/AuthContext'
import { useTaskDetailFetchData } from '../hooks/useTaskDetail.page.fetchData'
import { canRegisterTask, isTaskExpired } from '../utils/formatRequirement'
import { TaskArt } from '../components/TaskArt'
import { TaskRequirementCard } from '../components/TaskRequirementCard'
import { TaskStepsList } from '../components/TaskStepsList'
import { TaskProgressPanel } from '../components/TaskProgressPanel'

export const PAGE_ID = 'jgame-task-detail'
export const PAGE_FEATURES = [
  { label: 'Đăng ký nhiệm vụ', code: 'btn-dang-ky-nhiem-vu' },
  { label: 'Đồng bộ tiến độ', code: 'btn-dong-bo-ngay' },
]

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const { isAuthenticated } = useAuth()
  const {
    task, progress, loading, notFound, registering, syncing, cooldownLeft, errorMessage,
    handleRegister, handleSync, copyRegistrationCode,
  } = useTaskDetailFetchData(taskId)
  const galleryImages = task?.galleryImages ?? []
  const [activeImage, setActiveImage] = useState(0)

  if (loading) return <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
  if (notFound || !task) return <div className='py-24 text-center text-white/60'>Không tìm thấy nhiệm vụ</div>

  const percentFull = task.slotLimit > 0 ? Math.round((task.slotUsed / task.slotLimit) * 100) : 0
  const lowSlot = task.slotsLeft > 0 && task.slotsLeft <= Math.max(5, Math.round(task.slotLimit * 0.05))
  const expired = isTaskExpired(task)
  const isRegistered = progress?.isRegistered ?? false
  const registrationCode = progress?.registrationCode ?? null

  const statusChip = task.status === 'closed'
    ? { label: 'Đã đóng', className: 'bg-white/10 text-white/60', icon: Lock }
    : expired
      ? { label: `Hết hạn ${formatDate(task.endAt)}`, className: 'bg-white/10 text-white/60', icon: CalendarDays }
      : task.slotsLeft <= 0
        ? { label: 'Hết suất', className: 'bg-red-500/20 text-red-300', icon: Users }
        : { label: 'Đang mở', className: 'bg-emerald-500/20 text-emerald-300', icon: CheckCircle2 }

  const ctaLabel = !isAuthenticated
    ? 'Đăng nhập để đăng ký'
    : task.status === 'closed'
      ? 'Nhiệm vụ đã đóng'
      : expired
        ? 'Đã hết hạn'
        : task.slotsLeft <= 0
          ? 'Đã đủ số lượng'
          : 'Đăng ký nhiệm vụ'
  const ctaDisabled = isAuthenticated && (!canRegisterTask(task) || registering)

  return (
    <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6'>
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <div>
          <TaskArt art={task.art} imageUrl={galleryImages[activeImage]} label={task.title} className='aspect-square w-full rounded-2xl' />
          {galleryImages.length > 1 && (
            <div className='mt-3 grid grid-cols-3 gap-2'>
              {galleryImages.map((img, idx) => (
                <button
                  key={img}
                  type='button'
                  onClick={() => setActiveImage(idx)}
                  className={cn('overflow-hidden rounded-lg border-2', activeImage === idx ? 'border-purple-400' : 'border-transparent opacity-70 hover:opacity-100')}
                  data-qa={`btn_gallery_${idx}`}
                >
                  <img src={img} alt={`${task.title} ${idx + 1}`} loading='lazy' className='aspect-square w-full object-cover' />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className='space-y-4'>
          <div>
            <div className='mb-2 flex flex-wrap items-center gap-2'>
              <p className='text-xs font-semibold uppercase tracking-wide text-white/50'>{task.publisherName}</p>
              {task.publisherFundStatus ? (
                <Badge className='flex items-center gap-1 border-none bg-emerald-500/20 text-[10px] text-emerald-300'><CheckCircle2 className='h-3 w-3' /> NPH đã cấp quỹ nhiệm vụ này</Badge>
              ) : (
                <Badge className='flex items-center gap-1 border-none bg-amber-500/20 text-[10px] text-amber-300'><Clock3 className='h-3 w-3' /> NPH chưa cấp quỹ</Badge>
              )}
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-2xl font-bold text-white'>{task.title}</h1>
              <Badge className={cn('flex items-center gap-1 border-none text-[10px]', statusChip.className)} data-qa='chip_trang_thai_nhiem_vu'>
                <statusChip.icon className='h-3 w-3' /> {statusChip.label}
              </Badge>
            </div>
          </div>

          {/* Thưởng + suất */}
          <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
            <div className='flex items-center justify-between'>
              <span className='flex items-center gap-1.5 text-lg font-bold text-amber-300'><Coins className='h-5 w-5' /> {formatNumber(task.rewardJcoin)} JCoin</span>
              <span className={cn('flex items-center gap-1 text-sm font-semibold', lowSlot ? 'animate-pulse text-red-400' : 'text-white/70')}>
                <Users className='h-4 w-4' /> {task.slotsLeft > 0 ? `Còn ${formatNumber(task.slotsLeft)}/${formatNumber(task.slotLimit)} suất` : 'Đã đủ số lượng đăng ký'}
              </span>
            </div>
            <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-white/10'>
              <div className='jgame-gradient-brand h-full' style={{ width: `${percentFull}%` }} />
            </div>
            <div className='mt-1.5 flex items-center justify-between text-xs text-white/50'>
              <span>Thưởng khi hoàn thành</span>
              {task.endAt && <span className='flex items-center gap-1'><CalendarDays className='h-3.5 w-3.5' /> Hạn: {formatDate(task.endAt)}</span>}
            </div>
          </div>

          {/* Nhiệm vụ này là gì? */}
          {(task.description || task.gameAndroidUrl || task.gameIosUrl) && (
            <section className='rounded-xl border border-white/10 bg-white/5 p-4' data-qa='card_mo_ta'>
              <h2 className='flex items-center gap-1.5 text-sm font-semibold text-white'><Info className='h-4 w-4 text-purple-300' /> Nhiệm vụ này là gì?</h2>
              {task.description && <p className='mt-2 text-sm leading-relaxed text-white/70'>{task.description}</p>}
              {(task.gameAndroidUrl || task.gameIosUrl) && (
                <div className='mt-3 flex flex-wrap gap-2'>
                  {task.gameAndroidUrl && (
                    <a href={task.gameAndroidUrl} target='_blank' rel='noreferrer' className='flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10' data-qa='lnk_tai_android'>
                      <Smartphone className='h-3.5 w-3.5' /> Tải Android
                    </a>
                  )}
                  {task.gameIosUrl && (
                    <a href={task.gameIosUrl} target='_blank' rel='noreferrer' className='flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10' data-qa='lnk_tai_ios'>
                      <Apple className='h-3.5 w-3.5' /> Tải iOS
                    </a>
                  )}
                </div>
              )}
            </section>
          )}

          <TaskRequirementCard task={task} />
          <TaskStepsList task={task} progress={progress} />

          {isAuthenticated && isRegistered && progress ? (
            <TaskProgressPanel task={task} progress={progress} syncing={syncing} cooldownLeft={cooldownLeft} onSync={handleSync} />
          ) : (
            <section className='flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4'>
              <Lock className='mt-0.5 h-4 w-4 flex-shrink-0 text-purple-300' />
              <div>
                <h2 className='text-sm font-semibold text-white'>Tiến độ của bạn</h2>
                <p className='mt-1 text-sm text-white/60'>
                  {isAuthenticated
                    ? 'Đăng ký nhiệm vụ để bắt đầu tính tiến độ, mốc đạt được và nhật ký đồng bộ.'
                    : 'Đăng nhập để đăng ký và theo dõi tiến độ, mốc đạt được và nhật ký đồng bộ.'}
                </p>
              </div>
            </section>
          )}

          {isRegistered && registrationCode && (
            <section className='rounded-xl border border-purple-400/30 bg-purple-500/10 p-4' data-qa='card_ma_dang_ky'>
              <h2 className='flex items-center gap-1.5 text-sm font-semibold text-white'><KeyRound className='h-4 w-4 text-purple-300' /> Mã đăng ký của bạn</h2>
              <div className='mt-2 flex items-center justify-between gap-3 rounded-lg bg-black/30 px-3 py-2'>
                <span className='font-mono text-lg font-bold tracking-widest text-white'>{registrationCode}</span>
                <Button type='button' variant='ghost' size='sm' className='text-white/80 hover:bg-white/10' onClick={copyRegistrationCode} data-qa='btn_copy_ma_dang_ky'>
                  <Copy className='mr-1.5 h-3.5 w-3.5' /> Sao chép
                </Button>
              </div>
              <p className='mt-2 text-xs text-white/50'>Nhập mã này ở bước "Nhập mã liên kết JGame" trong game. Mã luôn xem lại được tại đây.</p>
            </section>
          )}

          {!isRegistered && (
            <>
              {errorMessage && (
                <div className='flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
                  <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
                </div>
              )}
              <Button
                className='jgame-btn-primary w-full text-white'
                size='lg'
                disabled={ctaDisabled}
                onClick={isAuthenticated ? handleRegister : () => { window.location.hash = '#/jgame/dang-nhap' }}
                data-qa='btn_dang_ky_nhiem_vu'
              >
                {registering && <Loader2 className='mr-1.5 h-4 w-4 animate-spin' />}
                {ctaLabel}
              </Button>
            </>
          )}

          <div className='flex flex-wrap gap-4'>
            <Link to='/jgame/kiem-tien' className='jgame-gradient-text text-sm font-semibold'>← Xem các nhiệm vụ khác</Link>
            {isAuthenticated && <Link to='/jgame/kiem-tien/nhiem-vu-cua-toi' className='text-sm font-semibold text-white/70 hover:text-white' data-qa='lnk_nhiem_vu_cua_toi'>Nhiệm vụ của tôi</Link>}
          </div>
        </div>
      </div>
    </div>
  )
}
