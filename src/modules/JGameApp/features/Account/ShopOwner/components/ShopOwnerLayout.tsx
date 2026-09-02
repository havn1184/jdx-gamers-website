/**
 * ShopOwnerLayout — Khung Chủ Cybergame: sidebar riêng, phong cách dashboard,
 * tách bạch với trải nghiệm mua hàng storefront (URD Giai đoạn 2).
 */
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, LayoutList, RefreshCw, ClipboardList, Wallet, Store, Monitor, CalendarClock } from 'lucide-react'
import { cn } from '../../../../shared/components/ui/utils'

const MENU = [
  { to: '/jgame/chu-cybergame', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/jgame/chu-cybergame/zone-ve', label: 'Zone & Vé', icon: LayoutList },
  { to: '/jgame/chu-cybergame/dong-bo', label: 'Đồng bộ nền tảng', icon: RefreshCw },
  { to: '/jgame/chu-cybergame/may', label: 'Danh sách máy', icon: Monitor },
  { to: '/jgame/chu-cybergame/khung-gio', label: 'Khung giờ', icon: CalendarClock },
  { to: '/jgame/chu-cybergame/don-hang', label: 'Đơn hàng đã bán', icon: ClipboardList },
  { to: '/jgame/chu-cybergame/cong-no', label: 'Công nợ & Thanh toán', icon: Wallet },
]

export function ShopOwnerLayout({ shopName, children }: { shopName?: string; children: ReactNode }) {
  return (
    <div className='min-h-[calc(100vh-4rem)] bg-[#0b0417]'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row'>
        <aside className='flex-shrink-0 lg:w-56'>
          <div className='mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3'>
            <span className='jgame-gradient-brand flex h-9 w-9 items-center justify-center rounded-lg text-white'><Store className='h-4.5 w-4.5' /></span>
            <div className='min-w-0'>
              <p className='text-[11px] uppercase tracking-wide text-white/50'>Chủ Cybergame</p>
              <p className='truncate text-sm font-semibold text-white'>{shopName || 'Gian hàng'}</p>
            </div>
          </div>
          <nav className='flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible'>
            {MENU.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/jgame/chu-cybergame'}
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
