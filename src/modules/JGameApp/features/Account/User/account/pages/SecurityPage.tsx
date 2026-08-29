/**
 * SecurityPage — Đổi mật khẩu + Bật/tắt xác thực 2 lớp (SC-18).
 */
import { Loader2, ShieldCheck, ShieldOff } from 'lucide-react'
import { Input } from '../../../../../shared/components/ui/input'
import { Button } from '../../../../../shared/components/ui/button'
import { useSecurity } from '../hooks/useSecurity.page'
import { CustomerLayout } from '../components/CustomerLayout'

export const PAGE_ID = 'jgame-security'

export function SecurityPage() {
  const {
    user, oldPassword, setOldPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword,
    changingPassword, handleChangePassword,
    twoFAStep, twoFASecret, twoFACode, setTwoFACode, processing2FA,
    startEnable2FA, confirmEnable2FA, disable2FA,
  } = useSecurity()

  if (!user) return null

  return (
    <CustomerLayout>
      <h1 className='mb-6 text-xl font-bold text-white'>Bảo mật tài khoản</h1>

      <div className='space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6'>
        <h2 className='text-sm font-semibold text-white'>Đổi mật khẩu</h2>
        <div className='space-y-1.5'>
          <label className='text-sm text-white/70'>Mật khẩu hiện tại</label>
          <Input type='password' value={oldPassword} onChange={e => setOldPassword(e.target.value)} data-qa='i_mat_khau_cu' />
        </div>
        <div className='space-y-1.5'>
          <label className='text-sm text-white/70'>Mật khẩu mới</label>
          <Input type='password' value={newPassword} onChange={e => setNewPassword(e.target.value)} data-qa='i_mat_khau_moi' />
        </div>
        <div className='space-y-1.5'>
          <label className='text-sm text-white/70'>Xác nhận mật khẩu mới</label>
          <Input type='password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} data-qa='i_xac_nhan_mat_khau' />
        </div>
        <Button className='jgame-btn-primary text-white' disabled={changingPassword} onClick={handleChangePassword} data-qa='btn_doi_mat_khau'>
          {changingPassword && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Đổi mật khẩu
        </Button>
      </div>

      <div className='mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6'>
        <h2 className='text-sm font-semibold text-white'>Xác thực 2 lớp (2FA)</h2>

        {user.twoFactorEnabled ? (
          <>
            <p className='flex items-center gap-2 text-sm text-emerald-400'><ShieldCheck className='h-4 w-4' /> Đang bật</p>
            <Button variant='outline' className='border-white/20 text-white hover:bg-white/10' disabled={processing2FA} onClick={disable2FA} data-qa='btn_tat_2fa'>
              {processing2FA && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Tắt 2FA
            </Button>
          </>
        ) : twoFAStep === 'idle' ? (
          <>
            <p className='flex items-center gap-2 text-sm text-white/60'><ShieldOff className='h-4 w-4' /> Chưa bật</p>
            <Button className='jgame-btn-primary text-white' disabled={processing2FA} onClick={startEnable2FA} data-qa='btn_bat_2fa'>
              {processing2FA && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Bật 2FA
            </Button>
          </>
        ) : (
          <div className='space-y-3'>
            <p className='text-sm text-white/70'>Mã bí mật (nhập vào app xác thực): <span className='font-mono text-white'>{twoFASecret}</span></p>
            <p className='text-xs text-white/50'>Môi trường demo — nhập mã xác nhận cố định <span className='font-mono text-white'>123456</span></p>
            <Input
              value={twoFACode}
              onChange={e => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder='000000'
              className='max-w-[200px] text-center tracking-[0.5em]'
              data-qa='i_ma_xac_nhan_2fa'
            />
            <Button className='jgame-btn-primary text-white' onClick={confirmEnable2FA} data-qa='btn_xac_nhan_bat_2fa'>Xác nhận bật 2FA</Button>
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}
