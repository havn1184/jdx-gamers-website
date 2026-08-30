/**
 * useAccountDashboard.page.fetchData — Logic trang Tổng quan tài khoản: gộp số dư JCoin,
 * số nhiệm vụ đang làm, 3 đơn hàng gần nhất (cả 3 loại), trạng thái đăng ký Kênh Người Bán/Đối tác.
 */
import { useCallback, useEffect, useState } from 'react'
import { TaskApiService } from '../../../../Public/tasks/services/TaskApiService'
import { OrderApiService } from '../../order/services/OrderApiService'
import { AccessoryApiService } from '../../../../Public/accessories/services/AccessoryApiService'
import { PlaytimeApiService } from '../../../../Public/playtime/services/PlaytimeApiService'
import { ShopOwnerApiService } from '../../../ShopOwner/services/ShopOwnerApiService'
import { ReferrerApiService } from '../../../Partner/services/ReferrerApiService'

export interface RecentOrderItem {
  id: string
  title: string
  amount: number
  createdAt: string
  to: string
}

export function useAccountDashboard() {
  const [jcoinBalance, setJcoinBalance] = useState(0)
  const [inProgressTasksCount, setInProgressTasksCount] = useState(0)
  const [totalOrdersCount, setTotalOrdersCount] = useState(0)
  const [recentOrders, setRecentOrders] = useState<RecentOrderItem[]>([])
  const [hasShop, setHasShop] = useState(false)
  const [isAffiliate, setIsAffiliate] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [walletRes, tasksRes, cardRes, accessoryRes, playtimeRes, shopRes, affiliateRes] = await Promise.all([
      TaskApiService.getWalletBalance(),
      TaskApiService.getMyTasks(),
      OrderApiService.getMyOrders(),
      AccessoryApiService.getMyOrders(),
      PlaytimeApiService.getMyOrders(),
      ShopOwnerApiService.getMyShop(),
      ReferrerApiService.getMyAffiliateStatus(),
    ])

    if (walletRes.success && walletRes.data != null) setJcoinBalance(walletRes.data)
    if (tasksRes.success && tasksRes.data) setInProgressTasksCount(tasksRes.data.filter(t => t.progress.isRegistered && !t.progress.isCompleted).length)
    setHasShop(Boolean(shopRes.success && shopRes.data))
    setIsAffiliate(Boolean(affiliateRes.success && affiliateRes.data))

    const cardItems: RecentOrderItem[] = cardRes.success && cardRes.data
      ? cardRes.data.map(o => ({ id: o.id, title: o.productName, amount: o.totalAmount, createdAt: o.createdAt, to: `/jgame/ket-qua/${o.id}` }))
      : []
    const accessoryItems: RecentOrderItem[] = accessoryRes.success && accessoryRes.data
      ? accessoryRes.data.map(o => ({
          id: o.id,
          title: o.items.length === 1 ? o.items[0].productName : `${o.items[0].productName} +${o.items.length - 1} sản phẩm`,
          amount: o.totalAmount, createdAt: o.createdAt, to: `/jgame/don-hang-phu-kien/${o.id}`,
        }))
      : []
    const playtimeItems: RecentOrderItem[] = playtimeRes.success && playtimeRes.data
      ? playtimeRes.data.map(o => ({ id: o.id, title: `${o.shopName} — ${o.zoneName}`, amount: o.totalAmount, createdAt: o.createdAt, to: `/jgame/cho-ve/ket-qua/${o.id}` }))
      : []

    const merged = [...cardItems, ...accessoryItems, ...playtimeItems].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    setTotalOrdersCount(merged.length)
    setRecentOrders(merged.slice(0, 3))
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  return { jcoinBalance, inProgressTasksCount, totalOrdersCount, recentOrders, hasShop, isAffiliate, loading, refetch: fetchData }
}
