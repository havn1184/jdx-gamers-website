/**
 * ActivityHistoryPage — Lịch sử đăng nhập & hoạt động bảo mật (SC-19).
 */
import { Loader2, Inbox } from 'lucide-react'
import { CustomerLayout } from '../components/CustomerLayout'
import { useActivityHistoryFetchData } from '../hooks/useActivityHistory.page.fetchData'
import { formatDateTime } from '../../../../../shared/utils/FormatUtils'
import type { LoginActivityAction } from '../types/account.types'

export const PAGE_ID = 'jgame-activity-history'

const ACTION_LABEL: Record<LoginActivityAction, string> = {
  LOGIN: 'Đăng nhập',
  LOGOUT: 'Đăng xuất',
  REGISTER: 'Đăng ký tài khoản',
  CHANGE_PASSWORD: 'Đổi mật khẩu',
  RESET_PASSWORD: 'Đặt lại mật khẩu',
  ENABLE_2FA: 'Bật xác thực 2 lớp',
  DISABLE_2FA: 'Tắt xác thực 2 lớp',
  VERIFY_EMAIL: 'Xác thực email',
  VERIFY_PHONE: 'Xác thực số điện thoại',
  UPDATE_PROFILE: 'Cập nhật hồ sơ',
}

export function ActivityHistoryPage() {
  const { items, loading } = useActivityHistoryFetchData()

  return (
    <CustomerLayout>
      <h1 className='mb-6 text-xl font-bold text-white'>Lịch sử đăng nhập & hoạt động</h1>

      {loading && <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>}

      {!loading && items.length === 0 && (
        <div className='flex flex-col items-center gap-2 py-16 text-white/60'><Inbox className='h-8 w-8' /> Chưa có hoạt động nào</div>
      )}

      {!loading && items.length > 0 && (
        <div className='overflow-x-auto rounded-xl border border-white/10'>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Thời gian</th>
                <th className='px-3 py-2 text-left font-medium'>Hành động</th>
                <th className='px-3 py-2 text-left font-medium'>Thiết bị</th>
                <th className='px-3 py-2 text-left font-medium'>IP</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className='border-t border-white/10 text-white/80'>
                  <td className='px-3 py-2 text-white/50'>{formatDateTime(item.createdAt)}</td>
                  <td className='px-3 py-2'>{ACTION_LABEL[item.action]}</td>
                  <td className='max-w-[280px] truncate px-3 py-2 text-white/50' title={item.deviceInfo}>{item.deviceInfo}</td>
                  <td className='px-3 py-2 text-white/50'>{item.ipMock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CustomerLayout>
  )
}
