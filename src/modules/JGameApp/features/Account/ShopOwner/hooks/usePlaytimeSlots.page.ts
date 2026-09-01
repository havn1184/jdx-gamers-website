/**
 * usePlaytimeSlots.page — Logic trang xem khung giờ (đọc) theo 1 khu vực cụ thể, mặc định 7 ngày tới.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ShopOwnerApiService } from '../services/ShopOwnerApiService'
import { PlaytimeTerminalApiService } from '../services/PlaytimeTerminalApiService'
import type { PlaytimeZone } from '../types/shop-owner.types'
import type { PlaytimeSlot } from '../types/netbarbox.types'

const DEFAULT_DAYS_AHEAD = 7

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function usePlaytimeSlots() {
  const [zones, setZones] = useState<PlaytimeZone[]>([])
  const [loadingZones, setLoadingZones] = useState(true)
  const [zoneId, setZoneId] = useState('')

  const defaultRange = useMemo(() => {
    const from = new Date()
    const to = new Date(Date.now() + DEFAULT_DAYS_AHEAD * 86400000)
    return { fromDate: toDateOnly(from), toDate: toDateOnly(to) }
  }, [])
  const [fromDate, setFromDate] = useState(defaultRange.fromDate)
  const [toDate, setToDate] = useState(defaultRange.toDate)

  const [slots, setSlots] = useState<PlaytimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [zonesError, setZonesError] = useState<string | null>(null)

  const fetchZones = useCallback(async () => {
    setLoadingZones(true)
    setZonesError(null)
    try {
      const r = await ShopOwnerApiService.getZones()
      if (r.success && r.data) {
        setZones(r.data)
        // Tự chọn zone đầu tiên nếu chưa có zone nào được chọn — dùng callback để không phụ thuộc `zoneId`.
        setZoneId(prev => prev || (r.data && r.data.length > 0 ? r.data[0].id : prev))
      } else if (!r.success) {
        setZonesError(r.message || 'Không tải được danh sách khu vực')
      }
    } catch {
      setZonesError('Không thể kết nối đến máy chủ')
    } finally {
      setLoadingZones(false)
    }
  }, [])

  useEffect(() => { void fetchZones() }, [fetchZones])

  const fetchSlots = useCallback(async () => {
    if (!zoneId) { setSlots([]); return }
    setLoadingSlots(true)
    const r = await PlaytimeTerminalApiService.getSlots(zoneId, fromDate, toDate)
    if (r.success && r.data) setSlots(r.data)
    setLoadingSlots(false)
  }, [zoneId, fromDate, toDate])

  useEffect(() => { void fetchSlots() }, [fetchSlots])

  return {
    zones, loadingZones, zonesError, zoneId, setZoneId,
    fromDate, setFromDate, toDate, setToDate,
    slots, loadingSlots, refetch: fetchSlots,
  }
}
