/**
 * ShopZonesTicketsPage — Quản lý Zone & Vé, nhập thủ công (SC-P2-S3).
 */
import { Loader2, Pencil, Trash2, Plus, X } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/input'
import { Button } from '../../../../shared/components/ui/button'
import { formatCurrency } from '../../../../shared/utils/FormatUtils'
import { ShopOwnerLayout } from '../components/ShopOwnerLayout'
import { useMyShop } from '../hooks/useMyShop'
import { useShopZonesTickets } from '../hooks/useShopZonesTickets.page'
import type { ZoneType } from '../types/shop-owner.types'

export const PAGE_ID = 'jgame-shop-zones-tickets'
export const PAGE_FEATURES = [
  { label: 'Thêm/sửa zone', code: 'btn-luu-zone' },
  { label: 'Xóa zone', code: 'row-delete-zone' },
  { label: 'Thêm/sửa vé', code: 'btn-luu-ve' },
  { label: 'Xóa vé', code: 'row-delete-ve' },
]

const ZONE_TYPE_LABEL: Record<ZoneType, string> = { standard: 'Thường', vip: 'VIP', highend: 'Cấu hình cao' }

export function ShopZonesTicketsPage() {
  const { shop } = useMyShop()
  const {
    zones, tickets, loading,
    zoneForm, setZoneForm, savingZone, startEditZone, cancelEditZone, submitZone, removeZone,
    ticketForm, setTicketForm, savingTicket, startEditTicket, cancelEditTicket, submitTicket, removeTicket,
  } = useShopZonesTickets()

  if (loading) return <ShopOwnerLayout shopName={shop?.name}><div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div></ShopOwnerLayout>

  return (
    <ShopOwnerLayout shopName={shop?.name}>
      <h1 className='mb-6 text-xl font-bold text-white'>Quản lý Zone & Vé</h1>

      {/* Zones */}
      <section className='mb-10'>
        <h2 className='mb-3 text-base font-semibold text-white'>Khu vực (Zone)</h2>
        <div className='mb-4 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4'>
          <div className='flex flex-wrap gap-3'>
            <Input placeholder='Tên zone' value={zoneForm.name} onChange={e => setZoneForm(f => ({ ...f, name: e.target.value }))} className='min-w-[160px] flex-1' data-qa='i_ten_zone' />
            <select
              value={zoneForm.zoneType}
              onChange={e => setZoneForm(f => ({ ...f, zoneType: e.target.value as ZoneType }))}
              aria-label='Loại zone'
              className='min-w-[140px] flex-1 rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
              data-qa='sel_loai_zone'
            >
              <option value='standard'>Thường</option>
              <option value='vip'>VIP</option>
              <option value='highend'>Cấu hình cao</option>
            </select>
            <Input placeholder='Cấu hình máy (VD: i5, RTX 3060)' value={zoneForm.specs} onChange={e => setZoneForm(f => ({ ...f, specs: e.target.value }))} className='min-w-[200px] flex-1' data-qa='i_cau_hinh' />
            <Input placeholder='Tổng số chỗ' inputMode='numeric' value={zoneForm.totalSeats} onChange={e => setZoneForm(f => ({ ...f, totalSeats: e.target.value.replace(/\D/g, '') }))} className='min-w-[120px] flex-1' data-qa='i_tong_cho' />
          </div>
          <div className='flex gap-2'>
            <Button className='jgame-btn-primary text-white' size='sm' disabled={savingZone} onClick={submitZone} data-qa='btn_luu_zone'>
              {savingZone ? <Loader2 className='h-4 w-4 animate-spin mr-1.5' /> : <Plus className='h-4 w-4 mr-1.5' />} {zoneForm.id ? 'Cập nhật zone' : 'Thêm zone'}
            </Button>
            {zoneForm.id && (
              <Button variant='ghost' size='sm' className='text-white/70 hover:bg-white/10' onClick={cancelEditZone}>
                <X className='h-4 w-4 mr-1.5' /> Huỷ
              </Button>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          {zones.map(zone => (
            <div key={zone.id} className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm'>
              <div>
                <span className='font-semibold text-white'>{zone.name}</span>
                <span className='ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60'>{ZONE_TYPE_LABEL[zone.zoneType]}</span>
                <p className='mt-0.5 text-xs text-white/50'>{zone.specs} · {zone.totalSeats} chỗ</p>
              </div>
              <div className='flex gap-1'>
                <Button variant='ghost' size='sm' className='icon-warning border rounded-lg bg-white' title='Sửa' onClick={() => startEditZone(zone)}><Pencil className='h-4 w-4' /></Button>
                <Button variant='ghost' size='sm' className='icon-danger border rounded-lg bg-white' title='Xóa' onClick={() => removeZone(zone.id)} data-qa={`row_delete_zone_${zone.id}`}><Trash2 className='h-4 w-4' /></Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tickets */}
      <section>
        <h2 className='mb-3 text-base font-semibold text-white'>Vé giờ chơi</h2>
        <div className='mb-4 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4'>
          <div className='flex flex-wrap gap-3'>
            <select
              value={ticketForm.zoneId}
              onChange={e => setTicketForm(f => ({ ...f, zoneId: e.target.value }))}
              aria-label='Chọn zone cho vé'
              className='min-w-[160px] flex-1 rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
              data-qa='sel_zone_ve'
            >
              <option value=''>-- Chọn zone --</option>
              {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
            <Input placeholder='Số giờ chơi' inputMode='numeric' value={ticketForm.hours} onChange={e => setTicketForm(f => ({ ...f, hours: e.target.value.replace(/\D/g, '') }))} className='min-w-[120px] flex-1' data-qa='i_so_gio' />
            <Input placeholder='Giá gốc (VNĐ)' inputMode='numeric' value={ticketForm.originalPrice} onChange={e => setTicketForm(f => ({ ...f, originalPrice: e.target.value.replace(/\D/g, '') }))} className='min-w-[140px] flex-1' data-qa='i_gia_goc' />
            <Input placeholder='Giá bán (VNĐ, 0 = miễn phí)' inputMode='numeric' value={ticketForm.sellPrice} onChange={e => setTicketForm(f => ({ ...f, sellPrice: e.target.value.replace(/\D/g, '') }))} className='min-w-[160px] flex-1' data-qa='i_gia_ban' />
            <Input placeholder='Tổng số vé' inputMode='numeric' value={ticketForm.totalSlots} onChange={e => setTicketForm(f => ({ ...f, totalSlots: e.target.value.replace(/\D/g, '') }))} className='min-w-[120px] flex-1' data-qa='i_tong_ve' />
            <Input placeholder='Số vé còn (mặc định = tổng)' inputMode='numeric' value={ticketForm.availableSlots} onChange={e => setTicketForm(f => ({ ...f, availableSlots: e.target.value.replace(/\D/g, '') }))} className='min-w-[160px] flex-1' data-qa='i_ve_con' />
            <label className='flex items-center gap-2 text-sm text-white/70'>
              <input type='checkbox' checked={ticketForm.isFlashSale} onChange={e => setTicketForm(f => ({ ...f, isFlashSale: e.target.checked }))} data-qa='chk_flash_sale' />
              Đánh dấu Flash Sale
            </label>
          </div>
          <div className='flex gap-2'>
            <Button className='jgame-btn-primary text-white' size='sm' disabled={savingTicket} onClick={submitTicket} data-qa='btn_luu_ve'>
              {savingTicket ? <Loader2 className='h-4 w-4 animate-spin mr-1.5' /> : <Plus className='h-4 w-4 mr-1.5' />} {ticketForm.id ? 'Cập nhật vé' : 'Thêm vé'}
            </Button>
            {ticketForm.id && (
              <Button variant='ghost' size='sm' className='text-white/70 hover:bg-white/10' onClick={cancelEditTicket}>
                <X className='h-4 w-4 mr-1.5' /> Huỷ
              </Button>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          {tickets.map(ticket => {
            const zoneName = zones.find(z => z.id === ticket.zoneId)?.name || '—'
            return (
              <div key={ticket.id} className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm'>
                <div>
                  <span className='font-semibold text-white'>{zoneName} · {ticket.hours}h</span>
                  {ticket.isFlashSale && <span className='jgame-badge-soon ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold'>Flash Sale</span>}
                  <p className='mt-0.5 text-xs text-white/50'>
                    {ticket.sellPrice === 0 ? 'Miễn phí' : formatCurrency(ticket.sellPrice)} · Còn {ticket.availableSlots}/{ticket.totalSlots} vé
                  </p>
                </div>
                <div className='flex gap-1'>
                  <Button variant='ghost' size='sm' className='icon-warning border rounded-lg bg-white' title='Sửa' onClick={() => startEditTicket(ticket)}><Pencil className='h-4 w-4' /></Button>
                  <Button variant='ghost' size='sm' className='icon-danger border rounded-lg bg-white' title='Xóa' onClick={() => removeTicket(ticket.id)} data-qa={`row_delete_ve_${ticket.id}`}><Trash2 className='h-4 w-4' /></Button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </ShopOwnerLayout>
  )
}
