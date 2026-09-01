/**
 * LoginPage — Đăng nhập + xác thực 2FA nếu tài khoản đã bật (SC-12).
 */
import { Link } from 'react-router-dom'
import { Gamepad2, AlertCircle, Loader2, ShieldCheck, UserRound, Store, Megaphone, ShieldAlert } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/input'
import { Button } from '../../../../shared/components/ui/button'
import { useLogin } from '../hooks/useLogin.page'
import { DEMO_ACCOUNTS, DEMO_ACCOUNT_PASSWORD } from '../../../../shared/constants/demoAccounts'

export const PAGE_ID = 'jgame-login'

const DEMO_LIST = [
  { key: 'customer', label: 'Khách hàng', icon: UserRound, phone: DEMO_ACCOUNTS.customer.phone },
  { key: 'shopOwner', label: 'Chủ gian hàng', icon: Store, phone: DEMO_ACCOUNTS.shopOwner.phone },
  { key: 'affiliate', label: 'Đối tác tiếp thị', icon: Megaphone, phone: DEMO_ACCOUNTS.affiliate.phone },
  { key: 'admin', label: 'Quản trị viên', icon: ShieldAlert, phone: DEMO_ACCOUNTS.admin.phone },
] as const

export function LoginPage() {
  const {
    step, phone, setPhone, password, setPassword, rememberMe, setRememberMe,
    twoFACode, setTwoFACode, submitting, errorMessage, handleSubmitCredentials, handleSubmit2FA,
  } = useLogin()

  return (
    <div className='flex min-h-[80vh] flex-col items-center justify-center gap-6 px-4 py-12 lg:flex-row lg:items-start lg:justify-center'>
      <div className='w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8'>
        <div className='mb-6 flex flex-col items-center text-center'>
          <span className='jgame-gradient-brand mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-white'>
            <Gamepad2 className='h-6 w-6' />
          </span>
          <h1 className='text-xl font-bold text-white'>
            {step === 'credentials' ? 'Đăng nhập JGame' : 'Xác thực 2 lớp'}
          </h1>
          {step === '2fa' && <p className='mt-1 text-sm text-white/60'>Nhập mã 6 số từ ứng dụng xác thực</p>}
        </div>

        {errorMessage && (
          <div className='mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
          </div>
        )}

        {step === 'credentials' ? (
          <div className='space-y-4'>
            <div className='space-y-1.5'>
              <label className='text-sm text-white/70'>Số điện thoại</label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder='0912345678' inputMode='tel' data-qa='i_sdt' />
            </div>
            <div className='space-y-1.5'>
              <label className='text-sm text-white/70'>Mật khẩu</label>
              <Input type='password' value={password} onChange={e => setPassword(e.target.value)} placeholder='••••••••' data-qa='i_mat_khau' />
            </div>
            <div className='flex items-center justify-between text-sm'>
              <label className='flex items-center gap-2 text-white/70'>
                <input type='checkbox' checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} data-qa='chk_ghi_nho' />
                Ghi nhớ đăng nhập
              </label>
              <Link to='/jgame/quen-mat-khau' className='jgame-gradient-text font-medium'>Quên mật khẩu?</Link>
            </div>
            <Button className='jgame-btn-primary w-full text-white' size='lg' disabled={submitting} onClick={handleSubmitCredentials} data-qa='btn_xac_nhan_dang_nhap'>
              {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Đăng nhập
            </Button>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/50'>
              <ShieldCheck className='h-4 w-4 flex-shrink-0' /> Mã demo: <span className='font-mono text-white'>123456</span>
            </div>
            <Input
              value={twoFACode}
              onChange={e => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder='000000'
              className='text-center text-lg tracking-[0.5em]'
              data-qa='i_ma_2fa'
            />
            <Button className='jgame-btn-primary w-full text-white' size='lg' disabled={submitting || twoFACode.length !== 6} onClick={handleSubmit2FA} data-qa='btn_xac_nhan_2fa'>
              {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Xác nhận
            </Button>
          </div>
        )}

        <p className='mt-6 text-center text-sm text-white/60'>
          Chưa có tài khoản? <Link to='/jgame/dang-ky' className='jgame-gradient-text font-semibold'>Đăng ký ngay</Link>
        </p>
      </div>

      {step === 'credentials' && (
        <div className='w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 p-5' data-qa='panel_tai_khoan_demo'>
          <p className='mb-3 text-sm font-semibold text-white'>Tài khoản demo</p>
          <div className='space-y-2'>
            {DEMO_LIST.map(demo => (
              <button
                key={demo.key}
                type='button'
                className='flex w-full items-center gap-2.5 rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10'
                onClick={() => { setPhone(demo.phone); setPassword(DEMO_ACCOUNT_PASSWORD) }}
                data-qa={`btn_demo_${demo.key}`}
              >
                <demo.icon className='h-4 w-4 flex-shrink-0 text-white/50' />
                <div className='min-w-0'>
                  <p className='truncate font-medium text-white'>{demo.label}</p>
                  <p className='truncate text-xs text-white/40'>{demo.phone}</p>
                </div>
              </button>
            ))}
          </div>
          <p className='mt-3 text-xs text-white/40'>Mật khẩu chung: <span className='font-mono text-white/60'>{DEMO_ACCOUNT_PASSWORD}</span> — bấm để tự điền, sau đó bấm Đăng nhập.</p>
        </div>
      )}
    </div>
  )
}
