/**
 * NphLoginPage — Đăng nhập NPH ĐỘC LẬP (route `/jgame/nph/dang-nhap`), KHÔNG dùng chung form đăng nhập
 * Customer. Không có nút "Đăng ký" — chỉ Admin tạo tài khoản NPH
 * (20260903-nc_quan-tri-nha-phat-hanh-game.md mục 2.1).
 */
import { AlertCircle, Gamepad2, Loader2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { Input } from '../../../../shared/components/ui/input'
import { useNphLogin } from '../hooks/useNphLogin.dlg.form'

export const PAGE_ID = 'jgame-nph-login'
export const PAGE_FEATURES = [{ label: 'Đăng nhập NPH', code: 'btn-dang-nhap' }]

export function NphLoginPage() {
  const { email, setEmail, password, setPassword, isValid, submitting, errorMessage, handleSubmit } = useNphLogin()

  return (
    <div className='mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-10'>
      <div className='mb-6 flex flex-col items-center gap-2 text-center'>
        <span className='jgame-gradient-brand flex h-12 w-12 items-center justify-center rounded-xl text-white'><Gamepad2 className='h-6 w-6' /></span>
        <h1 className='text-xl font-bold text-white'>Cổng Nhà phát hành game</h1>
        <p className='text-sm text-white/60'>Đăng nhập bằng email/mật khẩu do Quản trị viên cấp</p>
      </div>

      <form
        className='rounded-2xl border border-white/10 bg-white/5 p-5'
        onSubmit={e => { e.preventDefault(); void handleSubmit() }}
      >
        <div className='space-y-3'>
          <Input type='email' placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} data-qa='i_email' autoComplete='username' />
          <Input type='password' placeholder='Mật khẩu' value={password} onChange={e => setPassword(e.target.value)} data-qa='i_mat_khau' autoComplete='current-password' />
        </div>

        {errorMessage && (
          <div className='mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
          </div>
        )}

        <Button type='submit' className='jgame-btn-primary mt-5 w-full text-white' size='lg' disabled={!isValid || submitting} data-qa='btn_dang_nhap'>
          {submitting && <Loader2 className='mr-1.5 h-4 w-4 animate-spin' />} Đăng nhập
        </Button>
      </form>
    </div>
  )
}
