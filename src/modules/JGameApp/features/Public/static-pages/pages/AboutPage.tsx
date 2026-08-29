/**
 * AboutPage — Giới thiệu (SC-21).
 */
import { Gamepad2, ShieldCheck, Zap, Users } from 'lucide-react'

export const PAGE_ID = 'jgame-about'

const STATS = [
  { label: 'Giao dịch thành công', value: '120,000+' },
  { label: 'Nhà cung cấp thẻ', value: '15+' },
  { label: 'Thời gian giao mã trung bình', value: '< 10 giây' },
  { label: 'Đối tác Referral', value: '300+' },
]

export function AboutPage() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-16 sm:px-6'>
      <div className='text-center'>
        <span className='jgame-gradient-brand mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white'>
          <Gamepad2 className='h-7 w-7' />
        </span>
        <h1 className='text-3xl font-extrabold text-white'>Về <span className='jgame-gradient-text'>JGame</span></h1>
        <p className='mx-auto mt-3 max-w-2xl text-white/60'>
          JGame là nền tảng thương mại điện tử dành cho cộng đồng gamer Việt Nam — bán thẻ game trực tuyến,
          nạp nhanh minh bạch, và đang mở rộng sang vé giờ chơi cybergame cùng kho phụ kiện gaming chính hãng.
        </p>
      </div>

      <div className='mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4'>
        {STATS.map(s => (
          <div key={s.label} className='rounded-xl border border-white/10 bg-white/5 p-4 text-center'>
            <p className='jgame-gradient-text text-xl font-bold'>{s.value}</p>
            <p className='mt-1 text-xs text-white/50'>{s.label}</p>
          </div>
        ))}
      </div>

      <div className='mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3'>
        <div className='rounded-xl border border-white/10 bg-white/5 p-5'>
          <Zap className='jgame-gradient-text mb-2 h-6 w-6' />
          <p className='font-semibold text-white'>Nạp nhanh</p>
          <p className='mt-1 text-sm text-white/60'>Tự động giao mã thẻ trong vài giây sau khi thanh toán thành công.</p>
        </div>
        <div className='rounded-xl border border-white/10 bg-white/5 p-5'>
          <ShieldCheck className='jgame-gradient-text mb-2 h-6 w-6' />
          <p className='font-semibold text-white'>Minh bạch</p>
          <p className='mt-1 text-sm text-white/60'>Mọi giao dịch đều tra cứu được, hoàn tiền tự động nếu có sự cố.</p>
        </div>
        <div className='rounded-xl border border-white/10 bg-white/5 p-5'>
          <Users className='jgame-gradient-text mb-2 h-6 w-6' />
          <p className='font-semibold text-white'>Cộng đồng</p>
          <p className='mt-1 text-sm text-white/60'>Chương trình đối tác Referral chia sẻ hoa hồng minh bạch.</p>
        </div>
      </div>
    </div>
  )
}
