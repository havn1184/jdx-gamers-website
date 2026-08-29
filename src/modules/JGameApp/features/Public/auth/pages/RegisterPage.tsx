/**
 * RegisterPage — Đăng ký tài khoản (SC-11).
 */
import { Link } from 'react-router-dom'
import { Gamepad2, AlertCircle, Loader2 } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/input'
import { Button } from '../../../../shared/components/ui/button'
import { cn } from '../../../../shared/components/ui/utils'
import { useRegister } from '../hooks/useRegister.page'

export const PAGE_ID = 'jgame-register'

export function RegisterPage() {
  const { formData, setFormData, errors, touched, submitting, errorMessage, handleBlur, handleSubmit } = useRegister()

  return (
    <div className='flex min-h-[80vh] items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8'>
        <div className='mb-6 flex flex-col items-center text-center'>
          <span className='jgame-gradient-brand mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-white'>
            <Gamepad2 className='h-6 w-6' />
          </span>
          <h1 className='text-xl font-bold text-white'>Tạo tài khoản JGame</h1>
        </div>

        {errorMessage && (
          <div className='mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
          </div>
        )}

        <div className='space-y-4'>
          <div className='space-y-1.5'>
            <label className='text-sm text-white/70'>Email</label>
            <Input
              value={formData.email}
              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
              onBlur={() => handleBlur('email')}
              className={cn(touched.email && errors.email && 'border-destructive')}
              placeholder='ban@email.com'
              data-qa='i_email'
            />
            {touched.email && errors.email && <p className='text-xs text-destructive'>{errors.email}</p>}
          </div>

          <div className='space-y-1.5'>
            <label className='text-sm text-white/70'>Số điện thoại</label>
            <Input
              value={formData.phone}
              onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
              onBlur={() => handleBlur('phone')}
              className={cn(touched.phone && errors.phone && 'border-destructive')}
              placeholder='0912345678'
              data-qa='i_sdt'
            />
            {touched.phone && errors.phone && <p className='text-xs text-destructive'>{errors.phone}</p>}
          </div>

          <div className='space-y-1.5'>
            <label className='text-sm text-white/70'>Mật khẩu</label>
            <Input
              type='password'
              value={formData.password}
              onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
              onBlur={() => handleBlur('password')}
              className={cn(touched.password && errors.password && 'border-destructive')}
              placeholder='Tối thiểu 8 ký tự'
              data-qa='i_mat_khau'
            />
            {touched.password && errors.password && <p className='text-xs text-destructive'>{errors.password}</p>}
          </div>

          <div className='space-y-1.5'>
            <label className='text-sm text-white/70'>Xác nhận mật khẩu</label>
            <Input
              type='password'
              value={formData.confirmPassword}
              onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
              onBlur={() => handleBlur('confirmPassword')}
              className={cn(touched.confirmPassword && errors.confirmPassword && 'border-destructive')}
              data-qa='i_xac_nhan_mat_khau'
            />
            {touched.confirmPassword && errors.confirmPassword && <p className='text-xs text-destructive'>{errors.confirmPassword}</p>}
          </div>

          <label className='flex items-start gap-2 text-sm text-white/70'>
            <input
              type='checkbox'
              className='mt-0.5'
              checked={formData.agreedTerms}
              onChange={e => setFormData(p => ({ ...p, agreedTerms: e.target.checked }))}
              data-qa='chk_dong_y_dieu_khoan'
            />
            Tôi đồng ý với <Link to='/jgame/dieu-khoan-su-dung' className='jgame-gradient-text'>Điều khoản sử dụng</Link>
          </label>

          <Button className='jgame-btn-primary w-full text-white' size='lg' disabled={submitting} onClick={handleSubmit} data-qa='btn_dang_ky'>
            {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Đăng ký
          </Button>
        </div>

        <p className='mt-6 text-center text-sm text-white/60'>
          Đã có tài khoản? <Link to='/jgame/dang-nhap' className='jgame-gradient-text font-semibold'>Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}
