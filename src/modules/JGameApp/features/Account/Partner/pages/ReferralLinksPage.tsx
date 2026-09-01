/**
 * ReferralLinksPage — Quản lý đa liên kết của đối tác (mỗi liên kết 1 kênh quảng bá + nhãn tự đặt).
 * 20260901-nc_doi-tac-tiep-thi-nang-cap.md mục 4 bước 14.
 */
import { Loader2, Copy, Plus, Trash2, AlertCircle, Link2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/button'
import { Input } from '../../../../shared/components/ui/input'
import { Badge } from '../../../../shared/components/ui/badge'
import { formatPercent } from '../../../../shared/utils/FormatUtils'
import { cn } from '../../../../shared/components/ui/utils'
import { PartnerLayout } from '../components/PartnerLayout'
import { useReferralLinks } from '../hooks/useReferralLinks.page'
import { REFERRAL_CHANNEL_LABELS, type ReferralChannel } from '../types/referrer.types'

export const PAGE_ID = 'jgame-referral-links'
export const PAGE_FEATURES = [
  { label: 'Tạo liên kết mới', code: 'btn-tao-lien-ket' },
  { label: 'Xoá liên kết', code: 'btn-xoa-lien-ket' },
  { label: 'Sao chép link', code: 'btn-copy-link' },
]

export function ReferralLinksPage() {
  const { links, loading, channel, setChannel, label, setLabel, isValid, creating, deletingId, errorMessage, handleCreate, handleDelete } = useReferralLinks()

  const handleCopy = async (shareUrl: string) => {
    await navigator.clipboard.writeText(shareUrl)
  }

  const defaultCode = links.find(l => l.isDefault)?.code

  return (
    <PartnerLayout referralCode={defaultCode}>
      <h1 className='mb-1 text-xl font-bold text-white'>Liên kết của tôi</h1>
      <p className='mb-6 text-sm text-white/60'>Tạo riêng 1 liên kết cho từng kênh quảng bá để so sánh hiệu quả (click, đơn, tỷ lệ chuyển đổi)</p>

      <div className='mb-6 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4'>
        <h2 className='text-sm font-semibold text-white'>Tạo liên kết mới</h2>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr_auto]'>
          <select
            value={channel}
            onChange={e => setChannel(e.target.value as ReferralChannel)}
            aria-label='Kênh quảng bá'
            className='rounded-lg border border-white/20 bg-[#1a0d33] px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none'
            data-qa='sel_kenh'
          >
            {Object.entries(REFERRAL_CHANNEL_LABELS).map(([value, text]) => (
              <option key={value} value={value}>{text}</option>
            ))}
          </select>
          <Input placeholder='Nhãn (VD: Bài viết Fanpage tháng 9)' value={label} onChange={e => setLabel(e.target.value)} data-qa='i_nhan' />
          <Button className='jgame-btn-primary text-white' disabled={!isValid || creating} onClick={handleCreate} data-qa='btn_tao_lien_ket'>
            {creating ? <Loader2 className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4' />}
            <span className='ml-1.5'>Tạo liên kết</span>
          </Button>
        </div>
        {errorMessage && (
          <div className='flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' /> {errorMessage}
          </div>
        )}
      </div>

      {loading ? (
        <div className='flex items-center justify-center gap-2 py-16 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải...</div>
      ) : links.length === 0 ? (
        <div className='flex flex-col items-center gap-2 py-16 text-white/60'>
          <Link2 className='h-8 w-8' /> Chưa có liên kết nào
        </div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-white/10'>
          <table className='w-full text-sm'>
            <thead className='bg-white/5 text-white/60'>
              <tr>
                <th className='px-3 py-2 text-left font-medium'>Nhãn</th>
                <th className='px-3 py-2 text-left font-medium'>Kênh</th>
                <th className='px-3 py-2 text-left font-medium'>Link</th>
                <th className='px-3 py-2 text-right font-medium'>Click</th>
                <th className='px-3 py-2 text-right font-medium'>Đơn</th>
                <th className='px-3 py-2 text-right font-medium'>Tỷ lệ chuyển đổi</th>
                <th className='w-[110px] px-3 py-2 text-center font-medium'>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {links.map(link => (
                <tr key={link.id} className='border-t border-white/10 text-white/80'>
                  <td className='px-3 py-2 font-medium text-white'>
                    {link.label} {link.isDefault && <Badge className='ml-1.5 border-none bg-purple-500/20 text-purple-300'>Mặc định</Badge>}
                  </td>
                  <td className='px-3 py-2'>{REFERRAL_CHANNEL_LABELS[link.channel]}</td>
                  <td className='max-w-[220px] truncate px-3 py-2 text-white/60'>{link.shareUrl}</td>
                  <td className='px-3 py-2 text-right'>{link.clickCount}</td>
                  <td className='px-3 py-2 text-right'>{link.orderCount}</td>
                  <td className='px-3 py-2 text-right'>{formatPercent((link.conversionRate ?? 0) * 100)}</td>
                  <td className='px-3 py-2'>
                    <div className='flex items-center justify-center gap-1'>
                      <Button variant='ghost' size='sm' className='icon-primary border rounded-lg bg-white' title='Sao chép' data-qa={`btn_copy_${link.id}`} onClick={() => handleCopy(link.shareUrl)}>
                        <Copy className='h-4 w-4' />
                      </Button>
                      {!link.isDefault && (
                        <Button
                          variant='ghost' size='sm' className={cn('icon-danger border rounded-lg bg-white', deletingId === link.id && 'opacity-50')}
                          title='Xoá' data-qa={`btn_xoa_${link.id}`} disabled={deletingId === link.id}
                          onClick={() => handleDelete(link.id)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PartnerLayout>
  )
}
