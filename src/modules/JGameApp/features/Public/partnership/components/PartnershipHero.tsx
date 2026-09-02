/**
 * PartnershipHero — Mở đầu trang Đối tác.
 */
import { Handshake } from 'lucide-react'

export function PartnershipHero() {
  return (
    <div className='mx-auto max-w-3xl px-4 pt-16 text-center sm:px-6'>
      <span className='jgame-gradient-brand mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white'>
        <Handshake className='h-7 w-7' />
      </span>
      <h1 className='text-3xl font-extrabold text-white sm:text-4xl'>
        Hợp tác cùng <span className='jgame-gradient-text'>JGame</span> — Biến mọi khung giờ trống thành doanh thu
      </h1>
      <p className='mx-auto mt-4 max-w-2xl text-white/60'>
        JGame kết nối phòng máy, cộng tác viên tiếp thị và nhà phát triển game với hàng chục nghìn
        game thủ đang hoạt động mỗi ngày. Chọn hình thức hợp tác phù hợp với bạn bên dưới.
      </p>
    </div>
  )
}
