/**
 * ShopSyncPage — Đồng bộ nền tảng: Thủ công / NetBarBox / DoDoNew (SC-P2-S4).
 */
import { Loader2, RefreshCw, CheckCircle2, Link2, AlertTriangle } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { Input } from '../../../../shared/components/ui/input'
import { formatDateTime } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { ShopOwnerLayout } from '../components/ShopOwnerLayout'
import { useShopSync } from '../hooks/useShopSync.page'
import { useNetbarboxConnection } from '../hooks/useNetbarboxConnection.page'
import type { ShopSyncMode } from '../types/shop-owner.types'
import { NetbarboxConnectionStatus } from '../types/netbarbox.types'

export const PAGE_ID = 'jgame-shop-sync'
export const PAGE_FEATURES = [
  { label: 'Chọn chế độ đồng bộ', code: 'btn-chon-sync-mode' },
  { label: 'Đồng bộ ngay', code: 'btn-dong-bo-ngay' },
  { label: 'Nhập khoá kết nối Netbarbox', code: 'i-connection-secret' },
  { label: 'Kết nối Netbarbox', code: 'btn-ket-noi-netbarbox' },
  { label: 'Xác nhận tên quán', code: 'btn-xac-nhan-ten-quan' },
  { label: 'Ngắt kết nối Netbarbox', code: 'btn-ngat-ket-noi' },
  { label: 'Đồng bộ danh mục Netbarbox', code: 'btn-dong-bo-danh-muc' },
]

const MODE_OPTIONS: { key: ShopSyncMode; label: string; desc: string }[] = [
  { key: 'manual', label: 'Thủ công', desc: 'Chủ gian hàng tự nhập dữ liệu vé và số chỗ trống ở trang Zone & Vé.' },
  { key: 'netbarbox', label: 'NetBarBox', desc: 'Đồng bộ trực tiếp số chỗ trống từ nền tảng quản lý phòng máy NetBarBox.' },
  { key: 'dodonew', label: 'DoDoNew', desc: 'Đồng bộ trực tiếp số chỗ trống từ nền tảng quản lý phòng máy DoDoNew.' },
]

export function ShopSyncPage() {
  const { shop, loadingShop, tickets, savingMode, setSyncMode, syncing, syncNow, lastSyncedAt, errorMessage } = useShopSync()
  const {
    connection, loadingConnection,
    connectionSecret, setConnectionSecret, connecting, connectError, connect,
    pendingConfirmName, acknowledgeConnected,
    confirmingDisconnect, requestDisconnect, cancelDisconnect, disconnecting, confirmDisconnect,
    history, loadingHistory,
    syncingCatalog, syncResult, syncError, syncCatalogNow,
  } = useNetbarboxConnection()

  if (loadingShop || !shop) return <ShopOwnerLayout><div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div></ShopOwnerLayout>

  return (
    <ShopOwnerLayout shopName={shop.name}>
      <h1 className='mb-6 text-xl font-bold text-white'>Đồng bộ nền tảng</h1>

      {errorMessage && (
        <div className='mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300' data-qa='loi_dong_bo'>
          <AlertTriangle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
        </div>
      )}

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

      {/* Kết nối Netbarbox — kết nối 2 chiều + đồng bộ danh mục thật (nc_ mục 3.6) */}
      <h2 className='mb-3 mt-10 text-base font-semibold text-white'>Kết nối Netbarbox</h2>
      {loadingConnection ? (
        <div className='flex items-center justify-center gap-2 py-10 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
      ) : (
        <div className='rounded-xl border border-white/10 bg-white/5 p-5'>
          {connection?.status === NetbarboxConnectionStatus.Connected ? (
            <>
              <div className='flex items-center gap-2 text-sm text-emerald-400'>
                <CheckCircle2 className='h-4 w-4' /> Đã kết nối với: <span className='font-semibold text-white'>{connection.shopRefName}</span>
              </div>
              {connection.lastCatalogSyncAt && <p className='mt-1 text-xs text-white/50'>Đồng bộ danh mục gần nhất: {formatDateTime(connection.lastCatalogSyncAt)}</p>}
              {shop.syncMode !== 'netbarbox' && (
                <p className='mt-2 flex items-center gap-1.5 text-xs text-amber-300'>
                  <AlertTriangle className='h-3.5 w-3.5' /> Chuyển chế độ đồng bộ ở trên sang "NetBarBox" để bắt đầu bán các gói đồng bộ được.
                </p>
              )}

              <div className='mt-4 flex flex-wrap items-center gap-2'>
                <Button className='jgame-btn-primary text-white' disabled={syncingCatalog} onClick={syncCatalogNow} data-qa='btn_dong_bo_danh_muc'>
                  {syncingCatalog ? <Loader2 className='h-4 w-4 animate-spin mr-1.5' /> : <RefreshCw className='h-4 w-4 mr-1.5' />} Đồng bộ ngay
                </Button>
                {!confirmingDisconnect ? (
                  <Button variant='ghost' className='text-red-300 hover:bg-red-500/10' onClick={requestDisconnect} data-qa='btn_ngat_ket_noi'>Ngắt kết nối</Button>
                ) : (
                  <div className='flex flex-wrap items-center gap-2 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-200'>
                    Xác nhận ngắt kết nối Netbarbox?
                    <Button size='sm' variant='ghost' className='text-red-200 hover:bg-red-500/20' disabled={disconnecting} onClick={confirmDisconnect} data-qa='btn_xac_nhan_ngat'>
                      {disconnecting ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : 'Có, ngắt kết nối'}
                    </Button>
                    <Button size='sm' variant='ghost' className='text-white/70' onClick={cancelDisconnect}>Huỷ</Button>
                  </div>
                )}
              </div>

              {syncResult && (
                <div className='mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/80' data-qa='ket_qua_dong_bo'>
                  <p>Kết quả đồng bộ: <span className='font-semibold text-white'>{syncResult.newCount}</span> gói mới · <span className='font-semibold text-white'>{syncResult.updatedCount}</span> cập nhật · <span className='font-semibold text-white'>{syncResult.removedCount}</span> bị gỡ · <span className='font-semibold text-white'>{syncResult.skippedCount}</span> bị bỏ qua</p>
                  {syncResult.skippedReasons.length > 0 && (
                    <ul className='mt-1.5 list-disc space-y-0.5 pl-4 text-white/60'>
                      {syncResult.skippedReasons.map((reason, idx) => <li key={idx}>{reason}</li>)}
                    </ul>
                  )}
                </div>
              )}
              {syncError && <p className='mt-3 text-xs text-red-300'>{syncError}</p>}
            </>
          ) : (
            <>
              {pendingConfirmName ? (
                <div className='rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-4' data-qa='banner_xac_nhan_ten_quan'>
                  <p className='text-sm text-white'>Xác nhận kết nối với quán: <span className='font-semibold text-emerald-300'>{pendingConfirmName}</span></p>
                  <p className='mt-1 text-xs text-white/60'>Vui lòng kiểm tra đúng đây là quán của bạn trên Netbarbox trước khi tiếp tục. Nếu sai, hãy ngắt kết nối ngay và kiểm tra lại khoá kết nối đã dán.</p>
                  <Button className='jgame-btn-primary mt-3 text-white' size='sm' onClick={acknowledgeConnected} data-qa='btn_xac_nhan_ten_quan'>Đúng, đây là quán của tôi</Button>
                </div>
              ) : (
                <>
                  <p className='flex items-center gap-1.5 text-sm text-white/70'><Link2 className='h-4 w-4' /> Dán khoá kết nối (ConnectionSecret) do Netbarbox cấp để liên kết gian hàng.</p>
                  <div className='mt-3 flex flex-wrap gap-3'>
                    <Input placeholder='Dán ConnectionSecret' value={connectionSecret} onChange={e => setConnectionSecret(e.target.value)} className='min-w-[240px] flex-1' data-qa='i_connection_secret' />
                    <Button className='jgame-btn-primary text-white' disabled={connecting || !connectionSecret.trim()} onClick={connect} data-qa='btn_ket_noi_netbarbox'>
                      {connecting ? <Loader2 className='h-4 w-4 animate-spin mr-1.5' /> : null} Kết nối
                    </Button>
                  </div>
                  {connectError && <p className='mt-2 text-xs text-red-300'>{connectError}</p>}
                  {connection?.status === NetbarboxConnectionStatus.Error && !connectError && <p className='mt-2 text-xs text-amber-300'>Kết nối trước đó bị lỗi, vui lòng kết nối lại.</p>}
                </>
              )}
            </>
          )}
        </div>
      )}

      <h3 className='mb-2 mt-6 text-sm font-semibold text-white/80'>Lịch sử đồng bộ</h3>
      {loadingHistory ? (
        <div className='flex items-center justify-center gap-2 py-8 text-white/60'><Loader2 className='h-4 w-4 animate-spin' /> Đang tải...</div>
      ) : history.length === 0 ? (
        <p className='text-xs text-white/50'>Chưa có lượt đồng bộ nào.</p>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-white/10' data-qa='table_lich_su_dong_bo'>
          <table className='w-full text-left text-xs text-white/80'>
            <thead className='bg-white/5 text-white/50'>
              <tr>
                <th className='px-3 py-2'>Thời điểm</th>
                <th className='px-3 py-2'>Kết quả</th>
                <th className='px-3 py-2'>Mới / Cập nhật / Gỡ / Bỏ qua</th>
                <th className='px-3 py-2'>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id} className='border-t border-white/10'>
                  <td className='px-3 py-2'>{formatDateTime(h.syncedAt)}</td>
                  <td className='px-3 py-2'>{h.success ? <span className='text-emerald-400'>Thành công</span> : <span className='text-red-300'>Lỗi</span>}</td>
                  <td className='px-3 py-2'>{h.newCount} / {h.updatedCount} / {h.removedCount} / {h.skippedCount}</td>
                  <td className='px-3 py-2'>{h.errorMessage || (h.skippedReasons.length > 0 ? h.skippedReasons.join('; ') : '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ShopOwnerLayout>
  )
}
