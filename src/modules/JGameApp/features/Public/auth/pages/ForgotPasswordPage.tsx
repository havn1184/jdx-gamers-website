/**
 * ForgotPasswordPage — Quên mật khẩu (SC-13).
 */
import { Link } from 'react-router-dom'
import { KeyRound, AlertCircle, Loader2, MailCheck } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/input'
import { Button } from '../../../../shared/components/ui/button'
import { useForgotPassword } from '../hooks/useForgotPassword.page'

export const PAGE_ID = 'jgame-forgot-password'

export function ForgotPasswordPage() {
  const { phone, setPhone, submitting, sent, errorMessage, handleSubmit } = useForgotPassword()

  return (
    <div className='flex min-h-[80vh] items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center'>
        {sent ? (
          <>
            <MailCheck className='mx-auto mb-4 h-12 w-12 text-emerald-400' />
            <h1 className='text-lg font-bold text-white'>Đã gửi hướng dẫn đặt lại mật khẩu</h1>
            <p className='mt-2 text-sm text-white/60'>Nếu tài khoản tồn tại, vui lòng kiểm tra tin nhắn SMS để tiếp tục.</p>
          </>
        ) : (
          <>
            <span className='jgame-gradient-brand mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white'>
              <KeyRound className='h-6 w-6' />
            </span>
            <h1 className='mb-1 text-lg font-bold text-white'>Quên mật khẩu?</h1>
            <p className='mb-5 text-sm text-white/60'>Nhập số điện thoại đã đăng ký</p>

            {errorMessage && (
              <div className='mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-left text-sm text-red-300'>
                <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
              </div>
            )}

            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder='0912345678' inputMode='tel' data-qa='i_sdt' />
            <Button className='jgame-btn-primary mt-4 w-full text-white' size='lg' disabled={submitting} onClick={handleSubmit} data-qa='btn_gui_yeu_cau'>
              {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Gửi yêu cầu
            </Button>
          </>
        )}

        <p className='mt-6 text-sm text-white/60'>
          <Link to='/jgame/dang-nhap' className='jgame-gradient-text font-semibold'>Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}
