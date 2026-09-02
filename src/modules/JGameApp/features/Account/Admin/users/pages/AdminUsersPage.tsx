/**
 * AdminUsersPage — Quản trị "Tài khoản hệ thống" (20260902-nc_quan-tri-tai-khoan-he-thong.md).
 * Danh sách phân trang toàn bộ tài khoản, lọc theo 4 nhóm nghiệp vụ, khóa/mở khóa + reset mật khẩu.
 */
import { Fragment, useState } from 'react'
import { Lock, Unlock, KeyRound, AlertTriangle, Copy, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { Input } from '../../../../../shared/components/ui/input'
import { Badge } from '../../../../../shared/components/ui/badge'
import { formatDateTime, formatCurrency } from '../../../../../shared/utils/FormatUtils'
import { cn } from '../../../../../shared/components/ui/utils'
import { AdminLayout } from '../../components/AdminLayout'
import { useAdminUsersFetchData } from '../hooks/useAdminUsers.page.fetchData'
import type { AdminUserKind } from '../../types/jgame.types'

export const PAGE_ID = 'jgame-admin-users'
export const PAGE_FEATURES = [
  { label: 'Tìm kiếm', code: 'i-tim-kiem' },
  { label: 'Lọc loại tài khoản', code: 'sel-loai-user' },
  { label: 'Khóa/Mở khóa', code: 'btn-khoa-mo-khoa' },
  { label: 'Reset mật khẩu', code: 'btn-reset-mat-khau' },
]

const KIND_LABELS: Record<AdminUserKind, string> = {
  customer: 'Khách hàng', shopOwner: 'Chủ Cybergame', affiliate: 'Đối tác tiếp thị', admin: 'Quản trị viên',
}

const KIND_BADGE_CLASS: Record<AdminUserKind, string> = {
  customer: 'bg-slate-500/20 text-slate-300',
  shopOwner: 'bg-purple-500/20 text-purple-300',
  affiliate: 'bg-amber-500/20 text-amber-300',
  admin: 'bg-emerald-500/20 text-emerald-300',
}

export function AdminUsersPage() {
  const {
    items, total, totalPages, loading, page, setPage,
    keyword, setKeyword, kind, setKind,
    lockUser, unlockUser, resetPassword,
  } = useAdminUsersFetchData()

  const [resetFor, setResetFor] = useState<{ id: string; password: string } | null>(null)
  const [resetting, setResetting] = useState<string | null>(null)
  const [lockingId, setLockingId] = useState<string | null>(null)

  const handleLockToggle = async (id: string, locked: boolean) => {
    setLockingId(id)
    try {
      await (locked ? unlockUser(id) : lockUser(id))
    } finally {
      setLockingId(null)
    }
  }

  const handleResetPassword = async (id: string) => {
    setResetting(id)
    try {
      const r = await resetPassword(id)
      if (r.success && r.data) setResetFor({ id, password: r.data.newPassword })
    } finally {
      setResetting(null)
    }
  }

  return (
    <AdminLayout>
      <div className='mb-6'>
        <h1 className='text-xl font-bold text-white'>Tài khoản hệ thống</h1>
        <p className='text-sm text-white/60'>Tra cứu, khóa/mở khóa đăng nhập, đặt lại mật khẩu cho mọi tài khoản người chơi</p>
      </div>

      <div className='mb-4 flex flex-wrap gap-3'>
        <Input placeholder='Tìm theo tên, SĐT, email...' value={keyword} onChange={e => setKeyword(e.target.value)} className='min-w-[240px] flex-1' data-qa='i_tim_kiem' />
        <select
          value={kind} onChange={e => setKind(e.target.value as AdminUserKind | 'all')}
          aria-label='Lọc theo loại tài khoản'
          className='min-w-[180px] rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
          data-qa='sel_loai_user'
        >
          <option value='all'>Tất cả loại tài khoản</option>
          <option value='customer'>Khách hàng</option>
          <option value='shopOwner'>Chủ Cybergame</option>
          <option value='affiliate'>Đối tác tiếp thị</option>
          <option value='admin'>Quản trị viên</option>
        </select>
      </div>

      {loading && items.length === 0 ? (
        <div className='py-12 text-center text-white/50'>Đang tải...</div>
      ) : items.length === 0 ? (
        <div className='py-12 text-center text-white/50'>Không có dữ liệu</div>
      ) : (
        <div className={cn('overflow-x-auto rounded-xl border border-white/10 transition-opacity duration-150', loading && 'pointer-events-none opacity-50')}>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Tài khoản</th>
                <th className='px-3 py-2 text-left font-medium'>Loại</th>
                <th className='px-3 py-2 text-right font-medium'>Số dư</th>
                <th className='px-3 py-2 text-left font-medium'>Đăng nhập lần cuối</th>
                <th className='px-3 py-2 text-center font-medium'>Trạng thái</th>
                <th className='w-[140px] px-3 py-2 text-center font-medium'>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <Fragment key={item.id}>
                  <tr className='border-t border-white/10 text-white/80'>
                    <td className='px-3 py-2'>
                      <p className='font-medium text-white'>{item.name}</p>
                      <p className='text-xs text-white/50'>{item.phone} · {item.email}</p>
                    </td>
                    <td className='px-3 py-2'>
                      <div className='flex flex-wrap items-center gap-1'>
                        <Badge className={cn('border-none', KIND_BADGE_CLASS[item.kind])}>{KIND_LABELS[item.kind]}</Badge>
                        {item.isBothShopOwnerAndAffiliate && (
                          <Badge className='inline-flex items-center gap-1 border-none bg-red-500/20 text-red-300' title='Vừa là Chủ Cybergame vừa là Đối tác tiếp thị'>
                            <AlertTriangle className='h-3 w-3' /> 2 vai trò
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className='px-3 py-2 text-right'>
                      <p className='text-white'>{formatCurrency(item.vndBalance)}</p>
                      <p className='text-xs text-white/50'>{item.jcoinBalance.toLocaleString('vi-VN')} JCoin</p>
                    </td>
                    <td className='px-3 py-2 text-white/60'>{item.lastLoginAt ? formatDateTime(item.lastLoginAt) : 'Chưa từng đăng nhập'}</td>
                    <td className='px-3 py-2 text-center'>
                      <Badge className={cn('border-none', item.isLocked ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300')}>
                        {item.isLocked ? 'Đã khóa' : 'Đang hoạt động'}
                      </Badge>
                    </td>
                    <td className='px-3 py-2'>
                      <div className='flex items-center justify-center gap-1'>
                        <Button
                          variant='ghost' size='sm' className='icon-warning border rounded-lg bg-white'
                          title={item.isLocked ? 'Mở khóa' : 'Khóa'} disabled={lockingId === item.id}
                          data-qa={`btn_khoa_${item.id}`} onClick={() => handleLockToggle(item.id, item.isLocked)}
                        >
                          {item.isLocked ? <Unlock className='h-4 w-4' /> : <Lock className='h-4 w-4' />}
                        </Button>
                        <Button
                          variant='ghost' size='sm' className='icon-warning border rounded-lg bg-white'
                          title='Reset mật khẩu' disabled={resetting === item.id}
                          data-qa={`btn_reset_${item.id}`} onClick={() => handleResetPassword(item.id)}
                        >
                          <KeyRound className='h-4 w-4' />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {resetFor?.id === item.id && (
                    <tr className='border-t border-white/10 bg-amber-500/5'>
                      <td colSpan={6} className='px-3 py-3'>
                        <div className='flex flex-wrap items-center gap-3'>
                          <AlertTriangle className='h-4 w-4 flex-shrink-0 text-amber-300' />
                          <span className='text-sm text-white/70'>Mật khẩu mới cho <b className='text-white'>{item.name}</b> (chỉ hiển thị 1 lần, admin tự gửi cho user qua kênh khác):</span>
                          <code className='rounded bg-black/30 px-2 py-1 font-mono text-sm text-amber-200'>{resetFor.password}</code>
                          <Button
                            variant='ghost' size='sm' className='text-white/70 hover:bg-white/10'
                            onClick={() => navigator.clipboard.writeText(resetFor.password)}
                          >
                            <Copy className='mr-1 h-3.5 w-3.5' /> Sao chép
                          </Button>
                          <Button variant='ghost' size='sm' className='ml-auto text-white/50 hover:bg-white/10' onClick={() => setResetFor(null)}>
                            <X className='h-3.5 w-3.5' />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className='mt-4 flex items-center justify-between text-sm text-white/60'>
          <span>Trang {page}/{totalPages} · Tổng {total} tài khoản</span>
          <div className='flex gap-2'>
            <Button variant='ghost' size='sm' className='border border-white/20 text-white hover:bg-white/10' disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className='h-4 w-4' /> Trước
            </Button>
            <Button variant='ghost' size='sm' className='border border-white/20 text-white hover:bg-white/10' disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Sau <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
