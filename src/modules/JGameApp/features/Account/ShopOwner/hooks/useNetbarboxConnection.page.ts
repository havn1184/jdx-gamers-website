/**
 * useNetbarboxConnection.page — Logic mục "Kết nối Netbarbox" trong trang Đồng bộ nền tảng:
 * nhập khoá kết nối, xác nhận tên quán, ngắt kết nối, đồng bộ danh mục ngay, lịch sử đồng bộ.
 */
import { useCallback, useEffect, useState } from 'react'
import { NetbarboxConnectionApiService } from '../services/NetbarboxConnectionApiService'
import type { NetbarboxConnectionInfo, NetbarboxSyncHistoryItem, NetbarboxSyncResultResponse } from '../types/netbarbox.types'

export function useNetbarboxConnection() {
  const [connection, setConnection] = useState<NetbarboxConnectionInfo | null>(null)
  const [loadingConnection, setLoadingConnection] = useState(true)

  const [connectionSecret, setConnectionSecret] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)
  /** Tên quán vừa xác thực xong, chờ chủ Cybergame xác nhận đúng quán trước khi coi là hoàn tất (bắt buộc bảo mật — nc_ mục 3.6.1 bước 4). */
  const [pendingConfirmName, setPendingConfirmName] = useState<string | null>(null)

  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const [history, setHistory] = useState<NetbarboxSyncHistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [syncingCatalog, setSyncingCatalog] = useState(false)
  const [syncResult, setSyncResult] = useState<NetbarboxSyncResultResponse | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  const fetchConnection = useCallback(async () => {
    setLoadingConnection(true)
    const r = await NetbarboxConnectionApiService.getConnection()
    if (r.success && r.data) setConnection(r.data)
    setLoadingConnection(false)
  }, [])

  useEffect(() => { void fetchConnection() }, [fetchConnection])

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true)
    const r = await NetbarboxConnectionApiService.getSyncHistory()
    if (r.success && r.data) setHistory(r.data)
    setLoadingHistory(false)
  }, [])

  useEffect(() => { void fetchHistory() }, [fetchHistory])

  const connect = useCallback(async () => {
    if (!connectionSecret.trim()) return
    setConnecting(true)
    setConnectError(null)
    try {
      const r = await NetbarboxConnectionApiService.connect({ connectionSecret: connectionSecret.trim() })
      if (r.success && r.data) {
        setConnection(r.data)
        setPendingConfirmName(r.data.shopRefName)
        setConnectionSecret('')
        await fetchHistory()
      } else {
        setConnectError(r.message || 'Kết nối thất bại, vui lòng kiểm tra lại khoá kết nối')
      }
    } finally {
      setConnecting(false)
    }
  }, [connectionSecret, fetchHistory])

  /** Chủ Cybergame bấm xác nhận đúng tên quán — chỉ tắt banner cảnh báo, không gọi thêm API nào
   * (BE đã lưu kết nối ngay trong lượt gọi `connect` — xem nc_ mục 3.6.1 bước 4: 1 thao tác duy nhất). */
  const acknowledgeConnected = useCallback(() => setPendingConfirmName(null), [])

  const requestDisconnect = useCallback(() => setConfirmingDisconnect(true), [])
  const cancelDisconnect = useCallback(() => setConfirmingDisconnect(false), [])

  const confirmDisconnect = useCallback(async () => {
    setDisconnecting(true)
    try {
      const r = await NetbarboxConnectionApiService.disconnect()
      if (r.success) {
        setPendingConfirmName(null)
        await fetchConnection()
      }
    } finally {
      setDisconnecting(false)
      setConfirmingDisconnect(false)
    }
  }, [fetchConnection])

  const syncCatalogNow = useCallback(async () => {
    setSyncingCatalog(true)
    setSyncError(null)
    setSyncResult(null)
    try {
      const r = await NetbarboxConnectionApiService.syncCatalogNow()
      if (r.success && r.data) {
        setSyncResult(r.data)
        await fetchConnection()
        await fetchHistory()
      } else {
        setSyncError(r.message || 'Đồng bộ danh mục thất bại')
      }
    } finally {
      setSyncingCatalog(false)
    }
  }, [fetchConnection, fetchHistory])

  return {
    connection, loadingConnection,
    connectionSecret, setConnectionSecret, connecting, connectError, connect,
    pendingConfirmName, acknowledgeConnected,
    confirmingDisconnect, requestDisconnect, cancelDisconnect, disconnecting, confirmDisconnect,
    history, loadingHistory,
    syncingCatalog, syncResult, syncError, syncCatalogNow,
  }
}
