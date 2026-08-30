/**
 * TasksMarketplacePage — Nhiệm vụ đang mở, kiếm JCoin qua trải nghiệm/test game (SC-TASK-01).
 */
import { Link } from 'react-router-dom'
import { Search, Loader2, PackageOpen, Coins, Trophy, Timer, Gem, Users, CheckCircle2, Clock3 } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/input'
import { Badge } from '../../../../shared/components/ui/badge'
import { TaskArt } from '../components/TaskArt'
import { formatNumber } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { useTaskMarketplaceFetchData, type TaskFilter } from '../hooks/useTaskMarketplace.page.fetchData'
import { formatRequirementSummary } from '../utils/formatRequirement'

export const PAGE_ID = 'jgame-tasks-marketplace'
export const PAGE_FEATURES = [
  { label: 'Tìm kiếm nhiệm vụ', code: 'i-tim-kiem' },
  { label: 'Lọc theo dạng yêu cầu', code: 'btn-loc-dang-yeu-cau' },
  { label: 'Xem chi tiết nhiệm vụ', code: 'row-view' },
]

const FILTER_TABS: { key: TaskFilter; label: string; icon: typeof Trophy }[] = [
  { key: 'all', label: 'Tất cả', icon: Coins },
  { key: 'level', label: 'Đạt cấp độ', icon: Trophy },
  { key: 'playtime', label: 'Thời lượng chơi', icon: Timer },
  { key: 'collection', label: 'Sưu tập vật phẩm', icon: Gem },
]

export function TasksMarketplacePage() {
  const { items, loading, keyword, setKeyword, requirementType, setRequirementType } = useTaskMarketplaceFetchData()

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
            <Link to='/jgame/kiem-tien/vi-jcoin' className='jgame-btn-primary rounded-full px-4 py-2 font-semibold text-white' data-qa='btn_vi_jcoin'>Ví JCoin</Link>
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

        {!(loading && items.length === 0) && items.length === 0 && (
          <div className='flex flex-col items-center gap-2 py-16 text-white/60'><PackageOpen className='h-8 w-8' /> Không có nhiệm vụ phù hợp</div>
        )}

        {items.length > 0 && (
          <div className={cn('grid grid-cols-1 gap-5 transition-opacity duration-150 sm:grid-cols-2 lg:grid-cols-3', loading && 'pointer-events-none opacity-50')}>
            {items.map(task => {
              const remaining = task.slotLimit - task.slotUsed
              const percentFull = Math.round((task.slotUsed / task.slotLimit) * 100)
              const lowSlot = remaining > 0 && remaining <= Math.max(5, Math.round(task.slotLimit * 0.05))
              return (
                <Link key={task.id} to={`/jgame/kiem-tien/${task.id}`} className='jgame-card-hover overflow-hidden rounded-2xl border border-white/10 bg-white/5' data-qa={`row_view_${task.id}`}>
                  <div className='relative'>
                    <TaskArt art={task.art} imageUrl={task.galleryImages?.[0]} label={task.title} className='aspect-[16/9] w-full' />
                    <span className='absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs font-bold text-amber-300 backdrop-blur'>
                      <Coins className='h-3.5 w-3.5' /> {formatNumber(task.rewardJcoin)}
                    </span>
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
                    <p className='mt-1 text-sm text-white/60'>{formatRequirementSummary(task)}</p>

                    <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-white/10'>
                      <div className='jgame-gradient-brand h-full' style={{ width: `${percentFull}%` }} />
                    </div>
                    <div className='mt-1.5 flex items-center justify-between text-[11px]'>
                      <span className={cn('flex items-center gap-1', lowSlot ? 'animate-pulse font-semibold text-red-400' : 'text-white/50')}>
                        <Users className='h-3 w-3' /> {remaining > 0 ? `Còn ${formatNumber(remaining)} suất` : 'Đã đủ số lượng'}
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
