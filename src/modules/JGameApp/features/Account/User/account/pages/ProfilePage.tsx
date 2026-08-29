/**
 * ProfilePage — Hồ sơ cá nhân (SC-17).
 */
import { Link } from 'react-router-dom'
import { Loader2, BadgeCheck, BadgeAlert } from 'lucide-react'
import { Input } from '../../../../../shared/components/ui/input'
import { Button } from '../../../../../shared/components/ui/button'
import { CustomerLayout } from '../components/CustomerLayout'
import { useProfile } from '../hooks/useProfile.page'

export const PAGE_ID = 'jgame-profile'

export function ProfilePage() {
  const { user, name, setName, avatarUrl, setAvatarUrl, dob, setDob, submitting, sendingEmailVerify, handleSave, handleSendEmailVerify } = useProfile()

  if (!user) return null

  return (
    <CustomerLayout>
      <h1 className='mb-6 text-xl font-bold text-white'>Hồ sơ cá nhân</h1>

      <div className='space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6'>
        <div className='space-y-1.5'>
          <label className='text-sm text-white/70'>Họ tên</label>
          <Input value={name} onChange={e => setName(e.target.value)} data-qa='i_ho_ten' />
        </div>

        <div className='space-y-1.5'>
          <label className='text-sm text-white/70'>Ảnh đại diện (URL)</label>
          <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder='https://...' data-qa='i_avatar_url' />
        </div>

        <div className='space-y-1.5'>
          <label className='text-sm text-white/70'>Ngày sinh</label>
          <Input type='date' value={dob} onChange={e => setDob(e.target.value)} data-qa='i_ngay_sinh' />
        </div>

        <div className='flex items-center justify-between rounded-lg bg-white/5 px-3 py-2'>
          <div>
            <p className='text-sm text-white'>{user.email}</p>
            {user.emailVerified ? (
              <span className='inline-flex items-center gap-1 text-xs text-emerald-400'><BadgeCheck className='h-3.5 w-3.5' /> Đã xác thực</span>
            ) : (
              <span className='inline-flex items-center gap-1 text-xs text-amber-400'><BadgeAlert className='h-3.5 w-3.5' /> Chưa xác thực</span>
            )}
          </div>
          {!user.emailVerified && (
            <Button variant='outline' size='sm' className='border-white/20 text-white hover:bg-white/10' disabled={sendingEmailVerify} onClick={handleSendEmailVerify} data-qa='btn_gui_xac_thuc_email'>
              {sendingEmailVerify && <Loader2 className='h-3.5 w-3.5 animate-spin mr-1' />} Gửi email xác thực
            </Button>
          )}
        </div>

        <div className='flex items-center justify-between rounded-lg bg-white/5 px-3 py-2'>
          <div>
            <p className='text-sm text-white'>{user.phone}</p>
            {user.phoneVerified ? (
              <span className='inline-flex items-center gap-1 text-xs text-emerald-400'><BadgeCheck className='h-3.5 w-3.5' /> Đã xác thực</span>
            ) : (
              <span className='inline-flex items-center gap-1 text-xs text-amber-400'><BadgeAlert className='h-3.5 w-3.5' /> Chưa xác thực</span>
            )}
          </div>
          {!user.phoneVerified && (
            <Link to='/jgame/xac-thuc-so-dien-thoai' className='jgame-gradient-text text-sm font-semibold'>Xác thực ngay</Link>
          )}
        </div>

        <Button className='jgame-btn-primary w-full text-white' disabled={submitting} onClick={handleSave} data-qa='btn_luu_ho_so'>
          {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Lưu thay đổi
        </Button>
      </div>
    </CustomerLayout>
  )
}
