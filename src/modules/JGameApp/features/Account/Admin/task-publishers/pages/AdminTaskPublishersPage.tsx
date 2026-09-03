/**
 * AdminTaskPublishersPage — Quản lý NPH: danh sách + tạo mới (Email bắt buộc) + reveal-once (password
 * khởi tạo + webhook secret) + xoay khoá/đặt lại mật khẩu/tạm ngưng/kích hoạt
 * (20260903-nc_quan-tri-nha-phat-hanh-game.md mục 3.1).
 *
 * Deviation: `TaskPublisherResponse` (Backend) KHÔNG có field số dư quỹ JCoin — cột "Quỹ JCoin hiện tại"
 * nêu trong doc chưa hiển thị được (Backend chưa có endpoint admin đọc quỹ theo từng NPH).
 */
import { useState } from 'react'
import { Plus, RotateCw, KeyRound, Ban, CheckCircle2, Copy, X, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { Input } from '../../../../../shared/components/ui/input'
import { Badge } from '../../../../../shared/components/ui/badge'
import { cn } from '../../../../../shared/components/ui/utils'
import { formatDateTime } from '../../../../../shared/utils/FormatUtils'
import { AdminLayout } from '../../components/AdminLayout'
import { TASK_PUBLISHER_ADMIN_STATUS_LABELS } from '../../types/jgame.types'
import { useTaskPublishersFetchData } from '../hooks/useTaskPublishers.page.fetchData'

export const PAGE_ID = 'jgame-admin-task-publishers'
export const PAGE_FEATURES = [
  { label: 'Thêm NPH', code: 'btn-them-nph' },
  { label: 'Xoay khoá webhook (dòng)', code: 'row-rotate-secret' },
  { label: 'Đặt lại mật khẩu (dòng)', code: 'row-reset-password' },
  { label: 'Tạm ngưng/Kích hoạt (dòng)', code: 'row-toggle-status' },
]

export function AdminTaskPublishersPage() {
  const { items, loading, errorMessage, revealPanel, setRevealPanel, handleCreate, handleRotateSecret, handleResetPassword, handleSuspend, handleActivate } = useTaskPublishersFetchData()
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (label: string, value: string) => {
    void navigator.clipboard.writeText(value)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const submitCreate = async () => {
    if (!name.trim() || !email.trim() || submitting) return
    setSubmitting(true)
    setFormError(null)
    const result = await handleCreate({ name: name.trim(), email: email.trim() })
    setSubmitting(false)
    if (!result.success) {
      setFormError(result.message || 'Tạo NPH thất bại.')
      return
    }
    setName('')
    setEmail('')
    setFormOpen(false)
  }

  return (
    <AdminLayout>
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-xl font-bold text-white'>Nhà phát hành game</h1>
          <p className='text-sm text-white/60'>Quản lý tài khoản NPH tự phục vụ, khoá webhook, trạng thái hoạt động</p>
        </div>
        <Button className='jgame-btn-primary text-white' onClick={() => { setFormOpen(true); setFormError(null) }} data-qa='btn_them_nph'>
          <Plus className='h-4 w-4 mr-2' /> Thêm NPH
        </Button>
      </div>

      {errorMessage && (
        <div className='mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
          <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
        </div>
      )}

      {revealPanel && (
        <div className='mb-6 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <p className='text-sm font-semibold text-amber-200'>Thông tin cho "{revealPanel.name}" — chỉ hiển thị 1 LẦN, hãy chuyển ngay cho NPH:</p>
            <button type='button' className='text-amber-200/70 hover:text-amber-100' onClick={() => setRevealPanel(null)}><X className='h-4 w-4' /></button>
          </div>
          {revealPanel.password && (
            <div className='mb-2 flex items-center gap-2'>
              <span className='w-28 flex-shrink-0 text-xs text-white/60'>Mật khẩu</span>
              <code className='flex-1 truncate rounded bg-black/30 px-2 py-1.5 text-xs text-white'>{revealPanel.password}</code>
              <Button variant='ghost' size='sm' className='border rounded-lg bg-white' onClick={() => handleCopy('password', revealPanel.password!)}><Copy className='h-4 w-4' /></Button>
            </div>
          )}
          {revealPanel.webhookSecret && (
            <div className='flex items-center gap-2'>
              <span className='w-28 flex-shrink-0 text-xs text-white/60'>Webhook secret</span>
              <code className='flex-1 truncate rounded bg-black/30 px-2 py-1.5 text-xs text-white'>{revealPanel.webhookSecret}</code>
              <Button variant='ghost' size='sm' className='border rounded-lg bg-white' onClick={() => handleCopy('secret', revealPanel.webhookSecret!)}><Copy className='h-4 w-4' /></Button>
            </div>
          )}
          {copied && <p className='mt-1.5 text-xs text-emerald-300'>Đã sao chép {copied === 'password' ? 'mật khẩu' : 'khoá webhook'}</p>}
        </div>
      )}

      {formOpen && (
        <div className='mb-6 rounded-xl border border-white/10 bg-white/5 p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-sm font-semibold text-white'>Thêm NPH</h2>
            <button type='button' className='text-white/50 hover:text-white' onClick={() => setFormOpen(false)}><X className='h-4 w-4' /></button>
          </div>
          <div className='flex flex-wrap gap-3'>
            <Input placeholder='Tên NPH' value={name} onChange={e => setName(e.target.value)} className='min-w-[200px] flex-1' data-qa='i_ten_nph' />
            <Input type='email' placeholder='Email đăng nhập' value={email} onChange={e => setEmail(e.target.value)} className='min-w-[200px] flex-1' data-qa='i_email_nph' />
          </div>
          {formError && (
            <div className='mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
              <AlertCircle className='h-4 w-4 flex-shrink-0' /> {formError}
            </div>
          )}
          <div className='mt-4 flex gap-2'>
            <Button className='jgame-btn-primary text-white' disabled={!name.trim() || !email.trim() || submitting} onClick={submitCreate} data-qa='btn_luu_nph'>
              {submitting && <Loader2 className='h-4 w-4 animate-spin mr-1.5' />} Lưu
            </Button>
            <Button variant='ghost' className='text-white/70 hover:bg-white/10' onClick={() => setFormOpen(false)} data-qa='btn_huy_nph'>Hủy</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className='py-12 text-center text-white/50'>Đang tải...</div>
      ) : items.length === 0 ? (
        <div className='py-12 text-center text-white/50'>Chưa có NPH nào</div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-white/10'>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Tên NPH</th>
                <th className='px-3 py-2 text-left font-medium'>Email</th>
                <th className='px-3 py-2 text-left font-medium'>Khoá webhook</th>
                <th className='px-3 py-2 text-center font-medium'>Nhiệm vụ</th>
                <th className='px-3 py-2 text-center font-medium'>Trạng thái</th>
                <th className='px-3 py-2 text-left font-medium'>Ngày tạo</th>
                <th className='w-[160px] px-3 py-2 text-center font-medium'>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id} className='border-t border-white/10 text-white/80'>
                  <td className='px-3 py-2 font-medium text-white'>{p.name}</td>
                  <td className='px-3 py-2'>{p.email}</td>
                  <td className='px-3 py-2 font-mono text-xs'>{p.webhookSecretMasked}</td>
                  <td className='px-3 py-2 text-center'>{p.taskCount}</td>
                  <td className='px-3 py-2 text-center'>
                    <Badge className={cn('border-none', p.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300')}>
                      {TASK_PUBLISHER_ADMIN_STATUS_LABELS[p.status]}
                    </Badge>
                  </td>
                  <td className='px-3 py-2 text-white/50'>{formatDateTime(p.createdAt)}</td>
                  <td className='px-3 py-2'>
                    <div className='flex items-center justify-center gap-1'>
                      <Button variant='ghost' size='sm' className='border rounded-lg bg-white' title='Xoay khoá webhook' data-qa={`btn_xoay_khoa_${p.id}`} onClick={() => void handleRotateSecret(p.id, p.name)}><RotateCw className='h-4 w-4' /></Button>
                      <Button variant='ghost' size='sm' className='border rounded-lg bg-white' title='Đặt lại mật khẩu' data-qa={`btn_dat_lai_mk_${p.id}`} onClick={() => void handleResetPassword(p.id, p.name)}><KeyRound className='h-4 w-4' /></Button>
                      {p.status === 'active' ? (
                        <Button variant='ghost' size='sm' className='icon-danger border rounded-lg bg-white' title='Tạm ngưng' data-qa={`btn_tam_ngung_${p.id}`} onClick={() => void handleSuspend(p.id)}><Ban className='h-4 w-4' /></Button>
                      ) : (
                        <Button variant='ghost' size='sm' className='border rounded-lg bg-white' title='Kích hoạt' data-qa={`btn_kich_hoat_${p.id}`} onClick={() => void handleActivate(p.id)}><CheckCircle2 className='h-4 w-4' /></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
