/**
 * useAdminDashboard.page.fetchData — Logic trang Tổng quan hệ thống (Admin). Gộp dữ liệu từ
 * các API admin đã có sẵn (Báo cáo doanh thu/Giao dịch/Đối tác Referral/Khuyến mãi) — không thêm
 * API mới, giống mẫu `useAccountDashboard.page.fetchData.ts` (Promise.all song song).
 */
import { useCallback, useEffect, useState } from 'react'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { OrderAdminItem, ReferralPartnerAdmin, PromotionAdmin } from '../../types/jgame.types'

/** Tỷ lệ hoàn tiền từ mức này trở lên coi là cảnh báo nghi ngờ gian lận (khớp ngưỡng đã dùng ở AdminReferralPartnersPage). */
const REFUND_RATE_ALERT_THRESHOLD = 10

export function useAdminDashboard() {
  const [totalGmv, setTotalGmv] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [avgFailRate, setAvgFailRate] = useState(0)
  const [activeSupplierCount, setActiveSupplierCount] = useState(0)
  const [pendingIssueOrders, setPendingIssueOrders] = useState<OrderAdminItem[]>([])
  const [alertPartners, setAlertPartners] = useState<ReferralPartnerAdmin[]>([])
  const [runningPromotions, setRunningPromotions] = useState<PromotionAdmin[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [reportRes, ordersRes, suppliersRes, partnersRes, promotionsRes] = await Promise.all([
      JGameApiServiceAdmin.getRevenueReport(),
      JGameApiServiceAdmin.getOrders(),
      JGameApiServiceAdmin.getSuppliers(),
      JGameApiServiceAdmin.getReferralPartners(),
      JGameApiServiceAdmin.getPromotions(),
    ])

    if (reportRes.success && reportRes.data) {
      const rows = reportRes.data
      setTotalGmv(rows.reduce((sum, r) => sum + r.gmv, 0))
      setTotalOrders(rows.reduce((sum, r) => sum + r.totalOrders, 0))
      setAvgFailRate(rows.length ? Math.round(rows.reduce((sum, r) => sum + r.failRatePercent, 0) / rows.length) : 0)
    }
    if (ordersRes.success && ordersRes.data) {
      setPendingIssueOrders(ordersRes.data.filter(o => o.status === 'SUPPLY_FAILED'))
    }
    if (suppliersRes.success && suppliersRes.data) {
      setActiveSupplierCount(suppliersRes.data.filter(s => s.status === 'active').length)
    }
    if (partnersRes.success && partnersRes.data) {
      setAlertPartners(partnersRes.data.filter(p => p.refundRatePercent >= REFUND_RATE_ALERT_THRESHOLD))
    }
    if (promotionsRes.success && promotionsRes.data) {
      setRunningPromotions(promotionsRes.data.filter(p => p.status === 'active'))
    }
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  return {
    totalGmv, totalOrders, avgFailRate, activeSupplierCount,
    pendingIssueOrders, alertPartners, runningPromotions, loading, refetch: fetchData,
  }
}
