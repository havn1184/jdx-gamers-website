/**
 * NphSettingsPage — Đổi mật khẩu + xoay khoá webhook (secret plaintext hiện ĐÚNG 1 LẦN, panel inline
 * không dùng Dialog — cùng quy ước "reveal-once" đã áp dụng cho `resetUserPassword` khu Admin JGameApp)
 * + đăng xuất (20260903-nc_quan-tri-nha-phat-hanh-game.md mục 2.7).
 */
import { useState } from 'react'
import { AlertCircle, CheckCircle2, Copy, KeyRound, Loader2, LogOut, ShieldAlert } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { Input } from '../../../../../shared/components/ui/input'
import { NphLayout } from '../../components'
import { useNphAuth } from '../../contexts/NphAuthContext'
import { useNphSettingsForm } from '../hooks/useNphSettings.page.form'

export const PAGE_ID = 'jgame-nph-settings'
export const PAGE_FEATURES = [
  { label: 'Đổi mật khẩu', code: 'btn-doi-mat-khau' },
  { label: 'Xoay khoá webhook', code: 'btn-xoay-khoa' },
  { label: 'Đăng xuất', code: 'btn-dang-xuat' },
]

export function NphSettingsPage() {
  const { logout } = useNphAuth()
  const [copied, setCopied] = useState(false)
  const {
    oldPassword, setOldPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword,
    isPasswordFormValid, changingPassword, passwordError, passwordSuccess, handleChangePassword,
    rotating, rotateError, revealedSecret, setRevealedSecret, handleRotateSecret,
  } = useNphSettingsForm()

  const handleCopy = (value: string) => {
    void navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <NphLayout>
      <h1 className='mb-6 text-xl font-bold text-white'>Cài đặt</h1>

      <div className='mb-6 rounded-xl border border-white/10 bg-white/5 p-4'>
        <h2 className='mb-3 flex items-center gap-2 text-sm font-semibold text-white'><KeyRound className='h-4 w-4' /> Đổi mật khẩu</h2>
        <div className='max-w-sm space-y-3'>
          <Input type='password' placeholder='Mật khẩu cũ' value={oldPassword} onChange={e => setOldPassword(e.target.value)} data-qa='i_mat_khau_cu' />
          <Input type='password' placeholder='Mật khẩu mới (tối thiểu 6 ký tự)' value={newPassword} onChange={e => setNewPassword(e.target.value)} data-qa='i_mat_khau_moi' />
          <Input type='password' placeholder='Xác nhận mật khẩu mới' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} data-qa='i_xac_nhan_mat_khau' />
        </div>
        {passwordError && (
          <div className='mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' /> {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className='mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300'>
            <CheckCircle2 className='h-4 w-4 flex-shrink-0' /> Đổi mật khẩu thành công
          </div>
        )}
        <Button className='jgame-btn-primary mt-4 text-white' disabled={!isPasswordFormValid || changingPassword} onClick={handleChangePassword} data-qa='btn_doi_mat_khau'>
          {changingPassword && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Đổi mật khẩu
        </Button>
      </div>

      <div className='mb-6 rounded-xl border border-white/10 bg-white/5 p-4'>
        <h2 className='mb-3 flex items-center gap-2 text-sm font-semibold text-white'><ShieldAlert className='h-4 w-4' /> Khoá webhook</h2>
        <p className='mb-3 text-sm text-white/60'>Dùng để ký các request webhook báo tiến độ nhiệm vụ. Xoay khoá sẽ vô hiệu hoá khoá cũ ngay lập tức.</p>

        {revealedSecret ? (
          <div className='rounded-lg border border-amber-400/30 bg-amber-500/10 p-3'>
            <p className='mb-2 text-sm font-medium text-amber-200'>Khoá webhook mới — chỉ hiển thị 1 lần, hãy sao chép ngay:</p>
            <div className='flex items-center gap-2'>
              <code className='flex-1 truncate rounded bg-black/30 px-2 py-1.5 text-xs text-white'>{revealedSecret}</code>
              <Button variant='ghost' size='sm' className='border rounded-lg bg-white' onClick={() => handleCopy(revealedSecret)} data-qa='btn_copy_secret'>
                <Copy className='h-4 w-4' />
              </Button>
            </div>
            {copied && <p className='mt-1.5 text-xs text-emerald-300'>Đã sao chép</p>}
            <Button variant='ghost' size='sm' className='mt-3 text-white/70 hover:bg-white/10' onClick={() => setRevealedSecret(null)} data-qa='btn_dong_secret'>Đã lưu, đóng lại</Button>
          </div>
        ) : (
          <>
            {rotateError && (
              <div className='mb-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
                <AlertCircle className='h-4 w-4 flex-shrink-0' /> {rotateError}
              </div>
            )}
            <Button className='jgame-btn-primary text-white' disabled={rotating} onClick={handleRotateSecret} data-qa='btn_xoay_khoa'>
              {rotating && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Xoay khoá webhook
            </Button>
          </>
        )}
      </div>

      <Button variant='ghost' className='border border-white/20 text-white hover:bg-white/10' onClick={logout} data-qa='btn_dang_xuat'>
        <LogOut className='h-4 w-4 mr-2' /> Đăng xuất
      </Button>
    </NphLayout>
  )
}
