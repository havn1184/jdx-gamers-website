/**
 * AdminReportsPage — Báo cáo doanh thu & đối soát theo NCC (SC-A6).
 */
import { useMemo } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { formatCurrency } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { AdminLayout } from '../../components/AdminLayout'
import { useJGameReportsFetchData } from '../hooks/useJGameReports.page.fetchData'

export const PAGE_ID = 'jgame-admin-reports'
export const PAGE_FEATURES = [{ label: 'Làm mới', code: 'btn-lam-moi' }]

/** Ngưỡng cảnh báo tỷ lệ lỗi cấp mã theo NCC (mục 9 — NFR theo dõi & vận hành) */
const ERROR_RATE_WARNING_THRESHOLD = 10

export function AdminReportsPage() {
  const { rows, loading, refreshing, refetch } = useJGameReportsFetchData()

  const totalGmv = useMemo(() => rows.reduce((sum, r) => sum + r.gmv, 0), [rows])
  const totalOrders = useMemo(() => rows.reduce((sum, r) => sum + r.totalOrders, 0), [rows])

  return (
    <AdminLayout>
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-xl font-bold text-white'>Báo cáo doanh thu & đối soát</h1>
          <p className='text-sm text-white/60'>GMV, số lượng đơn, tỷ lệ lỗi cấp mã theo từng NCC</p>
        </div>
        <Button variant='ghost' className='border border-white/20 text-white hover:bg-white/10' disabled={refreshing} onClick={() => refetch(true)} data-qa='btn_lam_moi'>
          <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} /> Làm mới
        </Button>
      </div>

      <div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4'>
        <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
          <p className='text-xs text-white/50'>Tổng GMV</p>
          <p className='mt-1 text-lg font-bold text-white'>{formatCurrency(totalGmv)}</p>
        </div>
        <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
          <p className='text-xs text-white/50'>Tổng số đơn</p>
          <p className='mt-1 text-lg font-bold text-white'>{totalOrders}</p>
        </div>
      </div>

      {loading ? (
        <div className='py-12 text-center text-white/50'>Đang tải...</div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-white/10'>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Nhà cung cấp</th>
                <th className='px-3 py-2 text-right font-medium'>Tổng đơn</th>
                <th className='px-3 py-2 text-right font-medium'>Thành công</th>
                <th className='px-3 py-2 text-right font-medium'>Lỗi cấp mã</th>
                <th className='px-3 py-2 text-right font-medium'>Tỷ lệ lỗi</th>
                <th className='px-3 py-2 text-right font-medium'>GMV</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.supplierName} className='border-t border-white/10 text-white/80'>
                  <td className='px-3 py-2 font-medium text-white'>{row.supplierName}</td>
                  <td className='px-3 py-2 text-right'>{row.totalOrders}</td>
                  <td className='px-3 py-2 text-right text-emerald-400'>{row.successOrders}</td>
                  <td className='px-3 py-2 text-right text-red-400'>{row.failedOrders}</td>
                  <td className='px-3 py-2 text-right'>
                    <span className={cn('inline-flex items-center gap-1', row.failRatePercent >= ERROR_RATE_WARNING_THRESHOLD ? 'font-medium text-red-400' : '')}>
                      {row.failRatePercent >= ERROR_RATE_WARNING_THRESHOLD && <AlertTriangle className='h-3.5 w-3.5' />}
                      {row.failRatePercent}%
                    </span>
                  </td>
                  <td className='px-3 py-2 text-right font-medium text-white'>{formatCurrency(row.gmv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
