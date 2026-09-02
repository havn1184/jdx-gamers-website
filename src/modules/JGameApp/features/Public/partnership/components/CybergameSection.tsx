/**
 * CybergameSection — Nội dung hợp tác Chủ phòng Cybergame (trọng tâm trang Đối
 * tác): phân tích kinh tế + luồng tích hợp + luồng người chơi, kèm game 2D minh hoạ.
 */
import { useState } from 'react'
import {
  TrendingUp, Users, ShoppingBag, Gauge, Gift, Tag, CalendarClock, Bell,
  ClipboardList, KeyRound, Wrench, Monitor, Gamepad2, Wallet, type LucideIcon,
} from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { PartnershipStoryGame } from '../game/PartnershipStoryGame'
import { ACT2_INTEGRATION } from '../game/script'
import { PartnershipContactDialog } from './PartnershipContactDialog'

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Doanh thu mới từ giờ chết',
    desc: 'JGame đưa vé giờ thấp điểm lên "Chợ vé" cho tập khách hàng sẵn có, lấp đầy công suất trống mà không tốn thêm chi phí vận hành cận biên.',
  },
  {
    icon: Users,
    title: 'Khách hàng mới, không tốn phí marketing',
    desc: 'Tiếp cận trực tiếp cộng đồng gamer đang nạp thẻ/mua phụ kiện trên JGame — không trả trước một đồng quảng cáo nào, chỉ chia sẻ doanh thu trên vé bán được.',
  },
  {
    icon: ShoppingBag,
    title: 'Tăng giá trị đơn hàng (upsell)',
    desc: 'Bán thêm gói combo (giờ chơi + nước uống, giờ chơi nhóm, gói theo tuần...) ngay trên gian hàng JGame của quán.',
  },
  {
    icon: Gauge,
    title: 'Vận hành nhẹ, dữ liệu minh bạch',
    desc: 'Đồng bộ máy trống/bận qua hệ thống quản lý sẵn có, không cần đổi phần mềm. Có dashboard riêng theo dõi doanh thu, lượt khách, giờ đông/vắng.',
  },
  {
    icon: Bell,
    title: 'Remarketing tới cộng đồng JGame',
    desc: 'Gửi lại ưu đãi, thông báo giờ vàng tới đúng những người chơi đã từng ghé quán qua JGame — mời khách quay lại mà không cần tự chạy quảng cáo.',
  },
]

const INTEGRATION_ICONS: Record<string, LucideIcon> = {
  'clipboard-list': ClipboardList,
  'key-round': KeyRound,
  wrench: Wrench,
  monitor: Monitor,
  'gamepad-2': Gamepad2,
  wallet: Wallet,
}

const PLAYER_FLOWS = [
  { icon: Gift, title: 'Săn vé 0 đồng', desc: 'Người chơi hoàn thành nhiệm vụ/mini-game để nhận vé giờ thấp điểm miễn phí — quán lấp đầy giờ trống và có cơ hội biến khách dùng thử thành khách quen.' },
  { icon: Tag, title: 'Mua gói khuyến mãi của quán', desc: 'Quán tự tạo combo/gói giờ chơi giá ưu đãi, bán trực tiếp cho tập khách JGame, thu tiền ngay mà không cần giảm giá đại trà cho khách cũ.' },
  { icon: CalendarClock, title: 'Đặt vé giữ chỗ trước giờ chơi', desc: 'Người chơi đặt trước khung giờ và thanh toán online — quán chủ động biết trước lượng khách để sắp xếp máy, nhân sự.' },
]

export function CybergameSection() {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <section className='mx-auto max-w-5xl px-4 py-16 sm:px-6' id='cybergame'>
      <div className='mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300'>
        Đối tác trọng tâm
      </div>
      <h2 className='text-2xl font-extrabold text-white sm:text-3xl'>Chủ phòng Cybergame</h2>
      <p className='mt-3 max-w-3xl text-white/60'>
        Chi phí mặt bằng, nhân sự, điện nước của một phòng máy vẫn chạy đều 24/7 — bất kể máy có khách hay
        không. Với đa số cybergame, khung giờ hành chính trong tuần chỉ đạt 20–40% công suất, nghĩa là phần
        lớn "hàng tồn kho" (giờ máy) đang bị lãng phí mỗi ngày. Liên kết với JGame để bán vé giờ thấp điểm và
        biến khoảng thời gian đó thành nguồn lợi nhuận mới.
      </p>

      <div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {BENEFITS.map(b => (
          <div key={b.title} className='rounded-xl border border-white/10 bg-white/5 p-5'>
            <b.icon className='jgame-gradient-text mb-2 h-6 w-6' />
            <p className='font-semibold text-white'>{b.title}</p>
            <p className='mt-1 text-sm text-white/60'>{b.desc}</p>
          </div>
        ))}
      </div>
      <p className='mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200'>
        Cam kết rủi ro thấp: mô hình chia sẻ doanh thu theo giao dịch thành công — quán không có khách JGame
        giới thiệu thì không phát sinh chi phí.
      </p>

      <div className='mt-10'>
        <h3 className='text-lg font-bold text-white'>Xem cách JGame vận hành cùng phòng máy của bạn</h3>
        <p className='mt-1 text-sm text-white/60'>Minh hoạ tự động phát — lợi ích hợp tác, luồng tích hợp hệ thống và luồng người chơi đến quán.</p>
        <div className='mt-4'>
          <PartnershipStoryGame
            sceneKey='cybergame-story'
            loadScene={() => import('../game/scenes/CybergameStoryScene').then(m => m.CybergameStoryScene)}
          />
        </div>
      </div>

      <div className='mt-10'>
        <h3 className='text-lg font-bold text-white'>Luồng tích hợp hệ thống — 3 giai đoạn</h3>
        <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
            <p className='text-xs font-semibold uppercase tracking-wide text-white/50'>Giai đoạn 1 — Kết nối tài khoản</p>
            <div className='mt-3 space-y-2'>
              {ACT2_INTEGRATION.phase1.steps.map(s => {
                const Icon = INTEGRATION_ICONS[s.icon]
                return (
                  <div key={s.label} className='flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5'>
                    <Icon className='h-4 w-4 text-cyan-300' /><span className='text-sm text-white/80'>{s.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
            <p className='text-xs font-semibold uppercase tracking-wide text-white/50'>Giai đoạn 2 — Vận hành song song</p>
            <div className='mt-3 space-y-2'>
              {ACT2_INTEGRATION.phase2.lanes.map(l => {
                const Icon = INTEGRATION_ICONS[l.icon]
                return (
                  <div key={l.label} className='flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5'>
                    <Icon className='h-4 w-4 text-cyan-300' /><span className='text-sm text-white/80'>{l.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
            <p className='text-xs font-semibold uppercase tracking-wide text-white/50'>Giai đoạn 3 — Đối soát</p>
            <div className='mt-3 space-y-2'>
              {ACT2_INTEGRATION.phase3.steps.map(s => {
                const Icon = INTEGRATION_ICONS[s.icon]
                return (
                  <div key={s.label} className='flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5'>
                    <Icon className='h-4 w-4 text-cyan-300' /><span className='text-sm text-white/80'>{s.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className='mt-10'>
        <h3 className='text-lg font-bold text-white'>3 hình thức người chơi đến với quán</h3>
        <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3'>
          {PLAYER_FLOWS.map(f => (
            <div key={f.title} className='rounded-xl border border-white/10 bg-white/5 p-5'>
              <f.icon className='jgame-gradient-text mb-2 h-6 w-6' />
              <p className='font-semibold text-white'>{f.title}</p>
              <p className='mt-1 text-sm text-white/60'>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className='mt-10 flex justify-center'>
        <Button size='lg' className='jgame-btn-primary text-white' onClick={() => setContactOpen(true)} data-qa='btn_dang_ky_doi_tac_cybergame'>
          Đăng ký làm Đối tác Cybergame
        </Button>
      </div>

      <PartnershipContactDialog
        open={contactOpen}
        type='cybergame'
        title='Đăng ký làm Đối tác Cybergame'
        description='Để lại thông tin quán, đội ngũ JGame sẽ liên hệ tư vấn tích hợp trong 24h.'
        onClose={() => setContactOpen(false)}
      />
    </section>
  )
}
