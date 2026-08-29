/**
 * StorefrontFooter — Footer công khai của JGame Store.
 */
import { Link } from 'react-router-dom'
import { Gamepad2 } from 'lucide-react'

export function StorefrontFooter() {
  return (
    <footer className='mt-16 border-t border-white/10 bg-[#0f0620] text-white/60'>
      <div className='mx-auto max-w-7xl px-4 py-10 sm:px-6'>
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-3'>
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <span className='jgame-gradient-brand flex h-8 w-8 items-center justify-center rounded-lg text-white'>
                <Gamepad2 className='h-4 w-4' />
              </span>
              <span className='text-base font-bold text-white'>JGame Store</span>
            </div>
            <p className='text-sm leading-relaxed'>
              Nền tảng bán thẻ game trực tuyến — nạp nhanh, minh bạch, tự động giao mã sau khi thanh toán.
            </p>
          </div>
          <div>
            <h4 className='text-sm font-semibold text-white mb-3'>Về JGame</h4>
            <ul className='space-y-2 text-sm'>
              <li><Link to='/jgame/gioi-thieu' className='hover:text-white'>Giới thiệu</Link></li>
              <li><Link to='/jgame/dieu-khoan-su-dung' className='hover:text-white'>Điều khoản sử dụng</Link></li>
              <li><Link to='/jgame/chinh-sach-bao-mat' className='hover:text-white'>Chính sách bảo mật</Link></li>
              <li><Link to='/jgame/doi-tac' className='hover:text-white'>Chương trình đối tác</Link></li>
            </ul>
          </div>
          <div>
            <h4 className='text-sm font-semibold text-white mb-3'>Hỗ trợ</h4>
            <ul className='space-y-2 text-sm'>
              <li><Link to='/jgame/lien-he' className='hover:text-white'>Liên hệ CSKH</Link></li>
              <li><Link to='/jgame/lich-su' className='hover:text-white'>Tra cứu đơn hàng</Link></li>
            </ul>
          </div>
        </div>
        <div className='mt-8 border-t border-white/10 pt-6 text-center text-xs'>
          © {new Date().getFullYear()} JGame Store — Nền tảng thương mại điện tử gaming.
        </div>
      </div>
    </footer>
  )
}
