/**
 * StorefrontHeader — Header công khai của JGame Store (không phải TopMenu nội bộ).
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Gamepad2, Menu, X, History, Users, LogOut, UserCircle2, ShoppingCart,
  UserRound, ShieldCheck, ChevronDown, Package, Store, Megaphone, Coins, LayoutDashboard,
} from 'lucide-react'
import { Button } from '../shared/components/ui/button'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWalletBalance } from '../features/Account/User/wallet/hooks/useWalletBalance'
import { useMyShop } from '../features/Account/ShopOwner/hooks/useMyShop'
import { useMyAffiliate } from '../features/Account/Partner/hooks/useMyAffiliate'
import { formatNumber } from '../shared/utils/FormatUtils'

const NAV_ITEMS: { label: string; to: string; soon?: boolean }[] = [
  { label: 'Trang chủ', to: '/jgame' },
  { label: 'Nạp thẻ', to: '/jgame/nap-the' },
  { label: 'Chợ vé', to: '/jgame/cho-ve' },
  { label: 'Phụ kiện', to: '/jgame/phu-kien' },
  { label: 'Kiếm tiền', to: '/jgame/kiem-tien' },
  { label: 'Giới thiệu', to: '/jgame/gioi-thieu' },
  { label: 'Liên hệ', to: '/jgame/lien-he' },
]

export function StorefrontHeader() {
  const { isAuthenticated, user, logout } = useAuth()
  const { totalQuantity } = useCart()
  const { balance: wallet } = useWalletBalance()
  const { shop, refetch: refetchShop } = useMyShop()
  const { isAffiliate, refetch: refetchAffiliate } = useMyAffiliate()
  const isShopOwner = Boolean(shop)
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)

  // Header được mount 1 lần cho cả session (kể cả trước khi đăng nhập) — phải refetch
  // trạng thái Kênh Người Bán/Đối tác mỗi khi tài khoản đăng nhập thay đổi, tránh hiển thị
  // nhầm menu của tài khoản trước đó (đăng nhập demo khác nhau trong cùng phiên).
  useEffect(() => {
    void refetchShop()
    void refetchAffiliate()
  }, [user?.id, refetchShop, refetchAffiliate])

  const goTo = (path: string) => { setAvatarOpen(false); navigate(path) }

  return (
    <header className='sticky top-0 z-40 border-b border-white/10 bg-[#150829]/95 backdrop-blur supports-[backdrop-filter]:bg-[#150829]/80'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6'>
        <Link to='/jgame' className='flex items-center gap-2 flex-shrink-0' data-qa='btn_ve_trang_chu'>
          <span className='jgame-gradient-brand flex h-9 w-9 items-center justify-center rounded-xl text-white'>
            <Gamepad2 className='h-5 w-5' />
          </span>
          <span className='text-lg font-extrabold tracking-tight text-white'>
            J<span className='jgame-gradient-text'>Game</span>
          </span>
        </Link>

        <nav className='hidden md:flex items-center gap-1'>
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className='relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white'
              data-qa={`btn_nav_${item.to.replace(/\W+/g, '_')}`}
            >
              {item.label}
              {item.soon && (
                <span className='jgame-badge-soon rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none'>SỚM</span>
              )}
            </Link>
          ))}
          {isAuthenticated && isAffiliate && (
            <Link to='/jgame/doi-tac' className='flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white' data-qa='btn_nav_doi_tac'>
              <Users className='h-4 w-4' /> Đối tác
            </Link>
          )}
        </nav>

        <div className='hidden md:flex items-center gap-2'>
          {isAuthenticated && (
            <Link to='/jgame/vi' className='flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/20' data-qa='btn_vi_jcoin_header'>
              <Coins className='h-4 w-4' /> {formatNumber(wallet.jcoinBalance)}
            </Link>
          )}
          <Link to='/jgame/gio-hang' className='relative rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white' data-qa='btn_gio_hang'>
            <ShoppingCart className='h-5 w-5' />
            {totalQuantity > 0 && (
              <span className='jgame-gradient-brand absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white'>
                {totalQuantity}
              </span>
            )}
          </Link>

          {isAuthenticated && user ? (
            <div className='relative'>
              <button
                type='button'
                className='flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10'
                onClick={() => setAvatarOpen(v => !v)}
                data-qa='btn_avatar_menu'
              >
                <span className='jgame-gradient-brand flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white'>
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className='max-w-[100px] truncate'>{user.name}</span>
                <ChevronDown className='h-3.5 w-3.5' />
              </button>

              {avatarOpen && (
                <div className='absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-[#1a0d33] py-1.5 shadow-xl'>
                  <button type='button' className='flex w-full items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10' onClick={() => goTo('/jgame/tai-khoan')} data-qa='btn_tai_khoan_cua_toi'>
                    <LayoutDashboard className='h-4 w-4' /> Tài khoản của tôi
                  </button>
                  <div className='my-1 border-t border-white/10' />
                  <button type='button' className='flex w-full items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10' onClick={() => goTo('/jgame/ho-so')}>
                    <UserRound className='h-4 w-4' /> Hồ sơ cá nhân
                  </button>
                  <button type='button' className='flex w-full items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10' onClick={() => goTo('/jgame/bao-mat')}>
                    <ShieldCheck className='h-4 w-4' /> Bảo mật
                  </button>
                  <button type='button' className='flex w-full items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10' onClick={() => goTo('/jgame/lich-su-hoat-dong')}>
                    <History className='h-4 w-4' /> Lịch sử hoạt động
                  </button>
                  <button type='button' className='flex w-full items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10' onClick={() => goTo('/jgame/lich-su')}>
                    <Package className='h-4 w-4' /> Đơn hàng của tôi
                  </button>
                  {isShopOwner && (
                    <button type='button' className='flex w-full items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10' onClick={() => goTo('/jgame/kenh-nguoi-ban')} data-qa='btn_kenh_nguoi_ban'>
                      <Store className='h-4 w-4' /> Kênh người bán
                    </button>
                  )}
                  {isAffiliate && (
                    <button type='button' className='flex w-full items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10' onClick={() => goTo('/jgame/doi-tac')} data-qa='btn_kenh_doi_tac'>
                      <Megaphone className='h-4 w-4' /> Kênh đối tác
                    </button>
                  )}
                  <button type='button' className='flex w-full items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10' onClick={() => goTo('/jgame/kiem-tien/nhiem-vu-cua-toi')} data-qa='btn_nhiem_vu_cua_toi_header'>
                    <Coins className='h-4 w-4' /> Nhiệm vụ của tôi
                  </button>
                  {user.role === 'admin' && (
                    <button type='button' className='flex w-full items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10' onClick={() => goTo('/jgame/quan-tri')} data-qa='btn_quan_tri_he_thong'>
                      <ShieldCheck className='h-4 w-4' /> Quản trị hệ thống
                    </button>
                  )}
                  <div className='my-1 border-t border-white/10' />
                  <button type='button' className='flex w-full items-center gap-2 px-3 py-2 text-sm text-red-300 hover:bg-white/10' onClick={() => { setAvatarOpen(false); logout() }} data-qa='btn_dang_xuat'>
                    <LogOut className='h-4 w-4' /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              size='sm'
              className='jgame-btn-primary text-white'
              onClick={() => navigate('/jgame/dang-nhap')}
              data-qa='btn_dang_nhap'
            >
              <UserCircle2 className='h-4 w-4 mr-1.5' /> Đăng nhập
            </Button>
          )}
        </div>

        <div className='flex items-center gap-1 md:hidden'>
          <Link to='/jgame/gio-hang' className='relative rounded-lg p-2 text-white' data-qa='btn_gio_hang_mobile'>
            <ShoppingCart className='h-5 w-5' />
            {totalQuantity > 0 && (
              <span className='jgame-gradient-brand absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white'>
                {totalQuantity}
              </span>
            )}
          </Link>
          <button
            type='button'
            className='text-white p-2'
            onClick={() => setMobileOpen(v => !v)}
            data-qa='btn_menu_mobile'
            aria-label='Mở menu'
          >
            {mobileOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className='md:hidden border-t border-white/10 bg-[#150829] px-4 py-3 space-y-1'>
          {NAV_ITEMS.map(item => (
            <Link key={item.to} to={item.to} className='block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10' onClick={() => setMobileOpen(false)}>
              {item.label}{item.soon ? ' (Sắp ra mắt)' : ''}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to='/jgame/tai-khoan' className='block rounded-lg px-3 py-2 text-sm font-semibold text-white' onClick={() => setMobileOpen(false)}>Tài khoản của tôi</Link>
              {isAffiliate && (
                <Link to='/jgame/doi-tac' className='block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10' onClick={() => setMobileOpen(false)}>Đối tác</Link>
              )}
              <Link to='/jgame/lich-su' className='block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10' onClick={() => setMobileOpen(false)}>Đơn hàng của tôi</Link>
              {isShopOwner && (
                <Link to='/jgame/kenh-nguoi-ban' className='block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10' onClick={() => setMobileOpen(false)}>Kênh người bán</Link>
              )}
              <Link to='/jgame/kiem-tien/nhiem-vu-cua-toi' className='block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10' onClick={() => setMobileOpen(false)}>Nhiệm vụ của tôi</Link>
              <Link to='/jgame/vi' className='block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10' onClick={() => setMobileOpen(false)}>Ví của tôi ({formatNumber(wallet.jcoinBalance)} JCoin)</Link>
              <Link to='/jgame/ho-so' className='block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10' onClick={() => setMobileOpen(false)}>Hồ sơ cá nhân</Link>
              <Link to='/jgame/bao-mat' className='block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10' onClick={() => setMobileOpen(false)}>Bảo mật</Link>
              <Link to='/jgame/lich-su-hoat-dong' className='block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10' onClick={() => setMobileOpen(false)}>Lịch sử hoạt động</Link>
              {user?.role === 'admin' && (
                <Link to='/jgame/quan-tri' className='block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10' onClick={() => setMobileOpen(false)}>Quản trị hệ thống</Link>
              )}
              <button type='button' className='block w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10' onClick={logout}>Đăng xuất</button>
            </>
          ) : (
            <button type='button' className='block w-full text-left rounded-lg px-3 py-2 text-sm font-semibold text-white jgame-gradient-brand' onClick={() => navigate('/jgame/dang-nhap')}>
              Đăng nhập
            </button>
          )}
        </div>
      )}
    </header>
  )
}
