/**
 * GameDevSection — Nội dung hợp tác Nhà phát triển game (đăng nhiệm vụ để tiếp
 * cận tập người chơi thật của JGame). Chưa có luồng tự đăng ký nên CTA mở form
 * liên hệ chung.
 */
import { useState } from 'react'
import { Users2, Wallet, MessageSquareText } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { PartnershipContactDialog } from './PartnershipContactDialog'
import { PartnershipStoryGame } from '../game/PartnershipStoryGame'

const POINTS = [
  { icon: Users2, title: 'Người chơi thật, không phải bot', desc: 'Hàng nghìn game thủ đang hoạt động mỗi ngày trên JGame sẵn sàng trải nghiệm và đánh giá game của bạn.' },
  { icon: Wallet, title: 'Trả thưởng theo nhiệm vụ hoàn thành', desc: 'Mô hình pay-per-action — chỉ trả thưởng khi người chơi hoàn thành đúng nhiệm vụ, kiểm soát ngân sách rõ ràng.' },
  { icon: MessageSquareText, title: 'Phản hồi thật trước khi ra mắt', desc: 'Thu thập đánh giá, phát hiện lỗi từ người chơi thật trước khi phát hành chính thức.' },
]

export function GameDevSection() {
  const [contactOpen, setContactOpen] = useState(false)
  return (
    <section className='mx-auto max-w-5xl px-4 py-14 sm:px-6' id='game-dev'>
      <h2 className='text-2xl font-extrabold text-white'>Đối tác Nhà phát triển game</h2>
      <p className='mt-3 max-w-3xl text-white/60'>
        Đang phát triển một tựa game mới và cần người chơi thật để test tính năng, đánh giá trải nghiệm,
        hoặc tạo lượt tải đầu tiên? Đăng "nhiệm vụ" lên JGame — hàng nghìn game thủ đang kiếm JCoin mỗi ngày
        sẽ chủ động trải nghiệm game của bạn và để lại phản hồi thật.
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
        <h3 className='text-lg font-bold text-white'>Xem luồng nhiệm vụ hoạt động thế nào</h3>
        <p className='mt-1 text-sm text-white/60'>Minh hoạ tự động phát — đăng nhiệm vụ, người chơi thật trải nghiệm, nhận JCoin và phản hồi thật.</p>
        <div className='mt-4'>
          <PartnershipStoryGame
            sceneKey='gamedev-story'
            loadScene={() => import('../game/scenes/GameDevStoryScene').then(m => m.GameDevStoryScene)}
          />
        </div>
      </div>

      <div className='mt-8 flex justify-center'>
        <Button size='lg' className='jgame-btn-primary text-white' onClick={() => setContactOpen(true)} data-qa='btn_lien_he_hop_tac_nhiem_vu'>
          Liên hệ hợp tác nhiệm vụ
        </Button>
      </div>

      <PartnershipContactDialog
        open={contactOpen}
        type='game-dev'
        title='Liên hệ hợp tác Nhà phát triển game'
        description='Cho JGame biết về game của bạn và mục tiêu nhiệm vụ mong muốn, đội ngũ sẽ tư vấn trong 24h.'
        onClose={() => setContactOpen(false)}
      />
    </section>
  )
}
