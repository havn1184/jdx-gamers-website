/**
 * AffiliatePartnerPage — Landing page chi tiết hợp tác Tiếp thị liên kết.
 */
import { PartnershipBackLink } from '../components/PartnershipBackLink'
import { AffiliateSection } from '../components/AffiliateSection'

export const PAGE_ID = 'jgame-partnership-affiliate'

export function AffiliatePartnerPage() {
  return (
    <div className='pb-16'>
      <PartnershipBackLink />
      <AffiliateSection />
    </div>
  )
}
