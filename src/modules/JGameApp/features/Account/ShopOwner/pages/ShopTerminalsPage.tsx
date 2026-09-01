/**
 * ShopTerminalsPage — Danh sách máy của gian hàng: trạng thái đồng bộ thời gian thực từ Netbarbox (đọc,
 * PlaytimeTerminalApiService) + khai báo/xóa máy thủ công (ShopOwnerApiService — BE đã có sẵn từ tích
 * hợp Netbarbox, 20260901-nc_shop-owner-zone-ve-crud.md bổ sung UI).
 */
import { Loader2, Monitor, Plus, X, Trash2, AlertCircle } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/input'
import { Button } from '../../../../shared/components/ui/button'
import { cn } from '../../../../shared/components/ui/utils'
import { ShopOwnerLayout } from '../components/ShopOwnerLayout'
import { usePlaytimeTerminals } from '../hooks/usePlaytimeTerminals.page'
import { PlaytimeTerminalStatus } from '../types/netbarbox.types'

export const PAGE_ID = 'jgame-shop-terminals'
export const PAGE_FEATURES = [
  { label: 'Xem danh sách máy', code: 'grid-danh-sach-may' },
  { label: 'Thêm máy thủ công', code: 'btn-them-may' },
  { label: 'Xóa máy', code: 'row-delete-may' },
]

const STATUS_LABEL: Record<number, string> = {
  [PlaytimeTerminalStatus.Available]: 'Trống',
  [PlaytimeTerminalStatus.Reserved]: 'Đã đặt',
  [PlaytimeTerminalStatus.InUse]: 'Đang dùng',
  [PlaytimeTerminalStatus.Offline]: 'Ngừng hoạt động',
  [PlaytimeTerminalStatus.Unknown]: 'Chưa xác định',
}

const STATUS_COLOR: Record<number, string> = {
  [PlaytimeTerminalStatus.Available]: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300',
  [PlaytimeTerminalStatus.Reserved]: 'border-amber-400/40 bg-amber-500/10 text-amber-300',
  [PlaytimeTerminalStatus.InUse]: 'border-sky-400/40 bg-sky-500/10 text-sky-300',
  [PlaytimeTerminalStatus.Offline]: 'border-white/20 bg-white/5 text-white/40',
  [PlaytimeTerminalStatus.Unknown]: 'border-red-400/40 bg-red-500/10 text-red-300',
}

export function ShopTerminalsPage() {
  const {
    shop, loadingShop, terminals, zones, loading, errorMessage,
    showForm, openForm, cancelForm, form, setForm, saving, submitTerminal, removeTerminal,
  } = usePlaytimeTerminals()

  return (
    <ShopOwnerLayout shopName={shop?.name}>
      <div className='mb-1 flex items-center justify-between'>
        <h1 className='text-xl font-bold text-white'>Danh sách máy</h1>
        {!showForm && (
          <Button className='jgame-btn-primary text-white' size='sm' onClick={openForm} data-qa='btn_them_may'>
            <Plus className='h-4 w-4 mr-1.5' /> Thêm máy
          </Button>
        )}
      </div>
      <p className='mb-6 text-xs text-white/50'>Trạng thái được đồng bộ thời gian thực từ Netbarbox. Có thể tự khai báo thêm máy thủ công bên dưới.</p>

      {errorMessage && (
        <div className='mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300' data-qa='loi_danh_sach_may'>
          <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
        </div>
      )}

      {showForm && (
        <div className='mb-6 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4'>
          <div className='flex flex-wrap gap-3'>
            <select
              value={form.zoneId}
              onChange={e => setForm(f => ({ ...f, zoneId: e.target.value }))}
              aria-label='Chọn khu vực cho máy'
              className='min-w-[160px] flex-1 rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
              data-qa='sel_zone_may'
            >
              <option value=''>-- Chọn khu vực --</option>
              {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
            <Input placeholder='Số hiệu máy (VD: PC-01)' value={form.terminalNumber} onChange={e => setForm(f => ({ ...f, terminalNumber: e.target.value }))} className='min-w-[160px] flex-1' data-qa='i_so_hieu_may' />
            <Input placeholder='Mã máy phía Netbarbox' value={form.netbarboxTerminalRef} onChange={e => setForm(f => ({ ...f, netbarboxTerminalRef: e.target.value }))} className='min-w-[200px] flex-1' data-qa='i_netbarbox_terminal_ref' />
          </div>
          <div className='flex gap-2'>
            <Button className='jgame-btn-primary text-white' size='sm' disabled={saving} onClick={submitTerminal} data-qa='btn_luu_may'>
              {saving ? <Loader2 className='h-4 w-4 animate-spin mr-1.5' /> : <Plus className='h-4 w-4 mr-1.5' />} Thêm máy
            </Button>
            <Button variant='ghost' size='sm' className='text-white/70 hover:bg-white/10' onClick={cancelForm}>
              <X className='h-4 w-4 mr-1.5' /> Huỷ
            </Button>
          </div>
        </div>
      )}

      {(loadingShop || loading) ? (
        <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
      ) : terminals.length === 0 ? (
        <div className='rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60' data-qa='empty_danh_sach_may'>
          Gian hàng chưa có máy nào được đăng ký. Bấm "Thêm máy" để tự khai báo, hoặc đồng bộ với Netbarbox.
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' data-qa='grid_danh_sach_may'>
          {terminals.map(t => (
            <div key={t.id} className={cn('relative flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center', STATUS_COLOR[t.status] ?? STATUS_COLOR[PlaytimeTerminalStatus.Unknown])}>
              <button
                type='button'
                title='Xóa'
                onClick={() => removeTerminal(t.id)}
                className='icon-danger absolute right-1.5 top-1.5 rounded-lg border bg-white p-1'
                data-qa={`row_delete_may_${t.id}`}
              >
                <Trash2 className='h-3.5 w-3.5' />
              </button>
              <Monitor className='h-5 w-5' />
              <span className='text-sm font-semibold text-white'>{t.terminalNumber}</span>
              <span className='text-[11px]'>{STATUS_LABEL[t.status] ?? 'Chưa xác định'}</span>
            </div>
          ))}
        </div>
      )}
    </ShopOwnerLayout>
  )
}
