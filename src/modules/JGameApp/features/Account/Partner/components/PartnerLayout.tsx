/**
 * PartnerLayout — Khung Đối tác tiếp thị liên kết: sidebar NavMenu riêng, tách bạch với
 * trải nghiệm mua hàng/kênh người bán/quản trị. Độc lập hoàn toàn — không dùng chung layout.
 */
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Megaphone, LayoutDashboard, Link2, Wallet } from 'lucide-react'
import { cn } from '../../../../shared/components/ui/utils'

const MENU = [
  { to: '/jgame/doi-tac', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/jgame/doi-tac/lien-ket', label: 'Liên kết của tôi', icon: Link2 },
  { to: '/jgame/doi-tac/thanh-toan', label: 'Thanh toán', icon: Wallet },
]

export function PartnerLayout({ referralCode, children }: { referralCode?: string; children: ReactNode }) {
  return (
    <div className='min-h-[calc(100vh-4rem)] bg-[#0b0417]'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row'>
        <aside className='flex-shrink-0 lg:w-56'>
          <div className='mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3'>
            <span className='jgame-gradient-brand flex h-9 w-9 items-center justify-center rounded-lg text-white'><Megaphone className='h-4.5 w-4.5' /></span>
            <div className='min-w-0'>
              <p className='text-[11px] uppercase tracking-wide text-white/50'>Đối tác tiếp thị</p>
              <p className='truncate text-sm font-semibold text-white'>{referralCode || 'Chưa có mã'}</p>
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
