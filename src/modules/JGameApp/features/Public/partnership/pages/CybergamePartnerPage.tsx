/**
 * CybergamePartnerPage — Landing page chi tiết hợp tác Chủ phòng Cybergame.
 */
import { PartnershipBackLink } from '../components/PartnershipBackLink'
import { CybergameSection } from '../components/CybergameSection'

export const PAGE_ID = 'jgame-partnership-cybergame'

export function CybergamePartnerPage() {
  return (
    <div className='pb-16'>
      <PartnershipBackLink />
      <CybergameSection />
    </div>
  )
}
