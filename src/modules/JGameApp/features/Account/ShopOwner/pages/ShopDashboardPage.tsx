/**
 * ShopDashboardPage — Tổng quan gian hàng (SC-P2-S2).
 */
import { Link } from 'react-router-dom'
import { Loader2, Wallet, TrendingUp, ShoppingBag, AlertTriangle, Flame, MapPin, Pencil, X, Star } from 'lucide-react'
import { formatCurrency, formatNumber } from '../../../../shared/utils/FormatUtils'
import { Input } from '../../../../shared/components/ui/input'
import { Button } from '../../../../shared/components/ui/button'
import { ShopOwnerLayout } from '../components/ShopOwnerLayout'
import { useMyShop } from '../hooks/useMyShop'
import { useShopProfileEdit } from '../hooks/useShopProfileEdit'
import { useShopDashboardFetchData } from '../hooks/useShopDashboard.page.fetchData'

export const PAGE_ID = 'jgame-shop-dashboard'

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
      <div className='jgame-gradient-text mb-2'>{icon}</div>
      <p className='text-lg font-bold text-white'>{value}</p>
      <p className='text-xs text-white/50'>{label}</p>
    </div>
  )
}

function ShopProfileCard({ shop, onSaved }: { shop: ReturnType<typeof useMyShop>['shop']; onSaved: () => void }) {
  const f = useShopProfileEdit(shop, onSaved)
  if (!shop) return null

  if (!f.editing) {
    return (
      <div className='mb-8 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2'>
            <h2 className='truncate text-base font-semibold text-white'>{shop.name}</h2>
            <span className='flex items-center gap-1 text-xs text-amber-300'><Star className='h-3.5 w-3.5 fill-amber-300' /> {shop.rating.toFixed(1)}</span>
          </div>
          <p className='mt-1 flex items-center gap-1.5 text-sm text-white/60'><MapPin className='h-3.5 w-3.5 flex-shrink-0' /> {shop.address}, {shop.city}</p>
          {shop.description && <p className='mt-1.5 text-sm text-white/50'>{shop.description}</p>}
        </div>
        <Button variant='outline' size='sm' className='flex-shrink-0 gap-1.5 border-white/20 bg-transparent text-white hover:bg-white/10' onClick={f.startEdit} data-qa='btn_sua_thong_tin_gian_hang'>
          <Pencil className='h-3.5 w-3.5' /> Sửa thông tin
        </Button>
      </div>
    )
  }

  return (
    <div className='mb-8 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4'>
      <h2 className='text-base font-semibold text-white'>Sửa thông tin gian hàng</h2>
      <div className='grid gap-3 sm:grid-cols-2'>
        <div className='space-y-1.5'>
          <label className='text-sm text-white/70'>Tên gian hàng</label>
          <Input value={f.name} onChange={e => f.setName(e.target.value)} data-qa='i_sua_ten_gian_hang' />
        </div>
        <div className='space-y-1.5'>
          <label className='text-sm text-white/70'>Thành phố</label>
          <Input value={f.city} onChange={e => f.setCity(e.target.value)} data-qa='i_sua_thanh_pho' />
        </div>
        <div className='space-y-1.5 sm:col-span-2'>
          <label className='text-sm text-white/70'>Địa chỉ</label>
          <Input value={f.address} onChange={e => f.setAddress(e.target.value)} data-qa='i_sua_dia_chi' />
        </div>
        <div className='space-y-1.5 sm:col-span-2'>
          <label className='text-sm text-white/70'>Mô tả gian hàng</label>
          <textarea
            value={f.description}
            onChange={e => f.setDescription(e.target.value)}
            rows={2}
            className='w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none'
            data-qa='i_sua_mo_ta'
          />
        </div>
      </div>
      {f.errorMessage && <p className='text-sm text-red-300'>{f.errorMessage}</p>}
      <div className='flex gap-2'>
        <Button className='jgame-btn-primary gap-1.5 text-white' size='sm' disabled={!f.isValid || f.submitting} onClick={f.handleSave} data-qa='btn_luu_thong_tin_gian_hang'>
          {f.submitting && <Loader2 className='h-3.5 w-3.5 animate-spin' />} Lưu thay đổi
        </Button>
        <Button variant='outline' size='sm' className='gap-1.5 border-white/20 bg-transparent text-white hover:bg-white/10' onClick={f.cancelEdit} data-qa='btn_huy_sua_gian_hang'>
          <X className='h-3.5 w-3.5' /> Huỷ
        </Button>
      </div>
    </div>
  )
}

export function ShopDashboardPage() {
  const { shop, refetch: refetchShop } = useMyShop()
  const { summary, loading } = useShopDashboardFetchData()

  return (
    <ShopOwnerLayout shopName={shop?.name}>
      <h1 className='mb-6 text-xl font-bold text-white'>Tổng quan gian hàng</h1>

      <ShopProfileCard shop={shop} onSaved={refetchShop} />

      {loading || !summary ? (
        <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
      ) : (
        <>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
            <StatTile icon={<Wallet className='h-5 w-5' />} label='Doanh thu hôm nay' value={formatCurrency(summary.todayRevenue)} />
            <StatTile icon={<TrendingUp className='h-5 w-5' />} label='Doanh thu 7 ngày' value={formatCurrency(summary.weekRevenue)} />
            <StatTile icon={<ShoppingBag className='h-5 w-5' />} label='Đơn mới cần xử lý' value={formatNumber(summary.newOrdersCount)} />
          </div>

          {summary.lowSlotTickets.length > 0 && (
            <div className='mt-8'>
              <h2 className='mb-3 flex items-center gap-2 text-base font-semibold text-white'>
                <AlertTriangle className='h-4 w-4 text-amber-400' /> Vé sắp hết chỗ
              </h2>
              <div className='space-y-2'>
                {summary.lowSlotTickets.map(t => (
                  <div key={t.id} className='flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm'>
                    <span className='text-white/80'>{t.hours}h chơi · {formatCurrency(t.sellPrice)}</span>
                    <span className='animate-pulse font-semibold text-amber-300'>Còn {t.availableSlots} chỗ</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='mt-8'>
            <h2 className='mb-3 flex items-center gap-2 text-base font-semibold text-white'>
              <Flame className='h-4 w-4 text-red-400' /> Vé bán chạy
            </h2>
            {summary.topTickets.length === 0 ? (
              <p className='text-sm text-white/50'>Chưa có đơn hàng nào.</p>
            ) : (
              <div className='overflow-x-auto rounded-xl border border-white/10'>
                <table className='w-full text-sm'>
                  <thead className='bg-white/5 text-white/60'>
                    <tr>
                      <th className='px-3 py-2 text-left font-medium'>Zone</th>
                      <th className='px-3 py-2 text-right font-medium'>Giờ chơi</th>
                      <th className='px-3 py-2 text-right font-medium'>Giá bán</th>
                      <th className='px-3 py-2 text-right font-medium'>Đã bán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.topTickets.map(({ ticket, zoneName, soldCount }) => (
                      <tr key={ticket.id} className='border-t border-white/10 text-white/80'>
                        <td className='px-3 py-2'>{zoneName}</td>
                        <td className='px-3 py-2 text-right'>{ticket.hours}h</td>
                        <td className='px-3 py-2 text-right'>{formatCurrency(ticket.sellPrice)}</td>
                        <td className='px-3 py-2 text-right font-semibold text-white'>{soldCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <Link to='/jgame/kenh-nguoi-ban/zone-ve' className='mt-8 inline-block jgame-gradient-text text-sm font-semibold'>Quản lý Zone & Vé →</Link>
        </>
      )}
    </ShopOwnerLayout>
  )
}
