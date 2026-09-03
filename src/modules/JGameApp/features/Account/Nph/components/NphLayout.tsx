/**
 * NphLayout — Khung cổng tự phục vụ NPH: sidebar riêng, ĐỘC LẬP hoàn toàn với AdminLayout/PartnerLayout
 * (20260903-nc_quan-tri-nha-phat-hanh-game.md mục 2.2). Hiện tên NPH + trạng thái tài khoản.
 *
 * Ghi chú: Backend (`PublisherAuthController.Login`) đã chặn đăng nhập khi NPH bị Suspended — nghĩa là
 * hễ vào được cổng này thì tài khoản đang Active. BE cũng chưa có endpoint tự kiểm tra trạng thái tức
 * thời trong phiên (JWT NPH không có claim status), nên badge dưới đây luôn hiển thị "Đang hoạt động"
 * — nếu Admin tạm ngưng NPH giữa phiên, thao tác ghi sẽ bị BE từ chối ở lần gọi API kế tiếp (báo lỗi
 * qua thông báo chuẩn), không có cảnh báo trước ở đây (deviation có ghi chú, ngoài khả năng BE hiện tại).
 */
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Gamepad2, LayoutDashboard, ClipboardList, Receipt, Wallet, Settings } from 'lucide-react'
import { cn } from '../../../../shared/components/ui/utils'
import { useNphAuth } from '../contexts/NphAuthContext'

const MENU = [
  { to: '/jgame/nph', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/jgame/nph/nhiem-vu', label: 'Nhiệm vụ của tôi', icon: ClipboardList },
  { to: '/jgame/nph/giao-dich', label: 'Giao dịch', icon: Receipt },
  { to: '/jgame/nph/vi', label: 'Ví & Nạp tiền', icon: Wallet },
  { to: '/jgame/nph/cai-dat', label: 'Cài đặt', icon: Settings },
]

export function NphLayout({ children }: { children: ReactNode }) {
  const { profile } = useNphAuth()

  return (
    <div className='min-h-[calc(100vh-4rem)] bg-[#0b0417]'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row'>
        <aside className='flex-shrink-0 lg:w-56'>
          <div className='mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3'>
            <span className='jgame-gradient-brand flex h-9 w-9 items-center justify-center rounded-lg text-white'><Gamepad2 className='h-4.5 w-4.5' /></span>
            <div className='min-w-0'>
              <p className='text-[11px] uppercase tracking-wide text-white/50'>Nhà phát hành game</p>
              <p className='truncate text-sm font-semibold text-white'>{profile?.name || 'NPH'}</p>
              <p className='mt-0.5 inline-block rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300'>Đang hoạt động</p>
            </div>
          </div>
          <nav className='flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible'>
            {MENU.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) => cn(
                  'flex flex-shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap',
                  isActive ? 'jgame-gradient-brand text-white' : 'text-white/70 hover:bg-white/10'
                )}
              >
                <item.icon className='h-4 w-4' /> {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className='min-w-0 flex-1'>{children}</div>
      </div>
    </div>
  )
}
