/**
 * usePlaytimeTerminals.page — Logic trang danh sách máy của gian hàng đang đăng nhập: đọc trạng thái
 * thời gian thực qua PlaytimeTerminalApiService (route public `api/playtime`), khai báo/sửa/xóa máy thủ
 * công qua ShopOwnerApiService (route `api/shop-owner/terminals` — BE đã có sẵn từ tích hợp Netbarbox,
 * chỉ thiếu UI cho tới 20260901-nc_shop-owner-zone-ve-crud.md).
 */
import { useCallback, useEffect, useState } from 'react'
import { useMyShop } from './useMyShop'
import { PlaytimeTerminalApiService } from '../services/PlaytimeTerminalApiService'
import { ShopOwnerApiService } from '../services/ShopOwnerApiService'
import type { PlaytimeTerminal } from '../types/netbarbox.types'
import type { PlaytimeZone } from '../types/shop-owner.types'

export interface TerminalFormState { zoneId: string; terminalNumber: string; netbarboxTerminalRef: string }
const EMPTY_TERMINAL_FORM: TerminalFormState = { zoneId: '', terminalNumber: '', netbarboxTerminalRef: '' }

export function usePlaytimeTerminals() {
  const { shop, loading: loadingShop } = useMyShop()
  const [terminals, setTerminals] = useState<PlaytimeTerminal[]>([])
  const [zones, setZones] = useState<PlaytimeZone[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<TerminalFormState>(EMPTY_TERMINAL_FORM)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    if (!shop) { setTerminals([]); setLoading(false); return }
    setLoading(true)
    setErrorMessage(null)
    try {
      const [terminalsRes, zonesRes] = await Promise.all([PlaytimeTerminalApiService.getTerminals(shop.id), ShopOwnerApiService.getZones()])
      if (terminalsRes.success && terminalsRes.data) setTerminals(terminalsRes.data)
      if (zonesRes.success && zonesRes.data) setZones(zonesRes.data)
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setLoading(false)
    }
  }, [shop])

  useEffect(() => { void fetchData() }, [fetchData])

  const openForm = useCallback(() => { setErrorMessage(null); setForm(EMPTY_TERMINAL_FORM); setShowForm(true) }, [])
  const cancelForm = useCallback(() => { setShowForm(false); setForm(EMPTY_TERMINAL_FORM) }, [])

  const submitTerminal = useCallback(async () => {
    if (!form.zoneId || !form.terminalNumber.trim() || !form.netbarboxTerminalRef.trim()) return
    setSaving(true)
    setErrorMessage(null)
    try {
      const r = await ShopOwnerApiService.createTerminal({
        zoneId: form.zoneId, terminalNumber: form.terminalNumber.trim(), netbarboxTerminalRef: form.netbarboxTerminalRef.trim(),
      })
      if (r.success) { setShowForm(false); setForm(EMPTY_TERMINAL_FORM); await fetchData() }
      else setErrorMessage(r.message || 'Không thêm được máy')
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setSaving(false)
    }
  }, [form, fetchData])

  const removeTerminal = useCallback(async (terminalId: string) => {
    setErrorMessage(null)
    try {
      const r = await ShopOwnerApiService.deleteTerminal(terminalId)
      if (r.success) await fetchData()
      else setErrorMessage(r.message || 'Không xóa được máy')
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    }
  }, [fetchData])

  return {
    shop, loadingShop, terminals, zones, loading, errorMessage, refetch: fetchData,
    showForm, openForm, cancelForm, form, setForm, saving, submitTerminal, removeTerminal,
  }
}
