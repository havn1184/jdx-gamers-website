/**
 * GameDevPartnerPage — Landing page chi tiết hợp tác Nhà phát triển game.
 */
import { PartnershipBackLink } from '../components/PartnershipBackLink'
import { GameDevSection } from '../components/GameDevSection'

export const PAGE_ID = 'jgame-partnership-gamedev'

export function GameDevPartnerPage() {
  return (
    <div className='pb-16'>
      <PartnershipBackLink />
      <GameDevSection />
    </div>
  )
}
