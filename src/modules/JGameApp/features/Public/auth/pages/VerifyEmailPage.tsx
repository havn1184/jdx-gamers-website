/**
 * VerifyEmailPage — Xác thực email từ link gửi qua mail (SC-15).
 */
import { Link } from 'react-router-dom'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { useVerifyEmail } from '../hooks/useVerifyEmail.page'

export const PAGE_ID = 'jgame-verify-email'

export function VerifyEmailPage() {
  const { status, errorMessage } = useVerifyEmail()

  return (
    <div className='flex min-h-[80vh] items-center justify-center px-4 py-12 text-center'>
      <div className='w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8'>
        {status === 'loading' && (
          <>
            <Loader2 className='mx-auto mb-4 h-10 w-10 animate-spin text-white/60' />
            <p className='text-white/70'>Đang xác thực email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className='mx-auto mb-4 h-12 w-12 text-emerald-400' />
            <h1 className='text-lg font-bold text-white'>Xác thực email thành công!</h1>
            <Link to='/jgame' className='mt-4 inline-block jgame-gradient-text font-semibold'>Về trang chủ</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className='mx-auto mb-4 h-12 w-12 text-red-400' />
            <h1 className='text-lg font-bold text-white'>Xác thực thất bại</h1>
            <p className='mt-1 text-sm text-white/60'>{errorMessage}</p>
            <Link to='/jgame/ho-so' className='mt-4 inline-block jgame-gradient-text font-semibold'>Về hồ sơ cá nhân</Link>
          </>
        )}
      </div>
    </div>
  )
}
