/**
 * ShopSlotsPage — Xem khung giờ (đọc) theo 1 khu vực cụ thể, phục vụ hình thức "Đặt trước theo khung giờ".
 * Khung giờ tự sinh khi truy vấn lần đầu — chủ Cybergame không cần tạo tay, chỉ xem tình hình đặt chỗ.
 */
import { Loader2, CalendarClock, AlertCircle } from 'lucide-react'
import { formatDate } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { ShopOwnerLayout } from '../components/ShopOwnerLayout'
import { useMyShop } from '../hooks/useMyShop'
import { usePlaytimeSlots } from '../hooks/usePlaytimeSlots.page'

export const PAGE_ID = 'jgame-shop-slots'
export const PAGE_FEATURES = [
  { label: 'Chọn khu vực xem khung giờ', code: 'sel_zone_khung_gio' },
  { label: 'Xem bảng khung giờ', code: 'table_khung_gio' },
]

function formatTimeOnly(isoString: string): string {
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return isoString
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export function ShopSlotsPage() {
  const { shop } = useMyShop()
  const { zones, loadingZones, zonesError, zoneId, setZoneId, fromDate, setFromDate, toDate, setToDate, slots, loadingSlots } = usePlaytimeSlots()

  return (
    <ShopOwnerLayout shopName={shop?.name}>
      <h1 className='mb-1 text-xl font-bold text-white'>Khung giờ theo khu vực</h1>
      <p className='mb-6 text-xs text-white/50'>Sức chứa còn trống theo từng khung giờ, phục vụ hình thức đặt trước — chỉ để xem, không cần tạo tay.</p>

      {zonesError && (
        <div className='mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300' data-qa='loi_khung_gio'>
          <AlertCircle className='h-4 w-4 flex-shrink-0' /> {zonesError}
        </div>
      )}

      <div className='mb-5 flex flex-wrap items-center gap-3'>
        <select
          value={zoneId}
          onChange={e => setZoneId(e.target.value)}
          disabled={loadingZones || zones.length === 0}
          aria-label='Chọn khu vực'
          className='min-w-[180px] rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
          data-qa='sel_zone_khung_gio'
        >
          {zones.length === 0 && <option value=''>-- Chưa có khu vực --</option>}
          {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
        <label className='flex items-center gap-2 text-xs text-white/60'>
          Từ ngày
          <input type='date' value={fromDate} onChange={e => setFromDate(e.target.value)} className='rounded-lg border border-white/20 bg-[#1a0d33] px-2 py-1.5 text-sm text-white focus:border-white/40 focus:outline-none' data-qa='dt_tu_ngay' />
        </label>
        <label className='flex items-center gap-2 text-xs text-white/60'>
          Đến ngày
          <input type='date' value={toDate} onChange={e => setToDate(e.target.value)} className='rounded-lg border border-white/20 bg-[#1a0d33] px-2 py-1.5 text-sm text-white focus:border-white/40 focus:outline-none' data-qa='dt_den_ngay' />
        </label>
      </div>

      {loadingSlots ? (
        <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
      ) : slots.length === 0 ? (
        <div className='rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60' data-qa='empty_khung_gio'>
          Không có khung giờ nào trong khoảng ngày đã chọn.
        </div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-white/10' data-qa='table_khung_gio'>
          <table className='w-full text-left text-xs text-white/80'>
            <thead className='bg-white/5 text-white/50'>
              <tr>
                <th className='px-3 py-2'>Ngày</th>
                <th className='px-3 py-2'>Khung giờ</th>
                <th className='px-3 py-2'>Đã đặt / Tổng</th>
                <th className='px-3 py-2'>Còn trống</th>
              </tr>
            </thead>
            <tbody>
              {slots.map(s => (
                <tr key={s.id} className='border-t border-white/10'>
                  <td className='px-3 py-2'>{formatDate(s.date)}</td>
                  <td className='px-3 py-2 flex items-center gap-1.5'><CalendarClock className='h-3.5 w-3.5 text-white/40' /> {formatTimeOnly(s.slotStart)} - {formatTimeOnly(s.slotEnd)}</td>
                  <td className='px-3 py-2'>{s.bookedCount}/{s.totalCapacity}</td>
                  <td className={cn('px-3 py-2 font-semibold', s.availableCount > 0 ? 'text-emerald-400' : 'text-red-300')}>{s.availableCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ShopOwnerLayout>
  )
}
