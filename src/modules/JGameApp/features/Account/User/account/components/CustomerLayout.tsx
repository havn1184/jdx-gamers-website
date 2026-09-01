/**
 * CustomerLayout — Khung Tài khoản khách hàng: sidebar NavMenu riêng, tập trung toàn bộ
 * chức năng cá nhân (hồ sơ, bảo mật, lịch sử, nhiệm vụ Kiếm tiền, ví JCoin...).
 * Độc lập hoàn toàn với AdminLayout/ShopOwnerLayout/PartnerLayout — không dùng chung component.
 */
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, UserRound, ShieldCheck, History, Package, ListChecks, Coins, Store, Megaphone,
  Ticket, Star,
} from 'lucide-react'
import { cn } from '../../../../../shared/components/ui/utils'
import { useAuth } from '../../../../../contexts/AuthContext'
import { useMyShop } from '../../../ShopOwner/hooks/useMyShop'
import { useMyAffiliate } from '../../../Partner/hooks/useMyAffiliate'

const BASE_MENU = [
  { to: '/jgame/tai-khoan', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/jgame/ho-so', label: 'Hồ sơ cá nhân', icon: UserRound },
  { to: '/jgame/bao-mat', label: 'Bảo mật', icon: ShieldCheck },
  { to: '/jgame/lich-su-hoat-dong', label: 'Lịch sử hoạt động', icon: History },
  { to: '/jgame/lich-su', label: 'Đơn hàng của tôi', icon: Package },
  { to: '/jgame/ve-da-mua', label: 'Vé đã mua', icon: Ticket },
  { to: '/jgame/danh-gia-cua-toi', label: 'Đánh giá của tôi', icon: Star },
  { to: '/jgame/kiem-tien/nhiem-vu-cua-toi', label: 'Nhiệm vụ của tôi', icon: ListChecks },
  { to: '/jgame/vi', label: 'Ví của tôi', icon: Coins },
]

export function CustomerLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { shop } = useMyShop()
  const { isAffiliate } = useMyAffiliate()

  // Chỉ hiển thị mục "Kênh Người Bán" / "Đối tác tiếp thị" khi user THỰC SỰ thuộc nhóm đó
  // (đăng ký "Trở thành..." nằm ở AccountDashboardPage, không lộ chức năng nhóm khác ở đây)
  const MENU = [
    ...BASE_MENU,
    ...(shop ? [{ to: '/jgame/kenh-nguoi-ban', label: 'Kênh Người Bán', icon: Store }] : []),
    ...(isAffiliate ? [{ to: '/jgame/doi-tac', label: 'Đối tác tiếp thị', icon: Megaphone }] : []),
  ]

  return (
    <div className='min-h-[calc(100vh-4rem)] bg-[#0b0417]'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row'>
        <aside className='flex-shrink-0 lg:w-56'>
          <div className='mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3'>
            <span className='jgame-gradient-brand flex h-9 w-9 items-center justify-center rounded-lg text-white'><LayoutDashboard className='h-4.5 w-4.5' /></span>
            <div className='min-w-0'>
              <p className='text-[11px] uppercase tracking-wide text-white/50'>Tài khoản của tôi</p>
              <p className='truncate text-sm font-semibold text-white'>{user?.name || 'Khách hàng'}</p>
            </div>
          </div>
          <nav className='flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible'>
            {MENU.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/jgame/tai-khoan'}
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
