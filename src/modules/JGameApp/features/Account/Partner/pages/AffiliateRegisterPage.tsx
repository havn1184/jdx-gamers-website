/**
 * AffiliateRegisterPage — Đăng ký làm Đối tác tiếp thị liên kết (SC-REF-01).
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Megaphone, AlertCircle } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/input'
import { Button } from '../../../../shared/components/ui/button'
import { useMyAffiliate } from '../hooks/useMyAffiliate'
import { useAffiliateRegister } from '../hooks/useAffiliateRegister.page'

export const PAGE_ID = 'jgame-affiliate-register'
export const PAGE_FEATURES = [{ label: 'Đăng ký đối tác', code: 'btn-dang-ky-doi-tac' }]

export function AffiliateRegisterPage() {
  const navigate = useNavigate()
  const { isAffiliate, loading: loadingStatus } = useMyAffiliate()
  const { displayName, setDisplayName, channel, setChannel, isValid, submitting, errorMessage, handleSubmit } = useAffiliateRegister()

  useEffect(() => {
    if (!loadingStatus && isAffiliate) navigate('/jgame/doi-tac', { replace: true })
  }, [loadingStatus, isAffiliate, navigate])

  if (loadingStatus) return <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang kiểm tra...</div>

  return (
    <div className='mx-auto max-w-lg px-4 py-12 sm:px-6'>
      <div className='mb-6 text-center'>
        <span className='jgame-gradient-brand mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-white'><Megaphone className='h-7 w-7' /></span>
        <h1 className='text-xl font-bold text-white'>Đăng ký làm Đối tác tiếp thị liên kết</h1>
        <p className='mt-1 text-sm text-white/60'>Nhận hoa hồng khi giới thiệu người mua thẻ game/vé giờ chơi qua link của bạn</p>
      </div>

      <div className='space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6'>
        <div className='space-y-1.5'>
          <label className='text-sm text-white/70'>Tên hiển thị</label>
          <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder='VD: Nguyễn Văn A' data-qa='i_ten_hien_thi' />
        </div>
        <div className='space-y-1.5'>
          <label className='text-sm text-white/70'>Kênh quảng bá chính</label>
          <Input value={channel} onChange={e => setChannel(e.target.value)} placeholder='VD: Kênh TikTok/Facebook, group cộng đồng...' data-qa='i_kenh_quang_ba' />
        </div>

        {errorMessage && (
          <div className='flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
          </div>
        )}

        <Button className='jgame-btn-primary w-full text-white' disabled={!isValid || submitting} onClick={handleSubmit} data-qa='btn_dang_ky_doi_tac'>
          {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Đăng ký làm đối tác
        </Button>
      </div>
    </div>
  )
}
