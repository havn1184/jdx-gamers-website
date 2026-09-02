/**
 * PartnershipBackLink — Link quay lại trang tổng quan Đối tác, dùng chung cho 3
 * landing page chi tiết.
 */
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function PartnershipBackLink() {
  return (
    <div className='mx-auto max-w-5xl px-4 pt-8 sm:px-6'>
      <Link to='/jgame/hop-tac' className='inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white' data-qa='link_ve_trang_doi_tac'>
        <ArrowLeft className='h-4 w-4' /> Tất cả hình thức hợp tác
      </Link>
    </div>
  )
}
