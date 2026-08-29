/**
 * useLogin.page — Logic trang Đăng nhập + xác thực 2FA nếu tài khoản đã bật (SC-12).
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthApiService } from '../services/AuthApiService'
import { TokenManager } from '../../../../shared/services/api'
import { useAuth } from '../../../../contexts/AuthContext'
import { consumeReturnTo } from '../../../../shared/utils/pendingSelection'
import { ShopOwnerApiService } from '../../../Account/ShopOwner/services/ShopOwnerApiService'
import { ReferrerApiService } from '../../../Account/Partner/services/ReferrerApiService'

type LoginStep = 'credentials' | '2fa'

/** Chuẩn hoá đăng nhập bằng số điện thoại (không còn chấp nhận email ở màn Đăng nhập). */
const PHONE_RE = /^0\d{9,10}$/

/** Xác định trang đích sau đăng nhập theo loại tài khoản: admin → Quản trị; đã có gian hàng →
 * Kênh Người Bán; đã là đối tác tiếp thị → Dashboard Đối tác; còn lại → Tổng quan tài khoản. */
async function resolveLandingRoute(): Promise<string> {
  const meRes = await AuthApiService.getCurrentUser()
  if (meRes.success && meRes.data?.role === 'admin') return '/jgame/quan-tri'

  const shopRes = await ShopOwnerApiService.getMyShop()
  if (shopRes.success && shopRes.data) return '/jgame/kenh-nguoi-ban'

  const affiliateRes = await ReferrerApiService.getMyAffiliateStatus()
  if (affiliateRes.success && affiliateRes.data) return '/jgame/doi-tac'

  return '/jgame/tai-khoan'
}

export function useLogin() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [step, setStep] = useState<LoginStep>('credentials')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [twoFACode, setTwoFACode] = useState('')
  const [pendingToken, setPendingToken] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const finishLogin = async (accessToken: string, refreshToken?: string) => {
    // Đọc returnTo TRƯỚC khi refreshUser() làm isAuthenticated đổi true — tránh đua với
    // effect tự động consumeReturnTo() ở JGamePortalContent (cùng phản ứng theo isAuthenticated).
    const returnTo = consumeReturnTo()
    TokenManager.setTokens(accessToken, refreshToken)
    await refreshUser()
    if (returnTo) {
      navigate(returnTo.replace(/^#/, ''), { replace: true })
      return
    }
    navigate(await resolveLandingRoute(), { replace: true })
  }

  const handleSubmitCredentials = async () => {
    if (!phone.trim() || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin')
      return
    }
    if (!PHONE_RE.test(phone.trim())) {
      setErrorMessage('Số điện thoại không hợp lệ (VD: 0912345678)')
      return
    }
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const r = await AuthApiService.login({ identifier: phone.trim(), password, rememberMe })
      if (!r.success || !r.data) {
        setErrorMessage(r.message || 'Đăng nhập thất bại')
        return
      }
      if (r.data.requires2FA && r.data.pendingToken) {
        setPendingToken(r.data.pendingToken)
        setStep('2fa')
        return
      }
      if (r.data.accessToken) await finishLogin(r.data.accessToken, r.data.refreshToken)
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit2FA = async () => {
    if (!pendingToken || twoFACode.length !== 6) return
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const r = await AuthApiService.verify2FA({ pendingToken, code: twoFACode })
      if (r.success && r.data?.accessToken) {
        await finishLogin(r.data.accessToken, r.data.refreshToken)
      } else {
        setErrorMessage(r.message || 'Mã xác thực không đúng')
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    step, phone, setPhone, password, setPassword, rememberMe, setRememberMe,
    twoFACode, setTwoFACode, submitting, errorMessage,
    handleSubmitCredentials, handleSubmit2FA,
  }
}
