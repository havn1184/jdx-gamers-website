/**
 * useAdminUsers.page.fetchData — Logic trang Quản trị "Tài khoản hệ thống" (20260902-nc_quan-tri-tai-khoan-he-thong.md).
 */
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from '../../../../../shared/hooks/useDebounce'
import { JGameApiServiceAdmin } from '../../services/JGameApiServiceAdmin'
import type { AdminUserItem, AdminUserKind } from '../../types/jgame.types'

const PAGE_SIZE = 20

export function useAdminUsersFetchData() {
  const [items, setItems] = useState<AdminUserItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [kind, setKind] = useState<AdminUserKind | 'all'>('all')
  const [page, setPage] = useState(1)
  const debouncedKeyword = useDebounce(keyword, 500)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const r = await JGameApiServiceAdmin.getUsers({ keyword: debouncedKeyword || undefined, kind, page, limit: PAGE_SIZE })
      if (r.success && r.data) {
        setItems(r.data.items)
        setTotal(r.data.total)
        setTotalPages(r.data.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }, [debouncedKeyword, kind, page])

  useEffect(() => { void fetchData() }, [fetchData])

  // Đổi từ khóa/loại user -> quay về trang 1 (tránh kẹt ở trang rỗng khi kết quả lọc ít hơn).
  useEffect(() => { setPage(1) }, [debouncedKeyword, kind])

  const setKeywordAndReset = useCallback((value: string) => setKeyword(value), [])
  const setKindAndReset = useCallback((value: AdminUserKind | 'all') => setKind(value), [])

  const lockUser = useCallback(async (id: string) => {
    const r = await JGameApiServiceAdmin.lockUser(id)
    if (r.success) void fetchData()
    return r
  }, [fetchData])

  const unlockUser = useCallback(async (id: string) => {
    const r = await JGameApiServiceAdmin.unlockUser(id)
    if (r.success) void fetchData()
    return r
  }, [fetchData])

  const resetPassword = useCallback(async (id: string) => {
    return JGameApiServiceAdmin.resetUserPassword(id)
  }, [])

  return {
    items, total, totalPages, loading, page, setPage,
    keyword, setKeyword: setKeywordAndReset, kind, setKind: setKindAndReset,
    lockUser, unlockUser, resetPassword,
  }
}
