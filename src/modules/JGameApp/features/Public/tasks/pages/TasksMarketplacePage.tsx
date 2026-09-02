/**
 * TasksMarketplacePage — Nhiệm vụ đang mở, kiếm JCoin qua trải nghiệm/test game (SC-TASK-01).
 * Lọc server-side (loại yêu cầu + từ khoá), card hiển thị câu yêu cầu từ BE, badge "Đã đăng ký"/"Đã đóng".
 */
import { Link } from 'react-router-dom'
import { Search, Loader2, PackageOpen, Coins, Trophy, Timer, Gem, Users, CheckCircle2, Clock3, Flag, BadgeCheck, Lock, AlertCircle, Crown } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/input'
import { Badge } from '../../../../shared/components/ui/badge'
import { formatNumber } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { useTaskMarketplaceFetchData, type TaskFilter } from '../hooks/useTaskMarketplace.page.fetchData'
import { formatRequirementSummary, isTaskExpired } from '../utils/formatRequirement'
import { TaskArt } from '../components/TaskArt'

export const PAGE_ID = 'jgame-tasks-marketplace'
export const PAGE_FEATURES = [
  { label: 'Tìm kiếm nhiệm vụ', code: 'i-tim-kiem' },
  { label: 'Lọc theo dạng yêu cầu', code: 'btn-loc-dang-yeu-cau' },
  { label: 'Xem chi tiết nhiệm vụ', code: 'row-view' },
]

const FILTER_TABS: { key: TaskFilter; label: string; icon: typeof Trophy }[] = [
  { key: 'all', label: 'Tất cả', icon: Coins },
  { key: 'level', label: 'Cấp độ', icon: Trophy },
  { key: 'playtime', label: 'Giờ chơi', icon: Timer },
  { key: 'collection', label: 'Sưu tập', icon: Gem },
]

export function TasksMarketplacePage() {
  const {
    items, registeredIds, loading, errorMessage, keyword, setKeyword, requirementType, setRequirementType, hasActiveFilter, clearFilter, refetch,
  } = useTaskMarketplaceFetchData()

  return (
    <div>
      {/* Hero — giới thiệu JCoin */}
      <section className='jgame-hero-bg relative overflow-hidden'>
        <div className='relative mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-20'>
          <span className='jgame-gradient-brand mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white'><Coins className='h-7 w-7' /></span>
          <h1 className='text-3xl font-extrabold text-white sm:text-5xl'>
            <span className='jgame-gradient-text'>Kiếm tiền</span> cùng JGame
          </h1>
          <p className='mx-auto mt-4 max-w-2xl text-sm text-white/70 sm:text-base'>
            Trải nghiệm, test game cho các nhà phát hành — hoàn thành nhiệm vụ nhận ngay <span className='font-semibold text-white'>JCoin</span>.
            Dùng JCoin để nạp thẻ game, mua vé giờ chơi hoặc phụ kiện gamer — không rút được tiền mặt.
          </p>
          <div className='mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-3 text-sm'>
            <Link to='/jgame/kiem-tien/nhiem-vu-cua-toi' className='rounded-full border border-white/20 px-4 py-2 text-white/80 hover:bg-white/10' data-qa='btn_nhiem_vu_cua_toi'>Nhiệm vụ của tôi</Link>
            <Link to='/jgame/kiem-tien/xep-hang' className='flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 font-semibold text-amber-300 hover:bg-amber-400/20' data-qa='btn_bang_xep_hang'>
              <Crown className='h-4 w-4' /> Bảng xếp hạng
            </Link>
            <Link to='/jgame/vi' className='jgame-btn-primary rounded-full px-4 py-2 font-semibold text-white' data-qa='btn_vi_jcoin'>Ví của tôi</Link>
          </div>

          <div className='mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl bg-white/10 p-2 backdrop-blur'>
            <Search className='ml-2 h-5 w-5 flex-shrink-0 text-white/60' />
            <Input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder='Tìm theo tên game, nhà phát hành...'
              aria-label='Tìm kiếm nhiệm vụ'
              className='border-none bg-transparent text-white placeholder:text-white/50 focus-visible:ring-0'
              data-qa='i_tim_kiem'
            />
          </div>
        </div>
      </section>

      <div className='mx-auto max-w-7xl px-4 py-10 sm:px-6'>
        <div className='mb-6 flex flex-wrap gap-2' data-qa='btn_loc_dang_yeu_cau'>
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              type='button'
              onClick={() => setRequirementType(tab.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                requirementType === tab.key ? 'jgame-gradient-brand border-transparent text-white' : 'border-white/20 text-white/70 hover:bg-white/10'
              )}
            >
              <tab.icon className='h-3.5 w-3.5' /> {tab.label}
            </button>
          ))}
        </div>

        {loading && items.length === 0 && (
          <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải nhiệm vụ...</div>
        )}

        {!loading && errorMessage && items.length === 0 && (
          <div className='flex flex-col items-center gap-3 py-16 text-white/60'>
            <AlertCircle className='h-8 w-8 text-red-300' /> {errorMessage}
            <button type='button' onClick={() => void refetch()} className='rounded-full border border-white/20 px-4 py-1.5 text-sm text-white/80 hover:bg-white/10' data-qa='btn_thu_lai'>Thử lại</button>
          </div>
        )}

        {!loading && !errorMessage && items.length === 0 && (
          <div className='flex flex-col items-center gap-3 py-16 text-white/60'>
            <PackageOpen className='h-8 w-8' /> {hasActiveFilter ? 'Không có nhiệm vụ phù hợp' : 'Chưa có nhiệm vụ nào đang mở'}
            {hasActiveFilter && (
              <button type='button' onClick={clearFilter} className='rounded-full border border-white/20 px-4 py-1.5 text-sm text-white/80 hover:bg-white/10' data-qa='btn_xoa_bo_loc'>Xoá bộ lọc</button>
            )}
          </div>
        )}

        {items.length > 0 && (
          <div className={cn('grid grid-cols-1 gap-5 transition-opacity duration-150 sm:grid-cols-2 lg:grid-cols-3', loading && 'pointer-events-none opacity-50')}>
            {items.map(task => {
              const percentFull = task.slotLimit > 0 ? Math.round((task.slotUsed / task.slotLimit) * 100) : 0
              const lowSlot = task.slotsLeft > 0 && task.slotsLeft <= Math.max(5, Math.round(task.slotLimit * 0.05))
              const isRegistered = registeredIds.has(task.id)
              const unavailable = task.status === 'closed' || isTaskExpired(task)
              return (
                <Link key={task.id} to={`/jgame/kiem-tien/${task.id}`} className='jgame-card-hover overflow-hidden rounded-2xl border border-white/10 bg-white/5' data-qa={`row_view_${task.id}`}>
                  <div className='relative'>
                    <TaskArt art={task.art} imageUrl={task.galleryImages?.[0]} label={task.title} className='aspect-[16/9] w-full' />
                    <span className='absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs font-bold text-amber-300 backdrop-blur'>
                      <Coins className='h-3.5 w-3.5' /> {formatNumber(task.rewardJcoin)}
                    </span>
                    {isRegistered ? (
                      <span className='absolute left-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-1 text-[11px] font-bold text-white'><BadgeCheck className='h-3 w-3' /> Đã đăng ký</span>
                    ) : unavailable ? (
                      <span className='absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-bold text-white/70'><Lock className='h-3 w-3' /> {task.status === 'closed' ? 'Đã đóng' : 'Đã hết hạn'}</span>
                    ) : null}
                  </div>
                  <div className='p-4'>
                    <div className='mb-1 flex items-center justify-between gap-2'>
                      <p className='truncate text-xs font-semibold uppercase tracking-wide text-white/50'>{task.publisherName}</p>
                      {task.publisherFundStatus ? (
                        <Badge className='flex items-center gap-1 border-none bg-emerald-500/20 text-[10px] text-emerald-300'><CheckCircle2 className='h-3 w-3' /> NPH đã cấp quỹ</Badge>
                      ) : (
                        <Badge className='flex items-center gap-1 border-none bg-amber-500/20 text-[10px] text-amber-300'><Clock3 className='h-3 w-3' /> Chờ cấp quỹ</Badge>
                      )}
                    </div>
                    <h3 className='truncate font-semibold text-white'>{task.title}</h3>
                    <p className='mt-1 flex items-start gap-1.5 text-sm text-white/60'><Flag className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-purple-300' /> <span className='line-clamp-2'>{formatRequirementSummary(task)}</span></p>

                    <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-white/10'>
                      <div className='jgame-gradient-brand h-full' style={{ width: `${percentFull}%` }} />
                    </div>
                    <div className='mt-1.5 flex items-center justify-between text-[11px]'>
                      <span className={cn('flex items-center gap-1', lowSlot ? 'animate-pulse font-semibold text-red-400' : 'text-white/50')}>
                        <Users className='h-3 w-3' /> {task.slotsLeft > 0 ? `Còn ${formatNumber(task.slotsLeft)}/${formatNumber(task.slotLimit)} suất` : 'Đã đủ số lượng'}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
