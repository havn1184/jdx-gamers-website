/**
 * AffiliateSection — Nội dung hợp tác Tiếp thị liên kết, trỏ CTA sang luồng
 * đăng ký affiliate đã có sẵn (`/jgame/doi-tac/dang-ky`).
 */
import { useNavigate } from 'react-router-dom'
import { Link2, Percent, LineChart } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { PartnershipStoryGame } from '../game/PartnershipStoryGame'

const POINTS = [
  { icon: Link2, title: 'Không cần vốn, không cần kho hàng', desc: 'Chỉ cần chia sẻ đường link giới thiệu của bạn — không nhập hàng, không tồn kho.' },
  { icon: Percent, title: 'Hoa hồng minh bạch trên mỗi giao dịch', desc: 'Nhận hoa hồng khi người được giới thiệu nạp thẻ, mua vé chơi game hoặc mua phụ kiện.' },
  { icon: LineChart, title: 'Theo dõi real-time', desc: 'Xem số liệu lượt click, đơn hàng, hoa hồng ngay trên Kênh đối tác cá nhân.' },
]

export function AffiliateSection() {
  const navigate = useNavigate()
  return (
    <section className='mx-auto max-w-5xl px-4 py-14 sm:px-6' id='affiliate'>
      <h2 className='text-2xl font-extrabold text-white'>Đối tác Tiếp thị liên kết</h2>
      <p className='mt-3 max-w-3xl text-white/60'>
        Chia sẻ đường link giới thiệu — kiếm hoa hồng minh bạch trên mỗi giao dịch nạp thẻ, mua vé, mua
        phụ kiện của người bạn giới thiệu. Theo dõi hoa hồng real-time trên Kênh đối tác.
      </p>
      <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3'>
        {POINTS.map(p => (
          <div key={p.title} className='rounded-xl border border-white/10 bg-white/5 p-5'>
            <p.icon className='jgame-gradient-text mb-2 h-6 w-6' />
            <p className='font-semibold text-white'>{p.title}</p>
            <p className='mt-1 text-sm text-white/60'>{p.desc}</p>
          </div>
        ))}
      </div>

      <div className='mt-10'>
        <h3 className='text-lg font-bold text-white'>Xem luồng hoa hồng hoạt động thế nào</h3>
        <p className='mt-1 text-sm text-white/60'>Minh hoạ tự động phát — chia sẻ link, bạn bè mua hàng, hoa hồng cộng dồn về ví.</p>
        <div className='mt-4'>
          <PartnershipStoryGame
            sceneKey='affiliate-story'
            loadScene={() => import('../game/scenes/AffiliateStoryScene').then(m => m.AffiliateStoryScene)}
          />
        </div>
      </div>

      <div className='mt-8 flex justify-center'>
        <Button size='lg' className='jgame-btn-primary text-white' onClick={() => navigate('/jgame/doi-tac/dang-ky')} data-qa='btn_tro_thanh_ctv'>
          Trở thành Cộng tác viên
        </Button>
      </div>
    </section>
  )
}
