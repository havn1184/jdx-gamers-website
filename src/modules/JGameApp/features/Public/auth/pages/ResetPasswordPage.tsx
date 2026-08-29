/**
 * ResetPasswordPage — Đặt lại mật khẩu (SC-14).
 */
import { KeyRound, AlertCircle, Loader2 } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/input'
import { Button } from '../../../../shared/components/ui/button'
import { useResetPassword } from '../hooks/useResetPassword.page'

export const PAGE_ID = 'jgame-reset-password'

export function ResetPasswordPage() {
  const { token, newPassword, setNewPassword, confirmPassword, setConfirmPassword, submitting, errorMessage, handleSubmit } = useResetPassword()

  return (
    <div className='flex min-h-[80vh] items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8'>
        <div className='mb-6 flex flex-col items-center text-center'>
          <span className='jgame-gradient-brand mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-white'>
            <KeyRound className='h-6 w-6' />
          </span>
          <h1 className='text-lg font-bold text-white'>Đặt lại mật khẩu</h1>
        </div>

        {!token && (
          <div className='mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' /> Đường dẫn không hợp lệ — thiếu mã xác nhận
          </div>
        )}
        {errorMessage && (
          <div className='mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
          </div>
        )}

        <div className='space-y-4'>
          <div className='space-y-1.5'>
            <label className='text-sm text-white/70'>Mật khẩu mới</label>
            <Input type='password' value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder='Tối thiểu 8 ký tự' data-qa='i_mat_khau_moi' />
          </div>
          <div className='space-y-1.5'>
            <label className='text-sm text-white/70'>Xác nhận mật khẩu mới</label>
            <Input type='password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} data-qa='i_xac_nhan_mat_khau' />
          </div>
          <Button className='jgame-btn-primary w-full text-white' size='lg' disabled={submitting || !token} onClick={handleSubmit} data-qa='btn_dat_lai'>
            {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Đặt lại mật khẩu
          </Button>
        </div>
      </div>
    </div>
  )
}
