/**
 * VerifyPhonePage — Xác thực số điện thoại bằng OTP (SC-16).
 */
import { Smartphone, AlertCircle, Loader2 } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/input'
import { Button } from '../../../../shared/components/ui/button'
import { useVerifyPhone } from '../hooks/useVerifyPhone.page'

export const PAGE_ID = 'jgame-verify-phone'

export function VerifyPhonePage() {
  const { otp, setOtp, submitting, errorMessage, cooldown, resend, handleSubmit } = useVerifyPhone()

  return (
    <div className='flex min-h-[80vh] items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center'>
        <span className='jgame-gradient-brand mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white'>
          <Smartphone className='h-6 w-6' />
        </span>
        <h1 className='mb-1 text-lg font-bold text-white'>Xác thực số điện thoại</h1>
        <p className='mb-5 text-sm text-white/60'>Nhập mã OTP 6 số vừa gửi (xem console log — môi trường demo)</p>

        {errorMessage && (
          <div className='mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-left text-sm text-red-300'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
          </div>
        )}

        <Input
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder='000000'
          className='text-center text-lg tracking-[0.5em]'
          data-qa='i_otp'
        />
        <Button className='jgame-btn-primary mt-4 w-full text-white' size='lg' disabled={submitting || otp.length !== 6} onClick={handleSubmit} data-qa='btn_xac_nhan_otp'>
          {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Xác nhận
        </Button>

        <button
          type='button'
          className='mt-4 text-sm text-white/60 hover:text-white disabled:opacity-40'
          disabled={cooldown > 0}
          onClick={() => void resend()}
          data-qa='btn_gui_lai_otp'
        >
          {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : 'Gửi lại mã OTP'}
        </button>
      </div>
    </div>
  )
}
