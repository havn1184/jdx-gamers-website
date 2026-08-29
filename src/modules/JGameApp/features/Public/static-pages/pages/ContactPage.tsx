/**
 * ContactPage — Liên hệ (SC-22).
 */
import { Mail, Phone, MapPin, Loader2 } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/input'
import { Button } from '../../../../shared/components/ui/button'
import { useContactForm } from '../hooks/useContactForm.page'

export const PAGE_ID = 'jgame-contact'

export function ContactPage() {
  const { name, setName, email, setEmail, message, setMessage, submitting, handleSubmit } = useContactForm()

  return (
    <div className='mx-auto max-w-4xl px-4 py-16 sm:px-6'>
      <h1 className='text-center text-3xl font-extrabold text-white'>Liên hệ với chúng tôi</h1>
      <p className='mx-auto mt-2 max-w-lg text-center text-white/60'>Có thắc mắc về đơn hàng, hợp tác đối tác hay góp ý? Gửi cho JGame nhé.</p>

      <div className='mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2'>
        <div className='space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6'>
          <div className='space-y-1.5'>
            <label htmlFor='contact-name' className='text-sm text-white/70'>Họ tên</label>
            <Input id='contact-name' value={name} onChange={e => setName(e.target.value)} data-qa='i_ho_ten' />
          </div>
          <div className='space-y-1.5'>
            <label htmlFor='contact-email' className='text-sm text-white/70'>Email</label>
            <Input id='contact-email' value={email} onChange={e => setEmail(e.target.value)} data-qa='i_email' />
          </div>
          <div className='space-y-1.5'>
            <label htmlFor='contact-message' className='text-sm text-white/70'>Nội dung</label>
            <textarea
              id='contact-message'
              className='invoice-textarea w-full rounded-lg bg-white/5 p-3 text-sm text-white'
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              data-qa='i_noi_dung'
            />
          </div>
          <Button className='jgame-btn-primary w-full text-white' disabled={submitting} onClick={handleSubmit} data-qa='btn_gui_lien_he'>
            {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Gửi liên hệ
          </Button>
        </div>

        <div className='space-y-4 text-white/70'>
          <div className='flex items-start gap-3'>
            <Mail className='mt-0.5 h-5 w-5 flex-shrink-0 jgame-gradient-text' />
            <div><p className='font-medium text-white'>Email</p><p className='text-sm'>support@jgame.vn</p></div>
          </div>
          <div className='flex items-start gap-3'>
            <Phone className='mt-0.5 h-5 w-5 flex-shrink-0 jgame-gradient-text' />
            <div><p className='font-medium text-white'>Hotline</p><p className='text-sm'>1900 6868 (8:00 - 22:00)</p></div>
          </div>
          <div className='flex items-start gap-3'>
            <MapPin className='mt-0.5 h-5 w-5 flex-shrink-0 jgame-gradient-text' />
            <div><p className='font-medium text-white'>Văn phòng</p><p className='text-sm'>Tầng 5, Toà nhà JGame, Quận 1, TP. Hồ Chí Minh</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}
