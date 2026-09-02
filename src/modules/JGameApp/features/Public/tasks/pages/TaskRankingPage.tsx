/**
 * TaskRankingPage — "Bảng xếp hạng JCoin" (20260902-nc_xep-hang-jcoin.md): Top 50 người kiếm được
 * nhiều JCoin nhất trong kỳ hiện tại (tuần/tháng/năm), công khai. Top 3 hiển thị dạng bục vinh danh
 * nổi bật, hạng 4-50 dạng danh sách, thanh "Vị trí của tôi" cố định ở đáy khi đã đăng nhập.
 */
import { Link } from 'react-router-dom'
import { Loader2, AlertCircle, Trophy, Coins, Sparkles, LogIn } from 'lucide-react'
import { formatNumber } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { useAuth } from '../../../../contexts/AuthContext'
import { useTaskRankingFetchData } from '../hooks/useTaskRanking.page.fetchData'
import type { TaskRankingEntry, TaskRankingPeriod } from '../types/task.types'

export const PAGE_ID = 'jgame-task-ranking'
export const PAGE_FEATURES = [{ label: 'Chọn kỳ xếp hạng', code: 'btn-chon-ky' }]

const PERIOD_TABS: { key: TaskRankingPeriod; label: string }[] = [
  { key: 'week', label: 'Tuần này' },
  { key: 'month', label: 'Tháng này' },
  { key: 'year', label: 'Năm nay' },
]

const PODIUM_STYLE: Record<1 | 2 | 3, { order: string; size: string; ring: string; badge: string; medal: string }> = {
  1: { order: 'order-2', size: 'h-24 w-24 text-2xl', ring: 'ring-4 ring-amber-400', badge: 'bg-amber-400 text-amber-950', medal: '🥇' },
  2: { order: 'order-1', size: 'h-20 w-20 text-xl', ring: 'ring-4 ring-slate-300', badge: 'bg-slate-300 text-slate-900', medal: '🥈' },
  3: { order: 'order-3', size: 'h-20 w-20 text-xl', ring: 'ring-4 ring-orange-400', badge: 'bg-orange-400 text-orange-950', medal: '🥉' },
}

function Avatar({ entry, className }: { entry: Pick<TaskRankingEntry, 'name' | 'avatarUrl'>; className?: string }) {
  if (entry.avatarUrl) {
    return <img src={entry.avatarUrl} alt={entry.name} className={cn('rounded-full object-cover', className)} />
  }
  return (
    <div className={cn('jgame-gradient-brand flex items-center justify-center rounded-full font-bold text-white', className)}>
      {entry.name.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

export function TaskRankingPage() {
  const { isAuthenticated } = useAuth()
  const { period, setPeriod, ranking, loading, error, refetch } = useTaskRankingFetchData()

  const top3 = ranking?.items.slice(0, 3) ?? []
  const rest = ranking?.items.slice(3) ?? []
  const myEntryInTop50 = ranking?.myEntry && ranking.items.some(i => i.userId === ranking.myEntry?.userId)

  return (
    <div>
      <section className='jgame-hero-bg relative overflow-hidden'>
        <div className='relative mx-auto max-w-4xl px-4 py-14 text-center sm:px-6'>
          <span className='jgame-gradient-brand mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white'><Trophy className='h-7 w-7' /></span>
          <h1 className='text-3xl font-extrabold text-white sm:text-4xl'>Bảng xếp hạng <span className='jgame-gradient-text'>JCoin</span></h1>
          <p className='mx-auto mt-3 max-w-xl text-sm text-white/70'>Kiếm càng nhiều JCoin, thứ hạng càng cao. Hoàn thành nhiệm vụ để leo hạng ngay hôm nay!</p>
        </div>
      </section>

      <div className='mx-auto max-w-4xl px-4 pb-28 pt-8 sm:px-6'>
        <div className='mb-8 flex justify-center gap-2' data-qa='btn_chon_ky'>
          {PERIOD_TABS.map(tab => (
            <button
              key={tab.key}
              type='button'
              onClick={() => setPeriod(tab.key)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                period === tab.key ? 'jgame-gradient-brand border-transparent text-white' : 'border-white/20 text-white/70 hover:bg-white/10'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải bảng xếp hạng...</div>
        )}

        {!loading && error && (
          <div className='flex flex-col items-center gap-3 py-16 text-white/60'>
            <AlertCircle className='h-8 w-8 text-red-300' /> {error}
            <button type='button' onClick={() => void refetch()} className='rounded-full border border-white/20 px-4 py-1.5 text-sm text-white/80 hover:bg-white/10'>Thử lại</button>
          </div>
        )}

        {!loading && !error && ranking && ranking.items.length === 0 && (
          <div className='flex flex-col items-center gap-3 py-16 text-white/60'>
            <Sparkles className='h-8 w-8' /> Chưa có ai lọt bảng xếp hạng kỳ này — hãy là người đầu tiên!
            <Link to='/jgame/kiem-tien' className='jgame-btn-primary rounded-full px-4 py-1.5 text-sm font-semibold text-white'>Khám phá nhiệm vụ</Link>
          </div>
        )}

        {!loading && !error && ranking && ranking.items.length > 0 && (
          <>
            {/* Top 3 — bục vinh danh */}
            <div className='mb-10 flex items-end justify-center gap-3 sm:gap-6'>
              {top3.map(entry => {
                const style = PODIUM_STYLE[entry.rank as 1 | 2 | 3]
                return (
                  <div key={entry.userId} className={cn('flex flex-col items-center', style.order)}>
                    <div className='relative'>
                      <Avatar entry={entry} className={style.size + ' ' + style.ring} />
                      <span className={cn('absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-xs font-bold', style.badge)}>{style.medal} #{entry.rank}</span>
                    </div>
                    <p className='mt-3 max-w-[100px] truncate text-sm font-semibold text-white'>{entry.name}</p>
                    <p className='flex items-center gap-1 text-xs font-bold text-amber-300'><Coins className='h-3 w-3' /> {formatNumber(entry.jcoinEarned)}</p>
                  </div>
                )
              })}
            </div>

            {/* Hạng 4-50 */}
            {rest.length > 0 && (
              <div className='divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5'>
                {rest.map(entry => (
                  <div key={entry.userId} className={cn('flex items-center gap-3 px-4 py-3', entry.isCurrentUser && 'bg-purple-500/10')}>
                    <span className='w-6 flex-shrink-0 text-center text-sm font-bold text-white/50'>{entry.rank}</span>
                    <Avatar entry={entry} className='h-9 w-9 flex-shrink-0 text-sm' />
                    <span className='flex-1 truncate text-sm font-medium text-white'>{entry.name}{entry.isCurrentUser && ' (Bạn)'}</span>
                    <span className='flex items-center gap-1 text-sm font-bold text-amber-300'><Coins className='h-3.5 w-3.5' /> {formatNumber(entry.jcoinEarned)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Vị trí của tôi — sticky đáy */}
      {!loading && !error && (
        <div className='fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0b0417]/95 backdrop-blur'>
          <div className='mx-auto max-w-4xl px-4 py-3 sm:px-6'>
            {!isAuthenticated ? (
              <Link to='/jgame/dang-nhap' className='flex items-center justify-center gap-2 text-sm font-semibold text-white' data-qa='btn_dang_nhap_xem_hang'>
                <LogIn className='h-4 w-4' /> Đăng nhập để xem thứ hạng của bạn
              </Link>
            ) : ranking?.myEntry ? (
              <div className='flex items-center gap-3'>
                <span className='w-8 flex-shrink-0 text-center text-sm font-bold text-white'>{ranking.myEntry.rank ?? '-'}</span>
                <Avatar entry={ranking.myEntry} className='h-9 w-9 flex-shrink-0 text-sm' />
                <span className='flex-1 truncate text-sm font-semibold text-white'>
                  {ranking.myEntry.rank == null ? 'Bạn chưa có JCoin nào kỳ này' : myEntryInTop50 ? 'Vị trí của bạn' : `Hạng ${ranking.myEntry.rank} — Vị trí của bạn`}
                </span>
                <span className='flex items-center gap-1 text-sm font-bold text-amber-300'><Coins className='h-3.5 w-3.5' /> {formatNumber(ranking.myEntry.jcoinEarned)}</span>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
