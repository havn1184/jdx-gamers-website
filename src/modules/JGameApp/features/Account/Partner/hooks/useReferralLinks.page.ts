/**
 * useReferralLinks.page — Logic trang "Liên kết của tôi" (đa liên kết, mỗi liên kết 1 kênh quảng bá).
 * 20260901-nc_doi-tac-tiep-thi-nang-cap.md mục 4 bước 14.
 */
import { useCallback, useEffect, useState } from 'react'
import { ReferrerApiService } from '../services/ReferrerApiService'
import type { ReferralLink, ReferralChannel } from '../types/referrer.types'

export function useReferralLinks() {
  const [links, setLinks] = useState<ReferralLink[]>([])
  const [loading, setLoading] = useState(true)
  const [channel, setChannel] = useState<ReferralChannel>('facebook')
  const [label, setLabel] = useState('')
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const r = await ReferrerApiService.getLinks()
    if (r.success && r.data) setLinks(r.data)
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  const isValid = label.trim().length >= 3

  const handleCreate = useCallback(async () => {
    if (!isValid) return
    setCreating(true)
    setErrorMessage(null)
    try {
      const r = await ReferrerApiService.createLink({ channel, label: label.trim() })
      if (r.success) {
        setLabel('')
        void fetchData()
      } else {
        setErrorMessage(r.message || 'Không tạo được liên kết — vui lòng thử lại')
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setCreating(false)
    }
  }, [isValid, channel, label, fetchData])

  const handleDelete = useCallback(async (linkId: string) => {
    setDeletingId(linkId)
    setErrorMessage(null)
    try {
      const r = await ReferrerApiService.deleteLink(linkId)
      if (r.success) {
        void fetchData()
      } else {
        setErrorMessage(r.message || 'Không xoá được liên kết')
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ')
    } finally {
      setDeletingId(null)
    }
  }, [fetchData])

  return {
    links, loading, channel, setChannel, label, setLabel, isValid,
    creating, deletingId, errorMessage, handleCreate, handleDelete,
  }
}
