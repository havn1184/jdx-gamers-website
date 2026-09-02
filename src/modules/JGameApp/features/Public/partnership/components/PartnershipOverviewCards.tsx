/**
 * PartnershipOverviewCards — 3 thẻ tổng quan trên trang Đối tác, mỗi thẻ dẫn sang
 * 1 landing page chi tiết riêng cho từng hình thức hợp tác.
 */
import { Link } from 'react-router-dom'
import { ArrowRight, Gamepad2, Link2, Rocket } from 'lucide-react'

const CARDS = [
  {
    to: '/jgame/hop-tac/cybergame',
    icon: Gamepad2,
    badge: 'Đối tác trọng tâm',
    title: 'Chủ phòng Cybergame',
    desc: 'Liên kết bán vé giờ thấp điểm, bán thêm gói/combo cho tập khách hàng mới từ JGame.',
  },
  {
    to: '/jgame/hop-tac/tiep-thi-lien-ket',
    icon: Link2,
    badge: 'Không cần vốn',
    title: 'Tiếp thị liên kết',
    desc: 'Chia sẻ link giới thiệu, nhận hoa hồng minh bạch trên mỗi giao dịch của bạn bè.',
  },
  {
    to: '/jgame/hop-tac/nha-phat-trien-game',
    icon: Rocket,
    badge: 'Người chơi thật',
    title: 'Nhà phát triển game',
    desc: 'Đăng nhiệm vụ trải nghiệm/test game, tiếp cận tập người chơi thật và nhận phản hồi thật.',
  },
] as const

export function PartnershipOverviewCards() {
  return (
    <div className='mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-5 px-4 sm:grid-cols-3 sm:px-6'>
      {CARDS.map(card => (
        <Link
          key={card.to}
          to={card.to}
          className='jgame-card-hover group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6'
          data-qa={`link_hop_tac_${card.to.split('/').pop()}`}
        >
          <span className='jgame-gradient-brand mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white'>
            <card.icon className='h-6 w-6' />
          </span>
          <span className='mb-2 inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300'>
            {card.badge}
          </span>
          <h3 className='text-lg font-bold text-white'>{card.title}</h3>
          <p className='mt-2 flex-1 text-sm text-white/60'>{card.desc}</p>
          <span className='mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white group-hover:gap-2.5'>
            Tìm hiểu chi tiết <ArrowRight className='h-4 w-4 transition-all' />
          </span>
        </Link>
      ))}
    </div>
  )
}
