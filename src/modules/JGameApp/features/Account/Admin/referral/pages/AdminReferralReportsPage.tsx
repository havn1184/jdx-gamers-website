/**
 * AdminReferralReportsPage — Báo cáo tổng hợp referral (click/đơn/hoa hồng/đã trả/còn nợ), có bộ lọc.
 * 20260901-nc_doi-tac-tiep-thi-nang-cap.md mục 4 bước 21.
 */
import { Input } from '../../../../../shared/components/ui/input'
import { formatCurrency, formatNumber } from '../../../../../shared/utils/FormatUtils'
import { AdminLayout } from '../../components/AdminLayout'
import { useAdminReferralReportsFetchData } from '../hooks/useAdminReferralReports.page.fetchData'
import { REFERRAL_COMMISSION_CATEGORY_LABELS, type ReferralCommissionCategory } from '../../types/jgame.types'

export const PAGE_ID = 'jgame-admin-referral-reports'
export const PAGE_FEATURES = [{ label: 'Lọc báo cáo', code: 'btn-loc-bao-cao' }]

export function AdminReferralReportsPage() {
  const { summary, loading, from, setFrom, to, setTo, category, setCategory, partnerId, setPartnerId } = useAdminReferralReportsFetchData()

  return (
    <AdminLayout>
      <div className='mb-6'>
        <h1 className='text-xl font-bold text-white'>Báo cáo tổng hợp Referral</h1>
        <p className='text-sm text-white/60'>Tổng click, đơn, hoa hồng phát sinh theo trạng thái, đã trả, còn nợ đối tác</p>
      </div>

      <div className='mb-6 flex flex-wrap gap-3'>
        <Input type='date' aria-label='Từ ngày' value={from} onChange={e => setFrom(e.target.value)} className='min-w-[150px]' data-qa='dt_tu_ngay' />
        <Input type='date' aria-label='Đến ngày' value={to} onChange={e => setTo(e.target.value)} className='min-w-[150px]' data-qa='dt_den_ngay' />
        <select
          value={category} onChange={e => setCategory(e.target.value as ReferralCommissionCategory | 'all')}
          aria-label='Lọc theo loại'
          className='min-w-[160px] rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
          data-qa='sel_loai'
        >
          <option value='all'>Tất cả loại</option>
          {Object.entries(REFERRAL_COMMISSION_CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <Input placeholder='Lọc theo mã đối tác' value={partnerId} onChange={e => setPartnerId(e.target.value)} className='min-w-[180px]' data-qa='i_doi_tac' />
      </div>

      {loading ? (
        <div className='py-12 text-center text-white/50'>Đang tải...</div>
      ) : !summary ? (
        <div className='py-12 text-center text-white/50'>Không có dữ liệu</div>
      ) : (
        <>
          <div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
            <StatTile label='Tổng click' value={formatNumber(summary.totalClicks)} />
            <StatTile label='Tổng đơn' value={formatNumber(summary.totalOrders)} />
            <StatTile label='Tổng hoa hồng phát sinh' value={formatCurrency(summary.totalCommission)} />
            <StatTile label='Đã thanh toán' value={formatCurrency(summary.totalPaid)} />
            <StatTile label='Còn nợ đối tác' value={formatCurrency(summary.totalOwed)} highlight />
          </div>

          <h2 className='mb-3 text-base font-semibold text-white'>Hoa hồng theo trạng thái đối soát</h2>
          <div className='overflow-x-auto rounded-xl border border-white/10'>
            <table className='w-full text-sm'>
              <thead className='bg-white/5 text-white/60'>
                <tr>
                  <th className='px-3 py-2 text-left font-medium'>Trạng thái</th>
                  <th className='px-3 py-2 text-right font-medium'>Số tiền</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary.totalCommissionByStatus).map(([status, amount]) => (
                  <tr key={status} className='border-t border-white/10 text-white/80'>
                    <td className='px-3 py-2'>{{ pending: 'Chờ đối soát', confirmed: 'Đã xác nhận', reversed: 'Đã đảo' }[status] ?? status}</td>
                    <td className='px-3 py-2 text-right font-medium text-white'>{formatCurrency(amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  )
}

function StatTile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
      <p className={`text-lg font-bold ${highlight ? 'text-amber-300' : 'text-white'}`}>{value}</p>
      <p className='text-xs text-white/50'>{label}</p>
    </div>
  )
}
