/**
 * ShopSyncPage — Đồng bộ nền tảng: Thủ công / NetBarBox / DoDoNew (SC-P2-S4).
 */
import { Loader2, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { formatDateTime } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { ShopOwnerLayout } from '../components/ShopOwnerLayout'
import { useShopSync } from '../hooks/useShopSync.page'
import type { ShopSyncMode } from '../types/shop-owner.types'

export const PAGE_ID = 'jgame-shop-sync'
export const PAGE_FEATURES = [{ label: 'Chọn chế độ đồng bộ', code: 'btn-chon-sync-mode' }, { label: 'Đồng bộ ngay', code: 'btn-dong-bo-ngay' }]

const MODE_OPTIONS: { key: ShopSyncMode; label: string; desc: string }[] = [
  { key: 'manual', label: 'Thủ công', desc: 'Chủ gian hàng tự nhập dữ liệu vé và số chỗ trống ở trang Zone & Vé.' },
  { key: 'netbarbox', label: 'NetBarBox', desc: 'Đồng bộ trực tiếp số chỗ trống từ nền tảng quản lý phòng máy NetBarBox.' },
  { key: 'dodonew', label: 'DoDoNew', desc: 'Đồng bộ trực tiếp số chỗ trống từ nền tảng quản lý phòng máy DoDoNew.' },
]

export function ShopSyncPage() {
  const { shop, loadingShop, tickets, savingMode, setSyncMode, syncing, syncNow, lastSyncedAt } = useShopSync()

  if (loadingShop || !shop) return <ShopOwnerLayout><div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div></ShopOwnerLayout>

  return (
    <ShopOwnerLayout shopName={shop.name}>
      <h1 className='mb-6 text-xl font-bold text-white'>Đồng bộ nền tảng</h1>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-3' data-qa='btn_chon_sync_mode'>
        {MODE_OPTIONS.map(opt => (
          <button
            key={opt.key}
            type='button'
            disabled={savingMode}
            onClick={() => setSyncMode(opt.key)}
            className={cn(
              'rounded-xl border p-4 text-left transition-colors',
              shop.syncMode === opt.key ? 'border-transparent bg-white/10 ring-2 ring-[var(--primary)]' : 'border-white/10 bg-white/5 hover:bg-white/10'
            )}
          >
            <div className='flex items-center justify-between'>
              <span className='font-semibold text-white'>{opt.label}</span>
              {shop.syncMode === opt.key && <CheckCircle2 className='h-4 w-4 text-emerald-400' />}
            </div>
            <p className='mt-1 text-xs text-white/60'>{opt.desc}</p>
          </button>
        ))}
      </div>

      {shop.syncMode !== 'manual' && (
        <div className='mt-6 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm text-white'>Kéo dữ liệu chỗ trống mới nhất từ {shop.syncMode === 'netbarbox' ? 'NetBarBox' : 'DoDoNew'}</p>
            {lastSyncedAt && <p className='mt-0.5 text-xs text-white/50'>Đồng bộ gần nhất: {formatDateTime(lastSyncedAt)}</p>}
          </div>
          <Button className='jgame-btn-primary flex-shrink-0 text-white' disabled={syncing} onClick={syncNow} data-qa='btn_dong_bo_ngay'>
            {syncing ? <Loader2 className='h-4 w-4 animate-spin mr-1.5' /> : <RefreshCw className='h-4 w-4 mr-1.5' />} Đồng bộ ngay
          </Button>
        </div>
      )}

      <h2 className='mb-3 mt-8 text-base font-semibold text-white'>Số chỗ trống hiện tại</h2>
      <div className='space-y-2'>
        {tickets.map(t => (
          <div key={t.id} className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80'>
            <span>{t.hours}h chơi</span>
            <span className='font-semibold text-white'>{t.availableSlots}/{t.totalSlots} chỗ</span>
          </div>
        ))}
      </div>
    </ShopOwnerLayout>
  )
}
