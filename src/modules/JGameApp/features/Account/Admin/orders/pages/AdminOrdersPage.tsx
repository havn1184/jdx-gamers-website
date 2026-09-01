/**
 * AdminOrdersPage — Danh sách & chi tiết giao dịch, xử lý thủ công (SC-A4, mục 12).
 */
import { RefreshCw, RotateCcw, KeyRound } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { Input } from '../../../../../shared/components/ui/input'
import { Badge } from '../../../../../shared/components/ui/badge'
import { formatCurrency, formatDateTime } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { AdminLayout } from '../../components/AdminLayout'
import { useOrdersFetchData } from '../hooks/useOrders.page.fetchData'
import type { AdminOrderStatus } from '../../types/jgame.types'

export const PAGE_ID = 'jgame-admin-orders'
export const PAGE_FEATURES = [
  { label: 'Làm mới', code: 'btn-lam-moi' },
  { label: 'Hoàn tiền thủ công', code: 'row-refund' },
  { label: 'Cấp lại mã thủ công', code: 'row-reissue' },
]

const STATUS_META: Record<AdminOrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Chờ thanh toán', className: 'bg-amber-500/20 text-amber-300' },
  PAID: { label: 'Đang xử lý', className: 'bg-blue-500/20 text-blue-300' },
  SUCCESS: { label: 'Thành công', className: 'bg-emerald-500/20 text-emerald-300' },
  SUPPLY_FAILED: { label: 'Lỗi cấp mã', className: 'bg-red-500/20 text-red-300' },
  REFUND_PROCESSING: { label: 'Đang hoàn tiền', className: 'bg-amber-500/20 text-amber-300' },
  REFUNDED: { label: 'Đã hoàn tiền', className: 'bg-slate-500/20 text-slate-300' },
  EXPIRED: { label: 'Hết hạn', className: 'bg-slate-500/20 text-slate-300' },
  // Trạng thái riêng domain Playtime (đơn vé giờ chơi)
  CONFIRMED: { label: 'Đã xác nhận', className: 'bg-blue-500/20 text-blue-300' },
  USED: { label: 'Đã sử dụng', className: 'bg-emerald-500/20 text-emerald-300' },
  // Trạng thái riêng domain Accessory (đơn phụ kiện)
  PACKING: { label: 'Đang đóng gói', className: 'bg-amber-500/20 text-amber-300' },
  SHIPPING: { label: 'Đang giao hàng', className: 'bg-blue-500/20 text-blue-300' },
  DELIVERED: { label: 'Đã giao', className: 'bg-emerald-500/20 text-emerald-300' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-red-500/20 text-red-300' },
  RETURNED: { label: 'Đã trả hàng', className: 'bg-slate-500/20 text-slate-300' },
}

export function AdminOrdersPage() {
  const { items, loading, refreshing, keyword, setKeyword, refetch, resolveOrder } = useOrdersFetchData()

  return (
    <AdminLayout>
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-xl font-bold text-white'>Giao dịch</h1>
          <p className='text-sm text-white/60'>Tra soát giao dịch, xử lý thủ công khi cần (hoàn tiền/cấp lại mã)</p>
        </div>
        <Button variant='ghost' className='border border-white/20 text-white hover:bg-white/10' disabled={refreshing} onClick={() => refetch(true)} data-qa='btn_lam_moi'>
          <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} /> Làm mới
        </Button>
      </div>

      <Input placeholder='Tìm theo mã đơn, tên thẻ...' value={keyword} onChange={e => setKeyword(e.target.value)} className='mb-4 max-w-sm' data-qa='i_tim_kiem' />

      {loading && items.length === 0 ? (
        <div className='py-12 text-center text-white/50'>Đang tải...</div>
      ) : items.length === 0 ? (
        <div className='py-12 text-center text-white/50'>Không có dữ liệu</div>
      ) : (
        <div className={cn('overflow-x-auto rounded-xl border border-white/10 transition-opacity duration-150', loading && 'pointer-events-none opacity-50')}>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Mã đơn</th>
                <th className='px-3 py-2 text-left font-medium'>Loại thẻ</th>
                <th className='px-3 py-2 text-left font-medium'>NCC</th>
                <th className='px-3 py-2 text-right font-medium'>Số tiền</th>
                <th className='px-3 py-2 text-left font-medium'>Referrer</th>
                <th className='px-3 py-2 text-center font-medium'>Trạng thái</th>
                <th className='px-3 py-2 text-left font-medium'>Thời gian</th>
                <th className='w-[110px] px-3 py-2 text-center font-medium'>Xử lý</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const meta = STATUS_META[item.status]
                return (
                  <tr key={item.id} className='border-t border-white/10 text-white/80'>
                    <td className='px-3 py-2 font-medium text-white'>{item.id}</td>
                    <td className='px-3 py-2'>{item.productName}</td>
                    <td className='px-3 py-2'>{item.supplierName}</td>
                    <td className='px-3 py-2 text-right'>{formatCurrency(item.totalAmount)}</td>
                    <td className='px-3 py-2 text-white/50'>{item.referrerCode || '-'}</td>
                    <td className='px-3 py-2 text-center'><Badge className={cn('border-none', meta.className)}>{meta.label}</Badge></td>
                    <td className='px-3 py-2 text-white/50'>{formatDateTime(item.createdAt)}</td>
                    <td className='px-3 py-2'>
                      {item.status === 'SUPPLY_FAILED' ? (
                        <div className='flex items-center justify-center gap-1'>
                          <Button variant='ghost' size='sm' className='icon-warning border rounded-lg bg-white' title='Hoàn tiền' data-qa={`btn_refund_${item.id}`} onClick={() => resolveOrder(item.id, 'refund')}><RotateCcw className='h-4 w-4' /></Button>
                          <Button variant='ghost' size='sm' className='icon-success border rounded-lg bg-white' title='Cấp lại mã' data-qa={`btn_reissue_${item.id}`} onClick={() => resolveOrder(item.id, 'reissue')}><KeyRound className='h-4 w-4' /></Button>
                        </div>
                      ) : (
                        <span className='block text-center text-white/20'>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
