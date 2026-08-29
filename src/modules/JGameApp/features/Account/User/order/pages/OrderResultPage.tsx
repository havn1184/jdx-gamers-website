/**
 * OrderResultPage — Kết quả giao dịch: Thành công (SC-06) hoặc Thất bại/Hoàn tiền (SC-07).
 */
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, Copy, Eye, EyeOff, RotateCcw, LifeBuoy } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/button'
import { formatCurrency, formatDateTime } from '../../../../../shared/utils/FormatUtils'
import { useOrderResult } from '../hooks/useOrderResult.page'

export const PAGE_ID = 'jgame-order-result'
export const PAGE_FEATURES = [{ label: 'Sao chép mã thẻ', code: 'btn-copy-ma-the' }, { label: 'Hiện/ẩn mã thẻ', code: 'btn-toggle-ma-the' }]

const REFUND_LABEL: Record<string, string> = {
  PROCESSING: 'Đang xử lý hoàn tiền',
  DONE: 'Đã hoàn tiền thành công',
}

export function OrderResultPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { order, cardCode, refund, loading, revealing, revealFullCode } = useOrderResult(orderId)
  const [showFull, setShowFull] = useState(false)
  const [copied, setCopied] = useState(false)

  if (loading || !order) {
    return <div className='flex items-center justify-center gap-2 py-24 text-white/60'><Loader2 className='h-5 w-5 animate-spin' /> Đang tải kết quả...</div>
  }

  const handleToggleFull = async () => {
    if (!showFull && !cardCode?.serialFull) await revealFullCode()
    setShowFull(v => !v)
  }

  const handleCopy = async () => {
    if (!cardCode) return
    const text = showFull && cardCode.serialFull ? `${cardCode.serialFull} - ${cardCode.pinFull}` : `${cardCode.serialMasked} - ${cardCode.pinMasked}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const isSuccess = order.status === 'SUCCESS'

  return (
    <div className='mx-auto max-w-lg px-4 py-12 text-center sm:px-6'>
      {isSuccess ? (
        <>
          <CheckCircle2 className='mx-auto mb-4 h-14 w-14 text-emerald-400' />
          <h1 className='text-xl font-bold text-white'>Thanh toán thành công!</h1>
          <p className='mt-1 text-sm text-white/60'>{order.productName} — {formatCurrency(order.totalAmount)}</p>

          {cardCode && (
            <div className='mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-left'>
              <div className='flex items-center justify-between text-sm text-white/60'>
                <span>Mã thẻ</span>
                <button type='button' onClick={handleToggleFull} className='flex items-center gap-1 text-white/80 hover:text-white' data-qa='btn_toggle_ma_the'>
                  {revealing ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : showFull ? <EyeOff className='h-3.5 w-3.5' /> : <Eye className='h-3.5 w-3.5' />}
                  {showFull ? 'Ẩn' : 'Hiện đầy đủ'}
                </button>
              </div>
              <div className='mt-2 space-y-1 font-mono text-base text-white'>
                <p>Serial: {showFull && cardCode.serialFull ? cardCode.serialFull : cardCode.serialMasked}</p>
                <p>Pin: {showFull && cardCode.pinFull ? cardCode.pinFull : cardCode.pinMasked}</p>
              </div>
              <Button variant='ghost' size='sm' className='mt-3 text-white/70 hover:bg-white/10 hover:text-white' onClick={handleCopy} data-qa='btn_copy_ma_the'>
                <Copy className='h-4 w-4 mr-1.5' /> {copied ? 'Đã sao chép!' : 'Sao chép mã thẻ'}
              </Button>
              <p className='mt-2 text-xs text-white/40'>Cấp lúc {formatDateTime(cardCode.issuedAt)}</p>
            </div>
          )}

          <Link to='/jgame/lich-su' className='mt-6 inline-block jgame-gradient-text text-sm font-semibold'>Xem trong lịch sử giao dịch</Link>
        </>
      ) : (
        <>
          <XCircle className='mx-auto mb-4 h-14 w-14 text-red-400' />
          <h1 className='text-xl font-bold text-white'>Không thể cấp mã thẻ</h1>
          <p className='mt-1 text-sm text-white/60'>Nhà cung cấp tạm thời gián đoạn — hệ thống đang tự động hoàn tiền cho bạn.</p>

          {refund && (
            <div className='mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-left'>
              <div className='flex items-center gap-2 text-sm text-amber-300'>
                <RotateCcw className='h-4 w-4' /> {REFUND_LABEL[refund.status]}
              </div>
              <p className='mt-2 text-sm text-white/60'>{refund.reason}</p>
              <p className='mt-1 text-sm text-white/60'>Số tiền: <span className='font-semibold text-white'>{formatCurrency(order.totalAmount)}</span></p>
              {refund.refundedAt && <p className='mt-1 text-xs text-white/40'>Hoàn tiền lúc {formatDateTime(refund.refundedAt)}</p>}
            </div>
          )}

          <Button variant='outline' className='mt-6 border-white/20 text-white hover:bg-white/10' data-qa='btn_lien_he_ho_tro'>
            <LifeBuoy className='h-4 w-4 mr-1.5' /> Liên hệ hỗ trợ
          </Button>
        </>
      )}
    </div>
  )
}
