/**
 * PartnershipContactDialog — Modal liên hệ hợp tác dùng chung cho khối Cybergame
 * và Nhà phát triển game trên trang Đối tác. Không dùng Radix Dialog (chưa có sẵn
 * trong JGameApp) — modal tự dựng theo đúng phong cách dropdown/backdrop hiện có
 * (xem StorefrontHeader avatar menu).
 */
import { useEffect } from 'react'
import { Loader2, X, CheckCircle2 } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/input'
import { Button } from '../../../../shared/components/ui/button'
import { usePartnershipContact, type PartnershipContactType } from '../hooks/usePartnershipContact.page'

interface PartnershipContactDialogProps {
  open: boolean
  type: PartnershipContactType
  title: string
  description: string
  onClose: () => void
}

export function PartnershipContactDialog({ open, type, title, description, onClose }: PartnershipContactDialogProps) {
  const { name, setName, email, setEmail, message, setMessage, submitting, submitted, handleSubmit, reset } = usePartnershipContact(type)

  useEffect(() => {
    if (!open) reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4' onClick={onClose}>
      <div
        className='w-full max-w-md rounded-2xl border border-white/10 bg-[#1a0d33] p-6 shadow-2xl'
        onClick={e => e.stopPropagation()}
        data-qa={`dialog_partnership_contact_${type}`}
      >
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h3 className='text-lg font-bold text-white'>{title}</h3>
            <p className='mt-1 text-sm text-white/60'>{description}</p>
          </div>
          <button type='button' onClick={onClose} className='rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white' aria-label='Đóng' data-qa='btn_dong_dialog_hop_tac'>
            <X className='h-5 w-5' />
          </button>
        </div>

        {submitted ? (
          <div className='mt-6 flex flex-col items-center gap-3 py-6 text-center'>
            <CheckCircle2 className='h-10 w-10 text-emerald-400' />
            <p className='text-white'>Đã gửi yêu cầu hợp tác!</p>
            <p className='text-sm text-white/60'>JGame sẽ liên hệ lại qua email bạn đã cung cấp trong thời gian sớm nhất.</p>
            <Button className='jgame-btn-primary mt-2 text-white' onClick={onClose} data-qa='btn_dong_sau_gui_hop_tac'>Đóng</Button>
          </div>
        ) : (
          <div className='mt-5 space-y-3'>
            <div className='space-y-1.5'>
              <label htmlFor='partner-name' className='text-sm text-white/70'>Họ tên / Tên quán</label>
              <Input id='partner-name' value={name} onChange={e => setName(e.target.value)} data-qa='i_ten_hop_tac' />
            </div>
            <div className='space-y-1.5'>
              <label htmlFor='partner-email' className='text-sm text-white/70'>Email / Số điện thoại</label>
              <Input id='partner-email' value={email} onChange={e => setEmail(e.target.value)} data-qa='i_email_hop_tac' />
            </div>
            <div className='space-y-1.5'>
              <label htmlFor='partner-message' className='text-sm text-white/70'>Thông tin thêm</label>
              <textarea
                id='partner-message'
                className='invoice-textarea w-full rounded-lg bg-white/5 p-3 text-sm text-white'
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                data-qa='i_noi_dung_hop_tac'
              />
            </div>
            <Button className='jgame-btn-primary w-full text-white' disabled={submitting} onClick={handleSubmit} data-qa='btn_gui_yeu_cau_hop_tac'>
              {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Gửi yêu cầu hợp tác
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
