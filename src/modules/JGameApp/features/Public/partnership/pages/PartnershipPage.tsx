/**
 * PartnershipPage — Trang tổng quan "Đối tác": giới thiệu ngắn 3 hình thức hợp
 * tác của JGame, click "Tìm hiểu chi tiết" để sang landing page riêng từng loại.
 */
import { PartnershipHero } from '../components/PartnershipHero'
import { PartnershipOverviewCards } from '../components/PartnershipOverviewCards'

export const PAGE_ID = 'jgame-partnership'

export function PartnershipPage() {
  return (
    <div className='pb-20'>
      <PartnershipHero />
      <PartnershipOverviewCards />
    </div>
  )
}
