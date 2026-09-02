/**
 * AdminLayout — Khung Quản trị JGame: sidebar riêng, phong cách dashboard tối,
 * tách bạch với trải nghiệm mua hàng/Chủ Cybergame (chuyển từ AdminApp về JGameApp).
 */
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Gamepad2, Headphones, Building2, ShoppingCart, Users, Ticket, BarChart2, ShieldCheck, Banknote, Percent, FileBarChart } from 'lucide-react'
import { cn } from '../../../../shared/components/ui/utils'

const MENU = [
  { to: '/jgame/quan-tri', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/jgame/quan-tri/danh-muc-the', label: 'Danh mục thẻ', icon: Gamepad2 },
  { to: '/jgame/quan-tri/phu-kien', label: 'Phụ kiện', icon: Headphones },
  { to: '/jgame/quan-tri/nha-cung-cap', label: 'Nhà cung cấp', icon: Building2 },
  { to: '/jgame/quan-tri/giao-dich', label: 'Giao dịch', icon: ShoppingCart },
  { to: '/jgame/quan-tri/doi-tac-referral', label: 'Đối tác Referral', icon: Users },
  { to: '/jgame/quan-tri/doi-tac-referral/thanh-toan', label: 'Duyệt thanh toán', icon: Banknote },
  { to: '/jgame/quan-tri/doi-tac-referral/ty-le-hoa-hong', label: 'Cấu hình hoa hồng', icon: Percent },
  { to: '/jgame/quan-tri/doi-tac-referral/bao-cao', label: 'Báo cáo Referral', icon: FileBarChart },
  { to: '/jgame/quan-tri/khuyen-mai', label: 'Khuyến mãi', icon: Ticket },
  { to: '/jgame/quan-tri/bao-cao', label: 'Báo cáo', icon: BarChart2 },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className='min-h-[calc(100vh-4rem)] bg-[#0b0417]'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row'>
        <aside className='flex-shrink-0 lg:w-56'>
          <div className='mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3'>
            <span className='jgame-gradient-brand flex h-9 w-9 items-center justify-center rounded-lg text-white'><ShieldCheck className='h-4.5 w-4.5' /></span>
            <div className='min-w-0'>
              <p className='text-[11px] uppercase tracking-wide text-white/50'>Quản trị hệ thống</p>
              <p className='truncate text-sm font-semibold text-white'>JGame Store</p>
            </div>
          </div>
          <nav className='flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible'>
            {MENU.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/jgame/quan-tri'}
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
