/**
 * useVerifyEmail.page — Logic trang Xác thực Email (SC-15). Token lấy từ query param `?token=`.
 */
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AuthApiService } from '../services/AuthApiService'

export function useVerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Thiếu mã xác thực')
      return
    }
    let cancelled = false
    void (async () => {
      const r = await AuthApiService.verifyEmail(token)
      if (cancelled) return
      if (r.success) setStatus('success')
      else { setStatus('error'); setErrorMessage(r.message || 'Xác thực thất bại') }
    })()
    return () => { cancelled = true }
  }, [token])

  return { status, errorMessage }
}
